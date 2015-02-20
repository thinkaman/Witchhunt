stepDict = {

	deal: {
		skip: null,
		title: "Role Deal",
		target_auto: null,
		step_auto: 3,
		step: function(g) {
			var stepResult = {eventList: [], gameUpdateDict: {}};
			//initialize deal vars
			var playerCount = g.playerIDList.length;
			if (playerCount < MIN_GAME_SIZE) {
				throw new Meteor.Error("not-enough-players-to-deal");
			}
			stepResult.gameUpdateDict['maxPlayerCount'] = playerCount;
			var roleCount = g.roleListList.length - 1
			var myRoleListList = g.roleListList.slice();
			var myTeamList = []; //does not include holy
			var needsCards = [];	//doubles as draft order		
			var myRoleAssignments = [];
			var myTeamAssignments = [];
			for (var i = 0; i < playerCount; i++) {
				needsCards.push(i);
				myRoleAssignments.push([]);
				myTeamAssignments.push(null);
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
			for (var key in masterTeamBreakpointDict) {
				for (var i = 0; i < masterTeamBreakpointDict[key].length; i++) {
					if (masterTeamBreakpointDict[key][i] <= playerCount) {
						myTeamList.push(Number(key));
					}
				}
			}
			while (myTeamList.length + myRoleListList[0].length < playerCount) {
				myTeamList.push(0);
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
			}

			//randomly assign remaining players highest priority draft pick and a random team
			while (needsCards.length) {
				var pid = needsCards.shift();
				//convert prefList to PLL for this game's roleListList
				var myPrefList = g.userAccounts[pid].prefList;
				var myPLL = [[]];
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

			var hasPTom = g.roleListList[1].indexOf(masterRoleList.indexOf("Peeping Tom"));
			var hasPTim = g.roleListList[1].indexOf(masterRoleList.indexOf("Peeping Tim"));
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
					if (myTeamAssignments[pid] != 1) { //if not holy
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

			stepResult.gameUpdateDict['private.playerRoleListList'] = myRoleAssignments;
			stepResult.gameUpdateDict['private.playerTeamList'] = myTeamAssignments;

			return stepResult;
		}
	},			
	pregameEmail: {
		skip: function(g) {return true},
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = {eventList: [], gameUpdateDict: {}};
			return stepResult;
		},
	},
	gameStart: {
		skip: null,
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = {eventList: [], gameUpdateDict: {}};
			//generate and store events, prepare game.player objects, create Targets and PermissionsLists
			stepResult.eventList.push({tag:"@START"});
			Targets.insert(new Target(g.gid, "lynch-master", null, null));
			var playerList = [];
			var extraLivesList = [];
			var deathDataList = [];
			for (var pid in g.private.playerRoleListList) {
				Targets.insert(new Target(g.gid, "lynch-vote#", pid, null));
				PermissionsLists.insert(new PermissionsList(g.gid, pid, ['a' + pid]));
				var myRoleList = g.private.playerRoleListList[pid];
				for (var roleIndex in myRoleList) {
					var roleString = masterRoleList[myRoleList[roleIndex]];
					Targets.insert(new Target(g.gid, roleString, pid, null));
					if (doubleTargetList.indexOf(roleString) != -1) { //some roles have two target objects
						Targets.insert(new Target(g.gid, (roleString + '-2'), pid, null));
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
				var myLogEvent = {tag: "@A", actors: [pid], teamIndex: myTeamRaw};
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

			stepResult.gameUpdateDict['private.playerList'] = playerList;
			stepResult.gameUpdateDict['private.extraLivesList'] = extraLivesList;
			stepResult.gameUpdateDict['deathDataList'] = deathDataList;
			return stepResult;
		},
	},
	'meet-Witches': {
		skip: null,
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = {eventList: [], updatePermissionsKeyDict: {}, permissionsPool: true};

			var witchIDs = [];
			var mixedJuniorIDs = [];
			var warlockIDs = [];
			for (var pid in g.private.playerTeamList) {
				switch (g.private.playerTeamList[pid]) {
					case -1:
						witchIDs.push(pid);
						break;
					case -2:
					case 2:
						mixedJuniorIDs.push(pid);
						break;
					case -3:
						warlockIDs.push(pid);
						break;
					default:
						break;
				}
			}

			stepResult.eventList.push({tag: '@WR', actors: witchIDs});
			Targets.insert(new Target(g.gid, "coven-master", null, g.private.currentSubchannelDict['c']));
			Targets.insert(new Target(g.gid, "covenIllusion-master", null, g.private.currentSubchannelDict['c']));
			if (mixedJuniorIDs.length) {
				shuffle(mixedJuniorIDs);
				stepResult.eventList.push({tag: '@JSR1', actors: witchIDs, targets: mixedJuniorIDs});
				Targets.insert(new Target(g.gid, "covenRecruit-master", null, g.private.currentSubchannelDict['c']));
			}
			if (warlockIDs.length) {
				stepResult.eventList.push({tag: '@WLR', actors: witchIDs, targets: warlockIDs});
			}

			for (var index in witchIDs) {
				var pid = witchIDs[index];
				stepResult.updatePermissionsKeyDict[pid] = "coven";
				Targets.insert(new Target(g.gid, "coven-vote#", pid, g.private.currentSubchannelDict['c']));
				Targets.insert(new Target(g.gid, "coven-vote#", pid, g.private.currentSubchannelDict['c']));
				if (mixedJuniorIDs.length) {
					Targets.insert(new Target(g.gid, "covenRecruit-vote#", null, g.private.currentSubchannelDict['c']));
				}
			}
			return stepResult;
		},
	},
	'meet-Juniors': {
		skip: function(g) {return (g.private.playerTeamList.indexOf(-2) == -1)},
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = {eventList: []};
			var groupIDs = [];
			for (var pid in g.private.playerTeamList) {
				if (g.private.playerTeamList[pid] == -2) {
					groupIDs.push(pid)
				}
			}
			stepResult.eventList.push({tag: '@JR', actors: groupIDs});
			return stepResult;
		},
	},
	'meet-Traitors': {
		skip: function(g) {return (g.private.playerTeamList.indexOf(-3) == -1)},
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = {eventList: []};
			var groupIDs = [];
			for (var pid in g.private.playerTeamList) {
				if (g.private.playerTeamList[pid] == -3) {
					groupIDs.push(pid)
				}
			}
			stepResult.eventList.push({tag: '@TR', actors: groupIDs});
			return stepResult;
		},
	},
	'meet-Spies': {
		skip: function(g) {return (g.private.playerTeamList.indexOf(2) == -1)},
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = {eventList: []};
			var groupIDs = [];
			for (var pid in g.private.playerTeamList) {
				if (g.private.playerTeamList[pid] == 2) {
					groupIDs.push(pid)
				}
			}
			stepResult.eventList.push({tag: '@SR', actors: groupIDs});
			return stepResult;
		},
	},
	'meet-Knights': {
		skip: function(g) {return (g.private.playerTeamList.indexOf(3) == -1)},
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = {eventList: []};
			var groupIDs = [];
			for (var pid in g.private.playerTeamList) {
				if (g.private.playerTeamList[pid] == 3) {
					groupIDs.push(pid)
				}
			}
			stepResult.eventList.push({tag: '@KGR', actors: groupIDs});
			return stepResult;
		},
	},
	'meet-Lovers': {
		skip: function(g) {return (g.private.playerTeamList.indexOf(41) == -1)},
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = {eventList: []};
			for (var i = 1; i < 4; i++) {
				var groupIDs = [];
				for (var pid in g.private.playerTeamList) {
					if (g.private.playerTeamList[pid] == 40 + i) {
						groupIDs.push(pid)
					}
				}
				if (groupIDs.length == 2) {
					stepResult.eventList.push({tag: '@LR', actors: [groupIDs[0]], targets: [groupIDs[1]]});
				}
			}
			return stepResult;
		},
	},
	'meet-Travelers': {
		skip: function(g) {return true},
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = {eventList: [], gameUpdateDict: {}};
			stepResult.eventList.push({tag: '@TVR', actors: []});
			return stepResult;
		},
	},
	'dayStart': {
		skip: null,
		title: null,
		target_auto: null,
		step_auto: 5,
		step: function(g) {
			var stepResult = {eventList: [], gameUpdateDict: {}};
			//stepResult.eventList.push({tag: '', actors: [], targets: []});
			return stepResult;
		},
	},
	'victoryCheckA': {
		skip: function(g) {return true},
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = {eventList: [], gameUpdateDict: {}};
			stepResult.eventList.push({tag: '', actors: [], targets: []});
			return stepResult;
		},
	},
	'victoryCheckB': {
		skip: function(g) {return true},
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = {eventList: [], gameUpdateDict: {}};
			stepResult.eventList.push({tag: '', actors: [], targets: []});
			return stepResult;
		},
	},
	'judgeMultiplex': {
		skip: function(g) {return true},
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = {eventList: [], gameUpdateDict: {}};
			stepResult.eventList.push({tag: '', actors: [], targets: []});
			return stepResult;
		},
	},
	'gravediggerMultiplex': {
		skip: function(g) {return true},
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = {eventList: [], gameUpdateDict: {}};
			stepResult.eventList.push({tag: '', actors: [], targets: []});
			return stepResult;
		},
	},
	'deadMultiplex': {
		skip: function(g) {return true},
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = {eventList: [], gameUpdateDict: {}};
			stepResult.eventList.push({tag: '', actors: [], targets: []});
			return stepResult;
		},
	},
	'loverSuicide': {
		skip: function(g) {return true},
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = {eventList: [], gameUpdateDict: {}};
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
			var stepResult = {eventList: [], gameUpdateDict: {}};
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
			var stepResult = {eventList: [], gameUpdateDict: {}};
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
			var stepResult = {eventList: [], gameUpdateDict: {}};
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
			var stepResult = {eventList: [], gameUpdateDict: {}};
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
			var stepResult = {eventList: [], gameUpdateDict: {}};
			var t = Targets.findOne({gid: g.gid, tag: "Priest"});			
			var myPID = t.a;
			stepResult.eventList.push({tag: '', actors: [myPID], targets: []});
			return stepResult;
		},
	},
	'Judge': {
		skip: function(g) {return true},
		title: null,
		role_index: masterRoleList.indexOf('Judge'),
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = {eventList: [], gameUpdateDict: {}};
			var t = Targets.findOne({gid: g.gid, tag: "Judge"});
			var myPID = t.a;
			stepResult.eventList.push({tag: '', actors: [myPID], targets: []});
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
			var stepResult = {eventList: [], gameUpdateDict: {}};
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
			var stepResult = {eventList: [], gameUpdateDict: {}};
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
			var stepResult = {eventList: [], gameUpdateDict: {}};
			var myPID = getPIDn(g, 'Survivalist');
			stepResult.gameUpdateDict["private.extraLivesList." + myPID] = 1;
			stepResult.eventList.push({tag: '$S', actors: [myPID]});
			return stepResult;
		},
	},
	'Gambler': {
		skip: function(g) {return true},
		title: null,
		role_index: masterRoleList.indexOf('Gambler'),
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = {eventList: [], gameUpdateDict: {}};
			var t = Targets.findOne({gid: g.gid, tag: "Gambler"});
			var myPID = t.a;
			stepResult.eventList.push({tag: '', actors: [myPID], targets: []});
			return stepResult;
		},
	},
	'Fanatic': {
		skip: function(g) {return true},
		title: null,
		role_index: masterRoleList.indexOf('Fanatic'),
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = {eventList: [], gameUpdateDict: {}};
			var myPID = getPIDn(g, 'Fanatic');
			stepResult.eventList.push({tag: '', actors: [myPID], targets: []});
			return stepResult;
		},
	},
	'Gravedigger': {
		skip: function(g) {return true},
		title: null,
		role_index: masterRoleList.indexOf('Gravedigger'),
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = {eventList: [], gameUpdateDict: {}};
			var myPID = getPIDn(g, 'Gravedigger');
			stepResult.eventList.push({tag: '', actors: [myPID], targets: []});
			return stepResult;
		},
	},
	'Apprentice': {
		skip: function(g) {return true},
		title: null,
		role_index: masterRoleList.indexOf('Apprentice'),
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = {eventList: [], gameUpdateDict: {}};
			var t = Targets.findOne({gid: g.gid, tag: "Apprentice"});
			var myPID = t.a;
			//if target is judge, spawn an apprentice judge target?
			stepResult.eventList.push({tag: '', actors: [myPID], targets: []});
			return stepResult;
		},
	},
	'Apprentice-J': {
		skip: function(g) {return true},
		title: null,
		target_auto: null,
		step_auto: 1,
		step: function(g) {
			var stepResult = {eventList: [], gameUpdateDict: {}};
			var t = Targets.findOne({gid: g.gid, tag: "Apprentice-J"});
			var myPID = t.a;
			stepResult.eventList.push({tag: '', actors: [myPID], targets: []});
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
			var stepResult = {eventList: [], gameUpdateDict: {}};
			var myPID = getPIDn(g, 'Oracle');
			var deathLocationQueue = [];
			for (var key in deathLocationStringDict) {
				if (key != 77) {
					deathLocationQueue.push(key);
				}
			}
			shuffle(deathLocationQueue);
			if (myPID != null) {
				var priestDeathLocationIndex = deathLocationQueue.pop();
				stepResult.gameUpdateDict['priestDeathLocationIndex'] = priestDeathLocationIndex;
				stepResult.eventList.push({tag: '$O', actors: [myPID], priestDeathLocationIndex: [priestDeathLocationIndex]});
			}
			stepResult.gameUpdateDict['private.deathLocationQueue'] = deathLocationQueue;
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
			var stepResult = {eventList: [], gameUpdateDict: {}};
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
			var stepResult = {eventList: [], gameUpdateDict: {}};
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
			var stepResult = {eventList: []};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
					var pid = getPID(g, masterRoleList.indexOf('Magician'));
					var t = Targets.findOne({gid: g.gid, tag: 'Magician'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Conspirator': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Conspirator'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = {eventList: [], gameUpdateDict: {}};
					var pid = getPID(g, masterRoleList.indexOf('Conspirator'));
					var t = Targets.findOne({gid: g.gid, tag: 'Conspirator'});
					stepResult.eventList.push({tag: '', actors: [], targets: []});
					return stepResult;
				},
			},
	'Con Artist': {skip: function(g) {return true},
				title: null,
				role_index: masterRoleList.indexOf('Con Artist'),
				target_auto: null,
				step_auto: 1,
				step: function(g) {
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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
					var stepResult = {eventList: [], gameUpdateDict: {}};
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