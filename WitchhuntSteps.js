StepResult = function() {
	this.removeTargetList = []; //[{search field}]
	this.changeTargetDict = {}; //dict[Target tag] = newTargets
	this.updateTargetTupleList = []; //[[{search field} {update field}]]
	this.addTargetList = []; //[{search field}]
	this.updateGameDict = {}; //dict[Game object param] = value to update to
	this.subchannelUpdateDict = {}; //dict[channelKey to increment] = true to grant access to new suchannel
	this.updatePermissionsKeyDict = {}; //dict[pid] = new permissionsKey
	this.insertStepList = []; //[newStepName]
	this.eventList = []; //list of events
	this.permissionsUpdateDict = {}; //dict[pid] = list of permissions to add
	this.permissionsPool = false; //check for bilateral permissions conversions
	this.resolvePermissionsTimeDelay = false; //end of night conversion of temp permissions
	this.messagePostList = []; //list of Messages to post

	this.getCurrentValue = function(g, propertyName) {
		if (this.updateGameDict.hasOwnProperty(propertyName)) {
			return this.updateGameDict[propertyName];
		} else if (propertyName.slice(0,8) == "private.") { //gotta support these explicitly
			if (propertyName.slice(8,23) == "extraLivesList.") { //to reconcile mongo/js syntax
				return g.private.extraLivesList[propertyName.slice(23)];
			} else {
				return g.private[propertyName.slice(8)];
			}
		} else {
			return g[propertyName];
		}
	}
	this.addToGameProperty = function(g, propertyName, value) {
		if (this.updateGameDict.hasOwnProperty(propertyName)) {
			this.updateGameDict[propertyName] += value;
		} else if (propertyName.slice(0,8) == "private.") { //gotta support these explicitly
			if (propertyName.slice(8,23) == "extraLivesList.") { //to reconcile mongo/js syntax
				this.updateGameDict[propertyName] = g.private.extraLivesList[propertyName.slice(23)] + value;
			} else {
				this.updateGameDict[propertyName] = g.private[propertyName.slice(8)] + value;
			}
		} else {
			this.updateGameDict[propertyName] = g[propertyName] + value;
		}
	}
	this.incrementGameProperty = function(g, propertyName) {
		return this.addToGameProperty(g, propertyName, 1);
	}
	this.decrementGameProperty = function(g, propertyName) {
		return this.addToGameProperty(g, propertyName, -1);
	}
	this.pushGameProperty = function(g, propertyName, newElement) {
		if (!this.updateGameDict.hasOwnProperty(propertyName)) {
			if (propertyName.slice(0,8) == "private.") {
				this.updateGameDict[propertyName] = g.private[propertyName.slice(8)];
			} else {
				this.updateGameDict[propertyName] = g[propertyName];

			}
		}
		return this.updateGameDict[propertyName].push(newElement);
	}
}

