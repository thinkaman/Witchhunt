stepScheduleNextDict = {"Signup":		"Deal",
						"Deal":			"GameStart",
						"Game Start":   "Day",
						"Day":			"Night",
						"Night":		"Day",
						"Village Win":	null,
						"Witch Win":	null,
						};

stepScheduleDict = {"Signup":		[],
					"Deal":			["deal"],
					"Game Start":   ["gameStart", "survivalist", "acolyte", "witchMeet", "apprentice", "gambler", "oracle", "peepingTom", "initBomber"],
					"Day":			["dayStart", "victoryCheckA", "lynch", "victoryCheckB", "bombPassCheck"],
					"Night":		["nightStart", "gravediggerMultiplex", "angelDemonMasterMultiplex", "witchMultiplex", "priest", "inquisitor", "spiritualist", "hunterCheck", "bomberCheck", "resolveNightKills"],
					"Reaction": 	["DOB"], //dummy, only for reference
					"Village Win":	["villageWin"],
					"Witch Win":	["witchWin"],
					};

stepDict = {

	deal:      {skip: null,
				title: "Role Deal",
				target_auto: null,
				step_auto: 3,
				step: function(g) {
					results = [];
					updateDict = {};
					//initialize deal vars
					var playerCount = g.playerIDList.length;
					if (playerCount < MIN_GAME_SIZE) {
						throw new Meteor.Error("not-enough-players-to-deal");
					}
					updateDict['maxPlayerCount'] = playerCount;
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
							return false; //not enough roles
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

					//generate and store events, prepare game.player objects
					var playerList = [];
					var logEventList = [{tag:"@START"}];
					for (var pid in myRoleAssignments) {
						var myRoleList = myRoleAssignments[pid];
						var myTeam = myTeamAssignments[pid];
						var myTeamRaw = myTeam;
						var mySubteam = null;
						if (myTeam > 9) {
							mySubteam = myTeam % 10;
							myTeam = Math.floor(myTeam / 10);
						} else if (myTeam < -9) {							
							mySubteam = Math.abs(myTeam % 10);
							myTeam = Math.ceil(myTeam / 10);
						}
						var p = new Player(g.playerIDList[pid], g.playerNameList[pid], myTeam, mySubteam, myRoleList);
						playerList.push(p);
						var myLogEvent = {tag: "@A", a: pid, teamIndex: myTeamRaw};
						for (var i = 0; i < myRoleList.length; i++) {
							myLogEvent["roleIndex" + (i+1)] = myRoleList[i];
						}
						logEventList.push(myLogEvent);
					}
					updateDict['private.playerList'] = playerList;					
					updateDict['private.playerRoleListList'] = myRoleAssignments;				
					updateDict['private.playerTeamList'] = myTeamAssignments;

					//update database, return all events
					Games.update({gid: g.gid}, {$set: updateDict});
					Log.remove({gid: g.gid}); //fresh log in case of redeal
					packLogEvents(g.gid, logEventList);
					return results;
				}
			},

	char5: {skip: function(g) {return false}, //function returning true if we should skip the step entirely (i.e. not Hunter's night, or not Halftime)
			title: "Gambler",
			target_auto: 3, //auto advances past the prompt if game.auto is greater; null if no target
			step_auto: 4, //auto advances past the resolution if game.auto is greater
			step: function(g) {
				//actual game logic and database updates go here
				//returns a list of complete log events, or false if error
			}
		},
};

targetPromptDict = {
	char5: "Gambler, will you choose odd or even?", //string or function(gid) that returns a string using TBD special formatting templates
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