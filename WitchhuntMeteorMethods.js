Meteor.methods({
	changeEmail: function(newEmail) {
		check(newEmail, String);

		if (Meteor.userId() == null) {
			throw new Meteor.Error("not-authorized");
		}
		//TODO
	},
	changePrefList: function(userID, newPrefList) {
		check(userID, String);
		check(newPrefList, Array);

		if (Meteor.userId() == null) {
			throw new Meteor.Error("not-authorized");
		}
		Meteor.users().update({_id: Meteor.userId()}, {$set: {prefList: newPrefList}});
		Games.update({userAccounts: {_id: Meteor.userId()}}, {$set: {"userAccounts.$.prefList": newPrefList}}, {multi: true});
	},
	createGame: function() {
		var g = null;
		if (Meteor.isClient && Meteor.userId() == null) {
			throw new Meteor.Error("not-authorized");
		}
		var g = new Game(null, Meteor.userId() , Meteor.user().username);
		Games.insert(g);
		if (Meteor.isClient) {
			Session.set("gid", g.gid);
		}
	},
	clearAll: function() {
		clearAll();
	},
	joinGame: function(gid, overrideUsername) {
		check(gid, Number);

		var u = Meteor.user();
		var userID = Meteor.userId();
		var username = u.username;
		if (userID == null) {
			throw new Meteor.Error("not-authorized");
		}
		var g = Games.findOne({gid: gid});
		if (g == null) {
			throw new Meteor.Error("game-does-not-exist");
		}
		if (g.currentPhase != "Signup") {
			throw new Meteor.Error("game-already-started");
		}
		if (overrideUsername != null) {
			if (userID != g.moderatorID) {
				throw new Meteor.Error("not-authorized");
			}
			u = Meteor.users.findOne({username: overrideUsername},{username: 1, emails: 1, prefList: 1});
			if (u == null) { //we need to make a new user account
				if (Meteor.isServer) { //server makes a real new account
					var new_id = Accounts.createUser({username: overrideUsername, password: overrideUsername});
					u = Meteor.users.findOne({_id: new_id});
				} else { //client has to make a temp dummy user
					u = {u_id: "dummyID", username: overrideUsername, prefList: []};
				}
			}
			userID = u._id;
			username = overrideUsername;
		} else if (userID == g.moderatorID) {
			throw new Meteor.Error("moderator-cannot-join-own-game");
		}
		if (g.playerIDList.indexOf(userID) != -1) {
			throw new Meteor.Error("user-already-in-game");
		}
		if (g.playerIDList.length >= g.maxPlayerCount) {
			throw new Meteor.Error("game-full");
		}
		if (Meteor.isClient) {
			Session.set("gid", g.gid);
		}
		Games.update(g._id, {$push: {playerIDList: userID}});
		Games.update(g._id, {$push: {playerNameList: username}});
		Games.update(g._id, {$push: {userAccounts: u}});
	},
	leaveGame: function(gid, overrideUsername) {
		check(gid, Number);

		var u = Meteor.user();
		var userID = Meteor.userId();
		var username = u.username;
		if (userID == null) {
			throw new Meteor.Error("not-authorized");
		}
		var g = Games.findOne({gid: gid});
		if (g == null) {
			throw new Meteor.Error("game-does-not-exist");
		}
		if (overrideUsername != null) {
			if (userID != g.moderatorID) {
				throw new Meteor.Error("not-authorized");
			}
			if (g.playerNameList.indexOf(overrideUsername) == -1) {
				throw new Meteor.Error("username-not-in-game");
			}
			userID = g.playerIDList[g.playerNameList.indexOf(overrideUsername)];
			username = overrideUsername;
		}
		if (g.currentPhase != "Signup") {
			throw new Meteor.Error("game-already-started");
		}
		if (g.playerIDList.indexOf(userID) == -1) {
			throw new Meteor.Error("user-not-in-game");
		}
		Games.update(g._id, {$pull: {playerIDList: userID}});
		Games.update(g._id, {$pull: {playerNameList: username}});
	},
	setupGame: function(gid, updateGameDict) {
		check(gid, Number);

		var userID = Meteor.userId();
		var g = Games.findOne({gid: gid});
		if (g == null) {
			throw new Meteor.Error("game-does-not-exist");
		}
		if (userID != g.moderatorID) {
			throw new Meteor.Error("not-authorized");
		}
		if (g.currentPhase != "Signup") {
			throw new Meteor.Error("game-already-started");
		}
		for (key in updateGameDict) {
			var value = updateGameDict[key];
			switch(key) {
				case "gameName":
					check(value, String);
					break;
				case "maxPlayerCount":
					check(value, Number);
					if (value < MIN_GAME_SIZE || value > MAX_GAME_SIZE) {
						throw new Meteor.Error("invalid-game-size");
					}
					updateGameDict[key] = Math.floor(value);
					break;
				case "roleListList":
					check(value, Array);
					for (var index = 2; index < value.length; index++) {
						if (value[index].length != value[1].length) {
							throw new Meteor.Error("inequal-neutral-role-list-lengths");
						}
					}
					var sorted_list = [];
					for (var index = 0; index < value.length; index++) {
						sorted_list = sorted_list.concat(value[index]);
					}
					sorted_list.sort();
					for (var i = 0; i < sorted_list.length; i++) {
						if (sorted_list[i] % 1 != 0) {
							throw new Meteor.Error("non-int-role");
						} else if (sorted_list[i] < 0 || sorted_list[i] >= masterRoleList.length) {
							throw new Meteor.Error("invalid-role");
						} else if (i != 0 && sorted_list[i] == sorted_list[i-1]) {
							throw new Meteor.Error("duplicate-role");
						} else if (sorted_list[i] in masterRoleDependencyDict) {
							for (var requiredRole in masterRoleDependencyDict[sorted_list[i]]) {
								if (!(requiredRole in sorted_list)) {
									throw new Meteor.Error("missing-role-dependency");
								}
							}
						}
						if (sorted_list[i] in masterExpansionDependencyDict) {
							for (var requiredRole in masterExpansionDependencyDict[sorted_list[i]]) {
								if (!(requiredRole in sorted_list)) {
									throw new Meteor.Error("missing-expansion-dependency");
								}
							}
						}
					}
					for (var requiredRole in masterMandatoryRoleList) {
						if (!(requiredRole in sorted_list)) {
							throw new Meteor.Error("missing-mandatory-role");
						}
					}
					break;
				case "expansionList":
					check(value, Array);
					for (var index in value) {
						if (!(index in [0,1,2])) {
							throw new Meteor.Error("invalid-expansion");
						}
					}
					//TODO - sanitize roleList according to selection rules of new expansion
					//remove any dependent roles for removed expansions according to masterExpansionDependencyDict
					//remove any dependencies for removed roles according to masterRoleDependencyDict
					//(there are no nested dependencies)
					//add any required roles for new expansions (king) according to masterExpansionRequirementDict
					break;
				default:
					throw new Meteor.Error("invalid-game-param");
					break;
			}
		}
		Games.update({gid: gid}, {$set: updateGameDict});
	},
	debugPopulateGame: function(gid) {
		check(gid, Number);

		var g = Games.findOne({gid: gid});
		if (g == null) {
			throw new Meteor.Error("game-does-not-exist");
		}
		if (Meteor.isClient) {
			var userID = Meteor.userId();
			if (userID != g.moderatorID) {
				throw new Meteor.Error("not-authorized");
			}
		}
		if (g.currentPhase != "Signup") {
			throw new Meteor.Error("game-already-started");
		}
		for (var i = g.playerIDList.length; i < g.maxPlayerCount; i++) {
			if (Meteor.isServer) { //the client can just be confused for a moment, rather than throw an exception
				Meteor.call("joinGame", gid, debugNames[i]);
			}
		}
		Games.update({gid: gid}, {$set: {debugRandomTargets: true}})
	},
	step: function(gid, advance) {
		check(gid, Number);
		check(advance, Boolean);

		var g = Games.findOne({gid: gid});
		if (g == null) {
			throw new Meteor.Error("game-does-not-exist");
		}
		var userID = Meteor.userId();
		if (userID == null || userID != g.moderatorID) {
			throw new Meteor.Error("not-authorized");
		}

		var updateGameDict = {};
		var myStepName = null;
		if (g.private.stepList.length == 0) {
			if (stepScheduleNextDict[g.currentPhase] == null) {
				return null;
			} else {
				var my_cp = stepScheduleNextDict[g.currentPhase];							//sets the next full phase
				var my_sl = stepScheduleDict[my_cp].slice();	//copy a fresh stepList for the new phase
				myStepName = my_sl[0];

				updateGameDict['currentPhase'] = my_cp;
				updateGameDict['private.stepList'] = my_sl;
			}
		} else {
			myStepName = g.private.stepList[0];
		}

		var skip = false;
		var myStep = stepDict[myStepName];

		if (masterRoleList.indexOf(myStepName) != -1) { //if step is a character
			skip = true //unless we find it
			for (var index in g.roleListList) {
				if (g.roleListList[index].indexOf(masterRoleList.indexOf(myStepName)) != -1) {
					skip = false; //we found it
				}
			}
		}
		if (masterRoleList.indexOf(myStepName.slice(0,-2)) != -1) { //ditto, for sometihng like Fanatic-2 or Apprentice-J
			skip = true
			for (var index in g.roleListList) {
				if (g.roleListList[index].indexOf(masterRoleList.indexOf(myStepName.slice(0,-2))) != -1) {
					skip = false;
				}
			}
		}
		if (myStep.skip != undefined && myStep.skip != null) {	//if step has a skip function...
			if (myStep.skip(g)) {	//...that evals to true...
				skip = true;		//...set flag to not eval step.
			}
		}
		if (skip) {
			Games.update({gid: gid}, {$pop: {'private.stepList': -1}});
			//console.log("skipping step:" + myStepName);
			return Meteor.call("step", gid, advance);
		}
		//console.log("running step:" + myStepName);

		var permissionsUpdateDict = {};
		 //check if no target is needed, we stopped for a target last time, or we are on auto:
		if (myStep.target_auto == null || g.private.currentTargetPrompt == g.private.stepList[0] || myStep.target_auto < g.auto) {
			updateGameDict['private.currentTargetPrompt'] = null;
		} else if (myStep.target_auto != null) { //else, we need a target resolved before we can advance
			updateGameDict['private.currentTargetPrompt'] = g.private.stepList[0];
			Games.update({gid: gid}, {$set: updateGameDict});
			return null;
		}

		try {
			var stepResult = myStep.step(g); //returns a step result object, which includes properties eventList and updateGameDict
		} catch (error) {
			throw error;
		}
		if (stepResult != null) { //steps return a stepResult object with many possible instructions. Let's handle them:
			for (var index in stepResult.removeTargetList) {
				Targets.remove(stepResult.removeTargetList[index]);
			}
			for (var tag in stepResult.changeTargetDict) {
				try {
					Meteor.call("changeTarget", gid, tag, stepResult.changeTargetDict[tag], null);
				} catch (error) {
					//pass -- we don't care if debug targetting fails
				}
			}
			for (var index in stepResult.updateTargetTupleList) {
				var tuple = stepResult.updateTargetTupleList[index];
				if (tuple.length != 2) {
					throw new Meteor.Error("malformed-update-target-tuple");
				}
				Targets.update(tuple[0], tuple[1], {multi: true});
			}
			for (var index in stepResult.addTargetList) { //add stuff last so not overwritten by changes
				Targets.insert(stepResult.addTargetList[index]);
			}
			for (var key in stepResult.updateGameDict) {
				updateGameDict[key] = stepResult.updateGameDict[key];
				if (key.indexOf('.') == -1) {
					g[key] = updateGameDict[key]; //quickly update baseline game object for permissions
				}
			}
			if ('private.playerList' in stepResult.updateGameDict) {
				g.private.playerList = updateGameDict['private.playerList']; //for gameStart permissions
			}
			if ('private.covenList' in stepResult.updateGameDict) {
				g.private.covenList = updateGameDict['private.covenList']; //for subchannel updating
			}
			for (var key in stepResult.subchannelUpdateDict) {
				var pid_list = getSubchannelMembers(g, stepResult.subchannelUpdateDict[key]);
				var old_subchannel = g.private.currentSubchannelDict[key];
				var new_subchannel = old_subchannel + 1
				updateGameDict['private.currentSubchannelDict.' + key] = new_subchannel;
				g.private.currentSubchannelDict[key] = new_subchannel;
				for (var index in pid_list) {
					var pid = pid_list[index];
					var permissionsKey = g.private.playerList[pid].permissionsKey;
					if (pid in updatePermissionsKeyDict) {
						permissionsKey = updatePermissionsKeyDict[pid];
					}
					if (!(permissionsKey in permissionsUpdateDict)) {
						permissionsUpdateDict[permissionsKey] = [];
					}
					permissionsUpdateDict[permissionsKey].push('g' + key + new_subchannel);
				}
				Targets.update({gid: gid, p: (key + old_subchannel)}, {$set: {p: (key + new_subchannel)}}, {multi: true});
			}
			for (var index in stepResult.eventList) {
				var eventArgsDict = stepResult.eventList[index];
				//generate permission updates needed for each log entry--it's okay if our game object g is out of date here
				var logPermissionsUpdateDict = getLogEventPermissionsUpdates(g, eventArgsDict);
				for (var key in logPermissionsUpdateDict) {
					if (key in permissionsUpdateDict) {
						permissionsUpdateDict[key] = permissionsUpdateDict[key].concat(logPermissionsUpdateDict[key]);
					} else {
						permissionsUpdateDict[key] = logPermissionsUpdateDict[key];
					}
				}
			}
			for (var key in stepResult.permissionUpdateDict) {
				if (key in permissionsUpdateDict) {
					permissionsUpdateDict[key] = permissionsUpdateDict[key].concat(stepResult.permissionUpdateDict[key]);
				} else {
					permissionsUpdateDict[key] = stepResult.permissionUpdateDict[key];
				}
			}
			if (Object.keys(permissionsUpdateDict)) {
				for (var key in permissionsUpdateDict) {
					var new_pl = permissionsUpdateDict[key];
					PermissionsLists.update({gid: gid, key: key}, {$addToSet: {pl: {$each: new_pl}}});
				}
			}
			for (var pid in stepResult.updatePermissionsKeyDict) {
				var old_key = g.private.playerList[pid].permissionsKey;
				var new_key = stepResult.updatePermissionsKeyDict[old_key];
				if (old_key != new_key) {
					updateGameDict['private.playerList.' + pid + '.permissionsKey'] = new_key;
					var old_pl = PermissionsLists.findOne({gid: gid, key: old_key}).pl;
					PermissionsLists.update({gid: gid, key: new_key}, {$addToSet: {pl: {$each: old_pl}}});
				}
			}
			for (var i = 0; i < stepResult.insertStepList.length; i++) {
				var newStepString = stepResult.insertStepList[i];
				updateGameDict['private.stepList.' + -(i+1)] = newStepString; //such hacks, many mongo cheats, wow
			}
			if (Object.keys(updateGameDict)) {
				Games.update({gid: gid}, {$set: updateGameDict});
			}
			if (stepResult.permissionsPool) { //pool permissions
				//first compute all of our bilateral relationships
				var requirementsDict = {};
				for (var pid in g.private.playerList) {
					var p = g.private.playerList[pid];
					requirementsDict["all" + pid] = ["tp" + pid];
					for (var playerRoleIndex in p.roleList) {
						requirementsDict["all" + pid].push("c" + p.roleList[playerRoleIndex]);
					}
					if (p.team != 0 && p.team != 1) {
						if (p.subteam != null) {
							if (("t" + p.team + p.subteam) in requirementsDict) {
								requirementsDict["t" + p.team + p.subteam].push("tp" + pid);
							} else {
								requirementsDict["t" + p.team + p.subteam] = ["tp" + pid];
							}
						} else {
							if (("t" + p.team) in requirementsDict) {
								requirementsDict["t" + p.team].push("tp" + pid);
							} else {
								requirementsDict["t" + p.team] = ["tp" + pid];
							}
						}
					}
				}
				//next check if anyone has only one half of a relationship, and add the other if so
				var myPermissionsLists = PermissionsLists.find({gid: gid}).fetch();
				for (var index in myPermissionsLists) {
					var myKey = myPermissionsLists[index].key;
					var myPermissionList = myPermissionsLists[index].pl;
					var masterList = Object.keys(requirementsDict).sort();
					for (var i = 0; i < masterList.length; i++) {
						var master = masterList[i];
						if (myPermissionList.indexOf(master) != -1) { //has master--check if missing any slaves
							var missingSlaveList = [];
							for (var slaveIndex in requirementsDict[master]) {
								var slave = requirementsDict[master][slaveIndex];
								if (myPermissionList.indexOf(slave) == -1) {
									myPermissionList.push(slave);
									missingSlaveList.push(slave);
								}
							}
							PermissionsLists.update({gid: gid, key: myKey},
								{$push: {pl: {$each: missingSlaveList}}});
						} else { //does not have master--check if it has all slaves
							missing = false;
							for (var slaveIndex in requirementsDict[master]) {
								var slave = requirementsDict[master][slaveIndex];
								if (myPermissionList.indexOf(slave) == -1) {
									missing = true;
									break;
								}
							}
							if (!missing) { //if has all slaves, add master
								PermissionsLists.update({gid: gid, key: myPermissionList.key},
									{$push: {pl: master}});
							}
						}
					}
				}
			}
			if (stepResult.resolvePermissionsTimeDelay) { //end of night conversion of temp permissions
				//permissionsLists
				var adpl = PermissionsLists.findOne({gid: gid, key: "angelsDelayed"}).pl;
				var ddpl = PermissionsLists.findOne({gid: gid, key: "demonsDelayed"}).pl;
				PermissionsLists.update({gid: gid, key: 'angels'}, {$addToSet: {pl: {$each: adpl}}});
				PermissionsLists.update({gid: gid, key: 'demons'}, {$addToSet: {pl: {$each: ddpl}}});
				PermissionsLists.update({gid: gid, key: 'angelsDelayed'}, {$set: {pl: []}});
				PermissionsLists.update({gid: gid, key: 'demonsDelayed'}, {$set: {pl: []}});
				//logs
				Log.update({gid: g.gid, p: 'td'},   {$pull: {p: 'td'}}, {multi: true});
				Log.update({gid: g.gid, p: 'tdxa'}, {$set:  {"p.$": 'xa'}}, {multi: true});
				Log.update({gid: g.gid, p: 'tdxd'}, {$set:  {"p.$": 'xd'}}, {multi: true});
			}
			if (stepResult.eventList.length) { //add events to log after all permissions have been updated
				var myPermissionsLists = PermissionsLists.find({gid: gid}).fetch();
				for (var index in stepResult.eventList) {
					var eventArgsDict = stepResult.eventList[index];
					var subeventList = packLogEvent(g, myPermissionsLists, eventArgsDict);
					for (var subeventIndex in subeventList) {
						Log.insert(subeventList[subeventIndex]);
					}
				}
			}
			for (var index in stepResult.messagePostList) {
				//TODO
			}
			if (advance) {
				Games.update({gid: gid}, {$pop: {'private.stepList': -1}});
				if (myStep.step_auto < g.auto) {
					return Meteor.call("step", gid, advance);
				}
			}
		return null;
		}
	},
	changeTarget: function(gid, tag, newTargets, active) {
		check(gid, Number);
		check(tag, String);
		check(newTargets, Array);

		var t = Targets.findOne({gid: gid, tag: tag});
		if (t == undefined) {
			throw new Meteor.Error("no-such-target-object");
		} else if (newTargets.length != t.t.length) {
			throw new Meteor.Error("invalid-target-list-length");
		} else {
			for (var i = 0; i < (newTargets.length - 1); i++) {
				for (var j = i+1; j < newTargets.length; j++) {
					if (newTargets[i] != 77 && newTargets[i] == newTargets[j]) {
						throw new Meteor.Error("non-unique-targets");
					}
				}
			}
		}

		changed = false;
		if (active == null) { //no change
			active = t.active;
		}
		if (active != t.active) {
			changed = true;
		} else {
			for (var i = 0; i < t.t.length; i++) {
				if (t.t[i] != newTargets[i]) {
					changed = true;
					break;
				}
			}
		}
		if (changed == false) {
			throw new Meteor.Error("target-unchanged");
		}
		//validate newTargets
		g = Games.findOne({gid: gid});
		if (g == undefined) {
			throw new Meteor.Error("no-such-game");
		} else if (g.moderatorID != Meteor.userId()) {
			var pid = g.playerIDList.indexOf(Meteor.userId());
			if (pid == -1) {
				throw new Meteor.Error("user-not-in-game");
			} else if (t.a != pid) {
				throw new Meteor.Error("target-permissions-error");
			}
		}
		var legalInputList = getLegalTargetList(g, t);
		for (var index in newTargets) {
			if (legalInputList.indexOf(newTargets[index]) == -1) {
				throw new Meteor.Error("illegal-target", newTargets[index]);
			}
		}

		//if activation, possibly insert steps and prepare to advance?
		if (active) {
			//TODO
		}

		Targets.update({_id: t._id}, {$set: {t: newTargets, active: active}});
	},
});