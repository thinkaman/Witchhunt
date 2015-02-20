parseLogEvent = function(g, e) {
	var o = '';
	switch(e['tag']) {
		case '$ACO':
			o += '';
			break;
		case '$ADM':
			o += '';
			break;
		case '$ALC':
			o += '';
			break;
		case '$A':
			o += '';
			break;
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
			o += '';
			break;
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
			o += '';
			break;
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
						} else {
							o += "an unknown role and team type.";
							return ""; //hiding unknown assignment
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
			o += '';
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
			o += '';
			break;
		case '@JSR1':
			o += '';
			break;
		case '@JSR2':
			o += '';
			break;
		case '@WLR':
			o += '';
			break;
		case '@JR':
			o += '';
			break;
		case '@TR':
			o += '';
			break;
		case '@SR':
			o += '';
			break;
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
	return o;
}