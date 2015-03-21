MIN_GAME_SIZE = 7;
MAX_GAME_SIZE = 30;
MAX_ROLE_COUNT = 3;

adminNames = ["cpi", "herny", "broncobuster", "testmod"];

debugNames = ["John",
              "Rose",
              "Dave",
              "Jade",
              "Jane",
              "Jake",
              "Roxy",
              "Dirk",
              "Karkat",
              "Aradia",
              "Tavros",
              "Sollux",
              "Terezi",
              "Kanaya",
              "Nepeta",
              "Vriska",
              "Equius",
              "Gamzee",
              "Eridan",
              "Feferi",
              "Davesprite",
              "Dad",
              "Jack",
              "WV",
              "PM",
              "AR",
              "WQ",
              "WK",
              "Miss Paint",
              "Calliope",
              "Caliborn",
              "cpi",
              "herny",
              "broncobuster",
              "testmod",
             ];

phaseStyleDict = {"Game Start":     "gs",
                  "Day":            "dy",
                  "Night":          "nt",
                  "Village Win":    "vw",
                  "Witch Win":      "ww",
                  };

masterExpansionList = ["Halftime",
                       "King's Court",
                       "Love & War"]

masterTeamDict = {   0: "Village Peasant",
                     1: "Village Clergy",
                     2: "Village Spy",
                     3: "Village Knight",
                     4: "Village Lover",
                  '-1': "Witch",
                  '-2': "Junior Witch",
                  '-3': "Traitor",
                  '-4': "Warlock",
                  };

abbrevTeamDict = {   0: "V",
                     1: "H",
                     2: "S",
                     3: "K",
                     4: "L",
                  '-1': "W",
                  '-2': "J",
                  '-3': "T",
                  '-4': "R",
                  };

masterCategoryList = ["Holy",
                      "Offensive",
                      "Defensive",
                      "Informative",
                      "Hybrid",
                      "Court",
                      "Traveler",
                      "Legend"]

masterRoleList =   ["Priest",
                    "Judge",
                    "Dirty Old Bastard",
                    "Hunter",
                    "Survivalist",          //index 4
                    "Gambler",
                    "Fanatic",
                    "Gravedigger",
                    "Apprentice",
                    "Oracle",               //index 9
                    "Peeping Tom",
                    "Peeping Tim",
                    "Acolyte",
                    "Loose Cannon",
                    "Bomber",               //index 14
                    "Assassin",
                    "Emissary",
                    "Benevolent Old Dame",
                    "Nurse",
                    "Spiritualist",         //index 19
                    "Inquisitor",
                    "Detective",
                    "Bishop",
                    "Daredevil",
                    "Magician",             //index 24
                    "Conspirator",
                    "Con Artist",
                    "Knife Thrower",
                    "Investigator",
                    "Innkeeper",            //index 29
                    "Butcher",
                    "Alchemist",
                    "Entertainer",
                    "Clown",
                    "King",                 //index 34
                    "Queen",
                    "Undertaker",
                    "Squire",
                    "Jester",
                    "Count",                //index 39
                    "Vizier",
                    "Vigilante",
                    "Traveling Medic",
                    "Traveling Mercenary",
                    "Traveling Mystic",     //index 44
                    "Traveling Minstrel",
                    "Templar",
                    "Lookout",
                    "Captain",
                    "Matchmaker",           //index 49
                    "Ninja",
                    "Seducer",
                    "Rogue",
                    "Blacksmith",
                    "Engineer",             //index 54
                    "Executioner",
                    "Copycat",
                    "Admiral",
                    "Vampire Hunter"];      //index 58

baseSetDefaultRoleList = [[0,12],[1,4,7,8,2,5,6,11,9,3,10,13,18,20,16,17,14,19]];

abbrevRoleList =   ["P",
                    "J",
                    "DOB",
                    "H",
                    "S",
                    "G",
                    "F",
                    "GD",
                    "A",
                    "O",
                    "PTOM",
                    "PTIM",
                    "ACO",
                    "LC",
                    "BMB",
                    "ASN",
                    "EM",
                    "BOD",
                    "N",
                    "SP",
                    "INQ",
                    "DET",
                    "B",
                    "DD",
                    "M",
                    "CNS",
                    "CA",
                    "KT",
                    "INV",
                    "INN",
                    "BTC",
                    "ALC",
                    "E",
                    "C",
                    "K",
                    "Q",
                    "U",
                    "SQ",
                    "JST",
                    "CNT",
                    "VZ",
                    "VIG",
                    "TMD",
                    "TMR",
                    "TMY",
                    "TML",
                    "T",
                    "L",
                    "CPT",
                    "MM",
                    "NJ",
                    "SD",
                    "R",
                    "BS",
                    "ENG",
                    "EX",
                    "CC",
                    "ADM",
                    "VH"];

