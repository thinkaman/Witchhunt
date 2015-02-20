Game = function(gameName, moderatorID, moderatorName) {
	//***PUBLIC VARS***
	this.gid = Games.find().count();
	this.createdAt = new Date();
	this.gameName = gameName;
	if (gameName == null) {
		this.gameName = "Game #" + this.gid;
	} else {
		this.gameName = gameName;
	}
	this.moderatorID = moderatorID;
	this.moderatorName = moderatorName;
	this.playerIDList = []; //length serves as maxPlayerCount
	this.playerNameList = [];
	this.maxPlayerCount = 25;
	this.roleListList = [[0,22],[1,2,3,4,5,6,7,8,9,10,11,20,23,24,25,26,27,28,29,30,31,32,33]]; //length serves as roleCount
	this.expansionList = [];
	this.winner = null;


	this.aliveNum = null;
	this.cycleNum = 0;
	this.currentPhase = "Signup";
	this.deathDataList = []; //initialize to null for every player; null if alive,[CYCLE_NUM, PHASE, DEATH_ORDER, TIME] if dead
	this.lastLynchTarget = null;
	this.bombHolder = null;
	this.hunterNight = null;

	this.auto = 2; //auto-advance priority
	this.userVoting = false; //do users get to vote?
	this.debugRandomTargets = false; //if true, randomTarget steps will not be skipped

	//TODO - deadline vars

	//***PRIVATE VARS***
	this.private = {};
	this.private.playerList = null; //list of player objects
	//control flow vars
	this.private.substep = 0;
	this.private.stepList = stepScheduleDict[this.currentPhase].slice(0);
	this.private.currentTargetPrompt = null;
	this.private.undoStepList = [];
	this.private.interruptStepList = [];
	this.private.gamblerChoice = null; //save this locally for speed
	this.private.apprenticeChoice = null; //save this locally for speed
	//secret game state vars (inter-phase)
	this.private.playerTeamList = [];
	this.private.playerRoleListList = [];
	this.private.extraLivesList = [];
	this.private.priestDeathLocationIndex = null; //used for Oracle
	this.private.deathLocationQueue = [];		  //used for Oracle
	this.private.angelCount = 0;
	this.private.demonCount = 0;
	this.private.demonTutorialStep = -1; //-1 - nothing, 0 - curse/protect only, 1 - solo only, 2 - double, 3-full
	this.private.angelTutorialStep = -1; //-1 - nothing, 0 - curse/protect only, 1 - solo only, 2 - double, 3-full
	this.private.doubleProtectUsed = false; //DEPRICATED: use a dedicated, second target instead (maybe a dummy)
	//permission data
	this.private.currentSubchannelDict = {k: 0,
										  c: 0,
										  j: 0,
										  t: 0,
										  s: 0,
										  g: 0,
										  l1: 0,
										  l2: 0,
										  l3: 0,
										};

	//temp vars (intra-phase inter-step)
	this.private.tempTarget = null; //used for assassin
	this.private.checkedFanatic = false; //local for speed
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

	//personal vars (pulled from player accounts, NEVER made public
	this.userAccounts = [];

	var keyList =  ['g-1', 'g-2', 'g-3', 'g2', 'g3', 'g41', 'g42', 'g43',
					'angels', 'demons', 'angelsDelayed', 'demonsDelayed'];
	for (var index in keyList) {
		var initialList = [];
		if (keyList[index] == "angels") {
			initialList.push("xa");
		} else if (keyList[index] == "demons") {
			initialList.push("xd");
		}
		PermissionsLists.insert(new PermissionsList(this.gid, keyList[index], initialList));
	}
	return this;
}

Player = function(id, username, playerIndex, team, subteam, roleList) {
	//All player vars are implicitly private
	this.userId = id;
	this.username = username;
	this.team = team;
	this.subteam = subteam;
	this.roleList = roleList; //simple index list--might be ultimately superfulous with Target entries
	this.covenJoinTime = null;
	this.courtJoinTime = null;
	this.permissionsKey = String(playerIndex);
	return this;
}