stepDict = {

	deal: {
		skip: null,
		title: "Role Deal",
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			//initialize deal vars
			var playerCount = g.playerIDList.length;
			if (playerCount < MIN_GAME_SIZE) {
				throw new Meteor.Error("not-enough-players-to-deal");
			}
			stepResult.updateGameDict['maxPlayerCount'] = playerCount;
			var roleCount = g.roleListList.length - 1
			var myRoleListList = g.roleListList.slice();
			var myTeamCountDict = {0: 0, 1: 0};
			var myTeamList = []; //does not include holy
			var needsCards = [];	//doubles as draft order
			var myRoleAssignments = [];
			var myTeamAssignments = [];
			for (var i = 0; i < playerCount; i++) {
				needsCards.push(i);
				myRoleAssignments.push([]);
				myTeamAssignments.push(null);
			}

			if (playerCount < 17) {
				myRoleListList[0].pop();
			}

			//make sure all neutral role lists are the correct length
			var targetRoleTotal = (playerCount - myRoleListList[0].length) * roleCount;
			for (var i = 1; i < myRoleListList.length; i++) {
				if (myRoleListList[i].length < targetRoleTotal) {
					throw new Meteor.Error("not-enough-roles");
				} else if (myRoleListList[i].length > targetRoleTotal) {
					myRoleListList[i] = myRoleListList[i].slice(0,targetRoleTotal);
				}
			}

			//decide team counts
			var myTeamBreakpointDict = baseSetTeamBreakpointDict;
			if (g.expansionList.indexOf(masterExpansionList.indexOf("Halftime")) != -1) {
				myTeamBreakpointDict = halftimeTeamBreakpointDict;
			} else if (g.expansionList.indexOf(masterExpansionList.indexOf("King's Court")) != -1) {
				myTeamBreakpointDict = kingscourtTeamBreakpointDict;
			} else if (g.expansionList.indexOf(masterExpansionList.indexOf("Love & War")) != -1) {
				myTeamBreakpointDict = loveandwarTeamBreakpointDict;
			}

			for (var key in myTeamBreakpointDict) {
				for (var i = 0; i < myTeamBreakpointDict[key].length; i++) {
					myTeamCountDict[key] = myTeamBreakpointDict[key][i];
					if (myTeamBreakpointDict[key][i] <= playerCount) {
						myTeamList.push(Number(key));
					}
				}
			}
			while (myTeamList.length + myRoleListList[0].length < playerCount) {
				myTeamList.push(0);
				myTeamCountDict[0] += 0;
			}

			//shuffle everything
			shuffle(needsCards);
			for (var i = 0; i < myRoleListList.length; i++) {
				shuffle(myRoleListList[i]);
			}
			shuffle(myTeamList);

			//randomly deal holy characters
			while (myRoleListList[0].length) {
				var pid = needsCards.shift();
				myRoleAssignments[pid] = [myRoleListList[0].shift()];
				myTeamAssignments[pid] = 1;
				myTeamCountDict[1] += 0;
			}

			//randomly assign remaining players highest priority draft pick and a random team
			while (needsCards.length) {
				var pid = needsCards.shift();
				//convert prefList to PLL for this game's roleListList
				var myPLL = [[]];
				var myPrefList = g.userAccounts[pid].prefList;
				for (var i = 1; i < g.roleListList.length; i++) {
					myPLL.push([]);
					for (var j = 0; j < myPrefList.length; j++) {
						if (g.roleListList[i].indexOf(myPrefList[j]) != -1) {
							myPLL[i].push(j);
							break;
						}
					}
				}

				var myRoleList = [];
				for (var i = 1; i < myPLL.length; i++) {
					var assigned = false;
					while (myPLL[i].length) {
						var prefRole = myPLL[i].shift();
						if (myRoleListList[i].indexOf(prefRole) != -1) { //check if role unassigned
							myRoleListList[i].splice(myRoleListList[i].indexOf(prefRole),1);
							myRoleList.push(prefRole);
							assigned = true;
							break;
						}
					}
					if (!assigned) { //else assign random role
						myRoleList.push(myRoleListList[i].shift());
					}
				}
				myRoleAssignments[pid] = myRoleList;
				myTeamAssignments[pid] = myTeamList.shift();
			}

			var hasPTom = g.roleListList[1].indexOf(masterRoleList.indexOf("Peeping Tom")) != -1;
			var hasPTim = g.roleListList[1].indexOf(masterRoleList.indexOf("Peeping Tim")) != -1;
			if (hasPTom || hasPTim) {
				var peasantList = [];
				var offensiveList = [];
				var defensiveList = [];
				var hasOffensivePeasant = false;
				var hasDefensivePeasant = false;
				for (var pid = 0; pid < myTeamAssignments.length; pid++) {
					var p = false;
					if (myTeamAssignments[pid] == 0) { //if peasant
						peasantList.push(pid);
						p = true;
					}
					if (roleCategoryList[myRoleAssignments[pid][0]] == masterCategoryList.indexOf("Offensive")) {
						offensiveList.push(pid);
						if (p) {
							hasOffensivePeasant = true;
						}
					} else if (roleCategoryList[myRoleAssignments[pid][0]] == masterCategoryList.indexOf("Defensive")) {
						defensiveList.push(pid);
						if (p) {
							hasDefensivePeasant = true;
						}
					}
				}
				shuffle(peasantList);
				shuffle(offensiveList);
				shuffle(defensiveList);
				if (hasPTom && (!hasOffensivePeasant)) { //check to make sure we have at least one offensive peasant)
					var peasantID = peasantList.pop();
					var donorID = offensiveList.pop();
					myTeamAssignments[peasantID] = myTeamAssignments[donorID]; //swap teams with donor
					myTeamAssignments[donorID] = 0;
				}
				if (hasPTim && (!hasDefensivePeasant)) { //check to make sure we have at least one defensive peasant)
					var peasantID = peasantList.pop();
					var donorID = offensiveList.pop();
					myTeamAssignments[peasantID] = myTeamAssignments[donorID]; //swap teams with donor
					myTeamAssignments[donorID] = 0;
				}
			}

			stepResult.updateGameDict['teamCountDict'] = myTeamCountDict;
			stepResult.updateGameDict['private.playerRoleListList'] = myRoleAssignments;
			stepResult.updateGameDict['private.playerTeamList'] = myTeamAssignments;

			return stepResult;
		}
	},
	pregameEmail: {
		skip: function(g) {return true},
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			return stepResult;
		},
	},
	gameStart: {
		skip: null,
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			//generate and store events, prepare game.player objects, create Targets and PermissionsLists
			stepResult.eventList.push({tag:"@START", subindex: -999});
			stepResult.addTargetList.push(new Target(g.gid, "lynch-master", null, null));
			var playerList = [];
			var extraLivesList = [];
			var deathDataList = [];
			for (var pid = 0; pid < g.private.playerRoleListList.length; pid++) {
				if (g.userVoting) {
					stepResult.addTargetList.push(new Target(g.gid, "lynch-vote#", pid, null));
				}
				PermissionsLists.insert(new PermissionsList(g.gid, pid, ['a' + pid]));
				var myRoleList = g.private.playerRoleListList[pid];
				for (var roleIndex in myRoleList) {
					var roleString = masterRoleList[myRoleList[roleIndex]];
					if (roleString == "Apprentice") {
						stepResult.updateTargetTupleList.push([{gid: g.gid, tag: "Apprentice"},
							{$set: {whitelist: [masterRoleList.indexOf("Gravedigger"), masterRoleList.indexOf("Judge")]}}]);
					}
					stepResult.addTargetList.push(new Target(g.gid, roleString, pid, null));
					if (doubleTargetList.indexOf(roleString) != -1) { //some roles have two target objects
						stepResult.addTargetList.push(new Target(g.gid, (roleString + '-2'), pid, null));
					}
				}
				var myTeam = g.private.playerTeamList[pid];
				var myTeamRaw = myTeam;
				var mySubteam = null;
				if (myTeam > 9) {
					mySubteam = myTeam % 10;
					myTeam = Math.floor(myTeam / 10);
				} else if (myTeam < -9) {
					mySubteam = Math.abs(myTeam % 10);
					myTeam = Math.ceil(myTeam / 10);
				}
				var p = new Player(g.playerIDList[pid], g.playerNameList[pid], pid, myTeam, mySubteam, myRoleList);
				playerList.push(p);
				var myLogEvent = {tag: "@A", subindex: pid, actors: [pid], teamIndex: myTeamRaw};
				for (var i = 0; i < myRoleList.length; i++) {
					myLogEvent["roleIndex" + (i+1)] = myRoleList[i];
				}
				stepResult.eventList.push(myLogEvent);
				extraLivesList.push(0);
				deathDataList.push(null);
			}
			PermissionsLists.insert(new PermissionsList(g.gid, 'coven', []));
			if (g.expansionList.indexOf(2) != -1) {
				PermissionsLists.insert(new PermissionsList(g.gid, 'court', []));
			}
			if (g.private.playerTeamList.indexOf(-2) != -1) {
				PermissionsLists.insert(new PermissionsList(g.gid, 'juniors', []));
			}
			if (g.private.playerTeamList.indexOf(-3) != -1) {
				PermissionsLists.insert(new PermissionsList(g.gid, 'traitors', []));
			}
			if (g.private.playerTeamList.indexOf(2) != -1) {
				PermissionsLists.insert(new PermissionsList(g.gid, 'spies', []));
			}
			if (g.private.playerTeamList.indexOf(3) != -1) {
				PermissionsLists.insert(new PermissionsList(g.gid, 'knights', []));
			}
			if (g.private.playerTeamList.indexOf(41) != -1) {
				PermissionsLists.insert(new PermissionsList(g.gid, 'lovers1', []));
			}
			if (g.private.playerTeamList.indexOf(42) != -1) {
				PermissionsLists.insert(new PermissionsList(g.gid, 'lovers2', []));
			}
			if (g.private.playerTeamList.indexOf(43) != -1) {
				PermissionsLists.insert(new PermissionsList(g.gid, 'lovers3', []));
			}
			PermissionsLists.insert(new PermissionsList(g.gid, 'angels', ['xa']));
			PermissionsLists.insert(new PermissionsList(g.gid, 'demons', ['xd']));
			PermissionsLists.insert(new PermissionsList(g.gid, 'angelsDelayed', []));
			PermissionsLists.insert(new PermissionsList(g.gid, 'demonsDelayed', []));

			stepResult.updateGameDict['private.playerList'] = playerList;
			stepResult.updateGameDict['private.extraLivesList'] = extraLivesList;
			stepResult.updateGameDict['deathDataList'] = deathDataList;
			return stepResult;
		},
	},
	'debugRandomTargets': {
		skip: function(g) {return (!g.debugRandomTargets)},
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			var targets = Targets.find({gid: g.gid, locked: 0}).fetch();
			for (var index in targets) {
				var t = targets[index];
				var newTargets = shuffle(getLegalTargetList(g, t)).slice(-t.t.length);
				while (newTargets.length < t.t.length) {
					newTargets.push(77);
				}
				stepResult.changeTargetDict[t.tag] = newTargets;
			}
			return stepResult;
		},
	},
	'meet-Witches': {
		skip: null,
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			var witchPIDs = [];
			var mixedJuniorPIDs = [];
			var warlockPIDs = [];
			for (var pid = 0; pid < g.private.playerTeamList.length; pid++) {
				switch (g.private.playerTeamList[pid]) {
					case -1:
						witchPIDs.push(pid);
						break;
					case -2:
					case 2:
						mixedJuniorPIDs.push(pid);
						break;
					case -3:
						warlockPIDs.push(pid);
						break;
					default:
						break;
				}
			}

			stepResult.updateGameDict['private.covenList'] = witchPIDs;
			stepResult.eventList.push({tag: '@WR', actors: witchPIDs});
			stepResult.addTargetList.push(new Target(g.gid, "coven-master", null, g.private.currentSubchannelDict['c']));
			stepResult.addTargetList.push(new Target(g.gid, "covenIllusion-master", null, g.private.currentSubchannelDict['c']));
			if (mixedJuniorPIDs.length) {
				shuffle(mixedJuniorPIDs);
				stepResult.eventList.push({tag: '@JSR1', actors: witchPIDs, targets: mixedJuniorPIDs});
				stepResult.addTargetList.push(new Target(g.gid, "covenRecruit-master", null, g.private.currentSubchannelDict['c']));
			}
			if (warlockPIDs.length) {
				stepResult.eventList.push({tag: '@WLR', actors: witchPIDs, targets: warlockPIDs});
			}

			for (var index in witchPIDs) {
				var pid = witchPIDs[index];
				stepResult.updatePermissionsKeyDict[pid] = "coven";
				if (g.userVoting) {
					stepResult.addTargetList.push(new Target(g.gid, "coven-vote#", pid, g.private.currentSubchannelDict['c']));
					stepResult.addTargetList.push(new Target(g.gid, "covenIllusion-vote#", pid, g.private.currentSubchannelDict['c']));
					if (mixedJuniorPIDs.length) {
						stepResult.addTargetList.push(new Target(g.gid, "covenRecruit-vote#", null, g.private.currentSubchannelDict['c']));
					}
				}
			}
			return stepResult;
		},
	},
	'meet-Juniors': {
		skip: function(g) {
			var teamCount = 0;
			for (var index in g.private.playerTeamList) {
				if (g.private.playerTeamList[index] == -2) {
					teamCount += 1;
				}
			}
			return (teamCount < 2);
		},
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			var groupPIDs = [];
			for (var pid = 0; pid < g.private.playerTeamList.length; pid++) {
				if (g.private.playerTeamList[pid] == -2) {
					groupPIDs.push(pid);
					stepResult.updatePermissionsKeyDict[pid] = "juniors";
				}
			}
			stepResult.eventList.push({tag: '@JR', actors: groupPIDs});
			return stepResult;
		},
	},
	'meet-Traitors': {
		skip: function(g) {
			var teamCount = 0;
			for (var index in g.private.playerTeamList) {
				if (g.private.playerTeamList[index] == -3) {
					teamCount += 1;
				}
			}
			return (teamCount < 2);
		},
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			var groupPIDs = [];
			for (var pid = 0; pid < g.private.playerTeamList.length; pid++) {
				if (g.private.playerTeamList[pid] == -3) {
					groupPIDs.push(pid);
					stepResult.updatePermissionsKeyDict[pid] = "traitors";
				}
			}
			stepResult.eventList.push({tag: '@TR', actors: groupPIDs});
			return stepResult;
		},
	},
	'meet-Spies': {
		skip: function(g) {
			var teamCount = 0;
			for (var index in g.private.playerTeamList) {
				if (g.private.playerTeamList[index] == 2) {
					teamCount += 1;
				}
			}
			return (teamCount < 2);
		},
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			var groupPIDs = [];
			for (var pid = 0; pid < g.private.playerTeamList.length; pid++) {
				if (g.private.playerTeamList[pid] == 2) {
					groupPIDs.push(pid);
					stepResult.updatePermissionsKeyDict[pid] = "spies";
				}
			}
			stepResult.eventList.push({tag: '@SR', actors: groupPIDs});
			return stepResult;
		},
	},
	'meet-Knights': {
		skip: function(g) {
			var teamCount = 0;
			for (var index in g.private.playerTeamList) {
				if (g.private.playerTeamList[index] == 3) {
					teamCount += 1;
				}
			}
			return (teamCount < 2);
		},
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			var groupPIDs = [];
			for (var pid = 0; pid < g.private.playerTeamList.length; pid++) {
				if (g.private.playerTeamList[pid] == 3) {
					groupPIDs.push(pid);
					stepResult.updatePermissionsKeyDict[pid] = "knights";
				}
			}
			stepResult.eventList.push({tag: '@KGR', actors: groupPIDs});
			return stepResult;
		},
	},
	'meet-Lovers': {
		skip: function(g) {
			var teamCount = 0;
			for (var index in g.private.playerTeamList) {
				if (g.private.playerTeamList[index] == 41) {
					teamCount += 1;
				}
			}
			return (teamCount < 2);
		},
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			for (var i = 1; i < 4; i++) {
				var groupPIDs = [];
				for (var pid = 0; pid < g.private.playerTeamList.length; pid++) {
					if (g.private.playerTeamList[pid] == 40 + i) {
						groupPIDs.push(pid);
						stepResult.updatePermissionsKeyDict[pid] = "lovers" + i;
					}
				}
				if (groupIDs.length == 2) {
					stepResult.permissionsUpdateDict["lovers" + i] = ['gl' + i + '0'];
					stepResult.eventList.push({tag: '@LR', actors: [groupPIDs[0]], targets: [groupPIDs[1]]});
				}
			}
			return stepResult;
		},
	},
	'meet-Travelers': {
		skip: function(g) {
			var teamCount = 0;
			var travelerRoleIDs = [];
			for (var i = 0; i < masterRoleList; i++) {
				if (masterRoleList[i].slice(0,9) == "Traveling") {
					travelerRoleIDs.push(i);
				}
			}
			for (var pid in g.private.playerRoleListList) {
				for (var roleIndex in g.private.playerRoleListList[pid]) {
					if (g.private.playerTeamList[pid][roleIndex] in travelerRoleIDs) {
						teamCount += 1;
					}
				}
			}
			return (teamCount < 2);
		},
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			stepResult.eventList.push({tag: '@TVR', actors: []});
			return stepResult;
		},
	},
	'dayStart': {
		skip: null,
		title: null,
		target_auto: null,
		step_auto: null,
		step: function(g) {
			var stepResult = new StepResult();
			//stepResult.eventList.push({tag: '', actors: [], targets: []});





			stepResult.updateTargetTupleList.push([{gid: g.gid, tag: {$regex: /lynch-/}}, {$set: {locked: 0}}]);
			stepResult.incrementGameProperty(g, 'cycleNum');
			stepResult.updateGameDict['lastLynchTarget'] = null;
			stepResult.updateGameDict['private.tempTarget'] = null;
			stepResult.updateGameDict['private.checkedFanatic'] = false;
			stepResult.updateGameDict['private.angelMessage'] = null;
			stepResult.updateGameDict['private.angelProtectList'] = [];
			stepResult.updateGameDict['private.shenanigansTargetList'] = [];
			stepResult.updateGameDict['private.curseTargetList'] = [];
			stepResult.updateGameDict['private.nightProtectList'] = [];
			stepResult.updateGameDict['private.nightKillList'] = [];
			stepResult.updateGameDict['private.nightSurvivalList'] = [];
			return stepResult;
		},
	},
	'lynch-master': {
		skip: null,
		title: null,
		target_auto: 5,
		step_auto: 5,
		step: function(g) {
			var stepResult = new StepResult();
			var t = Targets.findOne({gid: g.gid, tag: "lynch-master"});
			var lynchTarget = [77];
			if (t.t[0] != 77) {
				lynchTarget = t.t;
			} else {
				var votes_cursor = Targets.find({gid: g.gid, tag: {$regex: /lynch-/}});
				lynchTarget = tallyVotes(votes_cursor, true);
			}
			if (lynchTarget[0] == 77 || lynchTarget[0] == 88) {
				stepResult.eventList.push({tag: '@LK', targets: lynchTarget});
			} else {
				var result = kill(stepResult, g, lynchTarget[0], 'lynch');
				if (!result[1]) { //dead
					stepResult.eventList.push({tag: '@LK', targets: lynchTarget, statusCodes: [0], targetAliveBool: 0});
					onDeath(stepResult, g, lynchTarget[0], "Day");
				} else { //survived
					stepResult.eventList.push({tag: '@LK', targets: lynchTarget, statusCodes: [result[1]], targetAliveBool: 1});
					onSurvival(stepResult, g, lynchTarget[0], "Day");
				}
			}
			stepResult.updateGameDict['lastLynchTarget'] = lynchTarget[0];
			return stepResult;
		},
	},
	'victoryCheckA': {
		skip: function(g) {return true},
		title: null,
		target_auto: null,
		step_auto: 4,
		step: function(g) {
			var stepResult = new StepResult();
			stepResult.eventList.push({tag: '', actors: [], targets: []});
			return stepResult;
		},
	},
	'victoryCheckB': {
		skip: function(g) {return true},
		title: null,
		target_auto: null,
		step_auto: 4,
		step: function(g) {
			var stepResult = new StepResult();
			stepResult.eventList.push({tag: '', actors: [], targets: []});
			return stepResult;
		},
	},
	'bombPass': {
		skip: function(g) {return this.bombHolder == null;},
		title: null,
		target_auto: null,
		step_auto: 4,
		step: function(g) {
			var stepResult = new StepResult();
			//stepResult.eventList.push({tag: '', actors: [], targets: []});
			return stepResult;
		},
	},
	'nightStart': {
		skip: null,
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			if (g.userVoting) {
				stepResult.updateTargetTupleList.push([{gid: g.gid, tag: {$regex: /lynch-/}}, {$set: {locked: 1}}]);
			}
			//TODO - adjust coven vote Target objects for last stand
			//TODO - adjust coven vote Target objects for traitor join bonus
			return stepResult;
		},
	},
	'deadMultiplex': {
		skip: function(g) {return true},
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			stepResult.eventList.push({tag: '', actors: [], targets: []});
			return stepResult;
		},
	},
	'loverSuicide1': {
		skip: function(g) {return true},
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			stepResult.eventList.push({tag: '', actors: [], targets: []});
			return stepResult;
		},
	},
	'loverSuicide2': {
		skip: function(g) {return true},
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			stepResult.eventList.push({tag: '', actors: [], targets: []});
			return stepResult;
		},
	},
	'loverSuicide3': {
		skip: function(g) {return true},
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			stepResult.eventList.push({tag: '', actors: [], targets: []});
			return stepResult;
		},
	},
	'lustSuicide': {
		skip: function(g) {return true},
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			stepResult.eventList.push({tag: '', actors: [], targets: []});
			return stepResult;
		},
	},
	'resolveNightKills': {
		skip: function(g) {return true},
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			stepResult.eventList.push({tag: '', actors: [], targets: []});
			return stepResult;
		},
	},
	'villageWin': {
		skip: function(g) {return true},
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			stepResult.eventList.push({tag: '', actors: [], targets: []});
			return stepResult;
		},
	},
	'witchWin': {
		skip: function(g) {return true},
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			stepResult.eventList.push({tag: '', actors: [], targets: []});
			return stepResult;
		},
	},
	'Priest': {
		skip: function(g) {return true},
		title: null,
		role_index: masterRoleList.indexOf('Priest'),
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			var t = Targets.findOne({gid: g.gid, tag: "Priest"});
			var myPID = t.a;
			stepResult.eventList.push({tag: '', actors: [myPID], targets: []});
			return stepResult;
		},
	},
	'Judge': {
		skip: function(g) {
			if (g.lastLynchTarget != 77 && g.lastLynchTarget != 88) { //non no-lynch
				return true;
			} else if (g.privateApprenticeChoice == masterRoleList.indexOf("Judge") && //has apprentice
			           g.deathDataList[getPIDn(g, "Judge")] != null) { //judge dead
				return true;
			}
			return false;
		},
		title: null,
		role_index: masterRoleList.indexOf('Judge'),
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			var t = Targets.findOne({gid: g.gid, tag: "Judge"});
			var myPID = t.a;
			if (g.deathDataList[myPID] != null) { //dead judge
				stepResult.eventList.push({tag: '$J', alive: 0, actors: [myPID], targets: [77],
				                           townLynchTarget: g.lastLynchTarget});
			} else { //living judge
				lynchTarget = t.t[0];
				if (lynchTarget[0] == 77 || lynchTarget[0] == 88) {
					stepResult.eventList.push({tag: '$J', alive: 1, actors: [myPID], targets: [77],
					                           townLynchTarget: g.lastLynchTarget});
				} else {
					var extraLivesBurned = g.private.extraLivesList[lynchTarget[0]];
					var result = kill(stepResult, g, lynchTarget[0], 'judge');
					stepResult.updateGameDict['lastLynchTarget'] = lynchTarget[0];
					if (!result[1]) { //dead
						stepResult.eventList.push({tag: '$J', alive: 1, actors: [myPID], targets: lynchTarget,
						                           townLynchTarget: g.lastLynchTarget,
						                           statusCodes: [0], targetAliveBool: 0, extraLivesBurned: extraLivesBurned});
						onDeath(stepResult, g, lynchTarget[0], "Day");
					} else { //survived
						stepResult.eventList.push({tag: '$J', alive: 1, actors: [myPID], targets: lynchTarget,
						                           townLynchTarget: g.lastLynchTarget,
						                           statusCodes: [result[1]], targetAliveBool: 1});
						onSurvival(stepResult, g, lynchTarget[0], "Day");
					}
				}
			}
			return stepResult;
		},
	},
	'Dirty Old Bastard': {
		skip: function(g) {return true},
		title: null,
		role_index: masterRoleList.indexOf('Dirty Old Bastard'),
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			var t = Targets.findOne({gid: g.gid, tag: "Dirty Old Bastard"});
			var myPID = t.a;
			stepResult.eventList.push({tag: '', actors: [myPID], targets: []});
			return stepResult;
		},
	},
	'Hunter': {
		skip: function(g) {return g.hunterNight != g.cycleNum},
		title: null,
		role_index: masterRoleList.indexOf('Hunter'),
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			var t = Targets.findOne({gid: g.gid, tag: "Hunter"});
			var myPID = t.a;
			stepResult.eventList.push({tag: '$H', actors: [myPID], targets: []});
			return stepResult;
		},
	},
	'Survivalist': {
		skip: null,
		title: null,
		role_index: masterRoleList.indexOf('Survivalist'),
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			var myPID = getPIDn(g, 'Survivalist');
			stepResult.updateGameDict["private.extraLivesList." + myPID] = 1;
			stepResult.eventList.push({tag: '$S', actors: [myPID]});
			return stepResult;
		},
	},
	'Gambler': {
		skip: null,
		title: null,
		role_index: masterRoleList.indexOf('Gambler'),
		target_auto: 3,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			var t = Targets.findOne({gid: g.gid, tag: "Gambler"});
			var myPID = t.a;
			var selectionInt = t.t[0];
			stepResult.updateTargetTupleList.push([{gid: g.gid, tag: "Gambler"}, {$set: {locked: 1}}]);
			stepResult.updateGameDict['private.gamblerChoice'] = selectionInt;
			stepResult.eventList.push({tag: '$G1', actors: [myPID], selectionInt: selectionInt});
			return stepResult;
		},
	},
	'Fanatic': {
		skip: function(g) {return g.private.checkedFanatic},
		title: null,
		role_index: masterRoleList.indexOf('Fanatic'),
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			var myPID = getPIDn(g, 'Fanatic');
			var selfExtraLifeCount = g.private.extraLivesList[myPID];
			stepResult.updateGameDict["private.extraLivesList." + myPID] = selfExtraLifeCount;
			stepResult.eventList.push({tag: '$F', actors: [myPID], selfExtraLifeCount: selfExtraLifeCount});
			return stepResult;
		},
	},
	'Fanatic-2': {
		skip: function(g) {
			var priest_pid = getPIDn(g, 'Priest');
			if (priest_pid != null && priest_pid == g.lastLynchTarget) {
				return false;
			}
			return true;
		},
		title: null,
		role_index: masterRoleList.indexOf('Fanatic'),
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			var myPID = getPIDn(g, 'Fanatic');
			var selfExtraLifeCount = g.private.extraLivesList[myPID];
			stepResult.updateGameDict["private.extraLivesList." + myPID] = selfExtraLifeCount;
			stepResult.eventList.push({tag: '$F2', actors: [myPID], selfExtraLifeCount: selfExtraLifeCount});
			return stepResult;
		},
	},
	'Gravedigger': {
		skip: function(g) {
			if (g.privateApprenticeChoice == masterRoleList.indexOf("Gravedigger") &&
				g.deathDataList[getPIDn(g, "Gravedigger")] != null) { //gravedigger dead + has apprentice
				return true;
			}
			return false;
		},
		title: null,
		role_index: masterRoleList.indexOf('Gravedigger'),
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			var myPID = getPIDn(g, 'Gravedigger');
			if (g.deathDataList[myPID] != null) { //dead gravedigger
				for (var pid = 0; pid < g.deathDataList.length; pid++) {
					if (g.deathDataList[pid] != null && g.deathDataList[pid][0] == g.cycleNum) {
						stepResult.eventList.push({tag: '$GD', alive: 0, actors: [myPID], targets: [pid]});
					}
				}
			} else { //living gravedigger
				for (var pid = 0; pid < g.deathDataList.length; pid++) {
					if (g.deathDataList[pid] != null && g.deathDataList[pid][0] == g.cycleNum) {
						stepResult.eventList.push({tag: '$GD', alive: 1, actors: [myPID], targets: [pid],
							resultCardList: resultCardList});
					}
				}
			}
			return stepResult;
		},
	},
	'Apprentice': {
		skip: null,
		title: null,
		role_index: masterRoleList.indexOf('Apprentice'),
		target_auto: 3,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			var t = Targets.findOne({gid: g.gid, tag: "Apprentice"});
			var myPID = t.a;
			var tPID = 77;
			var selectedRoleIndex = t.t[0];
			if (selectedRoleIndex != 77) {
				tPID = getPID(g, selectedRoleIndex);
			}
			if (selectedRoleIndex == masterRoleList.indexOf("Judge")) { //add apprentice-judge target object
				Targets.insert(new Target(g.gid, "Apprentice-J", myPID, null));
			}
			stepResult.updateTargetTupleList.push([{gid: g.gid, tag: "Apprentice"}, {$set: {locked: 1}}]);
			stepResult.updateGameDict['private.appenticeChoice'] = selectedRoleIndex;
			stepResult.eventList.push({tag: '$A', actors: [myPID], targets: [tPID], selectedRoleIndex: selectedRoleIndex});
			return stepResult;
		},
	},
	'Apprentice-J': {
		skip: function(g) {
			if ((g.lastLynchTarget != 77 && g.lastLynchTarget != 88) || //non no-lynch
			    g.privateApprenticeChoice != masterRoleList.indexOf("Judge") || //picked different
			    g.deathDataList[getPIDn(g, "Judge")] == null) { //judge alive
				return true;
			}
			return false;
		},
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			var t = Targets.findOne({gid: g.gid, tag: "Apprentice-J"});
			var myPID = t.a;
			var judgePID = getPIDn(g, "Judge");
			if (g.deathDataList[myPID] != null) { //dead apprentice-judge
				stepResult.eventList.push({tag: '$J', alive: 0, actors: [myPID], targets: [77],
				                           townLynchTarget: g.lastLynchTarget,
				                           deadJudgeID: judgePID});
			} else { //living apprentice-judge
				lynchTarget = t.t[0];
				if (lynchTarget[0] == 77 || lynchTarget[0] == 88) {
					stepResult.eventList.push({tag: '$J', alive: 1, actors: [myPID], targets: [77],
					                           townLynchTarget: g.lastLynchTarget,
					                           deadJudgeID: judgePID});
				} else {
					var result = kill(stepResult, g, lynchTarget[0], 'judge');
					stepResult.updateGameDict['lastLynchTarget'] = lynchTarget[0];
					if (!result[1]) { //dead
						stepResult.eventList.push({tag: '$J', alive: 1, actors: [myPID], targets: lynchTarget,
						                           townLynchTarget: g.lastLynchTarget,
						                           statusCodes: [0], targetAliveBool: 0, extraLivesBurned: extraLivesBurned,
						                           deadJudgeID: judgePID});
						onDeath(stepResult, g, lynchTarget[0], "Day");
					} else { //survived
						stepResult.eventList.push({tag: '$J', alive: 1, actors: [myPID], targets: lynchTarget,
						                           townLynchTarget: g.lastLynchTarget,
						                           statusCodes: [result[1]], targetAliveBool: 1,
						                           deadJudgeID: judgePID});
						onSurvival(stepResult, g, lynchTarget[0], "Day");
					}
				}
			}
			return stepResult;
		},
	},
	'Apprentice-G': {
		skip: function(g) {
			if (g.privateApprenticeChoice != masterRoleList.indexOf("Gravedigger") ||
			    g.deathDataList[getPIDn(g, "Gravedigger")] == null) { //gravedigger not dead
				return true;
			}
			return false;
		},
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			var myPID = getPIDn(g, 'Apprentice');
			var deadGravediggerID = getPIDn(g, 'Gravedigger');
			if (g.deathDataList[myPID] != null) { //dead apprentice
				for (var pid = 0; pid < g.deathDataList.length; pid++) {
					if (g.deathDataList[pid] != null && g.deathDataList[pid][0] == g.cycleNum) {
						stepResult.eventList.push({tag: '$GD', alive: 0, actors: [myPID], targets: [pid],
							deadGravediggerID: deadGravediggerID});
					}
				}
			} else {
				for (var pid = 0; pid < g.deathDataList.length; pid++) {
					if (g.deathDataList[pid] != null && g.deathDataList[pid][0] == g.cycleNum) {
						stepResult.eventList.push({tag: '$GD', alive: 1, actors: [myPID], targets: [pid],
							resultCardList: resultCardList, deadGravediggerID: deadGravediggerID});
					}
				}
			}
			return stepResult;
		},
	},
	'Oracle always': {
		skip: null,
		title: null,
		role_index: masterRoleList.indexOf('Oracle'),
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			stepResult.permissionsPool = true;

			var myPID = getPIDn(g, 'Oracle');
			var deathLocationQueue = [];
			for (var key in deathLocationStringDict) {
				if (key != "77") {
					deathLocationQueue.push(Number(key));
				}
			}
			shuffle(deathLocationQueue);
			if (myPID != null) {
				var priestDeathLocationIndex = deathLocationQueue.pop();
				stepResult.updateGameDict['private.priestDeathLocationIndex'] = priestDeathLocationIndex;
				stepResult.eventList.push({tag: '$O', actors: [myPID], priestDeathLocationIndex: [priestDeathLocationIndex]});
			}
			stepResult.updateGameDict['private.deathLocationQueue'] = deathLocationQueue;
			return stepResult;
		},
	},
	'Peeping Tom': {
		skip: null,
		title: null,
		role_index: masterRoleList.indexOf('Peeping Tom'),
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			var myPID = getPIDn(g, 'Peeping Tom');
			var offensiveList = [];
			for (var pid = 0; pid < g.private.playerTeamList.length; pid++) {
				if (g.private.playerTeamList[pid] == 0) {
					if (roleCategoryList[g.private.playerRoleListList[pid][0]] == masterCategoryList.indexOf("Offensive")) {
						offensiveList.push(pid);
					}
				}
			}
			shuffle(offensiveList);
			stepResult.eventList.push({tag: '$PT2', actors: [myPID], targets: [offensiveList.pop()]});
			return stepResult;
		},
	},
	'Peeping Tim': {
		skip: null,
		title: null,
		role_index: masterRoleList.indexOf('Peeping Tim'),
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			var myPID = getPIDn(g, 'Peeping Tim');
			var defensiveList = [];
			for (var pid = 0; pid < g.private.playerTeamList.length; pid++) {
				if (g.private.playerTeamList[pid] == 0) {
					if (roleCategoryList[g.private.playerRoleListList[pid][0]] == masterCategoryList.indexOf("Defensive")) {
						defensiveList.push(pid);
					}
				}
			}
			shuffle(defensiveList);
			stepResult.eventList.push({tag: '$PT1', actors: [myPID], targets: [defensiveList.pop()]});
			return stepResult;
		},
	},
	'Acolyte': {
		skip: null,
		title: null,
		role_index: masterRoleList.indexOf('Acolyte'),
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			var myPID = getPIDn(g, 'Acolyte');
			var priest_pid = getPID(g, masterRoleList.indexOf('Priest'));
			stepResult.eventList.push({tag: '$ACO', actors: [myPID], targets: [priest_pid]});
			return stepResult;
		},
	},
	'Loose Cannon': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Loose Cannon'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Loose Cannon'));
					var t = Targets.findOne({gid: g.gid, tag: 'Loose Cannon'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Bomber': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Bomber'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Bomber'));
					var t = Targets.findOne({gid: g.gid, tag: 'Bomber'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Bomber Detonate': {skip: function(g) {return true},
				title: null,
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Assassin': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Assassin'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Assassin'));
					var t = Targets.findOne({gid: g.gid, tag: 'Assassin'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Assassin Guess': {skip: function(g) {return true},
				title: null,
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Emissary': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Emissary'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Emissary'));
					var t = Targets.findOne({gid: g.gid, tag: 'Emissary'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Benevolent Old Dame': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Benevolent Old Dame'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Benevolent Old Dame'));
					var t = Targets.findOne({gid: g.gid, tag: 'Benevolent Old Dame'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Nurse': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Nurse'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Nurse'));
					var t = Targets.findOne({gid: g.gid, tag: 'Nurse'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Spiritualist': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Spiritualist'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Spiritualist'));
					var t = Targets.findOne({gid: g.gid, tag: 'Spiritualist'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Inquisitor': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Inquisitor'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Inquisitor'));
					var t = Targets.findOne({gid: g.gid, tag: 'Inquisitor'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Detective': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Detective'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Detective'));
					var t = Targets.findOne({gid: g.gid, tag: 'Detective'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Bishop': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Bishop'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Bishop'));
					var t = Targets.findOne({gid: g.gid, tag: 'Bishop'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Daredevil': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Daredevil'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Daredevil'));
					var t = Targets.findOne({gid: g.gid, tag: 'Daredevil'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Magician': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Magician'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Magician'));
					var t = Targets.findOne({gid: g.gid, tag: 'Magician'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Conspirator': {
		skip: null,
		title: null,
		role_index: masterRoleList.indexOf('Conspirator'),
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = new StepResult();
			var myPID = getPIDn(g, 'Conspirator');
			var groupPIDs = [];
			var spyRoleIndexListList = [];
			for (var pid = 0; pid < g.private.playerTeamList.length; pid++) {
				if (g.private.playerTeamList[pid] == 2) {
					groupPIDs.push(pid);
					spyRoleIndexListList.push(g.private.playerRoleListList[pid]);
				}
			}
			shuffle(spyRoleIndexListList);
			stepResult.eventList.push({tag: '$CON1', actors: [myPID], targets: groupPIDs,
			                           spyRoleIndexListList: spyRoleIndexListList, spyCount: groupPIDs.length});
			return stepResult;
		},
	},
	'Con Artist': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Con Artist'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Con Artist'));
					var t = Targets.findOne({gid: g.gid, tag: 'Con Artist'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Knife Thrower': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Knife Thrower'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Knife Thrower'));
					var t = Targets.findOne({gid: g.gid, tag: 'Knife Thrower'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Investigator': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Investigator'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Investigator'));
					var t = Targets.findOne({gid: g.gid, tag: 'Investigator'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Innkeeper': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Innkeeper'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Innkeeper'));
					var t = Targets.findOne({gid: g.gid, tag: 'Innkeeper'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Butcher': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Butcher'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Butcher'));
					var t = Targets.findOne({gid: g.gid, tag: 'Butcher'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Alchemist': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Alchemist'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Alchemist'));
					var t = Targets.findOne({gid: g.gid, tag: 'Alchemist'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Alchemist Life Toggle': {skip: function(g) {return true},
				title: null,
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Entertainer': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Entertainer'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Entertainer'));
					var t = Targets.findOne({gid: g.gid, tag: 'Entertainer'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Clown': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Clown'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Clown'));
					var t = Targets.findOne({gid: g.gid, tag: 'Clown'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'King': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('King'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('King'));
					var t = Targets.findOne({gid: g.gid, tag: 'King'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Queen': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Queen'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Queen'));
					var t = Targets.findOne({gid: g.gid, tag: 'Queen'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Undertaker': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Undertaker'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Undertaker'));
					var t = Targets.findOne({gid: g.gid, tag: 'Undertaker'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Squire': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Squire'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Squire'));
					var t = Targets.findOne({gid: g.gid, tag: 'Squire'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Jester': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Jester'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Jester'));
					var t = Targets.findOne({gid: g.gid, tag: 'Jester'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Count': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Count'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Count'));
					var t = Targets.findOne({gid: g.gid, tag: 'Count'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Vizier': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Vizier'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Vizier'));
					var t = Targets.findOne({gid: g.gid, tag: 'Vizier'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Vigilante': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Vigilante'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Vigilante'));
					var t = Targets.findOne({gid: g.gid, tag: 'Vigilante'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Traveling Medic': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Traveling Medic'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Traveling Medic'));
					var t = Targets.findOne({gid: g.gid, tag: 'Traveling Medic'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Traveling Mercenary': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Traveling Mercenary'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Traveling Mercenary'));
					var t = Targets.findOne({gid: g.gid, tag: 'Traveling Mercenary'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Traveling Mystic': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Traveling Mystic'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Traveling Mystic'));
					var t = Targets.findOne({gid: g.gid, tag: 'Traveling Mystic'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Traveling Minstrel': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Traveling Minstrel'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Traveling Minstrel'));
					var t = Targets.findOne({gid: g.gid, tag: 'Traveling Minstrel'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Templar': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Templar'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Templar'));
					var t = Targets.findOne({gid: g.gid, tag: 'Templar'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Lookout': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Lookout'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Lookout'));
					var t = Targets.findOne({gid: g.gid, tag: 'Lookout'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Captain': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Captain'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Captain'));
					var t = Targets.findOne({gid: g.gid, tag: 'Captain'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Matchmaker': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Matchmaker'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Matchmaker'));
					var t = Targets.findOne({gid: g.gid, tag: 'Matchmaker'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Ninja': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Ninja'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Ninja'));
					var t = Targets.findOne({gid: g.gid, tag: 'Ninja'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Seducer': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Seducer'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Seducer'));
					var t = Targets.findOne({gid: g.gid, tag: 'Seducer'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Seducer Kill': {skip: function(g) {return true},
				title: null,
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Rogue': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Rogue'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Rogue'));
					var t = Targets.findOne({gid: g.gid, tag: 'Rogue'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Blacksmith': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Blacksmith'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Blacksmith'));
					var t = Targets.findOne({gid: g.gid, tag: 'Blacksmith'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Engineer': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Engineer'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Engineer'));
					var t = Targets.findOne({gid: g.gid, tag: 'Engineer'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Executioner': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Executioner'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Executioner'));
					var t = Targets.findOne({gid: g.gid, tag: 'Executioner'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Admiral': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Admiral'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Admiral'));
					var t = Targets.findOne({gid: g.gid, tag: 'Admiral'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Vampire Hunter': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Vampire Hunter'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = new StepResult();
					var pid = getPID(g, masterRoleList.indexOf('Vampire Hunter'));
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
};

targetPromptDict = {
	char5: "Gambler, will you choose odd or even?", //string or function(gid) that returns a string using TBD special formatting templates
}

function getPIDn(g, roleName) {
	return getPID(g, masterRoleList.indexOf(roleName));
}

function getPID(g, roleIndex) {
	for (var pid = 0; pid < g.private.playerRoleListList.length; pid++) {
		if (g.private.playerRoleListList[pid].indexOf(roleIndex) != -1) {
			return pid;
		}
	}
	return null;
}

function shuffle(array) {
	var counter = array.length, temp, index;
	// While there are elements in the array
	while (counter > 0) {
		// Pick a random index
		index = Math.floor(Math.random() * counter);
		// Decrease counter by 1
		counter--;
		// And swap the last element with it
		temp = array[counter];
		array[counter] = array[index];
		array[index] = temp;
	}
	return array;
}

function tallyVotes(cursor, requireTrueMajority) {
	var total = cursor.count();
	if (!total) {
		return [77];
	}
	var votes = cursor.fetch();

	var tallyList = {};
	for (var index in votes) {
		var targetList = votes[index].t;
		for (var targetIndex in targetList) {
			var target = targetList[targetIndex];
			if (!(target == 77)) {
				if (!(target in tallyDict)) {
					tallyDict[target] = 1;
				} else {
					tallyDict[target] += 1;
				}
			}
		}
	}
	var tallyList = [];
	for (var key in tallyDict) {
		if ((!requireTrueMajority) || tallyDict[key] > Math.floor(total/2)) { //check for majority if required
			tallyList.push({targetID: Number(key), count: tallyDict[key]});
		}
	}
	tallyList.sort(function(a,b) {return a.count - b.count});

	var resultsLength = votes[0].t.length;
	var resultsList = tallyList.slice(0,-resultsLength).map(function(x) {return x.targetID});
	while (resultsList.length < resultsLength) {
		resultsList.push(77);
	}
	return resultsList;
}

function kill(stepResult, g, pid, killClass) {
	//killClass options: null, "lynch", "judge", "rogue", "execute", "fake"
	var extraLifeCount = stepResult.getCurrentValue(g, 'private.extraLivesList.' + pid);
	if (g.deathDataList[pid] != null) {
		return [pid, survivalCodeList.indexOf("already-dead")];
	} else if (killClass == "fake") {
		return [pid, survivalCodeList.indexOf("fake")];
	} else if (killClass == "rogue") {
		if (extraLifeCount > 0) {
			if (extraLifeCount >= 2) { //survives
				stepList.decrementGameProperty(g, 'private.extraLivesList.' + pid);
				stepList.decrementGameProperty(g, 'private.extraLivesList.' + pid);
				return [pid, survivalCodeList.indexOf("extra-life")];
			} else { //dies
				return [pid, 0];
			}
		} else { //no extra lives - kill fails
			return [pid, survivalCodeList.indexOf("rogue")];
		}
	} else if (g.currentPhase == "Night" && killClass != "execute") { //night protection is skipped entirely for executes
		if (stepResult.getCurrentValue(g, 'cycleNum') == stepResult.getCurrentValue(g, 'halftime') &&
			g.private.playerList[pid].roleList.indexOf(masterRoleList.indexOf("Daredevil")) != -1) {
			return [pid, survivalCodeList.indexOf("daredevil-self")];
		} else if (stepResult.getCurrentValue(g, 'cycleNum') <= 3 &&
			g.private.playerList[pid].roleList.indexOf(masterRoleList.indexOf("Emissary")) != -1) {
			return [pid, survivalCodeList.indexOf("emissary")];
		}
		for (var i = 0; i < g.private.nightProtectList.length; i++) {
			if (g.private.nightProtectList[i] % 100 == pid) {
				var survivalCode = Math.floor(g.private.nightProtectList.splice(i, 1)[0] / 100);
				if (survivalCode == survivalCodeList.index("daredevil-intercept")) {
					var daredevilPID = null;
					for (var j = 0; j < g.private.playerRoleListList[j]; j++) {
						if (g.private.playerRoleListList[j].indexOf(masterRoleList.indexOf("Daredevil")) != -1) {
							daredevilPID = j;
							break;
						}
					}
					stepList.eventList.push({tag: '$DD3', actors: [daredevilPID], targets: [pid]});
					return [daredevilPID, survivalCodeList.indexOf("daredevil-intercept")];
				}
				return [pid, survivalCode];
			}
		}
		if (g.private.playerList[pid].team == 4) { //lovers
			var mySubteam = g.private.playerList[pid].subteam;
			var loverPID = null;
			for (var i = 0; i < g.private.playerTeamList.length; i++) {
				if (i != pid && g.private.playerList[i].team == 4 || g.private.playerList[pid].subteam == mySubteam) {
					loverPID = i;
					break;
				}
			}
			if (stepResult.getCurrentValue(g, 'cycleNum') == stepResult.getCurrentValue(g, 'halftime') &&
				g.private.playerList[loverPID].roleList.indexOf(masterRoleList.indexOf("Daredevil")) != -1) {
				return [pid, 100 + survivalCodeList.indexOf("daredevil-self")];
			} else if (stepResult.getCurrentValue(g, 'cycleNum') <= 3 &&
				g.private.playerList[loverPID].roleList.indexOf(masterRoleList.indexOf("Emissary")) != -1) {
				return [pid, 100 + survivalCodeList.indexOf("emissary")];
			}
			for (var i = 0; i < g.private.nightProtectList.length; i++) {
				if (g.private.nightProtectList[i] % 100 == loverPID) {
					var survivalCode = Math.floor(g.private.nightProtectList.splice(i, 1)[0] / 100);
					if (survivalCode == survivalCodeList.index("daredevil-intercept")) {
						var daredevilPID = null;
						for (var j = 0; j < g.private.playerRoleListList[j]; j++) {
							if (g.private.playerRoleListList[j].indexOf(masterRoleList.indexOf("Daredevil")) != -1) {
								daredevilPID = j;
								break;
							}
						}
						stepList.eventList.push({tag: '$DD3', actors: [daredevilPID], targets: [pid, loverPID]});
						return [daredevilPID, 100 + survivalCodeList.indexOf("daredevil-intercept")];
					}
					return [pid, 100 + survivalCode];
				}
			}
			//finally, we only want to handle lover extra lives if our main target has none
			var loverExtraLifeCount = stepResult.getCurrentValue(g, 'private.extraLivesList.' + loverPID);
			if (extraLifeCount == 0 && loverExtraLifeCount > 0) {
				stepList.decrementGameProperty(g, 'private.extraLivesList.' + loverPID);
				return [pid, 100 + survivalCodeList.indexOf("extra-lives")];
			}
		}
	}
	if (stepResult.getCurrentValue(g, 'cycleNum') <= 3 &&
	    g.private.playerList[pid].roleList.indexOf(masterRoleList.indexOf("Emissary")) != -1) {
		return [pid, survivalCodeList.indexOf("emissary")];
	}
	if (killClass == null || killClass == "lynch") {
		if (extraLifeCount > 0) {
			stepList.decrementGameProperty(g, 'private.extraLivesList.' + pid);
			return [pid, survivalCodeList.indexOf("extra-lives")];
		}
	}
	//else kill!
	return [pid, 0];
}

function onDeath(stepResult, g, pid, phase) {
	//Change Game vars:
	stepResult.decrementGameProperty(g, 'aliveNum');
	myDeathOrder = 1;
	for (var i = 1; i < g.deathDataList.length; i++) {
		if (g.deathDataList[i] != null) {
			myDeathOrder += 1;
		}
	}
	stepResult.updateGameDict['deathDataList.' + pid] = [g.cycleNum, phase, myDeathOrder, new Date()];

	//if member of any groups, leave and increment their subchannel
	if (g.courtList.indexOf(pid) != -1) {
		g.courtList.splice(g.courtList.indexOf(pid), 1);
		stepResult.updateGameDict['courtList'] = g.courtList;
		stepResult.subchannelUpdateDict['k'] = true;
	}
	if (g.private.covenList.indexOf(pid) != -1) {
		g.private.covenList.splice(g.private.covenList.indexOf(pid), 1);
		stepResult.updateGameDict['private.covenList'] = g.private.covenList;
		stepResult.subchannelUpdateDict['c'] = true;
	} else if (g.private.playerTeamList[pid] in teamChannelLabelDict) {
		stepResult.subchannelUpdateDict[teamChannelLabelDict[g.private.playerTeamList[pid]]] = true;
	}

	//Remove or modify applicable Target objects:
	stepResult.removeTargetList.push({gid: g.gid, tag: {$regex: /-vote/}});
	stepResult.updateTargetTupleList.push([{gid: g.gid, a: pid}, {locked: 1}]);
	stepResult.updateTargetTupleList.push([{gid: g.gid, style: {$in: [1,2]}}, {$pull: {t: pid}}]);

	//Angel or Demon?
	if (g.private.playerList[pid].team >= 0) { //angel
		stepResult.updateGameDict['private.angelCount'] = g.private.angelCount + 1;
		stepResult.updatePermissionsKeyDict[pid] = 'angels';
		stepResult.addTargetList.push(new Target(g.gid, 'angel-vote' + pid, pid, null));
		stepResult.addTargetList.push(new Target(g.gid, 'angelDouble-vote' + pid, pid, null));
	} else { //demon
		stepResult.updateGameDict['private.demonCount'] = g.private.demonCount + 1;
		stepResult.updatePermissionsKeyDict[pid] = 'demons';
		stepResult.addTargetList.push(new Target(g.gid, 'demon-vote' + pid, pid, null));
	}

	//on-death procs
	if (g.private.playerRoleListList[pid].indexOf(masterRoleList.indexOf("Benevolent Old Dame")) != -1) {
		stepResult.insertStepList.push("Benevolent Old Dame");
	}
	if (g.private.playerRoleListList[pid].indexOf(masterRoleList.indexOf("Dirty Old Bastard")) != -1) {
		stepResult.insertStepList.push("Dirty Old Bastard");
	}
	if (g.private.playerList[pid].team == 4) {
		stepResult.insertStepList.push("loverSuicide" + g.private.playerList[pid].subteam);
	}
	//lust suicide
	if (g.lustTargetList.indexOf(pid) != -1) {
		stepResult.insertStepList.push("lustSuicide");
	}
}

function onSurvival(stepResult, g, pid, phase) {
	if (g.hunterNight == null) {
		stepResult.updateGameDict['g.hunterNight'] = stepResult.getCurrentValue(g, cycleNum);
	}
	stepResult.pushGameProperty(g, 'survivalList', [stepResult.getCurrentValue(g, cycleNum), phase]);
}