roleCategoryList = {};
roleCategoryList[masterRoleList.indexOf('Priest')] =            masterCategoryList.indexOf('Holy');
roleCategoryList[masterRoleList.indexOf('Judge')] =             masterCategoryList.indexOf('Offensive');
roleCategoryList[masterRoleList.indexOf('Dirty Old Bastard')] = masterCategoryList.indexOf('Offensive');
roleCategoryList[masterRoleList.indexOf('Hunter')] =            masterCategoryList.indexOf('Offensive');
roleCategoryList[masterRoleList.indexOf('Survivalist')] =       masterCategoryList.indexOf('Defensive');
roleCategoryList[masterRoleList.indexOf('Gambler')] =           masterCategoryList.indexOf('Defensive');
roleCategoryList[masterRoleList.indexOf('Fanatic')] =           masterCategoryList.indexOf('Defensive');
roleCategoryList[masterRoleList.indexOf('Gravedigger')] =       masterCategoryList.indexOf('Informative');
roleCategoryList[masterRoleList.indexOf('Apprentice')] =        masterCategoryList.indexOf('Informative');
roleCategoryList[masterRoleList.indexOf('Oracle')] =            masterCategoryList.indexOf('Informative');
roleCategoryList[masterRoleList.indexOf('Peeping Tom')] =       masterCategoryList.indexOf('Informative');
roleCategoryList[masterRoleList.indexOf('Peeping Tim')] =       masterCategoryList.indexOf('Informative');
roleCategoryList[masterRoleList.indexOf('Acolyte')] =           masterCategoryList.indexOf('Holy');
roleCategoryList[masterRoleList.indexOf('Loose Cannon')] =      masterCategoryList.indexOf('Offensive');
roleCategoryList[masterRoleList.indexOf('Bomber')] =            masterCategoryList.indexOf('Offensive');
roleCategoryList[masterRoleList.indexOf('Assassin')] =          masterCategoryList.indexOf('Offensive');
roleCategoryList[masterRoleList.indexOf('Emissary')] =          masterCategoryList.indexOf('Defensive');
roleCategoryList[masterRoleList.indexOf('Benevolent Old Dame')]=masterCategoryList.indexOf('Defensive');
roleCategoryList[masterRoleList.indexOf('Nurse')] =             masterCategoryList.indexOf('Defensive');
roleCategoryList[masterRoleList.indexOf('Spiritualist')] =      masterCategoryList.indexOf('Informative');
roleCategoryList[masterRoleList.indexOf('Inquisitor')] =        masterCategoryList.indexOf('Informative');
roleCategoryList[masterRoleList.indexOf('Detective')] =         masterCategoryList.indexOf('Informative');
roleCategoryList[masterRoleList.indexOf('Bishop')] =            masterCategoryList.indexOf('Holy');
roleCategoryList[masterRoleList.indexOf('Daredevil')] =         masterCategoryList.indexOf('Defensive');
roleCategoryList[masterRoleList.indexOf('Magician')] =          masterCategoryList.indexOf('Hybrid');
roleCategoryList[masterRoleList.indexOf('Conspirator')] =       masterCategoryList.indexOf('Hybrid');
roleCategoryList[masterRoleList.indexOf('Con Artist')] =        masterCategoryList.indexOf('Hybrid');
roleCategoryList[masterRoleList.indexOf('Knife Thrower')] =     masterCategoryList.indexOf('Hybrid');
roleCategoryList[masterRoleList.indexOf('Investigator')] =      masterCategoryList.indexOf('Informative');
roleCategoryList[masterRoleList.indexOf('Innkeeper')] =         masterCategoryList.indexOf('Informative');
roleCategoryList[masterRoleList.indexOf('Butcher')] =           masterCategoryList.indexOf('Offensive');
roleCategoryList[masterRoleList.indexOf('Alchemist')] =         masterCategoryList.indexOf('Hybrid');
roleCategoryList[masterRoleList.indexOf('Entertainer')] =       masterCategoryList.indexOf('Hybrid');
roleCategoryList[masterRoleList.indexOf('Clown')] =             masterCategoryList.indexOf('Offensive');
roleCategoryList[masterRoleList.indexOf('King')] =              masterCategoryList.indexOf('Holy');
roleCategoryList[masterRoleList.indexOf('Queen')] =             masterCategoryList.indexOf('Court');
roleCategoryList[masterRoleList.indexOf('Undertaker')] =        masterCategoryList.indexOf('Informative');
roleCategoryList[masterRoleList.indexOf('Squire')] =            masterCategoryList.indexOf('Hybrid');
roleCategoryList[masterRoleList.indexOf('Jester')] =            masterCategoryList.indexOf('Hybrid');
roleCategoryList[masterRoleList.indexOf('Count')] =             masterCategoryList.indexOf('Informative');
roleCategoryList[masterRoleList.indexOf('Vizier')] =            masterCategoryList.indexOf('Court');
roleCategoryList[masterRoleList.indexOf('Vigilante')] =         masterCategoryList.indexOf('Hybrid');
roleCategoryList[masterRoleList.indexOf('Traveling Medic')] =   masterCategoryList.indexOf('Traveler');
roleCategoryList[masterRoleList.indexOf('Traveling Mercenary')]=masterCategoryList.indexOf('Traveler');
roleCategoryList[masterRoleList.indexOf('Traveling Mystic')] =  masterCategoryList.indexOf('Traveler');
roleCategoryList[masterRoleList.indexOf('Traveling Minstrel')] =masterCategoryList.indexOf('Traveler');
roleCategoryList[masterRoleList.indexOf('Templar')] =           masterCategoryList.indexOf('Holy');
roleCategoryList[masterRoleList.indexOf('Lookout')] =           masterCategoryList.indexOf('Hybrid');
roleCategoryList[masterRoleList.indexOf('Captain')] =           masterCategoryList.indexOf('Hybrid');
roleCategoryList[masterRoleList.indexOf('Matchmaker')] =        masterCategoryList.indexOf('Hybrid');
roleCategoryList[masterRoleList.indexOf('Ninja')] =             masterCategoryList.indexOf('Defensive');
roleCategoryList[masterRoleList.indexOf('Seducer')] =           masterCategoryList.indexOf('Hybrid');
roleCategoryList[masterRoleList.indexOf('Rogue')] =             masterCategoryList.indexOf('Offensive');
roleCategoryList[masterRoleList.indexOf('Blacksmith')] =        masterCategoryList.indexOf('Defensive');
roleCategoryList[masterRoleList.indexOf('Engineer')] =          masterCategoryList.indexOf('Offensive');
roleCategoryList[masterRoleList.indexOf('Executioner')] =       masterCategoryList.indexOf('Offensive');
roleCategoryList[masterRoleList.indexOf('Copycat')] =           masterCategoryList.indexOf('Hybrid');
roleCategoryList[masterRoleList.indexOf('Admiral')] =           masterCategoryList.indexOf('Hybrid');
roleCategoryList[masterRoleList.indexOf('Vampire Hunter')] =    masterCategoryList.indexOf('Legend');

