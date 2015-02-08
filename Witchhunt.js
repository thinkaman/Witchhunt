Games = new Mongo.Collection("games");
Log = new Mongo.Collection("log"); //packed log events -- split into subevents, permissions appended
Targets = new Mongo.Collection("targets");
Messages = new Mongo.Collection("messages");

if (Meteor.isClient) {
	Session.setDefault("gid", null);
	Session.setDefault("pid", null);
	Session.setDefault("permissionsList", []);
	Session.setDefault("myLog", []); //unpacked log events for current gid
	Session.setDefault("hideInfo", false);
	Session.setDefault("targetTime", null);
	Session.setDefault("pausedTimeLeft", null);
	Session.setDefault("interruptPausedTimeLeft", null);

	Accounts.ui.config({
		passwordSignupFields: 'USERNAME_AND_EMAIL',
	});

	Tracker.autorun(function () {
		Meteor.subscribe('games_dir');
		Meteor.subscribe('game_public', Session.get("gid"));
		Meteor.subscribe('game_finished', Session.get("gid"));
		Meteor.subscribe('game_mod', Session.get("gid"));
		//Meteor.subscribe('game_mod_log', Session.get("gid"));
	});
	Tracker.autorun(function () {
		var cursor = Games.find({gid: Session.get("gid"), 'private.playerIDList': Meteor.userId});
		if (cursor.count()) {
			var g = cursor.fetch()[0];
			var pid = g.playerIDList.indexOf(Meteor.userId);
			Session.set("pid", pid);
			Session.set("permissionsList", g.private.playerList[pid].permissionsList);
		} else {
			Session.set("pid", null);
			Session.set("permissionsList", null);
		}
	});
	Tracker.autorun(function () {
		Meteor.subscribe('game_player', Session.get("gid"), Session.get("permissionsList"));
	});
	Tracker.autorun(function () {
		var myLog = {};
		var cursor = Log.find();
		for (var index in cursor.fetch()) { //we assume you only have the logs for one game at a time
			var subevent = cursor.fetch()[index];
			if (!(subevent.eid in myLog)) {
				myLog[subevent.eid] = {};
			}
			myLog[subevent.eid][subevent.n] = subevent.v;
		}
		var myLogList = [];
		for (var key in myLog){
			myLogList.push(myLog[key]);
		}
		myLogList.sort(function(a,b){return a.t-b.t});
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
	});

	Template.body.events({
		"click #create-game": function(event) {
			Meteor.call("createGame");
		},
	});

	Template.game_dir_entry.helpers({
		"description": function() {
			var myDescription = this.gameName;
			if (this.moderatorName == null) {
				myDescription += " (auto)"
			} else {
				myDescription += " " + this.moderatorName
			}
			myDescription += " " + this.playerIDList.length + "/" + this.maxPlayerCount;
			return myDescription;
		},
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
		"click .debug-populate-game": function(event) {
			Meteor.call("debugPopulateGame", this.gid);
		},
		"click .setup-game": function(event) {
			//Meteor.call("leaveGame", {gid: this.gid, overrideUsername: null});
		},
		"click .advance-game": function(event) {
			Meteor.call("advanceGame", this.gid);
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
					break;
				case "Deal":
					//no break;
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
			return Targets.find({gid: this.gid});
		},
		"log_events": function() {
			return []; //TODO - Session.get("myLog");
		},
	});

	Template.player.helpers({
		"player_readout": function() {
			return this.username + ': \t' + masterRoleList[this.roleList[0]] + ' \t' + masterTeamDict[this.team];
		},
	});

	Template.log_event.helpers({
		"log_parse": function() {
			return "test string";
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
		return [Games.find({gid: gid, winner: {$ne: null}}, {fields: {private: 1}}), //private info for won games
				Log.find({gid: gid}, {fields: {p: 0}})];
	});
	Meteor.publish("game_player", function(gid, permissionsList) {
		return [Games.find({gid: gid, 'private.playerList.userId': this.userId}, {fields: {'private.playerList.$': 1}}),  //playerList entry for players
	// 			Log.find({gid: gid, $or: [{p: {$size:0}}, {p: {$in: permissionsList}}]}, {fields: {p: 0}}),
	// 			Targets.find({gid: gid, $or: [{p: {$size:0}}, {p: {$in: permissionsList}}]}, {fields: {p: 0}}),
	];
	});
	Meteor.publish("game_mod", function(gid) {
		return [Games.find({gid: gid, moderatorID: this.userId})]; //mod gets all
	});
	Meteor.publish("game_mod_log", function(gid) {
		var g = Games.findOne({gid: gid});
		if (g != undefined && g.moderatorID == this.userId) {
			return [Log.find({gid: gid}, {fields: {p: 0}}),
					Targets.find({gid: gid}, {fields: {p: 0}})];
		}
	});
}

//mongo DB cheat sheet:
//
//List:   Games.find({}, {fields: {private: 0, userAccounts: 0}});
//
//Public: Games.find({gid: GAME_ID}, {fields: {private: GAME_COMPLETE, userAccounts:0}}).limit(1);
//Player: Games.find({gid: GAME_ID}, {fields: {userAccounts: {$slice: [PLAYER_INDEX,1]}, private.playerList: {$slice: [PLAYER_INDEX,1]}}}).limit(1);
//Mod:    Games.find({gid: GAME_ID}).limit(1);
//
//Public:     Log.find({gid: GAME_ID, createdAt: {$gt: MIN_TIME}, p: {$size:0}}, {fields: {p: 0}});
//Player:     Log.find({gid: GAME_ID, createdAt: {$gt: MIN_TIME}, $or: [{p: {$size:0}}, {p: {$in: PERMISSIONS_LIST}}]}, {fields: {p: 0}});
//Court:      Log.find({gid: GAME_ID, createdAt: {$gt: MIN_TIME}, $or: [{p: {$size:0}}, {p: 'gk', createdAt: {$gt: COURT_MIN_PERMISSION_TIME}, createdAt: {$lt: COURT_MAX_PERMISSION_TIME}}, {p: {$in: PERMISSIONS_LIST}}]}, {fields: {p: 0}});
//Coven:      Log.find({gid: GAME_ID, createdAt: {$gt: MIN_TIME}, $or: [{p: {$size:0}}, {p: 'gc', createdAt: {$gt: COVEN_MIN_PERMISSION_TIME}, createdAt: {$lt: COVEN_MAX_PERMISSION_TIME}}, {p: {$in: PERMISSIONS_LIST}}]}, {fields: {p: 0}});
//Co/ven/urt: Log.find({gid: GAME_ID, createdAt: {$gt: MIN_TIME}, $or: [{p: {$size:0}}, {p: 'gk', createdAt: {$gt: COURT_MIN_PERMISSION_TIME}, createdAt: {$lt: COURT_MAX_PERMISSION_TIME}}, {{p: 'gc'}, createdAt: {$gt: COVEN_MIN_PERMISSION_TIME}, createdAt: {$lt: COVEN_MAX_PERMISSION_TIME}}, {p: {$in: PERMISSIONS_LIST}}]}, {fields: {p: 0}});
//Override:   Log.find({gid: GAME_ID, createdAt: {$gt: MIN_TIME}, {fields: {p: 0}});
//
//Public:     Targets.find({gid: GAME_ID, p: {$size:0}}, {fields: {p: 0}});
//Player:     Targets.find({gid: GAME_ID, $or: [p: {$size:0}, {p: {$in: PERMISSIONS_LIST}}]}, {fields: {p: 0}});
//Override:   Targets.find({gid: GAME_ID}, {fields: {p: 0}});