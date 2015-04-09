parseLogEvent = function(g, e, seat) {
	var targetString = 'some';
	var nameList = g.playerNameList;
	if (seat) {
		nameList = getPlayerNameSeatList(g);
	}
	var actors = null;
	var actorsPreface = '';
	var actorsSomeone = 'someone';
	var actorsThey = 'they';
	if (e.hasOwnProperty("actors")) {
		actors = listPrint(e.actors, nameList, '');
		actorsPreface = actors + ' ';
		actorsSomeone = actors;
		actorsThey = actors;
	}
	var targets = null;
	var targetsPreface = '';
	var targetsSomeone = 'someone';
	var targetsThey = 'they';
	if (e.hasOwnProperty('targets')) {
		targets = listPrint(e.targets, nameList, '');
		targetsPreface = targets + ' ';
		targetsSomeone = targets;
		targetsThey = targets;
	}
	switch(e['tag']) {
		case '$ACO':
			var actor = "The Acolyte";
			if (e.hasOwnProperty("actors")) {
				actor = g.playerNameList[e.actors[0]] + " the Acolyte";
			} else {
				return null;
			}
			var target = 'someone';
			if (e.hasOwnProperty('targets')) {
				target = g.playerNameList[e.targets[0]];
			}
			return actor + " learned that " + target + " is the Priest.";
		case '$ADM':
			o += '';
			break;
		case '$ALC':
			o += '';
			break;
		case '$A':
			var actor = "The Apprentice";
			if (e.hasOwnProperty("actors")) {
				actor = g.playerNameList[e.actors[0]] + " the Apprentice";
			} else {
				return null;
			}
			var target = 'someone';
			var target2 = 'they';
			if (e.hasOwnProperty('targets')) {
				target = g.playerNameList[e.targets[0]];
				target2 = target;
			}
			var role = 'either the Gravedigger or the Judge';
			if (e.hasOwnProperty('selectedRoleIndex')) {
				if (e.selectedRoleIndex == 77) {
					return actor + " declined to select a job.";
				}
				role = "the " + masterRoleList[e.selectedRoleIndex];
			}
			return actor + " learned that " + target + " is " + role + " and will take over that job if " + target2 + " dies.";
		case '$ASN':
			o += '';
			break;
		case '$B':
			o += '';
			break;
		case '$BS':
			o += '';
			break;
		case '$BOD':
			o += '';
			break;
		case '$BODS':
			o += '';
			break;
		case '$BMR1':
			o += '';
			break;
		case '$BMR2':
			o += '';
			break;
		case '$BTC':
			o += '';
			break;
		case '$CPT1':
			o += '';
			break;
		case '$CPT2':
			o += '';
			break;
		case '$CPT3':
			o += '';
			break;
		case '$C':
			o += '';
			break;
		case '$CA':
			o += '';
			break;
		case '$CON1':
			var actor = "The Conspirator";
			if (e.hasOwnProperty("actors")) {
				actor = g.playerNameList[e.actors[0]] + " the Conspirator";
			} else {
				return null;
			}
			var target = 'the ' + e.spyCount + ' Village Spies';
			if (e.hasOwnProperty('targets')) {
				target += ' (' + listPrint(e.targets, g.playerNameList, '') + ')';
			}
			if (e.hasOwnProperty('spyRoleIndexListList')) {
				return actor + " learned that " + target + " are " + listPrint(e.spyRoleIndexListList, masterRoleList, 'the') + ", though not their identities.";
			} else {
				return actor + " learned what characters " + target + " are, though not their identities.";
			}
		case '$CON2':
			o += '';
			break;
		case '$CNT':
			o += '';
			break;
		case '$DD1':
			o += '';
			break;
		case '$DD2':
			o += '';
			break;
		case '$DOB':
			o += '';
			break;
		case '$DOBS':
			o += '';
			break;
		case '$D':
			o += '';
			break;
		case '$EM1':
			o += '';
			break;
		case '$EM2':
			o += '';
			break;
		case '$ENG1':
			o += '';
			break;
		case '$ENG2':
			o += '';
			break;
		case '$ENG3':
			o += '';
			break;
		case '$E':
			o += '';
			break;
		case '$EX':
			o += '';
			break;
		case '$F1':
			o += '';
			break;
		case '$F2':
			o += '';
			break;
		case '$G1':
			var actor = "The Gambler";
			if (e.hasOwnProperty("actors")) {
				actor = g.playerNameList[e.actors[0]] + " the Gambler";
			} else {
				return null;
			}
			var choice = 'either odd or even';
			if (e.hasOwnProperty('selectionInt')) {
				switch (e.selectionInt) {
					case 0:
						choice = "even";
						break;
					case 1:
						choice = "odd";
						break;
					default: //77
						return actor + " declined to choose odd or even, and will receive no special protection.";
						break;
				}
			}
			return actor + " choose to be protected on " + choice + " nights.";
		case '$G2':
			o += '';
			break;
		case '$GD':
			o += '';
			break;
		case '$H1':
			o += '';
			break;
		case '$H2':
			o += '';
			break;
		case '$H3':
			o += '';
			break;
		case '$INN':
			o += '';
			break;
		case '$INQ':
			o += '';
			break;
		case '$INV':
			o += '';
			break;
		case '$JST1':
			o += '';
			break;
		case '$JST2':
			o += '';
			break;
		case '$J':
			o += '';
			break;
		case '$K1':
			o += '';
			break;
		case '$K2':
			o += '';
			break;
		case '$KT':
			o += '';
			break;
		case '$L1':
			o += '';
			break;
		case '$L2':
			o += '';
			break;
		case '$LC':
			o += '';
			break;
		case '$M1':
			o += '';
			break;
		case '$M2':
			o += '';
			break;
		case '$MM1':
			o += '';
			break;
		case '$MM2':
			o += '';
			break;
		case '$N':
			o += '';
			break;
		case '$NJ1':
			o += '';
			break;
		case '$NJ2':
			o += '';
			break;
		case '$NJ3':
			o += '';
			break;
		case '$O':
			var actor = "The Oracle";
			if (e.hasOwnProperty("actors")) {
				actor = g.playerNameList[e.actors[0]] + " the Oracle";
			} else {
				return null;
			}
			var location = ' in a particular spot.';
			if (e.hasOwnProperty('priestDeathLocationIndex')) {
				location = deathLocationStringDict[e.priestDeathLocationIndex[0]];
			}
			return actor + " learned that the Priest's body will be found " + location + ".";
		case '$P':
			o += '';
			break;
		case '$PT1':
			var actor = "The Peeping Tim";
			if (e.hasOwnProperty("actors")) {
				actor = g.playerNameList[e.actors[0]] + " the Peeping Tim";
			} else {
				return null;
			}
			var target = 'someone';
			if (e.hasOwnProperty('targets')) {
				target = g.playerNameList[e.targets[0]];
			}
			return actor + " learned that " + target + " is a Village Peasant with a Defensive character.";
		case '$PT2':
			var actor = "The Peeping Tom";
			if (e.hasOwnProperty("actors")) {
				actor = g.playerNameList[e.actors[0]] + " the Peeping Tom";
			} else {
				return null;
			}
			var target = 'someone';
			if (e.hasOwnProperty('targets')) {
				target = g.playerNameList[e.targets[0]];
			}
			return actor + " learned that " + target + " is a Village Peasant with an Offensive character.";
		case '$Q':
			o += '';
			break;
		case '$R':
			o += '';
			break;
		case '$SD1':
			o += '';
			break;
		case '$SD2':
			o += '';
			break;
		case '$SD3':
			o += '';
			break;
		case '$SD4':
			o += '';
			break;
		case '$SD5':
			o += '';
			break;
		case '$SQ1':
			o += '';
			break;
		case '$SQ2':
			o += '';
			break;
		case '$S':
			var actor = "The Survivalist";
			if (e.hasOwnProperty("actors")) {
				actor = g.playerNameList[e.actors[0]] + " the Survivalist";
			} else {
				return null;
			}
			o += actor + " has an extra life.";
			break;
		case '$T1':
			o += '';
			break;
		case '$T2':
			o += '';
			break;
		case '$TMD':
			o += '';
			break;
		case '$TMR':
			o += '';
			break;
		case '$TMY':
			o += '';
			break;
		case '$TML':
			o += '';
			break;
		case '$U1':
			o += '';
			break;
		case '$U2':
			o += '';
			break;
		case '$VH1':
			o += '';
			break;
		case '$VH2':
			o += '';
			break;
		case '$VIG1':
			o += '';
			break;
		case '$VIG2':
			o += '';
			break;
		case '$VZ':
			o += '';
			break;
		case '@START':
			o += g.gameName + ' has begun!';
			break;
		case '@A':
			if (e.actors == undefined) {
				return null;
			}
			switch(g.roleListList.length - 1) { //roleCount
				case 1:
					o += g.playerNameList[e.actors[0]] + ' was assigned ';
					if (e.hasOwnProperty('roleIndex1')) {
						if (e.hasOwnProperty('teamIndex')) {
							o += " the " + masterRoleList[e['roleIndex1']] + " " + masterTeamDict[e['teamIndex']] +'.';
						} else {
							o += " the " + masterRoleList[e['roleIndex1']] + " on an unknown team.";
						}
					} else {
						if (e.hasOwnProperty('teamIndex')) {
							o += "an unknown role as a " + masterTeamDict[e['teamIndex']] +'.';
							return null;
						} else {
							o += "an unknown role and team type.";
							return null; //hiding unknown assignment
						}
					}
					break;
				case 2:
					o += g.playerNameList[e['actors'][0]] + ' roles TODO!';
					break;
				case 3:
					o += g.playerNameList[e['actors'][0]] + ' roles TODO!';
					break;
				case 4:
					o += g.playerNameList[e['actors'][0]] + ' roles TODO!';
					break;
				default:
					o += "role count assignment error!";
					break;
			}
			break;
		case '@CL':
			o += '';
			break;
		case '@TC':
			o += '';
			break;
		case '@RT':
			o += '';
			break;
		case '@STALE':
			o += 'stalemate';
			break;
		case '@WIN':
			o += 'winnar';
			break;
		case '@REPLACE':
			o += '';
			break;
		case '@WARN':
			o += '';
			break;
		case '@MK':
			o += '';
			break;
		case '@MKR':
			o += '';
			break;
		case '@X':
			o += '';
			break;
		case '@V':
			o += 'vote';
			break;
		case '@KV':
			o += '';
			break;
		case '@CV':
			o += '';
			break;
		case '@CIV':
			o += '';
			break;
		case '@CRV':
			o += '';
			break;
		case '@AV':
			o += '';
			break;
		case '@DV':
			o += '';
			break;
		case '@LK':
			//TODO, WIP
			var actor = "The town";
			if (e.hasOwnProperty("actors")) {
				actor = g.playerNameList[e.actors[0]] + " the Judge";
			}
			var target = 'someone';
			var target2 = 'they';
			if (e.hasOwnProperty('targets')) {
				target = g.playerNameList[e.targets[0]];
				target2 = target;
			}
			var resolution = '';
			return actor + " decided to lynch " + target + resolution + ".";
			break;
		case '@KK':
			o += '';
			break;
		case '@CK':
			o += '';
			break;
		case '@AXR':
			o += '';
			break;
		case '@AP':
			o += '';
			break;
		case '@AZ':
			o += '';
			break;
		case '@DS':
			o += '';
			break;
		case '@DC':
			o += '';
			break;
		case '@DI':
			o += '';
			break;
		case '@DZ':
			o += '';
			break;
		case '@ADZ':
			o += '';
			break;
		case '@NKC':
			o += '';
			break;
		case '@NK':
			o += '';
			break;
		case '@BOMB':
			o += '';
			break;
		case '@BOMBP':
			o += '';
			break;
		case '@BOMBD':
			o += '';
			break;
		case '@HALF':
			o += '';
			break;
		case '@KR1':
			o += '';
			break;
		case '@KR':
			o += '';
			break;
		case '@KD':
			o += '';
			break;
		case '@CRT':
			o += '';
			break;
		case '@CJJ':
			o += '';
			break;
		case '@CRS':
			o += '';
			break;
		case '@CTJ':
			o += '';
			break;
		case '@CXJ':
			o += '';
			break;
		case '@CR':
			o += '';
			break;
		case '@WR':
			if (e.hasOwnProperty('actors')) {
				return listPrint(e.actors, g.playerNameList, '') + " are the Witches.";
			} else {
				return null;
			}
		case '@JSR1':
			if (e.hasOwnProperty('targets')) {
				return listPrint(e.targets, g.playerNameList, '') + " are the Junior Witches and Village Spies.";
			} else {
				return null;
			}
		case '@JSR2':
			if (e.hasOwnProperty('targets')) {
				return listPrint(e.targets, g.playerNameList, '') + " are the Junior Witches and Village Spies.";
			} else {
				return null;
			}
		case '@WLR':
			o += '';
			break;
		case '@JR':
			if (e.hasOwnProperty('actors')) {
				return listPrint(e.actors, g.playerNameList, '') + " are the Junior Witches.";
			} else {
				return null;
			}
		case '@TR':
			o += '';
			break;
		case '@SR':
			if (e.hasOwnProperty('actors')) {
				return listPrint(e.actors, g.playerNameList, '') + " are the Village Spies.";
			} else {
				return null;
			}
		case '@KGR':
			o += '';
			break;
		case '@KGR2':
			o += '';
			break;
		case '@LR':
			o += '';
			break;
		case '@TVR':
			o += '';
			break;
		case '@WRD':
			o += '';
			break;
		case '@WR1':
			o += '';
			break;
		case '@WR1S':
			o += '';
			break;
		case '@WR1T':
			o += '';
			break;
		case '@WR2':
			o += '';
			break;
		case '@WR2E':
			o += '';
			break;
		case '@WR3':
			o += '';
			break;
		case '@WR4':
			o += '';
			break;
		case '@WR4R':
			o += '';
			break;
		case '@WR5':
			o += '';
			break;
		case '@WR5R':
			o += '';
			break;
		case '@WR6':
			o += '';
			break;
		case '@WR6E':
			o += '';
			break;
		case '@WR7':
			o += '';
			break;
		case '@WR7R':
			o += '';
			break;
		case '@LS':
			o += '';
			break;
		default:
			break;
	}
	return null;
}

function listPrint(list, dict, prefix) {
	if (!prefix) {
		prefix = '';
	} else {
		prefix += ' ';
	}
	var output = "";
	var oxford = '';
	if (list.length > 2) {
		oxford = ',';
	}
	while (list.length > 2) {
		var index = list.shift();
		output += prefix + dict[index];
		if (list.length > 1) {
			output += ', ';
		} else if (list.length == 1) {
			output += oxford + ' and ';
		}
	}
	return output;
}