baseSetTeamBreakpointDict = {"-1": [3,6,9,14,17], //do not include holies or peasants!
                            };

halftimeTeamBreakpointDict ={"-1": [3,6,9,20], //do not include holies or peasants!
                             "-2": [14,17,23],
                              "2": [14,17,23],
                            };

masterMandatoryRoleList =   [0,1,4,7];
masterDisabledRoleList =    [12,13,14,15,16,17,18,19,20,21,22,23,24];
masterRoleDependencyDict =  { 8: [1,7], //nesting not allowed
                              9: [0],
                             12: [0],
                             29: [20,28],
                             35: [34],
                             37: [34],
                             38: [34],
                             39: [34],
                             40: [34],
                             41: [34],
                             45: [42,43,44],
                             48: [47],
                             57: [47],
                            };

masterExpansionDependencyDict =  {25: [0],
                                  34: [1],
                                  37: [1],
                                  49: [2],
                                 };

masterExpansionRequirementDict = {1: [34]}; //king required in KC games; check at startGame

baseSetDefaultRoleList = [[0,12],[1,4,7,8,2,5,6,11,9,3,10,13,18,20,16,17,14,19]];
halftimeDefaultRoleList = [[0,22],[1,4,7,8,2,5,11,3,10,20,24,23,27,32,25,28,29,31,30,26,6,9,33,13,14,18,17,16]];

deathLocationStringDict = { 0: "Across from the Alehouse",
                            1: "Beneath a Bridge",
                            2: "Close to the Church",
                            3: "Down by the Docks",
                            4: "Round the Riverbend",
                            5: "in Front of the Fields",
                            6: "Towards the Turnpike",
                            7: "Halfway down a Hill",
                            8: "Inside the Inn",
                            9: "Stuffed inside a Scarecrow",
                           10: "Within a Well",
                           11: "Left in a Lake",
                           12: "in the Middle of Nowhere",
                           13: "Vanquished in the Valley",
                           14: "Perched on a Pig Pen",
                           15: "Under the Underbrush",
                           77: "lying in the town square",
                           };


survivalCodeList = ["death", //this must always stay zero/false
                    "extra-life",
                    "angels",
                    "fake",
                    "gambler",
                    "emissary",
                    "daredevil-self",
                    "daredevil-intercept",
                    "magician",
                    "sniper",
                    "jester",
                    "mercenary",
                    "mystic",
                    "matchmaker",
                    "rogue",
                    "already-dead"];

teamChannelLabelDict = {'-2': 'j', '-3': 't', '2': 's', '3': 'g', '41': 'l1', '42': 'l2', '43': 'l3'};

