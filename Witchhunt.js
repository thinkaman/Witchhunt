Games = new Mongo.Collection("games");
Log = new Mongo.Collection("log"); //packed log events -- split into subevents, permissions appended
Targets = new Mongo.Collection("targets");
Messages = new Mongo.Collection("messages");
PermissionsLists = new Mongo.Collection("permissionsLists");

if (Meteor.isClient) {
	Session.setDefault("gid", null);
	Session.setDefault("pid", null);
	Session.setDefault("permissionsKey", null);
	Session.setDefault("permissionsList", null);
	Session.setDefault("myLog", []); //unpacked log events for current gid
	Session.setDefault("sandboxUsername", null); //override username for permissions

	Accounts.ui.config({
		passwordSignupFields: 'USERNAME_ONLY',
	});

	Meteor.subscribe('games_dir');

	Tracker.autorun(function () {
		if (!Session.equals("gid", null)) {
			var g = Games.findOne({gid: Session.get("gid")});
			if (g != undefined) {
				Meteor.subscribe('game_public', Session.get("gid"));
				//Meteor.subscribe('game_finished', Session.get("gid"));
				if (Meteor.user()) {
					if (!Session.equals("pid", null)) { //player or sandbox
						if (Session.equals("sandboxUsername", null)) {
							Meteor.subscribe('game_player', Session.get("gid"), Meteor.user().username);
						} else {
							Meteor.subscribe('game_player', Session.get("gid"), Session.get("sandboxUsername"));
						}
					} else if (g.moderatorID == Meteor.userId()) {
							Meteor.subscribe('game_mod', Session.get("gid"));
							Meteor.subscribe('game_mod_log', Session.get("gid"));
					}
				}
			}
		}
	});
	Tracker.autorun(function () {
		if (Meteor.user()) {
			if (Session.equals("sandboxUsername", null)) {
				Meteor.subscribe('game_player_permissions', Session.get("gid"), Meteor.user().username, Session.get("permissionsKey"));
			} else {
				Meteor.subscribe('game_player_permissions', Session.get("gid"), Session.get("sandboxUsername"), Session.get("permissionsKey"));
			}
		}
	});
	Tracker.autorun(function () {if (Meteor.user()) {
		if (Session.equals("sandboxUsername", null)) {
				Meteor.subscribe('game_player_data', Session.get("gid"), Meteor.user().username, Session.get("permissionsList"));
			} else {
				Meteor.subscribe('game_player_data', Session.get("gid"), Session.get("sandboxUsername"), Session.get("permissionsList"));
			}
		}
	});
	Tracker.autorun(function () { //compute local reactive vars
		var gid = Session.get("gid");
		var sandboxUsername = Session.get("sandboxUsername");
		if (gid != null) {
			var g = Games.findOne({gid: gid});
			if (g == undefined) {
				Session.set("gid", null);
				Session.set("pid", null);
				Session.set("permissionsKey", null);
				Session.set("permissionsList", null);
				Session.set("myLog", []);
			} else {
				var pid = g.playerIDList.indexOf(Meteor.userId());
				if (sandboxUsername) {
					pid = g.playerNameList.indexOf(sandboxUsername);
				}
				if (pid == -1) {
					Session.set("pid", null);
					Session.set("permissionsKey", null);
					Session.set("permissionsList", null);
				} else {
					Session.set("pid", pid);
					if (g.private == undefined || g.private.playerList == undefined) {
						Session.set("permissionsKey", null);
						Session.set("permissionsList", null);
					} else {
						var myIndex = 0;
						if (g.private.playerList.length > 1) {
							myIndex = pid;
						}
						var myKey = g.private.playerList[myIndex].permissionsKey;
						Session.set("permissionsKey", myKey);
						var myPL = PermissionsLists.findOne({gid: gid, key: myKey});
						if (myPL != null) {
							Session.set("permissionsList", myPL.pl);
						} else {
							Session.set("permissionsList", null);
						}
					}
				}
			}
		} else { //gid == null
			var g = Games.findOne({moderatorID: Meteor.userId()},{sort: {createdAt: -1}});
			if (g != undefined) {
				Session.set("gid", g.gid);
				Session.set("pid", null);
				Session.set("permissionsKey", null);
				Session.set("permissionsList", null);
				Session.set("myLog", []);
			} else {
				g = Games.findOne({playerIDList: Meteor.userId()},{sort: {createdAt: -1}});
				if (g != undefined) {
					Session.set("gid", g.gid);
					Session.set("pid", g.playerIDList.indexOf(Meteor.userId()));
					Session.set("permissionsKey", null);
					Session.set("permissionsList", null);
					Session.set("myLog", []);
				}
			}
		}
	});
	Tracker.autorun(function () { //computer myLog
		var myLog = {};
		var logs = Log.find().fetch();
		for (var i = 0; logs[i] != undefined; i++) { //we assume you only have the logs for one game at a time
			var subevent = logs[i];
			if (subevent.n == 'tag') {
				myLog[subevent.eid] = {tag: subevent.v, etime: subevent.t};
				if (subevent.hasOwnProperty('subindex')) {
					myLog[subevent.eid]['subindex'] = subevent.subindex;
				} else {
					myLog[subevent.eid]['subindex'] = 9999;
				}
			}
		}
		for (var i = 0; logs[i] != undefined; i++) { //we assume you only have the logs for one game at a time
			var subevent = logs[i];
			if (!(subevent.eid in myLog)) {
				myLog[subevent.eid] = {etime: subevent.t};
			}
			myLog[subevent.eid][subevent.n] = subevent.v;
		}
		var myLogList = [];
		for (var key in myLog){
			myLogList.push(myLog[key]);
		}
		myLogList.sort(function(a,b) {
			if (a.etime === b.etime) return a.subindex - b.subindex;
			return a.etime - b.etime;
		});
		Session.set("myLog", myLogList);
	});

	Meteor.users.deny({
		update: function() {
			return true;
		}
	});

	Template.body.helpers({
		"game_dir": function() {
			return Games.find();
		},
		"game_selected": function() {
			if (Session.get("gid") == null) {
				return [];
			}
			return Games.find({gid: Session.get("gid")});
		},
		"is_cpi": function() {
			if (Meteor.user() == null) {
				return false;
			}
			return Meteor.user().username == "cpi";
		},
	});

	Template.body.events({
		"click #create-game": function(event) {
			Meteor.call("createGame");
		},
		"click #clear-all": function(event) {
			Meteor.call("clearAll");
		},
		"submit .sandbox": function(event) {
			event.preventDefault();
			var username = event.target.text.value;
			if (!username) {
				Session.set("sandboxUsername", null);
			} else {
				Session.set("sandboxUsername", username);
			}
		},
	});

	Template.game_dir_entry.helpers({
		"description": function() {
			if ((!this) || (!this.playerIDList)) {
				return null;
			}
			var myDescription = this.gameName;
			if (this.moderatorName == null) {
				myDescription += " (auto)"
			} else {
				myDescription += " " + this.moderatorName
			}
			myDescription += " " + this.playerIDList.length + "/" + this.maxPlayerCount;
			return myDescription;
		},

		"is_mod": function() {
			return (this.moderatorID != null &&
					this.moderatorID == Meteor.userId());
		},
		"can_join": function() {
			return (Meteor.userId() != null &&
					this.currentPhase == "Signup" &&
					this.playerIDList.length < this.maxPlayerCount &&
					this.playerIDList.indexOf(Meteor.userId()) == -1 &&
					this.moderatorID != Meteor.userId());
		},
		"can_leave": function() {
			return (Meteor.userId() != null &&
					this.currentPhase == "Signup" &&
					this.playerIDList.indexOf(Meteor.userId()) != -1);
		},
		"is_signup": function() {
			return(this.moderatorID == Meteor.userId() &&
					this.currentPhase == "Signup");
		}
	});

	Template.game_dir_entry.events({
		"click .game-dir-line": function(event) {
			Session.set("gid", this.gid);
		},
		"click .join-game": function(event) {
			Meteor.call("joinGame", this.gid, null);
		},
		"click .leave-game": function(event) {
			Meteor.call("leaveGame", this.gid, null);
		},
		"submit .add-player": function(event) {
			event.preventDefault();
			var name = event.target.text.value;
			if (!name) {
				//nothing
			} else if (this.playerNameList.indexOf(name) == -1) {
				Meteor.call("joinGame", this.gid, name);
			} else {
				Meteor.call("leaveGame", this.gid, name);
			}
		},
		"click .debug-populate-game": function(event) {
			Meteor.call("debugPopulateGame", this.gid);
		},
		"click .setup-game-base": function(event) {
			Meteor.call("setupGame", this.gid, {roleList: baseSetDefaultRoleList, maxPlayerCount: 15, expansionList: []});
		},
		"click .setup-game-halftime": function(event) {
			Meteor.call("setupGame", this.gid, {roleList: halftimeDefaultRoleList, maxPlayerCount: 25, expansionList: [0]});
		},
		"click .step-game": function(event) {
			Meteor.call("step", this.gid, false);
		},
		"click .advance-game": function(event) {
			Meteor.call("step", this.gid, true);
		},
	});

	Template.game_panel.helpers({
		"description": function() {
			if (this == null) {
				return "";
			}
			var myDescription = this.gameName;
			if (this.moderatorName == null) {
				myDescription += " (auto)"
			} else {
				myDescription += " " + this.moderatorName
			}
			myDescription += " " + this.currentPhase + " ";
			switch (this.currentPhase) {
				case "Signup":
					myDescription += " " + this.playerIDList.length + "/" + this.maxPlayerCount;
					myDescription += " " + this.playerNameList;
					break;
				case "Deal":
					myDescription += "Dealing Cards..."
				default:
					if (this.private != undefined && this.private.playerTeamList != undefined) {
						myDescription += '\n' + this.private.playerTeamList;
						myDescription += '\n' + this.private.playerRoleListList;
						myDescription += '\n' + this.private.stepList;
					}
					break;
			}
			return myDescription;
		},
		"data": function() {
			var myData = this.stepList;
			return myData;
		},
		"players": function() {
			if (this.private != undefined) {
				return this.private.playerList;
			} else {
				return [];
			}
		},
		"targets": function() {
			return Targets.find({gid: this.gid, locked: 0});
		},
		"log_events": function() {
			return Session.get("myLog");
		},
	});

	Template.player.helpers({
		"is_mod": function() {
			return (Session.equals("sandboxUsername", null) &&
					Template.parentData(1).moderatorID != null &&
					Template.parentData(1).moderatorID == Meteor.userId());
		},
		"player_readout": function() {
			return this.username + ': \t' + masterRoleList[this.roleList[0]] + ' \t' + masterTeamDict[this.team];
		},
		"player_cards": function() {
			var card_list = [];
			card_list.push('team_' + masterTeamDict[this.team]);
			for (var index in this.roleList) {
				card_list.push(masterRoleList[this.roleList[index]]);
			}
			return card_list;
		},
		"player_permissions": function() {
			var myList = PermissionsLists.findOne({gid: Template.parentData(1).gid, key: this.permissionsKey});
			if (myList != null) {
				return myList.pl;
			}
		},
	});

	Template.player_card.helpers({
		"player_card_uri": function() {
			return '/img/' + this.toLowerCase().replace(' ', '') + "_web.png";
		},
	});

	Template.target.helpers({
		"target_list": function() {
			var myList = [];
			for (var index in this.t) {
				myList.push({gid: this.gid, tag: this.tag, index: index, value: this.t[index]});
			}
			return myList;
		},
	}),

	Template.target_selector.helpers({
		"legal_inputs": function() {
			return getLegalTargetList(Template.parentData(2), Template.parentData(1));
		},
	}),

	Template.target_selector.events({
		"change .target-selector": function(event) {
			var t = Template.parentData(1);
			var myIndex = event.target.id;
			var myNewValue = Number(event.target.value);

			var myNewTargetList = t.t.slice();
			myNewTargetList[myIndex] = myNewValue;
			if (myNewValue != 77) { //non-unique value?  swap with old location
				var myOldValue = t.t[myIndex];
				for (var i = 0; i < t.t.length; i++) {
					if (i != myIndex && t.t[i] == event.target.value) {
						myNewTargetList[i] = myOldValue;
						break;
					}
				}
			}
			var myFinalTargetList = [];
			for (var i = 0; i < myNewTargetList.length; i++) { //move everything up in fornt of the nones
				if (myNewTargetList[i] != 77) { //77 is explicit none
					myFinalTargetList.push(myNewTargetList[i]);
				}
			}
			while (myFinalTargetList.length < t.t.length) { //pad with nones
				myFinalTargetList.push(77);
			}
			Meteor.call("changeTarget", t.gid, t.tag, myFinalTargetList, t.active);
		},
	}),

	Template.target_selector_option.helpers({
		"selected": function() {
			return this == Template.parentData(1).value;
		},
		"text": function() {
			switch (Template.parentData(2).style) {
				case 2:
					if (this == 88) {
						return "No One";
					}
				case 1:
				case 3:
					if (this == 77) {
						return "";
					}
					return Template.parentData(3).playerNameList[this];
				case 4:
					if (this == 77) {
						return "";
					}
					return masterRoleList[this];
				case 5:
					if (this == 77) {
						return masterTeamDict[0];
					}
					return masterTeamDict[this];
				case 6:
					if (this == 77 || this == 0) {
						return "No";
					}
					return "Yes";
				case 7:
					if (this == 77) {
						return "";
					} else if (this % 2 == 1) {
						return "Odd";
					}
					return "Even";
				case 8:
					//todo warlock rituals
				default :
					break;
			}
		},
	}),

	Template.log_event.helpers({
		"log_parse": function() {
			if (this != null && this != undefined) {
				return parseLogEvent(Template.parentData(1), this);
			}
		},
	});
}

