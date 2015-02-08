Game = function(gameName, moderatorID, moderatorName) {
	//***PUBLIC VARS***
	this.gid = Games.find().count();
	this.createdAt = new Date();
	this.gameName = null;
	if (gameName == null) {
		this.gameName = "Game #" + this.gid;
	} else {
		this.gameName = gameName;
	}
	this.moderatorID = moderatorID;
	this.moderatorName = moderatorName;
	this.playerIDList = []; //length serves as maxPlayerCount
	this.playerNameList = [];
	this.maxPlayerCount = 12;
	this.roleListList = [[0],[1,2,3,4,5,6,7,8,9,10,11]]; //length serves as roleCount
	this.expansionList = [];
	this.winner = null;


	this.aliveNum = null;
	this.cycleNum = 0;
	this.currentPhase = "Signup";
	this.deathDataList = []; //initialize to null for every player; null if alive, [CYCLE_NUM, PHASE, TIME] if dead
	this.bombHolder = null;
	this.hunterNight = null;

	this.currentTargetPrompt = null;
	this.lastStepResult = null;
	this.auto = 2; //auto-advances though all 
	this.debugRandomTarget = false; //if true, any null targets will be replaced with a random non-null legal target

	//TODO - deadline vars

	//***PRIVATE VARS***
	this.private = {};
	this.private.playerList; //list of player objects
	//control flow vars
	this.private.substep = 0;
	this.private.stepList = stepScheduleDict[this.currentPhase].slice(0);
	this.private.undoStepList = [];
	this.private.interruptStepList = [];
	//secret game state vars (inter-phase)
	this.private.playerTeamList = [];
	this.private.playerRoleListList = [];
	this.private.priestDeathLocationIndex = null; //used for Oracle
	this.private.angelCount = 0;
	this.private.demonCount = 0;
	this.private.demonTutorialStep = -1; //-1 - nothing, 0 - curse/protect only, 1 - solo only, 2 - double, 3-full
	this.private.angelTutorialStep = -1; //-1 - nothing, 0 - curse/protect only, 1 - solo only, 2 - double, 3-full
	this.private.doubleProtectUsed = false; //DEPRICATED: use a dedicated, second target instead (maybe a dummy)
	//permission data
	this.private.groupPermissionListDict = {	'-1': ['t-1'],  //witches
												'-2': ['t-2'],  //unjoined juniors
												'-3': ['t-3'],  //unjoined traitors
												   2: ['t2'],   //spies
												   3: ['t3'],   //knights
												  41: [],		//lover pair A										
												  42: [],		//lover pair B
												  43: [],		//lover pair C
											'angels': ['xa'],	//angels
											'demons': ['xd'],	//demons
											'angelsDelayed': [],//angels time-delayed
											'demonsDelayed': [],//demons time-delayed
											};
	//temp vars (intra-phase inter-step)
	this.private.tempTarget; //used for assassin
	this.private.angelMessage = null; //temp var used to save angel messages between states
	this.private.angelProtectList = [];
	this.private.shenanigansTargetList = [];
	this.private.curseTargetList = [];
	this.private.nightProtectList = [];
	this.private.nightKillList = [];
	this.private.nightSurvivalList = [];
	//mod GUI tip vars
	this.private.linkList = []; //shows which players are "linked" to the current step
	this.private.deadRole = false; //shows if the current step is tied to a dead role
	this.private.currentStepLength = null; //used for setting timer

	//personal vars (pulled from palyer accounts, NEVER made public
	this.userAccounts = [];
	
	return this;
}

Player = function(id, username, team, subteam, roleList) {
	//All player vars are implicitly private
	this.userId = id;
	this.username = username;
	this.team = team;
	this.subteam = subteam;
	this.roleList = roleList; //simple index list--might be ultimately superfulous with Target entries
	this.covenJoinTime = null;
	this.courtJoinTime = null;
	this.covenMinPermissionTime = null;
	this.covenMaxPermissionTime = new Date();
	this.covenMaxPermissionTime.setDate(this.covenMaxPermissionTime.getDate() + 1000); //1000 days in future
	this.courtMinPermissionTime = null;
	this.courtMaxPermissionTime = new Date();
	this.courtMaxPermissionTime.setDate(this.covenMaxPermissionTime.getDate() + 1000); //1000 days in future
	this.permissionsList = [];
	this.permissionGroup = null;
	return this;
}

packLogEvents = function(gid, eventList) {
	for (var index in eventList) {
		packLogEvent(gid, eventList[index]);
	}
}