Target = function(gid, tag, pid, subchannel) {
	this.gid = gid;
	for (var key in targetTemplateDict[tag]) {
		var value = targetTemplateDict[tag][key];
		if (key == "tag") {
			value = value.replace('#', '' + pid);
		} else if (typeof(value) == typeof("")) {	
			value = value.replace('#', '' + pid).replace('S', '' + subchannel);
		} else if (value != null && typeof(value) == typeof([]) && value.length && typeof(value[0]) == typeof("")) {
			for (var index in value) {
				if (value[index] == '#') {
					value[index] = pid;
				} else {
					value[index] = value[index].replace('#', '' + pid).replace('S', '' + subchannel);		
				}
			}
		}
		this[key] = value;
	}
	return this;
}

getLegalTargetList = function(g, t) {
	myList = [77];
	switch(t.style) {
		case 2: //unique living player IDs + explicit None (88)
			myList.push(88);
		case 1: //unique living player IDs
			for (var pid = 0; pid < g.deathDataList.length; pid++) {
				if (g.deathDataList[pid] == null) {
					if (t.hasOwnProperty("whitelist")) {
						if (t.whitelist.indexOf(pid) != -1) {
							myList.push(pid);
						}
					} else if (t.hasOwnProperty("blacklist")) {
						if (t.blacklist.indexOf(pid) == -1) {
							myList.push(pid);
						}
					} else {
						myList.push(pid);
					}
				}
			}
			break;
		case 3: //unique dead player IDs
			for (var pid = 0; pid < g.deathDataList.length; pid++) {
				if (g.deathDataList[pid] != null) {
					if (t.hasOwnProperty("whitelist")) {
						if (t.whitelist.indexOf(pid) != -1) {
							myList.push(pid);
						}
					} else if (t.hasOwnProperty("blacklist")) {
						if (t.blacklist.indexOf(pid) == -1) {
							myList.push(pid);
						}
					} else {
						myList.push(pid);
					}
				}
			}
			break;
		case 4: //unique character indexes
			for (var pid in g.private.playerRoleListList) {
				for (var index in g.private.playerRoleListList[pid]) {
					var roleIndex = g.private.playerRoleListList[pid][index];
					if (t.hasOwnProperty("whitelist")) {
						if (t.whitelist.indexOf(roleIndex) != -1) {
							myList.push(roleIndex);
						}
					} else if (t.hasOwnProperty("blacklist")) {
						if (t.blacklist.indexOf(roleIndex) == -1) {
							myList.push(roleIndex);
						}
					} else {
						myList.push(roleIndex);
					}
				}
			}
			break;
		case 5: //unique team indexes (null defaults to 0)
			for (var pid in g.private.playerList) {
				var team = g.private.playerList[pid].team;
				if (myList.indexOf(team) == -1) {
					myList.push(team);
				}
			}
			break;
		case 6: //bool (null defaults to false)
			myList.push(1);
			break;
		case 7: //odd/even/null
			myList.push(0);
			myList.push(1);
			break;
		case 8: //unique warlock ritual indexes
			myList.push(0);
			myList.push(1);
			myList.push(2);
			myList.push(3);
			myList.push(4);
			myList.push(5);
			myList.push(6);
		default:
			break;
	}
	return myList;
}

PermissionsList = function(gid, key, initialList) {
	this.gid = gid;
	this.key = String(key);
	this.pl = initialList;
}

packLogEvent = function(g, permissionsLists, argsDict) {
	//Look up permissions on each sub-event
	var gid = g.gid;
	var myDate = new Date();
	var eid = Math.random().toString(36).slice(2); //random event id
	var myPermissionsDict = logPermissionsDict[argsDict['tag']];
	var tagPermissionsList = null;
	if (argsDict['tag'] in myPermissionsDict) {
		 tagPermissionsList = myPermissionsDict[argsDict['tag']]; //global permissions attached to the tag
	}
	var subeventList = [];
	for (var key in argsDict) {
		var mySubevent = {gid: gid, t: myDate, eid: eid, n: key, v: argsDict[key], p: []}
		if (key in myPermissionsDict) {
			var myPermissionsList = myPermissionsDict[key];
			//make sure any permissions attached to the event tag itself are included in ALL subevents
			for (var index in tagPermissionsList) {
				if (!(tagPermissionsList[index] in myPermissionsList)) {
					myPermissionsList.push(tagPermissionsList[index]);
				}
			}
			//now that we have our full list of permissions, let's swap values into any templates
			myPermissionsList = processPermissionTemplates(g, myPermissionsList, argsDict, argsDict[key])		
			mySubevent['p'] = myPermissionsList;
		}
		subeventList.push(mySubevent);
	}
	return subeventList;
};