if (Meteor.isServer) {
	Meteor.startup(function () {
		// code to run on server at startup
		if (Meteor.users.find({username: debugNames[0]}).count() == 0) { //debug accounts not initialized
			for (var index in debugNames) {
				Accounts.createUser({username: debugNames[index], password: debugNames[index]});
			}
		}
		for (var index in adminNames) {
			Meteor.users.update({username: adminNames[index]}, {$set: {admin: true}}, {multi: true});
		}
	});

	Accounts.onCreateUser(function(options, user) {
		user.prefList = [];
		// We still want the default hook's 'profile' behavior.
		if (options.profile) {
			user.profile = options.profile;
		}
		return user;
	});

	Meteor.publish("games_dir", function() {
		return Games.find({}, {fields: {private: 0, userAccounts: 0}}); //public games
	});
	Meteor.publish("game_public", function(gid) {
		return [Games.find({gid: gid}, {fields: {private: 0, userAccounts:0}}), //public info for all
				Log.find({gid: gid, p: {$size:0}}, {fields: {p: 0}}),
				Targets.find({gid: gid, p: {$size:0}}, {fields: {p: 0}})];
	});
	Meteor.publish("game_finished", function(gid) {
		var g = Games.findOne({gid: gid});
		if ((!g) || g.winner == null) {
			return [];
		}
		return [Games.find({gid: gid}, {fields: {private: 1}}), //private info for won games
				Log.find({gid: gid}, {fields: {p: 0}})];
	});
	Meteor.publish("game_player", function(gid, username) {
		//gets the Player object for a given player, including their permissionsKey
		var cursor = Games.find({gid: gid, 'private.playerList.username': username},
						  {fields: {moderatorID: 1, 'private.playerList.$': 1}});
		if (!cursor.count()) {
			return cursor;
		}
		var g = cursor.fetch()[0];
		if (g.private.playerList[0].userId != this.userId) {
			if (g.moderatorID != this.userId) {
				return [];
			}
		}
		return cursor;
	});
	Meteor.publish("game_player_permissions", function(gid, username, key) {
		//gets the permissions list for a given player, after verifying their key is correct
		if (gid == null || key == null) {
			return [];
		}
		var g = Games.findOne({gid: gid, 'private.playerList.username': username},
						      {fields: {moderatorID: 1, 'private.playerList.$': 1}});
		if (g == undefined) {
			return [];
		}
		if (g.moderatorID != this.userId) { //if we're not the mod, we need to check the key
			if (g.private.playerList[0].userId != this.userId || g.private.playerList[0].permissionsKey != key) {
				return [];
			}
		}
		return PermissionsLists.find({gid: gid, key: key});
	});
	Meteor.publish("game_player_data", function(gid, username, permissionsList) {
		//finally, verifies the permission list of a given player is correct
		if (gid == null || permissionsList == null) {
			return [];
		}
		var g = Games.findOne({gid: gid, 'private.playerList.username': username},
						      {fields: {moderatorID: 1, 'private.playerList.$': 1}});
		if (g == undefined) {
			return [];
		}
		if (g.moderatorID != this.userId) { //if we're not the mod, we need to check the permissionsList
			if (g.private.playerList[0].userId != this.userId) {
				return [];
			}
			var key = g.private.playerList[0].permissionsKey;
			var correctPermissionsList = PermissionsLists.findOne({gid: gid, key: key}).pl;
			for (var index in permissionsList) {
				if (correctPermissionsList.indexOf(permissionsList[index]) == -1) {
					return [];
				}
			}
		}
		permissionsList.push('p' + g.private.playerList[0].playerIndex);
		return [Log.find({gid: gid, p: {$in: permissionsList}}, {fields: {p: 0}}),
				Targets.find({gid: gid, p: {$in: permissionsList}}, {fields: {p: 0}})];
	});
	Meteor.publish("game_mod", function(gid) {
		return [Games.find({gid: gid, moderatorID: this.userId})]; //mod gets all
	});
	Meteor.publish("game_mod_log", function(gid) {
		var g = Games.findOne({gid: gid});
		if (g == undefined || g.moderatorID != this.userId) {
			return false;
		}
		return [Log.find({gid: gid}, {fields: {p: 0}}),
				Targets.find({gid: gid}, {fields: {p: 0}}),
				PermissionsLists.find({gid: gid}, {fields: {p: 0}})];
	});
}