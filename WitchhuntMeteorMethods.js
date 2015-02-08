Meteor.methods({
	changeEmail: function(newEmail) {
		if (Meteor.userId() == null) {
			throw new Meteor.Error("not-authorized");
		}
		//TODO
	},
	changePrefList: function(userID, newPrefList) {
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
	joinGame: function(gid, overrideUsername) {
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
			u = Meteor.users.findOne({username: overrideUsername},{username: 1, emails: 1, prefList: 1});
			if (u == null) {
				throw new Meteor.Error("user-does-not-exist: " + overrideUsername);
			}
			userID = u._id;
			username = u.username;
		} else if (userID == g.moderatorID) {
			throw new Meteor.Error("moderator-cannot-join-own-game");
		}
		if (g.currentPhase != "Signup") {
			throw new Meteor.Error("game-already-started");
		}
		if (userID in g.playerIDList) {
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
			u = Meteor.users.findOne({username: overrideUsername},{username: 1, emails: 1, prefList: 1});
			if (u == null) {
				throw new Meteor.Error("user-does-not-exist");
			}
			userID = u._id;
			username = u.username;
		}
		if (g.currentPhase != "Signup") {
			throw new Meteor.Error("game-already-started");
		}
		if (!(userID in g.playerIDList)) {
			throw new Meteor.Error("user-not-in-game");
		}
		Games.update(g._id, {$pull: {playerIDList: userID}});
		Games.update(g._id, {$pull: {playerNameList: username}});
	},
	setupGame: function(gid, param, value) {
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
		switch(param) {
			case "gameName":
				if (typeof(value) != "string") {
					throw new Meteor.Error("invalid-value-type");
				}
				Games.update(g._id, {$set: {param: value}})
				break;
			case "maxPlayerCount":
				if (typeof(value) != "number") {
					throw new Meteor.Error("invalid-value-type");
				} else if (value < MIN_GAME_SIZE || value > MAX_GAME_SIZE) {
					throw new Meteor.Error("invalid-game-size");
				}
				Games.update(g._id, {$set: {param: Math.floor(value)}})
				break;
			case "roleList":
				if (typeof(value) != "list") {
					throw new Meteor.Error("invalid-value-type");
				}
				var sorted_list = value.sort();
				for (var i = 0; i < sorted_list.length; i++) {
					if (sorted_list[i] % 1 != 0) {
						throw new Meteor.Error("non-int-role");
					} else if (sorted_list[i] < 0 || sorted_list[i] >= masterRoleList.length) {
						throw new Meteor.Error("invalid-role");
					} else if (i != 0 && sorted_list[i] == sorted_list[i-1]) {
						throw new Meteor.Error("duplicate-role");
					} else if (sorted_list[i] in masterRoleDependencyDict) {
						for (var requiredRole in masterRoleDependencyDict[sorted_list[i]]) {
							if (!(requiredRole in roleList)) {
								throw new Meteor.Error("missing-role-dependency");
							}
						}
					}
					if (sorted_list[i] in masterExpansionDependencyDict) {
						for (var requiredRole in masterExpansionDependencyDict[sorted_list[i]]) {
							if (!(requiredRole in roleList)) {
								throw new Meteor.Error("missing-expansion-dependency");
							}
						}
					}
				}
				for (var requiredRole in masterMandatoryRoleList) {
					if (!(requiredRole in roleList)) {
						throw new Meteor.Error("missing-mandatory-role");
					}
				}
				Games.update(g._id, {$set: {param: value}});
				break;
			case "roleCount":
				if (typeof(value) != "number") {
					throw new Meteor.Error("invalid-value-type");
				} else if (value < 1 || value > MAX_ROLE_COUNT) {
					throw new Meteor.Error("invalid-role-count");
				}
				Games.update(g._id, {$set: {param: Math.floor(value)}})
				break;
			case "expansionList":
				if (typeof(value) != "list") {
					throw new Meteor.Error("invalid-value-type");
				}
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
				Games.update(g._id, {$set: {param: value}});
				break;
			default:
				throw new Meteor.Error("invalid-game-param");
				break;
		}
	},
	debugPopulateGame: function(gid) {
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
	},
	advanceGame: function(gid) {
		var g = Games.findOne({gid: gid});
		if (g == null) {
			throw new Meteor.Error("game-does-not-exist");
		}
		if (Meteor.isClient) {
			var userID = Meteor.userId();
			if (userID == null || userID != g.moderatorID) {
				throw new Meteor.Error("not-authorized");
			}
		}
		var myStep = null;
		skip = false;
		updateDict = {};
		if (g.private.stepList.length == 0) {
			if (stepScheduleNextDict[g.currentPhase] == null) {
				return null;
			} else {
				updateDict['currentPhase'] = stepScheduleNextDict[g.currentPhase];							//sets the next full phase
				updateDict['private.stepList'] = stepScheduleDict[stepScheduleNextDict[g.currentPhase]].slice();	//copy a fresh stepList for the new phase
				myStep = stepDict[updateDict['private.stepList'][0]];
			}
		} else { //first step of each phase cannot skip
			myStep = stepDict[g.private.stepList[0]];
			if (g.private.stepList[0].slice(0,4) == "char") { //check for automated character requirement
				var reqChar = "char40".split('-')[0].slice(4);
				if (g.roleList.indexOf(reqChar) == -1) {
					skip = true;
				}
			}
			if (myStep.skip != null) { //step has a skip function that evals to true
				if (myStep.skip(g)) {
					skip = true;
				}
			}
			if (skip) {
				Game.update({gid: gid}, {$pop: {'private.stepList': -1}});
				return Meteor.call("advanceGame", gid);
			}
		}

		if (myStep.target_auto == null || g.currentTargetPrompt == g.private.stepList[0] || myStep.target_auto < g.auto) {
			updateDict['currentTargetPrompt'] = null;
		} else if (myStep.target_auto != null) { //we need a target resolved before we can advance
			updateDict['currentTargetPrompt'] = g.private.stepList[0];
			updateDict['lastStepResult'] = null;
			Game.update({gid: gid}, {$set: updateDict});
			return null;
		}
		Games.update({gid: gid}, {$set: updateDict});
		var result = myStep.step(g); //returns a list of event argsDicts
		if (result != false) {
			Games.update({gid: gid}, {$pop: {'private.stepList': -1}});
			Games.update({gid: gid}, {$set: {lastStepResult: result}});
			for (var index in result) {
				g.packLogEvent(result[index]);
			}
			if (myStep.step_auto < g.auto) {
				return Meteor.call("advanceGame", gid);
			}
		}
		return result;
	},
});