addToDictSet = function(dict, key, newElements) {
	if (!(key in dict)) {
		dict[key] = [];
	}
	for (var index in newElements) {
		if (dict[key].indexOf(newElements[index]) == -1) {
			dict[key].push(newElements[index]);
		}
	}
}

getLogEventPermissionsUpdates = function(g, argsDict) {
	var myPermissionsDict = logPermissionsDict[argsDict['tag']];
	if (myPermissionsDict == undefined) {
		throw new Meteor.error("bad-tag", argsDict);
	}
	var permissionUpdateDict = {};
	if ('updateActors' in myPermissionsDict) {
		for (var index in argsDict['actors']) {
			pid = argsDict['actors'][index];
			addToDictSet(permissionUpdateDict, g.private.playerList[pid].permissionsKey,
				processPermissionTemplates(g, myPermissionsDict['updateActors'], argsDict, null));
		}
	}
	if ('updateTargets' in myPermissionsDict) {
		//update each of the players listed in t with all the permissions in argsDict['updateActors']
		for (var index in argsDict['targets']) {
			pid = argsDict['targets'][index];
			addToDictSet(permissionUpdateDict, g.private.playerList[pid].permissionsKey,
				processPermissionTemplates(g, myPermissionsDict['updateTargets'], argsDict, null));
		}
	}
	if ('updateDead' in myPermissionsDict) {
		addToDictSet(permissionUpdateDict, "angels", processPermissionTemplates(g, myPermissionsDict['updateDead'], argsDict, null));
		addToDictSet(permissionUpdateDict, "demons", processPermissionTemplates(g, myPermissionsDict['updateDead'], argsDict, null));
	}
	if ('updateDeadDelayed' in myPermissionsDict) {
		addToDictSet(permissionUpdateDict, "angelsDelayed", processPermissionTemplates(g, myPermissionsDict['updateDeadDelayed'], argsDict, null));
		addToDictSet(permissionUpdateDict, "demonsDelayed", processPermissionTemplates(g, myPermissionsDict['updateDeadDelayed'], argsDict, null));
	}
	if ('updateAll' in myPermissionsDict) {
		for (var pid in g.private.playerList) {
			if (!(key == "angelsDelayed" || key == "angelsDelayed")) {
				addToDictSet(permissionUpdateDict, g.private.playerList[pid].permissionsKey,
					processPermissionTemplates(g, myPermissionsDict['updateDeadDelayed'], argsDict, null));
			}
		}
	}
	return permissionUpdateDict;
}

processPermissionTemplates = function(g, permissionList, argsDict, value) {
	var tempResults = [];
	for (var index in permissionList) {
		var p = permissionList[index];
		if (p.slice(-1) == 'A') { //apply permission for each actor
			for (var index2 in argsDict['actors']) {
				var pid = argsDict['actors']
				tempResults.push(p.slice(0,-1) + pid);
			}
		} else if (p.slice(-1) == 'T') { //apply permission for each target
			for (var index2 in argsDict['targets']) {						
				var pid = argsDict['targets'];
				if (pid != 77) {
					tempResults.push(p.slice(0,-1) + pid);
				}
			}
		} else if (p.slice(-1) == 'V') { //apply permission for subevent value
			tempResults.push(p.slice(0,-1) + value);
		} else if (p.slice(-1) == 'S') { //apply permission for subevent value
			tempResults.push(p.slice(0,-1) + g.private.currentSubchannelDict[p.slice(-2,-1)]);
		} else { //apply permission normally
			tempResults.push(p);
		}
	}
	var results = [];
	for (var index in tempResults) {
		var p = tempResults[index];
		if (p.slice(0,2) == 'cp') {
			var pid = parseInt(p.slice(2));
			results.push('c' + g.private.playerList[pid].roleList[0]);
		} else if (p == 'x') {
			if (g.private.angelCount) {
				results.push('xa');
			}
			if (g.private.demonCount) {
				results.push('xd');
			}
		} else if (p == 'tdx') {
			if (g.private.angelCount) {
				results.push('tdxa');
			}
			if (g.private.demonCount) {
				results.push('tdxd');
			}
		} else {
			results.push(p);
		}
	}
	return results;
}

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

clearAll = function() {
	Games.remove({});
	Targets.remove({});
	Log.remove({});
	Messages.remove({});
	PermissionsLists.remove({});
}