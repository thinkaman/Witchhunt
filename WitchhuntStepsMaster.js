stepScheduleNextDict = {"Signup":       "Deal",
                        "Deal":         "Game Start",
                        "Game Start":   "Day",
                        "Day":          "Night",
                        "Night":        "Day",
                        "Village Win":  null,
                        "Witch Win":    null,
                        };

stepScheduleDict = {"Signup":       [],
                    "Deal":         ["deal"],
                    "Game Start":   ["gameStart", "debugRandomTargets",
                                     "meet-Witches", "meet-Juniors", "meet-Traitors", "meet-Spies", "meet-Knights", "meet-Lovers",
                                     "Survivalist", "Oracle always", "Peeping Tom", "Peeping Tim", "Acolyte", "Conspirator",
                                     "Gambler",
                                     "Apprentice"],
                    "Day":          ["dayStart", "victoryCheckA", "debugRandomTargets",
                                     "lynch-master", "Judge", "Apprentice-J", "victoryCheckB", "bombPass"],
                    "Day-Insert":   [], //dummy, only for reference
                    "Night":        ["nightStart", "debugRandomTargets", "Gravedigger", "Apprentice-G", "Fanatic-2",
                                     "angelDemonMasterMultiplex",
                                     "witchMultiplex",
                                     "Priest", "Fanatic", "Inquisitor", "Spiritualist",
                                     "Hunter", "Bomber",
                                     "resolveNightKills"],
                    "Reaction":     ["DOB", "BOD"], //dummy, only for reference
                    "Village Win":  ["villageWin"],
                    "Witch Win":    ["witchWin"],
                    };