logPermissionsDict = {
    '$ACO': {'actors': ['c12'], 'targets': ['c0'], 'updateActors': ['c0'], },
    '$ADM': {'alive': ['c57'], 'actors': ['c57'], 'targets': ['aA', 'x'], 'survivalCodes': ['m'], 'mayKillBool': ['aA', 'x'], 'updateDead': ['c57'], },
    '$ALC': {'alive': ['c31'], 'actors': ['c31'], 'targets': ['aA', 'x'], 'survivalCodes': ['m'], 'extraLifeBool': ['aA', 'x'], 'updateDead': ['c31'], },
    '$A': {'actors': ['c8'], 'targets': ['aA'], 'selectedRoleIndex': ['aA'], 'updateActors': ['cpT'], },
    '$ASN': {'correntRoleIndex': ['cpT'], 'updateAll': ['c15'], },
    '$B': {'alive': ['c22'], 'actors': ['c22'], 'targets': ['aA', 'x', 'gc'], 'updateActors': ['tpT', 't-1'], 'updateDead': ['c22'], },
    '$BS': {'selfExtraLifeCount': ['m'], 'updateAll': ['c53'], },
    '$BOD': {'targetExtraLifeCount': ['m'], 'updateAll': ['c17'], },
    '$BODS': {'tag': ['c17'], },
    '$BMR1': {'actors': ['c14'], },
    '$BMR2': {'alive': ['c14'], 'actors': ['c14'], 'survivalCodes': ['m'], 'updateDead': ['c14'], },
    '$BTC': {'alive': ['c30'], 'actors': ['c30'], 'targets': ['aA', 'x'], 'survivalCodes': ['m'], 'updateDead': ['c30'], },
    '$CPT1': {'updateAll': ['[captainID]'], },
    '$CPT2': {'selfExtraLifeCount': ['m'], },
    '$CPT3': {},
    '$C': {'alive': ['c33'], 'actors': ['c33'], 'targets': ['aA', 'x'], 'survivalCodes': ['m'], 'updateDead': ['c33'], },
    '$CA': {'alive': ['c26'], 'actors': ['c26'], 'targets': ['aA', 'x'], 'survivalCodes': ['m'], 'resultCardList': ['aA', 'x'], 'updateActors': ['allT'], 'updateDead': ['c26'], },
    '$CON1': {'actors': ['c25'], 'targets': ['pT'], 'spyRoleIndexListList': ['aA', 'pT'], },
    '$CON2': {'alive': ['c25'], 'actors': ['c25'], 'selfExtraLifeCount': ['m'], },
    '$CNT': {'alive': ['c39'], 'actors': ['c39'], 'teamIndex': ['aA', 'x'], 'result': ['aA', 'x'], 'updateDead': ['c39'], },
    '$DD1': {'alive': ['c23'], 'actors': ['c23'], },
    '$DD2': {'alive': ['c23'], 'actors': ['c23'], 'targets': ['aA', 'x'], 'updateDead': ['c23'], },
    '$DOB': {'updateAll': ['c2'], },
    '$DOBS': {'tag': ['c2'], },
    '$D': {'resultCardList': ['allT'], 'updateAll': ['c21'], },
    '$EM1': {'actors': ['c16'], },
    '$EM2': {'alive': ['c16'], 'actors': ['c16'], },
    '$ENG1': {'updateAll': ['c54'], },
    '$ENG2': {},
    '$ENG3': {'survivalCodes': ['m'], },
    '$E': {'alive': ['c32'], 'actors': ['c32'], 'targets': ['aA', 'x'], 'survivalCodes': ['m'], 'witchNum': ['m'], 'trueTargetID': ['m'], 'updateDead': ['c32'], },
    '$EX': {'updateAll': ['c55'], },
    '$F1': {'tag': ['aA', 'x'], 'selfExtraLifeCount': ['m'], 'updateDead': ['c6'], },
    '$F2': {'tag': ['c0', 'pA', 'x'], 'actors': ['c6'], 'selfExtraLifeCount': ['m'], 'updateActors': ['c0'], 'updateDead': ['c6'], },
    '$G1': {'actors': ['c5'], 'selectionInt': ['aA'], },
    '$G2': {'tag': ['aA'], },
    '$GD': {'alive': ['cpA'], 'actors': ['cpA'], 'resultCardList': ['allT'], 'deadGravediggerID': ['c7'], 'updateActors': ['allT'], 'updateDead': ['cpA', 'allT'], },
    '$H1': {'alive': ['c3'], 'actors': ['c3'], },
    '$H2': {'alive': ['c3'], 'actors': ['c3'], },
    '$H3': {'alive': ['c3'], 'actors': ['c3'], 'targets': ['aA', 'x'], 'survivalCodes': ['m'], 'updateDead': ['c3'], },
    '$INN': {'actors': ['c20', 'c29'], 'updateActors': ['c20', 'c29'], 'updateTargets': ['[investigatorID,', 'innkeeperID]'], },
    '$INQ': {'actors': ['c20', 'c29'], 'targets': ['aA', 'x'], 'resultCategoryIndex': ['aA', 'x'], 'aliveInnkeeperID': ['c29'], 'updateDead': ['c20', 'c29'], },
    '$INV': {'actors': ['c28', 'c29'], 'targets': ['aA', 'x'], 'resultCategoryIndex': ['aA', 'x'], 'aliveInnkeeperID': ['c29'], 'updateDead': ['c28', 'c29'], },
    '$JST1': {'alive': ['c38'], 'actors': ['c38'], },
    '$JST2': {'alive': ['c38'], 'actors': ['c38'], 'survivalCodes': ['m'], 'updateDead': ['c38'], },
    '$J': {'alive': ['cpA'], 'actors': ['cpA'], 'survivalCodes': ['m'], 'extraLivesBurned': ['m'], 'deadJudgeID': ['c1'], 'updateActors': ['allT'], 'updateDead': ['cpA'], },
    '$K1': {'actors': ['c34'], },
    '$K2': {'alive': ['c34', 'gk'], 'actors': ['gk'], 'targets': ['gkS'], 'kingID': ['c34'], 'updateActors': ['c34', 'c40'], 'updateDead': ['c34', 'c40'], },
    '$KT': {'alive': ['c27'], 'actors': ['c27'], 'targets': ['aA', 'x'], 'survivalCodes': ['m'], 'updateDead': ['c27'], },
    '$L1': {'actors': ['c47'], 'alarmTypeIndex': ['aA'], },
    '$L2': {'alive': ['c47'], 'actors': ['c47'], 'alarmTypeIndex': ['aA'], 'deadRatioList': ['m'], 'selfExtraLifeCount': ['m'], },
    '$LC': {'survivalCodes': ['m'], 'updateAll': ['c13'], },
    '$M1': {'alive': ['c24'], 'actors': ['c24'], },
    '$M2': {'alive': ['c24'], 'actors': ['c24'], 'survivalCodes': ['m'], 'updateDead': ['c24'], },
    '$MM1': {'actors': ['c49'], 'targets': ['pT'], 'loverRoleIndexListList': ['aA', 'pT'], },
    '$MM2': {'alive': ['c49'], 'actors': ['c49'], },
    '$N': {'targets': ['cpT'], 'targetExtraLifeCount': ['m'], 'updateAll': ['c18'], },
    '$NJ1': {'updateAll': ['c50'], },
    '$NJ2': {},
    '$NJ3': {},
    '$O': {'actors': ['c9'], 'priestDeathLocationIndex': ['pA'], },
    '$P': {'alive': ['c0'], 'actors': ['c0'], 'targets': ['aA', 'x'], 'resultIsCovenBool': ['pA', 'x'], 'shenanigansBool': ['x'], 'updateDead': ['c0'], },
    '$PT1': {'actors': ['c11'], 'targets': ['aA'], 'updateActors': ['tpT']},
    '$PT2': {'actors': ['c10'], 'targets': ['aA'], 'updateActors': ['tpT']},
    '$Q': {'alive': ['c35', 'gk1'], 'actors': ['gkS'], 'targets': ['gkS'], 'updateActors': ['c35'], 'updateDead': ['c35'], },
    '$R': {'updateAll': ['c52'], },
    '$SD1': {'updateAll': ['c51'], },
    '$SD2': {},
    '$SD3': {'lookBool': ['aA', 'pT', 'x'], 'killBool': ['aA'], },
    '$SD4': {'tag': ['aA', 'pT', 'x'], 'updateTargets': ['allA'], 'updateDead': ['allA'], },
    '$SD5': {'tag': ['aA', 'pT', 'x'], },
    '$SQ1': {'actors': ['c37'], 'targets': ['pT'], 'knightRoleIndexListList': ['aA', 'pT'], },
    '$SQ2': {'tag': ['c37'], 'selfExtraLifeCount': ['m'], },
    '$S': {'actors': ['c4'], },
    '$T1': {'updateAll': ['c46'], },
    '$T2': {},
    '$TMD': {'alive': ['c42'], 'actors': ['aA', 'x'], 'targets': ['aA', 'x'], 'medicID': ['c42'], 'secondUseBool': ['aA', 'x'], 'targetSameTeamBool': ['m'], 'targetExtraLifeCount': ['m'], 'updateActors': ['c42'], 'updateDead': ['c42'], },
    '$TMR': {'alive': ['c43'], 'actors': ['aA', 'x'], 'targets': ['aA', 'x'], 'survivalCodes': ['m'], 'mercenaryID': ['c43'], 'secondUseBool': ['aA', 'x'], 'updateActors': ['c43'], 'updateDead': ['c43'], },
    '$TMY': {'alive': ['c44'], 'actors': ['aA', 'x'], 'targets': ['aA', 'x'], 'mysticID': ['c44'], 'secondUseBool': ['aA', 'x'], 'updateActors': ['c44'], 'updateDead': ['c44'], },
    '$TML': {'alive': ['c45'], 'actors': ['aA', 'x'], 'targets': ['aA', 'x'], 'minstrelID': ['c45'], 'updateActors': ['c45'], 'updateDead': ['c45'], },
    '$U1': {'actors': ['c36'], 'updateDead': ['c36'], },
    '$U2': {'actors': ['c36'], 'resultCardList': ['allT'], 'updateActors': ['allT'], 'updateDead': ['allT'], },
    '$VH1': {'actors': ['c58'], },
    '$VH2': {'tag': ['c58'], 'actors': ['c58'], },
    '$VIG1': {'tag': ['pA'], },
    '$VIG2': {'alive': ['c41'], 'actors': ['c41'], 'targets': ['aA', 'x'], 'survivalCodes': ['m'], },
    '$VZ': {'alive': ['c40'], 'targets': ['td'], 'vizierID': ['c40'], 'disbandBool': ['td'], 'updateActors': ['c40'], 'updateDeadDelayed': ['c40'], },
    '@START': {},
    '@A': {'teamIndex': ['tpA'], 'roleIndex1': ['cV'], 'roleIndex2': ['cV'], 'roleIndex3': ['cV'], 'roleIndex4': ['cV'], 'updateActors': ['allA'], },
    '@CL': {},
    '@TC': {},
    '@RT': {'tag': ['aA', 'aT'], },
    '@STALE': {},
    '@WIN': {},
    '@REPLACE': {},
    '@WARN': {},
    '@MK': {},
    '@MKR': {},
    '@X': {'updateDead': ['allA'], },
    '@V': {},
    '@KV': {'tag': ['gkS'], },
    '@CV': {'tag': ['gcS'], },
    '@CIV': {'tag': ['gcS'], },
    '@CRV': {'tag': ['gcS'], },
    '@AV': {'tag': ['xa'], },
    '@DV': {'tag': ['xd'], },
    '@LK': {'survivalCodes': ['m'], },
    '@KK': {'tag': ['gkS', 'x'], 'survivalCodes': ['m'], },
    '@CK': {'tag': ['gcS', 'x'], 'survivalCodes': ['m'], },
    '@AXR': {'tag': ['x'], },
    '@AP': {'tag': ['x'], },
    '@AZ': {'tag': ['x'], },
    '@DS': {'tag': ['x'], },
    '@DC': {'tag': ['x'], },
    '@DI': {'tag': ['x'], },
    '@DZ': {'tag': ['x'], },
    '@ADZ': {},
    '@NKC': {},
    '@NK': {},
    '@BOMB': {},
    '@BOMBP': {},
    '@BOMBD': {},
    '@HALF': {},
    '@KR1': {'actors': ['gkS', 'xtd'], },
    '@KR': {},
    '@KD': {},
    '@CRT': {'actors': ['gcS', 'xtd'], 'targets': ['gcS', 'pT', 'xtd'], 'targetTeamIndex': ['td'], },
    '@CJJ': {'tag': ['td'], 'actors': ['gcS', 'x'], 'targets': ['gcS', 'x'], 'juniorIDList': ['t-2'], 'spyIDList': ['t2'], 'updateActors': ['t2'], 'updateDeadDelayed': ['t-2'], },
    '@CRS': {'tag': ['td'], 'actors': ['gcS', 'x'], 'targets': ['gcS', 'x', 'pT'], 'targetExtraLifeCount': ['m'], 'updateActors': ['tpT'], 'updateDeadDelayed': ['tpT'], },
    '@CTJ': {'actors': ['gcS', 'x'], 'targets': ['gcS', 'x', 't-4'], 'updateDeadDelayed': ['tpT'], },
    '@CXJ': {'tag': ['td'], 'targets': ['gcS', 'x'], },
    '@CR': {'actors': ['gcS', 'xtd'], 'updateDeadDelayed': ['tA'], },
    '@WR': {'actors': ['t-1'], 'updateActors': ['gcS'], },
    '@JSR1': {'actors': ['t-1'], 'targets': ['gcS'], 'juniorIDList': ['t-2'], 'spyIDList': ['t2'], },
    '@JSR2': {'tag': ['gcS'], },
    '@WLR': {'actors': ['t-1'], 'targets': ['t-4'], 'updateActors': ['t-4'], },
    '@JR': {'actors': ['t-2'], 'updateActors': ['gjS'], },
    '@TR': {'actors': ['t-4'], 'updateActors': ['gtS'], },
    '@SR': {'actors': ['t2'], 'updateActors': ['gsS'], },
    '@KGR': {'actors': ['t3'], 'updateActors': ['ggS'], },
    '@KGR2': {'tag': ['tA'], 'actors': ['t3'], },
    '@LR': {'actors': ['tpA'], 'targets': ['tpT'], 'updateActors': ['tpT'], 'updateTargets': ['tpA'], },
    '@TVR': {'actors': ['pA', 'xtd'], },
    '@WRD': {'actors': ['tpA'], },
    '@WR1': {'updateAll': ['tpA'], },
    '@WR1S': {},
    '@WR1T': {},
    '@WR2': {'updateAll': ['tpA'], },
    '@WR2E': {'tag': ['tpT'], 'targetExtraLifeCount': ['m'], },
    '@WR3': {'livesStolenList': ['m'], 'selfExtraLifeCount': ['m'], 'updateAll': ['tpA'], },
    '@WR4': {'updateAll': ['tpA'], },
    '@WR4R': {},
    '@WR5': {'updateAll': ['tpA'], },
    '@WR5R': {},
    '@WR6': {'updateAll': ['tpA'], },
    '@WR6E': {'resultCardList': ['gcS', 'allT'], },
    '@WR7': {'updateAll': ['tpA'], },
    '@WR7R': {},
    '@LS': {'updateAll': ['tpA', 'tpT'], },
};