packLogEvent = function(gid, argsDict) {
	//Look up permissions on each sub-event
	var myDate = new Date();
	var eid = Math.random().toString(36).slice(2);
	var myPermissionsDict = logPermissionsDict[argsDict['tag']];
	var tagPermissionsList = null;
	if (argsDict['tag'] in myPermissionsDict) {
		 tagPermissionsList = myPermissionsDict[argsDict['tag']]; //global permissions attached to the tag
	}
	for (var key in argsDict) {
		var mySubevent = {gid: gid, t: myDate, eid: eid, n: key, v: argsDict[key], p: []}
		if (key in myPermissionsDict) {
			var myPermissionsList = myPermissionsDict[key];	//stage 1 - raw values
			var myPermissionsList2 = [];					//stage 2 - swapped templates
			var myPermissionsList3 = [];					//stage 3 - no temp formats
			//make sure any permissiosn attached to the event tag itself are included in ALL subevents
			for (var index in tagPermissionsList) {
				if (!(tagPermissionsList[index] in myPermissionsList)) {
					myPermissionsList.push(tagPermissionsList[index]);
				}
			}
			//now that we have our full list of permissions, let's swap values into any templates
			for (var index in myPermissionsList) {
				var p = myPermissionsList[index];
				if (p.slice(-1) == 'A') { //apply permission for each actor
					for (var pid in argsDict['actors']) {
						myPermissionsList2.push(p.slice(0,-1) + pid);
					}
				} else if (p.slice(-1) == 'T') { //apply permission for each target
					for (var pid in argsDict['targets']) {
						myPermissionsList2.push(p.slice(0,-1) + pid);
					}
				} else if (p.slice(-1) == 'V') { //apply permission for subevent value
					myPermissionsList2.push(p.slice(0,-1) + argsDict[key]);
				} else { //apply permission normally
					myPermissionsList2.push(p);
				}
			}			
			//finally, perform some conversions from temp formats
			for (var index in myPermissionsList2) {
				var p = myPermissionsList2[index];
				if (p.slice(0,2) == 'cp') {
					var pid = parseInt(p.slice(2));
					myPermissionsList3.push('c' + this.private.playerList[pid].roleList[0]);
				} else if (p == 'x') {
					if (this.private.angelCount) {
						myPermissionsList3.push('xa');
					}
					if (this.private.demonCount) {
						myPermissionsList3.push('xd');
					}
				} else if (p == 'tdx') {
					if (this.private.angelCount) {
						myPermissionsList3.push('tdxa');
					}
					if (this.private.demonCount) {
						myPermissionsList3.push('tdxd');
					}
				} else {
					myPermissionsList3.push(p);
				}
			}
			mySubevent['p'] = myPermissionsList3;
		}
		Log.insert(mySubevent)
	}
	//now let's add any updated permissions
	if ('updateActors' in argsDict) {
		//TODO
	}
	if ('updateTargets' in argsDict) {
		//TODO
	}
	if ('updateDead' in argsDict) {
		//TODO
	}
	if ('updateDeadDelayed' in argsDict) {
		//TODO
	}
	if ('updateAll' in argsDict) {
		//TODO
	}

};

unpackLogEvents = function(myLogQuery) {
	
};

updatePlayerPermissions = function(g, pid, newPermissionsList) {
	var player = g.playerList[pid];
	var myPermissionsList = null;
	if (player.permissionGroup != null) {								//special permissions group
		myPermissionsList = g.groupPermissionListDict[player.permissionGroup];
	} else {															//default
		myPermissionsList = player.permissionsList;
	}
	for (var p in newPermissionsList) {
		if (!(p in myPermissionsList)) {
			myPermissionsList.push(p);
		}
	}
};

changePlayerPermissionGroup = function(g, pid) {
	var player = g.playerList[pid];
	var oldPermissionsList = null;
	if (player.permissionGroup != null) {								//special permissions group
		oldPermissionsList = g.groupPermissionListDict[player.permissionGroup];
	} else {															//default
		oldPermissionsList = player.permissionsList;
	}
	if (g.deathDataList[pid] != null) {
		if (player.team < 0) {											//demon
			player.permissionGroup = 'demons';
		} else {														//angel
			player.permissionGroup = 'demons';
		}
	} else if (player.covenMinPermissionTime != null) {					//coven
		player.permissionGroup = '-1';
	} else if (player.team == 4) {										//lovers
		player.permissionGroup = '4' + player.subteam;
	} else if (player.team in [-2,-3,2,3]) {							//other team groups
		player.permissionGroup = player.team;
	} else {															//default
		player.permissionGroup = null;
	}
	g.updatePlayerPermissions(pid, oldPermissionsList);
};

resolveTimeDelay = function(g) {
	//permissions
	for (var p in g.groupPermissionListDict['angelsDelayed']) {
		if (!(p in g.groupPermissionListDict['angels'])) {
			g.groupPermissionListDict['angels'].push(p);
		}
	}
	for (var p in g.groupPermissionListDict['demonsDelayed']) {
		if (!(p in g.groupPermissionListDict['demons'])) {
			g.groupPermissionListDict['demons'].push(p);
		}
	}
	//logs
	Log.update({gid: g.gid, p: 'td'},   {$pull: {p:   'td'}}, {multi: true});
	Log.update({gid: g.gid, p: 'tdxa'}, {$set:  {"p.$": 'xa'}}, {multi: true});
	Log.update({gid: g.gid, p: 'tdxd'}, {$set:  {"p.$": 'xd'}}, {multi: true});
};

saveNewMessage = function(gid, pid, channel, messageValue) {
	var myPermissionsList = null;
	if (channel in channelPermissionDict) {
		myPermissionsList = channelPermissionDict[channel];
	} else {
		myPermissionsList = ['p' + pid];
	}
	var targetList = null;
	var targetEntryName = null;
	//TODO - parse message for target and vote tag, handle accordingly

	if (targetEntryName) {
		//TODO - update change target
		//TODO - first check if legal
		//TODO - then update
	}
	var myMessage = {'gid': gid,
					 'createdAt': new Date(),
					 'a': pid,
					 'tl': targetList,
					 'tn': targetEntryName,
					 'c': channel,
					 'v': messageValue,
					 'p': myPermissionsList};

};