targetTemplateDict = {
    'lynch-vote#':      {'tag': 'lynch-vote#', 'p': [], 'a': '#', 't': [77], 'useCount': 0, 'locked': 1, 'active': null, 'style': 2, },
    'court-vote#':      {'tag': 'court-vote#', 'p': ['gkS'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 1, 'active': null, 'style': 2, },
    'coven-vote#':      {'tag': 'coven-vote#', 'p': ['gcS'], 'a': '#', 't': [77, 77], 'useCount': 0, 'locked': 1, 'active': null, 'style': 2, },
    'covenIllusion-vote#':      {'tag': 'covenIllusion-vote#', 'p': ['gcS'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 1, 'active': null, 'style': 2, },
    'covenRecruit-vote#':       {'tag': 'covenRecruit-vote#', 'p': ['gcS'], 'a': '#', 't': [77, 77, 77], 'useCount': 0, 'locked': 1, 'active': null, 'style': 2, },
    'angel-vote#':      {'tag': 'angel-vote#', 'p': ['xa'], 'a': '#', 't': [77, 77, 77], 'useCount': 0, 'locked': 1, 'active': null, 'style': 2, },
    'angelDouble-vote#':        {'tag': 'angelDouble-vote#', 'p': ['xa'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 1, 'active': null, 'style': 6, },
    'demon-vote#':      {'tag': 'demon-vote#', 'p': ['xd'], 'a': '#', 't': [77, 77], 'useCount': 0, 'locked': 1, 'active': null, 'style': 2, },
    'lynch-master':     {'tag': 'lynch-master', 'p': [], 'a': 'm', 't': [77], 'useCount': 0, 'locked': 1, 'active': null, 'style': 2, },
    'court-master':     {'tag': 'court-master', 'p': ['gkS'], 'a': 'm', 't': [77], 'useCount': 0, 'locked': 1, 'active': null, 'style': 2, },
    'coven-master':     {'tag': 'coven-master', 'p': ['gcS'], 'a': 'm', 't': [77, 77], 'useCount': 0, 'locked': 1, 'active': null, 'style': 2, },
    'covenIllusion-master':     {'tag': 'covenIllusion-master', 'p': ['gcS'], 'a': 'm', 't': [77], 'useCount': 0, 'locked': 1, 'active': null, 'style': 2, },
    'covenRecruit-master':      {'tag': 'covenRecruit-master', 'p': ['gcS'], 'a': 'm', 't': [77, 77, 77], 'useCount': 0, 'locked': 1, 'active': null, 'style': 2, },
    'angel-master':     {'tag': 'angel-master', 'p': ['xa'], 'a': 'm', 't': [77, 77, 77], 'useCount': 0, 'locked': 1, 'active': null, 'style': 2, },
    'angelDouble-master':       {'tag': 'angelDouble-master', 'p': ['xa'], 'a': 'm', 't': [77], 'useCount': 0, 'locked': 1, 'active': null, 'style': 6, },
    'demon-master':     {'tag': 'demon-master', 'p': ['xd'], 'a': 'm', 't': [77, 77], 'useCount': 0, 'locked': 1, 'active': null, 'style': 2, },
    'Priest':       {'tag': 'Priest', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 0, 'active': null, 'style': 1, },
    'Judge':        {'tag': 'Judge', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 0, 'active': null, 'style': 1, },
    'Dirty Old Bastard':        {'tag': 'Dirty Old Bastard', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 0, 'active': null, 'style': 1, 'blacklist': ['#'], },
    'Hunter':       {'tag': 'Hunter', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 0, 'active': null, 'style': 1, },
    'Survivalist':      {'tag': 'Survivalist', 'p': ['p#'], 'a': '#', 't': [], 'useCount': 0, 'locked': 1, 'active': null, 'style': 0, },
    'Gambler':      {'tag': 'Gambler', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 0, 'active': null, 'style': 7, },
    'Fanatic':      {'tag': 'Fanatic', 'p': ['p#'], 'a': '#', 't': [], 'useCount': 0, 'locked': 1, 'active': null, 'style': 0, },
    'Gravedigger':      {'tag': 'Gravedigger', 'p': ['p#'], 'a': '#', 't': [], 'useCount': 0, 'locked': 1, 'active': null, 'style': 0, },
    'Apprentice':       {'tag': 'Apprentice', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 0, 'active': null, 'style': 4, },
    'Apprentice-J':     {'tag': 'Apprentice-J', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 1, 'active': null, 'style': 1, },
    'Apprentice-GD':        {'tag': 'Apprentice-GD', 'p': ['p#'], 'a': '#', 't': [], 'useCount': 0, 'locked': 1, 'active': null, 'style': 0, },
    'Oracle':       {'tag': 'Oracle', 'p': ['p#'], 'a': '#', 't': [], 'useCount': 0, 'locked': 1, 'active': null, 'style': 0, },
    'Peeping Tom':      {'tag': 'Peeping Tom', 'p': ['p#'], 'a': '#', 't': [], 'useCount': 0, 'locked': 1, 'active': null, 'style': 0, },
    'Peeping Tim':      {'tag': 'Peeping Tim', 'p': ['p#'], 'a': '#', 't': [], 'useCount': 0, 'locked': 1, 'active': null, 'style': 0, },
    'Acolyte':      {'tag': 'Acolyte', 'p': ['p#'], 'a': '#', 't': [], 'useCount': 0, 'locked': 1, 'active': null, 'style': 0, },
    'Loose Cannon':     {'tag': 'Loose Cannon', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 0, 'active': true, 'style': 1, },
    'Bomber':       {'tag': 'Bomber', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 0, 'active': null, 'style': 1, },
    'Bomber-2':     {'tag': 'Bomber-2', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 1, 'active': null, 'style': 6, },
    'Assassin':     {'tag': 'Assassin', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 0, 'active': null, 'style': 1, },
    'Assassin-2':       {'tag': 'Assassin-2', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 0, 'active': true, 'style': 4, },
    'Emissary':     {'tag': 'Emissary', 'p': ['p#'], 'a': '#', 't': [], 'useCount': 0, 'locked': 1, 'active': null, 'style': 0, },
    'Benevolent Old Dame':      {'tag': 'Benevolent Old Dame', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 0, 'active': null, 'style': 1, 'blacklist': ['#'], },
    'Nurse':        {'tag': 'Nurse', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 0, 'active': true, 'style': 4, },
    'Spiritualist':     {'tag': 'Spiritualist', 'p': ['p#'], 'a': '#', 't': [], 'useCount': 0, 'locked': 1, 'active': null, 'style': 0, },
    'Inquisitor':       {'tag': 'Inquisitor', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 0, 'active': null, 'style': 1, },
    'Detective':        {'tag': 'Detective', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 0, 'active': true, 'style': 3, },
    'Bishop':       {'tag': 'Bishop', 'p': ['p#'], 'a': '#', 't': [], 'useCount': 0, 'locked': 1, 'active': null, 'style': 0, },
    'Daredevil':        {'tag': 'Daredevil', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 0, 'active': null, 'style': 1, 'blacklist': ['#'], },
    'Magician':     {'tag': 'Magician', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 0, 'active': null, 'style': 1, },
    'Conspirator':      {'tag': 'Conspirator', 'p': ['p#'], 'a': '#', 't': [], 'useCount': 0, 'locked': 1, 'active': null, 'style': 0, },
    'Con Artist':       {'tag': 'Con Artist', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 0, 'active': null, 'style': 1, },
    'Knife Thrower':        {'tag': 'Knife Thrower', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 0, 'active': null, 'style': 1, },
    'Investigator':     {'tag': 'Investigator', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 0, 'active': null, 'style': 1, },
    'Innkeeper':        {'tag': 'Innkeeper', 'p': ['p#'], 'a': '#', 't': [], 'useCount': 0, 'locked': 1, 'active': null, 'style': 0, },
    'Butcher':      {'tag': 'Butcher', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 0, 'active': null, 'style': 1, },
    'Alchemist':        {'tag': 'Alchemist', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 0, 'active': null, 'style': 1, },
    'Alchemist-2':      {'tag': 'Alchemist-2', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 0, 'active': null, 'style': 6, },
    'Entertainer':      {'tag': 'Entertainer', 'p': ['p#'], 'a': '#', 't': [77, 77, 77], 'useCount': 0, 'locked': 0, 'active': null, 'style': 1, },
    'Clown':        {'tag': 'Clown', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 1, 'active': null, 'style': 1, },
    'King':     {'tag': 'King', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 0, 'active': null, 'style': 1, },
    'Queen':        {'tag': 'Queen', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 0, 'active': null, 'style': 1, },
    'Undertaker':       {'tag': 'Undertaker', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 1, 'active': null, 'style': 6, },
    'Squire':       {'tag': 'Squire', 'p': ['p#'], 'a': '#', 't': [], 'useCount': 0, 'locked': 1, 'active': null, 'style': 0, },
    'Jester':       {'tag': 'Jester', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 1, 'active': null, 'style': 1, },
    'Count':        {'tag': 'Count', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 1, 'active': null, 'style': 5, },
    'Vizier':       {'tag': 'Vizier', 'p': ['p#'], 'a': '#', 't': [77, 77, 77], 'useCount': 0, 'locked': 0, 'active': null, 'style': 1, },
    'Vigilante':        {'tag': 'Vigilante', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 1, 'active': null, 'style': 1, },
    'Traveling Medic':      {'tag': 'Traveling Medic', 'p': ['p#'], 'a': '#', 't': [77, 77], 'useCount': 0, 'locked': 1, 'active': null, 'style': 1, },
    'Traveling Mercenary':      {'tag': 'Traveling Mercenary', 'p': ['p#'], 'a': '#', 't': [77, 77], 'useCount': 0, 'locked': 1, 'active': null, 'style': 1, },
    'Traveling Mystic':     {'tag': 'Traveling Mystic', 'p': ['p#'], 'a': '#', 't': [77, 77], 'useCount': 0, 'locked': 1, 'active': null, 'style': 1, },
    'Traveling Minstrel':       {'tag': 'Traveling Minstrel', 'p': ['p#'], 'a': '#', 't': [77, 77, 77], 'useCount': 0, 'locked': 1, 'active': null, 'style': 6, },
    'Templar':      {'tag': 'Templar', 'p': ['p#'], 'a': '#', 't': [], 'useCount': 0, 'locked': 0, 'active': true, 'style': 0, },
    'Lookout':      {'tag': 'Lookout', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 0, 'active': null, 'style': 5, },
    'Captain':      {'tag': 'Captain', 'p': ['p#'], 'a': '#', 't': [], 'useCount': 0, 'locked': 0, 'active': true, 'style': 0, },
    'Matchmaker':       {'tag': 'Matchmaker', 'p': ['p#'], 'a': '#', 't': [], 'useCount': 0, 'locked': 1, 'active': null, 'style': 0, },
    'Ninja':        {'tag': 'Ninja', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 0, 'active': true, 'style': 1, },
    'Seducer':      {'tag': 'Seducer', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 0, 'active': true, 'style': 1, },
    'Seducer-2':        {'tag': 'Seducer-2', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 1, 'active': null, 'style': 6, },
    'Rogue':        {'tag': 'Rogue', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 0, 'active': true, 'style': 1, },
    'Blacksmith':       {'tag': 'Blacksmith', 'p': ['p#'], 'a': '#', 't': [], 'useCount': 0, 'locked': 0, 'active': true, 'style': 0, },
    'Engineer':     {'tag': 'Engineer', 'p': ['p#'], 'a': '#', 't': [77, 77], 'useCount': 0, 'locked': 0, 'active': true, 'style': 1, },
    'Executioner':      {'tag': 'Executioner', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 1, 'active': true, 'style': 1, },
    'Copycat':      {'tag': 'Copycat', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 1, 'active': null, 'style': 4, },
    'Assassin':     {'tag': 'Assassin', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 1, 'active': null, 'style': 1, },
    'Assassin-2':       {'tag': 'Assassin-2', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 1, 'active': true, 'style': 4, },
    'Nurse':        {'tag': 'Nurse', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 1, 'active': true, 'style': 4, },
    'Detective':        {'tag': 'Detective', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 1, 'active': true, 'style': 3, },
    'Captain':      {'tag': 'Captain', 'p': ['p#'], 'a': '#', 't': [], 'useCount': 0, 'locked': 1, 'active': true, 'style': 0, },
    'Ninja':        {'tag': 'Ninja', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 1, 'active': true, 'style': 1, },
    'Seducer':      {'tag': 'Seducer', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 1, 'active': true, 'style': 1, },
    'Seducer-2':        {'tag': 'Seducer-2', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 1, 'active': null, 'style': 6, },
    'Rogue':        {'tag': 'Rogue', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 1, 'active': true, 'style': 1, },
    'Blacksmith':       {'tag': 'Blacksmith', 'p': ['p#'], 'a': '#', 't': [], 'useCount': 0, 'locked': 1, 'active': true, 'style': 0, },
    'Engineer':     {'tag': 'Engineer', 'p': ['p#'], 'a': '#', 't': [77, 77], 'useCount': 0, 'locked': 1, 'active': true, 'style': 1, },
    'Executioner':      {'tag': 'Executioner', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 1, 'active': true, 'style': 1, },
    'Admiral':      {'tag': 'Admiral', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 0, 'active': null, 'style': 1, },
    'Vampire Hunter':       {'tag': 'Vampire Hunter', 'p': ['p#'], 'a': '#', 't': [], 'useCount': 0, 'locked': 1, 'active': null, 'style': 0, },
    'bomb':     {'tag': 'bomb', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 0, 'active': null, 'style': 1, },
    'warlockDraft-1':       {'tag': 'warlockDraft-1', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 0, 'active': null, 'style': 8, },
    'warlockDraft-2':       {'tag': 'warlockDraft-2', 'p': ['p#'], 'a': '#', 't': [77, 77], 'useCount': 0, 'locked': 0, 'active': null, 'style': 8, },
    'warlockDraft-3':       {'tag': 'warlockDraft-3', 'p': ['p#'], 'a': '#', 't': [77, 77, 77], 'useCount': 0, 'locked': 0, 'active': null, 'style': 8, },
    'warlockRitual-1':      {'tag': 'warlockRitual-1', 'p': ['p#'], 'a': '#', 't': [77, 77], 'useCount': 0, 'locked': 0, 'active': true, 'style': 1, 'blacklist': ['#'], },
    'warlockRitual-2':      {'tag': 'warlockRitual-2', 'p': ['p#'], 'a': '#', 't': [77, 77], 'useCount': 0, 'locked': 0, 'active': true, 'style': 1, 'blacklist': ['#'], },
    'warlockRitual-3':      {'tag': 'warlockRitual-3', 'p': ['p#'], 'a': '#', 't': [77, 77, 77], 'useCount': 0, 'locked': 0, 'active': true, 'style': 1, },
    'warlockRitual-4':      {'tag': 'warlockRitual-4', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 0, 'active': true, 'style': 1, 'blacklist': ['#'], },
    'warlockRitual-5':      {'tag': 'warlockRitual-5', 'p': ['p#'], 'a': '#', 't': [77], 'useCount': 0, 'locked': 0, 'active': true, 'style': 1, },
    'warlockRitual-6':      {'tag': 'warlockRitual-6', 'p': ['p#'], 'a': '#', 't': [77, 77, 77], 'useCount': 0, 'locked': 0, 'active': true, 'style': 1, },
    'warlockRitual-7':      {'tag': 'warlockRitual-7', 'p': ['p#'], 'a': '#', 't': [77, 77], 'useCount': 0, 'locked': 0, 'active': true, 'style': 1, },
};

doubleTargetList = ["Assassin", "Alchemist"];