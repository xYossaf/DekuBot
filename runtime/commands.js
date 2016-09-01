var config = require("../config.json");
var userDB = require("./user_rt.js");
var serverDB = require("./server_rt.js");
var permissionDB = require("./permission_rt.js");
var factionDB = require("./faction_rt.js");
var mangaDB = require("./manga_track_rt.js");
var redditDB = require("./reddit_rt.js");
var functions = require("./functions.js");
var battle = require("./battle_rt.js");
var customcommands = require("./custom_command_rt.js");

var jimp = require("jimp");
var parseString = require('xml2js').parseString;
var nani = require("nani").init(config.anilistID, config.anilist_Secret);
var nedb = require("nedb")
var request = require("request");
var youtubeNode = require("youtube-node");
var ytdl = require("ytdl-core");
var Commands = [];

Commands.help = {
	name: "help",
	help: "tbd",
	type: "general",
	lvl: 0,
	func: function(bot, msg) {
  	bot.reply(msg, " 📙 https://github.com/RoddersGH/DekuBot/wiki/General-Commands 📙 ");
  }
};

Commands.ping = {
	name: "ping",
	help: "tbd",
	type: "general",
	lvl: 0,
	func: function(bot, msg) {
  	bot.reply(msg, ":ping_pong:");
  }
};

Commands.purge = {
	name: "purge",
	help: "tbd",
	type: "admin",
	lvl: 1,
	func: function(bot, msg, args) {
    if (!msg.channel.server) {
      bot.sendMessage(msg.channel, "```diff\n- You can't do that in a DM you silly silly person!```");
      return;
    }
    if (!args || isNaN(args)) {
      bot.sendMessage(msg.channel, "```diff\n- Please define an amount of messages for me to delete!```");
      return;
    }
    if (!msg.channel.permissionsOf(msg.sender).hasPermission("manageMessages")) {
      bot.sendMessage(msg.channel, "```diff\n- Your role in this server does not have enough permissions.```");
      return;
    }
    if (!msg.channel.permissionsOf(bot.user).hasPermission("manageMessages")) {
      bot.sendMessage(msg.channel, "```diff\n- I don't have permission to do that!```");
      return;
    }
    if (args > 100) {
      bot.sendMessage(msg.channel, "```diff\n- The maximum is 100.```");
      return;
    }
    bot.getChannelLogs(msg.channel, args, function(error, messages) {
      if (error) {
        bot.sendMessage(msg.channel, "```diff\n- Something went wrong while getting logs thing.```");
        return;
      } else {
        var msgsleft = messages.length,
          delcount = 0;
        for (msg of messages) {
          bot.deleteMessage(msg);
          msgsleft--;
          delcount++;
          if (msgsleft === 0) {
            bot.sendMessage(msg.channel, "Done ✔ Deleted " + delcount + " messages.");
            return;
          }
        }
      }
    });
  }
};

Commands.namechanges = {
	name: "namechanges",
	help: "tbt",
	type: "general",
	lvl: 0,
	func: function(bot, msg) {
		if ((msg.mentions.length === 0) || (msg.mentions.length > 1)) {
			bot.sendMessage(msg.channel, "```diff\n- Please mention a single user.```");
		} else {
			msg.mentions.map(function(user) {
	      userDB.returnNamechanges(user).then(function(reply) {
	        bot.sendMessage(msg.channel, reply.join(', '));
	      }).catch(function(err) {
	        if (err === 'No changes found!') {
	          bot.sendMessage(msg.channel, "I don't have any changes registered 📒");
	          return;
	        }
	        bot.sendMessage(msg.channel, '❌ Something went wrong, try again later.');
	      });
	    });
		}
  }
};

Commands.botstatus = {
	name: "botstatus",
	help: "tbd",
	type: "general",
	lvl: 0,
	func: function(bot, msg) {
		var channelcount = 0;
		var usercount = 0;
		var finalstring = [];

		for (server of bot.servers) {
			for (channel of server.channels ) {
				channelcount++;
			};
			for (member of server.members) {
				usercount++;
			};
		};

		finalstring.push("Hi! Im DekuBot :robot:");
		finalstring.push("Im currently used in ``" + bot.servers.length + "`` server(s), in ``" + channelcount + "`` channels used by ``" + usercount + "`` users.");
		finalstring.push("I've been up and ready for ``" + (Math.round(bot.uptime / (1000 * 60 * 60))) + "`` hours, ``" + (Math.round(bot.uptime / (1000 * 60)) % 60) + "`` minutes, and ``" + (Math.round(bot.uptime / 1000) % 60 + ".") + "`` seconds.");
	  finalstring.push("If you have any questions or need some help, contact **RoddersGH#4702**")
		finalstring.push("```         __    __");
		finalstring.push("        /  |  | |'-.");
		finalstring.push("       .|__/  | |   |");
		finalstring.push("    _ /  `._  |_|_.-'");
		finalstring.push("   | /  |__.`=._) (_");
		finalstring.push('   |/ ._/  |"""""""""|');
		finalstring.push("   |'.  ` )|         |");
		finalstring.push('   ;"""/ / |         |');
		finalstring.push("    ) /_/| |.-------.|");
		finalstring.push("   o  `-`o o         o	```");
		bot.sendMessage(msg.channel, finalstring);
  }
};

Commands.getpermissionlvl = {
	name: "getpermissionlvl",
	help: "tbd",
	type: "admin",
	lvl: 1,
	func: function(bot, msg, args) {
		if ((msg.mentions.length === 0) || (msg.mentions.length > 1)) {
			bot.reply(msg, "```diff\n- Please mention a user```");
		} else {
			permissionDB.getPermission(msg.channel.server.id, msg.mentions[0].id).then(function(r) {
				bot.sendMessage(msg.channel, r);
			});
		}
  }
};

Commands.setpermissionlvl = {
	name: "setpermissionlvl",
	help: "tbd",
	type: "admin",
	lvl: 3,
	func: function(bot, msg, args) {
		var num = args.substr(args.indexOf(" ") + 1)
		var isnum = /^\d+$/.test(num);
		if ((msg.mentions.length === 0) || (msg.mentions.length > 1)) {
			bot.reply(msg, "```diff\n- Please mention a user```");
			return;
		} else {
			if (!num || isnum == false || (num == 4) || (num == 5) || (num < 0) || (num > 6)) {
				bot.sendMessage(msg.channel, "```diff\n- Please define the permission level you wish to set for the user.```");
				return;
			} else {
				permissionDB.check(msg.channel.server.id, msg.mentions[0].id).catch(function(e) {
					console.log(e);
					if (e == 'Nothing found!') {
						permissionDB.newPermission(msg.channel.server, msg.mentions[0]);
					};
				});
				permissionDB.getPermission(msg.channel.server.id, msg.author.id).then(function(r) {
					permissionDB.setPermission(r, msg.channel.server, msg.mentions[0], num).then(function(res) {
						bot.sendMessage(msg.channel, msg.mentions[0] + res);
					}).catch(function(e) {
						bot.sendMessage(msg.channel, e);
					});
				}).catch(function(e) {
					console.log(e);
				});
			}
	  }
  }
};

Commands.createfaction = {
	name: "createfaction",
	help: "tbd",
	type: "admin",
	lvl: 3,
	func: function(bot, msg, args) {
		var name = args.substr(0, args.indexOf("#") - 1).toLowerCase();
		var hex = args.substr(args.indexOf("#"))
		var isHex = /^#[0-9A-F]{6}$/i.test(hex);

		if (isHex == false) {
			bot.sendMessage(msg.channel, "```diff\n- Please enter a valid Hex value of the format #<six digit hex number>.```");
			return;
		};
		factionDB.checkNameClash(msg.channel.server, name).then(function() {
			var hex_int = parseInt("0x" + hex.substr(hex.indexOf("#") + 1), 16);
			bot.createRole(msg.server, {
				color : hex_int,
				hoist : false,
				name : name,
				permissions : [
					"attachFiles", "sendMessages", "readMessages", "embedLinks", "readMessageHistory", "createInstantInvite", "changeNickname", "voiceConnect", "voiceSpeak", "voiceUseVAD"
				],
				mentionable: false
			}, function(err, role) {
				if (err) {
					bot.sendMessage(msg.channel, err);
					return;
				}
				factionDB.createNewFaction(role.id, role.server, role.name, hex_int, role.permissions);
				bot.sendMessage(msg.channel, "The faction " + role.name + " has been created ✔");
			});
		}).catch(function(e) {
			bot.sendMessage(msg.channel, e);
			return;
		});
  }
};

// Commands.manualjoinfaction = {
// 	name: "manualjoinfaction",
// 	help: "tbd",
// 	type: "admin",
// 	lvl: 3,
// 	func: function(bot, msg, args) {
// 		var name = args.substr(args.indexOf(" ") + 1)
// 		var exitloop2 = false;
// 		if ((msg.mentions.length === 0) || (msg.mentions.length > 1)) {
// 			bot.reply(msg, "Please mention a user");
// 			return;
// 		} else {
// 			if (!name) {
// 				bot.sendMessage(msg.channel, "Please define the faction you wish the user to join.");
// 				return;
// 			} else {
// 				factionDB.getFactionsHere(msg.channel.server).then(function(r) {     //r is servers factions
// 					for (factionid of r) {
// 						if (exitloop2 == true) {
// 							break;
// 						};
// 						factionDB.getFactionName(factionid).then(function(v) {
// 							if (v == name) {
// 								userDB.getFactionIDs(msg.mentions[0]).then(function(q) {
// 									for (facid of q) {
// 										factionDB.getFactionID(msg.channel.server.id, v).then(function(j) { //j is id of a given server faction
// 										if ((j == facid) || (facid = r[0]) || (facid = r[1]) || (facid = r[2])) {
// 											bot.sendMessage(msg.channel, "The user is already in a faction on this server.");
// 											return;
// 										} else {
// 											userDB.addToFaction(msg.mentions[0], j);
// 											bot.sendMessage(msg.channel, "The user has successfully been added to " + name);
// 										};
// 										});
// 									};
// 								}).catch(function(e) {
// 									if (e == 'No factions found!') {
// 											factionDB.getFactionID(msg.channel.server.id, v).then(function(m) {
// 												userDB.addToFaction(msg.mentions[0], m);
// 												bot.sendMessage(msg.channel, "The user has successfully been added to " + name);
// 											});
// 									}
// 								});
// 								exitloop2 = true;
// 							};
// 						});
// 					}
//
// 				}).catch(function(e) {
// 					bot.sendMessage(msg.channel, e);
// 				});
// 			}
// 	  }
//   }
// };
//
// Commands.manualleavefaction = {
// 	name: "manualleavefaction",
// 	help: "tbd",
// 	type: "admin",
// 	lvl: 3,
// 	func: function(bot, msg, args) {
// 		var name = args.substr(args.indexOf(" ") + 1)
// 		exitloop = false;
// 		if ((msg.mentions.length === 0) || (msg.mentions.length > 1)) {
// 			bot.reply(msg, "Please mention a user");
// 			return;
// 		} else {
// 			if (!name) {
// 				bot.sendMessage(msg.channel, "Please define the faction you wish the user to leave.");
// 				return;
// 			} else {
// 				factionDB.getFactionsHere(msg.channel.server).then(function(r) {
// 					for (factionid of r) {
// 						factionDB.getFactionName(factionid).then(function(v) {
// 							if (v == name) {
// 								userDB.getFactionIDs(msg.mentions[0]).then(function(q){
// 									for (facid of q) {
// 										if (exitloop = true) {
// 											break;
// 										};
// 										factionDB.getFactionID(msg.channel.server.id, v).then(function(j) { //j is id of a given server faction
// 										if (j == facid) {
// 											userDB.removeFromFaction(msg.mentions[0], j);
// 											bot.sendMessage(msg.channel, "The user has successfully been removed from " + name);
//
// 											exitloop = true;
// 											return;
// 										};
// 										});
// 									};
// 								}).catch(function(e) {
// 									if (e == 'No factions found!') {
// 										bot.sendMessage(msg.channel, "The user is not in any faction");
// 										exitloop = true;
// 									}
// 								})
//
// 							}
// 						})
// 					}
// 					if (exitloop == false) {
// 						bot.sendMessage(msg.channel, "The user is not a member of the faction " + name);
// 					}
// 				})
// 			}
// 	  }
//   }
// };

Commands.faction = {
	name: "faction",
	help: "tbd",
	type: "general",
	lvl: 0,
	func: function(bot, msg, args) {
	  var msgArray = [];
	  var serverFactions = [];
		var found = false;
	  factionDB.getFactionsHere(msg.server).then(function(serverFactions) {
				for (i = 0; i < serverFactions.length; i++) {
					if (bot.memberHasRole(msg.author, msg.server.roles.get("id", serverFactions[i]))) {
						bot.sendMessage(msg.author, "❌ Sorry, you are already in a faction. If you really want to change faction though, message RoddersGH#4702");
						found = true;
					}
					if (found == false && i == serverFactions.length-1) {
						msgArray.push("Hello member of the " + msg.channel.server.name + " server");
						msgArray.push("Im a new addition to the server made by the Admin @Rodders. I help with a bunch of things which you can check out by going to the following link ");
						msgArray.push("I hope you continue to have lots of fun discussing one piece with us!");
						msgArray.push("(If this message was an annoyance or was not intended for you then I sincerely apologise and would ask you to contact @Rodders on the server with any issues)");
						msgArray.push(" ");
						msgArray.push("We have different factions on the server that give you access to exclusive channels and faction leaderboards(still being made )!");
						msgArray.push("**If you want to join a faction, type the number next to the faction you wish to join.**" );
						msgArray.push("The factions are:" );
						msgArray.push("1. Pirates" );
						msgArray.push("2. Marines" );
						msgArray.push("3. Revolutionary Army" );

						bot.sendMessage(msg.author, msgArray, {}, function(err, sentmsg) {
							sentmsg.author = msg.author
							functions.responseHandling(bot, sentmsg, "**Which faction would you like to join?**", msg.author, msg.server);
						});
					}
				}
	  }).catch(function(e) {
			if (e == 'No factions found') {
				bot.sendMessage(msg.channel, 'This server has no factions in it at the moment. Message an admin if you wish for them to create factions for the server.' )
			}
		})
  }
};

Commands.ignore = {
	name: "ignore",
	help: "tbd",
	type: "admin",
	lvl: 3,
	func: function(bot, msg, args) {
		serverDB.ignoreChannel(msg.channel).then(function(r) {
			bot.reply(msg, r);
		}).catch(function(e) {
			bot.reply(msg, e);
		})
  }
};

Commands.unignore = {
	name: "unignore",
	help: "tbd",
	type: "admin",
	lvl: 3,
	func: function(bot, msg, args) {
		serverDB.unignoreChannel(msg.channel).then(function(r) {
			bot.reply(msg, r);
		}).catch(function(e) {
			bot.reply(msg, e);
		})
  }
};

Commands.anime = {
	name: "anime",
	help: "tbd",
	type: "weeb",
	lvl: 0,
	func: function(bot, msg, args) {
		bot.sendMessage(msg.channel, " 🔍 *Searching...* 🔍");
		nani.get('anime/search/' + args).then(function(r) {
			if (r.length == 0) {
				bot.reply(msg, "❌ Nothing found ");
				return
			} else {
				nani.get('anime/' + r[0].id).then(function(data) {
					bot.sendMessage(msg.channel, 'http://anilist.co/anime/' + data.id + "   " + data.image_url_lge, function(err, message) {
						var msgArray = [];
						msgArray.push("**Names: **" + data.title_japanese + ", " + data.title_romaji + ", " + data.title_english);
						msgArray.push("**Type: **" + data.type);
						msgArray.push("**Genres: **" + data.genres);
						msgArray.push("**Score: **" + data.average_score);
						msgArray.push("**Status: **" + data.airing_status);
						if (data.total_episodes != 0) {
							msgArray.push("**# of Episodes: **" + data.total_episodes);
						}
						msgArray.push("**Start Date: **" + data.start_date.substr(0, 10));
						if (data.end_date) {
							msgArray.push("**End Date: **" + data.end_date.substr(0, 10));
						}
						var cleanText = data.description.replace(/<\/?[^>]+(>|$)/g, "");
						msgArray.push("**Description: **" + cleanText);
						bot.sendMessage(msg.channel, msgArray);
					});
				}).catch(function(e) {
					console.log(e);
				});
			}
		}).catch(function(e) {
			console.log(e);
			bot.reply(msg, "❌ Nothing found ");
		});
  }
};

Commands.manga = {
	name: "manga",
	help: "tbd",
	type: "weeb",
	lvl: 0,
	func: function(bot, msg, args) {
		bot.sendMessage(msg.channel, " 🔍 *Searching...* 🔍");
		nani.get('manga/search/' + args).then(function(r) {
			if (r.length == 0) {
				bot.reply(msg, "❌ Nothing found ");
				return
			} else {
				nani.get('manga/' + r[0].id).then(function(data) {
					bot.sendMessage(msg.channel, 'http://anilist.co/manga/' + data.id + "   " + data.image_url_lge, function(err, message) {
						var msgArray = [];
						msgArray.push("**Names: **" + data.title_japanese + ", " + data.title_romaji + ", " + data.title_english);
						msgArray.push("**Type: **" + data.type);
						msgArray.push("**Genres: **" + data.genres);
						msgArray.push("**Score: **" + data.average_score);
						msgArray.push("**Status: **" + data.airing_status);
						if (data.total_chapters != 0) {
							msgArray.push("**# of Chapters: **" + data.total_chapters + " In " + data.total_volumes + " Volumes.");
						}
						msgArray.push("**Start Date: **" + data.start_date.substr(0, 10));
						if (data.end_date) {
							msgArray.push("**End Date: **" + data.end_date.substr(0, 10));
						}
						var cleanText = data.description.replace(/<\/?[^>]+(>|$)/g, "");
						msgArray.push("**Description: **" + cleanText);
						bot.sendMessage(msg.channel, msgArray);
					});
				}).catch(function(e) {
					console.log(e);
				});
			}
		}).catch(function(e) {
			console.log(e);
			bot.reply(msg, "❌ Nothing found ");
		});
  }
};

Commands.character = {
	name: "character",
	help: "tbd",
	type: "weeb",
	lvl: 0,
	func: function(bot, msg, args) {
		bot.sendMessage(msg.channel, " 🔍 *Searching...* 🔍");
		nani.get('character/search/' + args).then(function(r) {
			if (r.length == 0) {
				bot.reply(msg, "❌ Nothing found ");
				return
			} else {
				var msgArray1 = [];
				if (r.length > 1 ) {
					for (i = 0; i < r.length; i++) {
						msgArray1.push("[ " + (i+1) + " ]  -  " + r[i].name_last + " " + r[i].name_first);
					}
				} else if (r.length == 1) {
				nani.get('character/' + r[0].id).then(function(data) {
					bot.sendMessage(msg.channel, 'http://anilist.co/character/' + data.id + "   " + data.image_url_lge, function(err, message) {
						var msgArray = [];
						msgArray.push("**Names: **" + data.name_last + " " + data.name_first + ", " + data.name_alt + ", " + data.name_japanese);
						var a = data.info.replace(/__/g, "**");
						var b = a.replace(/~!/g, " ");
						var c = b.replace(/!~/g, " ");
						if (data.info.length >= 1600) {
							msgArray.push("**Description: **\n\n" + c.substr(0, 1600) + "...       _click the first link above to read more_");
						} else {
							msgArray.push("**Description: **\n\n" + c);
						}

						bot.sendMessage(msg.channel, msgArray);
					});
				}).catch(function(e) {
					console.log(e);
				});
				return;
				}
				bot.sendMessage(msg.channel, "**Please choose one be giving a number:**", function(err, mesg){
					mesg.author = msg.author
					functions.responseHandlingREG(bot, mesg, msgArray1, msg.author).then(function(num){
						if (num > 0 && num <= r.length && num.length <= 2) {
							nani.get('character/' + r[num-1].id).then(function(data) {
								bot.sendMessage(msg.channel, 'http://anilist.co/character/' + data.id + "   " + data.image_url_lge, function(err, message) {
									var msgArray = [];
									msgArray.push("**Names: **" + data.name_last + " " + data.name_first + ", " + data.name_alt + ", " + data.name_japanese);
									var a = data.info.replace(/__/g, "**");
									var b = a.replace(/~!/g, " ");
									var c = b.replace(/!~/g, " ");
									var d = c.replace(/&#039;/, "'")
									if (data.info.length >= 1600) {
										msgArray.push("**Description: **\n\n" + d.substr(0, 1600) + "...       _click the first link above to read more_");
									} else {
										msgArray.push("**Description: **\n\n" + d);
									}

									bot.sendMessage(msg.channel, msgArray);
								});
							}).catch(function(e) {
								console.log(e);
							});
						}
					}).catch(function(e) {
						console.log(e);
					});

				});
			}
		}).catch(function(e) {
			console.log(e);
		});
  }
};

Commands.animesearch = {
	name: "animesearch",
	help: "tbd",
	type: "weeb",
	lvl: 0,
	func: function(bot, msg, args) {
		bot.sendMessage(msg.channel, " 🔍 *Searching...* 🔍");
		nani.get('anime/search/' + args).then(function(r) {
			if (r.length == 0) {
				bot.reply(msg, "❌ Nothing found ");
				return
			} else {
				var msgArray1 = [];
				if (r.length > 1 ) {
					for (i = 0; i < r.length; i++) {
						msgArray1.push("[ " + (i+1) + " ]  -  " + r[i].title_english);
					}
				} else if (r.length == 1) {
				nani.get('anime/' + r[0].id).then(function(data) {
					bot.sendMessage(msg.channel, 'http://anilist.co/anime/' + data.id + "   " + data.image_url_lge, function(err, message) {
						var msgArray = [];
						msgArray.push("**Names: **" + data.title_japanese + ", " + data.title_romaji + ", " + data.title_english);
						msgArray.push("**Type: **" + data.type);
						msgArray.push("**Genres: **" + data.genres);
						if (data.average_score == 0) {
							msgArray.push("**Score: **Undecided" );
						} else {
							msgArray.push("**Score: **" + data.average_score);
						}
						msgArray.push("**Status: **" + data.airing_status);
						if (data.total_episodes != 0) {
							msgArray.push("**# of Episodes: **" + data.total_episodes);
						}
						msgArray.push("**Start Date: **" + data.start_date.substr(0, 10));
						if (data.end_date) {
							msgArray.push("**End Date: **" + data.end_date.substr(0, 10));
						}
						if (data.description) {
							var cleanText = data.description.replace(/<\/?[^>]+(>|$)/g, "");
							msgArray.push("**Description: **" + cleanText);
						}
						bot.sendMessage(msg.channel, msgArray);
					});
				}).catch(function(e) {
					console.log(e);
				});
				return;
				}
				bot.sendMessage(msg.channel, "**Please choose one be giving a number:**", function(err, mesg){
					mesg.author = msg.author
					functions.responseHandlingREG(bot, mesg, msgArray1, msg.author).then(function(num){
						if (num > 0 && num <= r.length && num.length <= 2) {
							nani.get('anime/' + r[num-1].id).then(function(data) {
								bot.sendMessage(msg.channel, 'http://anilist.co/anime/' + data.id + "   " + data.image_url_lge, function(err, message) {
									var msgArray = [];
									msgArray.push("**Names: **" + data.title_japanese + ", " + data.title_romaji + ", " + data.title_english);
									msgArray.push("**Type: **" + data.type);
									msgArray.push("**Genres: **" + data.genres);
									if (data.average_score == 0) {
										msgArray.push("**Score: **Undecided" );
									} else {
										msgArray.push("**Score: **" + data.average_score);
									}
									msgArray.push("**Status: **" + data.airing_status);
									if (data.total_episodes != 0) {
										msgArray.push("**# of Episodes: **" + data.total_episodes);
									}
									msgArray.push("**Start Date: **" + data.start_date.substr(0, 10));
									if (data.end_date) {
										msgArray.push("**End Date: **" + data.end_date.substr(0, 10));
									}
									if (data.description) {
										var cleanText = data.description.replace(/<\/?[^>]+(>|$)/g, "");
										msgArray.push("**Description: **" + cleanText);
									}
									bot.sendMessage(msg.channel, msgArray);
								});
							}).catch(function(e) {
								console.log(e);
							});
						}
					}).catch(function(e) {
						console.log(e);
					});

				});
			}
		}).catch(function(e) {
			console.log(e);
		});
  }
};

Commands.mangasearch = {
	name: "mangasearch",
	help: "tbd",
	type: "weeb",
	lvl: 0,
	func: function(bot, msg, args) {
		bot.sendMessage(msg.channel, " 🔍 *Searching...* 🔍");
		nani.get('manga/search/' + args).then(function(r) {
			if (r.length == 0) {
				bot.reply(msg, "❌ Nothing found ");
				return
			} else {
				var msgArray1 = [];
				if (r.length > 1 ) {
					for (i = 0; i < r.length; i++) {
						msgArray1.push("[ " + (i+1) + " ]  -  " + r[i].title_english);
					}
				} else if (r.length == 1) {
					nani.get('manga/' + r[0].id).then(function(data) {
						bot.sendMessage(msg.channel, 'http://anilist.co/manga/' + data.id + "   " + data.image_url_lge, function(err, message) {
							var msgArray = [];
							msgArray.push("**Names: **" + data.title_japanese + ", " + data.title_romaji + ", " + data.title_english);
							msgArray.push("**Type: **" + data.type);
							msgArray.push("**Genres: **" + data.genres);
							msgArray.push("**Score: **" + data.average_score);
							msgArray.push("**Status: **" + data.airing_status);
							if (data.total_chapters != 0) {
								msgArray.push("**# of Chapters: **" + data.total_chapters + " In " + data.total_volumes + " Volumes.");
							}
							msgArray.push("**Start Date: **" + data.start_date.substr(0, 10));
							if (data.end_date) {
								msgArray.push("**End Date: **" + data.end_date.substr(0, 10));
							}
							var cleanText = data.description.replace(/<\/?[^>]+(>|$)/g, "");
							msgArray.push("**Description: **" + cleanText);
							bot.sendMessage(msg.channel, msgArray);
						});
					}).catch(function(e) {
						console.log(e);
					});
				return;
				}
				bot.sendMessage(msg.channel, "**Please choose one be giving a number:**", function(err, mesg){
					mesg.author = msg.author
					functions.responseHandlingREG(bot, mesg, msgArray1, msg.author).then(function(num){
						if (num > 0 && num <= r.length && num.length <= 2) {
							nani.get('manga/' + r[num-1].id).then(function(data) {
								bot.sendMessage(msg.channel, 'http://anilist.co/manga/' + data.id + "   " + data.image_url_lge, function(err, message) {
									var msgArray = [];
									msgArray.push("**Names: **" + data.title_japanese + ", " + data.title_romaji + ", " + data.title_english);
									msgArray.push("**Type: **" + data.type);
									msgArray.push("**Genres: **" + data.genres);
									msgArray.push("**Score: **" + data.average_score);
									msgArray.push("**Status: **" + data.airing_status);
									if (data.total_chapters != 0) {
										msgArray.push("**# of Chapters: **" + data.total_chapters + " In " + data.total_volumes + " Volumes.");
									}
									msgArray.push("**Start Date: **" + data.start_date.substr(0, 10));
									if (data.end_date) {
										msgArray.push("**End Date: **" + data.end_date.substr(0, 10));
									}
									var cleanText = data.description.replace(/<\/?[^>]+(>|$)/g, "");
									msgArray.push("**Description: **" + cleanText);
									bot.sendMessage(msg.channel, msgArray);
								});
							}).catch(function(e) {
								console.log(e);
							});
						}
					}).catch(function(e) {
						console.log(e);
					});
				});
			}
		}).catch(function(e) {
			console.log(e);
		});
  }
};

Commands.animeairdate = {
	name: "animeairdate",
	help: "tbd",
	type: "weeb",
	lvl: 0,
	func: function(bot, msg, args) {
		bot.sendMessage(msg.channel, " 🔍 *Searching...* 🔍");
		nani.get('anime/search/' + args).then(function(r) {
			if (r.length == 0) {
				bot.reply(msg, "Nothing found");
				return
			} else {
				nani.get('anime/' + r[0].id).then(function(data) {
					bot.sendMessage(msg.channel, 'http://anilist.co/anime/' + data.id + "   " + data.image_url_lge, function(err, message) {
						var msgArray = [];
						console.log(data.airing_status);
						if (data.airing_status == 'finished airing' || data.airing_status == 'not yet aired') {
							msgArray.push("**Status: **" + data.airing_status);
						} else {
							var date = new Date(null);
							date.setSeconds(data.airing.countdown); // specify value for SECONDS here
							var formattedDate = date.toISOString().substr(8,2)-1 + " Days, " + date.toISOString().substr(11,2) + " Hours, " + date.toISOString().substr(14,2) + " Minutes"

							msgArray.push("**Next Episode: **" + data.airing.next_episode);
							msgArray.push("**Airing On: **" + data.airing.time.substr(0, 10));
							msgArray.push("**Countdown: ** :hourglass_flowing_sand: " + formattedDate);
						}

						bot.sendMessage(msg.channel, msgArray);
					});
				}).catch(function(e) {
					console.log(e);
				});
			}
		}).catch(function(e) {
			console.log(e);
		});
  }
};

Commands.mangatrack = {
	name: "mangatrack",
	help: "tbd",
	type: "weeb",
	lvl: 0,
	func: function(bot, msg, args) {
		var found = false;
		var pmfound = false;
		if (args.indexOf(" ") > 0 || args.indexOf("\u200B") > 0) {
			bot.sendMessage(msg.channel, "Syntax error: Not a valid mangastream link. Please give the link in the form of '<http://mangastream.com/manga/><manga name>'. Go to <http://mangastream.com/manga> to find a list.");
			return;
		}
		request(args, function(error, response, body) {
			if (error) {
				console.log(error);
				bot.sendMessage(msg.channel, "Syntax error: Not a valid mangastream link. Please give the link in the form of '<http://mangastream.com/manga/><manga name>'. Go to <http://mangastream.com/manga> to find a list.");
			}
			if (body.search("<p>We tried our best but couldn't find the page you're looking for. We moved things around in July of 2013 which resulted in a lot of URLs changing, sorry for the inconvenience! The following pages might help you find what you're looking for:</p>") == -1 && args.indexOf('mangastream.com') >= 0 ) {
				var temptag = args.substr(args.indexOf('/manga/')+7);
				var mangatag = 0
				if (temptag.indexOf('/') >= 0) {
					mangatag = temptag.slice(0, temptag.indexOf('/'))
					args = args.slice(0, args.indexOf('/manga/')+7+mangatag.length)
				} else {
					mangatag = temptag
				}
				if (body.search( '<a href="http://mangastream.com/r/' + mangatag + '/') !== -1) {
					var temp = ('http://mangastream.com/r/' + mangatag + '/').length
					var begin = body.search( 'http://mangastream.com/r/' + mangatag + '/') + temp
					var othertemp = body.substr(begin)
					var end = othertemp.indexOf("/")
					mangaDB.getAll().then(function(r) {
						if (r.length != 0) {
							for(i = 0; i < r.length; i++) {
								if (r[i].url == args && r[i].server_id == msg.server.id) {
									found = true;
									for(q = 0; q < r[i].pm_array.length; q++) {
										if (r[i].pm_array[q] == msg.author.id) {
											bot.sendMessage(msg.channel, "You are already tracking ``" + args + "``. All new chapters will continue to be linked to you in a PM.");
											pmfound = true
										}
										console.log(pmfound);
										if (pmfound == false && q == r[i].pm_array.length-1 ) {
											mangaDB.addToPM(r[i]._id, msg.author);
											bot.sendMessage(msg.channel, "You are now tracking ``" + args + "``. All new chapters will be linked to you in a PM ✔");
										}
									}
								}
								console.log(found);
								if (found == false && i == r.length-1 ) {
									mangaDB.trackManga(args, body.substr(begin, end), 0, msg.server.id, false);
									mangaDB.getAll().then(function(res) {
										for(j = 0; j < res.length; j++) {
											if (res[j].url == args && res[j].server_id == msg.server.id) {
												mangaDB.addToPM(res[j]._id, msg.author);
												bot.sendMessage(msg.channel, "You are now tracking ``" + args + "``. All new chapters will be linked to you in a PM ✔");
											}
										}
									})
								}
							}
						} else {
							mangaDB.trackManga(args, body.substr(begin, end), 0, msg.server.id, false);
							mangaDB.getAll().then(function(res) {
								for(j = 0; j < res.length; j++) {
									if (res[j].url == args && res[j].server_id == msg.server.id) {
										mangaDB.addToPM(res[j]._id, msg.author);
										bot.sendMessage(msg.channel, "You are now tracking ``" + args + "``. All new chapters will be linked to you in a PM ✔");
									}
								}
							})
						}
					})
				} else {
					bot.sendMessage(msg.channel, "Syntax error: Not a valid mangastream link. Please give the link in the form of '<http://mangastream.com/manga/><manga name>' **MUST BE http NOT https**. Go to <http://mangastream.com/manga> to find a list.");
				}
			} else {
				bot.sendMessage(msg.channel, "Syntax error: Not a valid mangastream link. Please give the link in the form of '<http://mangastream.com/manga/><manga name>'. Go to <http://mangastream.com/manga> to find a list.");
			}
		})
	}
};

Commands.unmangatrack = {
	name: "unmangatrack",
	help: "tbd",
	type: "weeb",
	lvl: 3,
	func: function(bot, msg, args) {
		var found = false;
		var pmfound = false;
		if (args.indexOf(" ") > 0 || args.indexOf("\u200B") > 0) {
			bot.sendMessage(msg.channel, "Syntax error: Not a valid mangastream link. Please give the link in the form of '<http://mangastream.com/manga/><manga name>'. Go to <http://mangastream.com/manga> to find a list.");
			return;
		}
		request(args, function(error, response, body) {
			if (error) {
				console.log(error);
				bot.sendMessage(msg.channel, "Syntax error: Not a valid mangastream link. Please give the link in the form of '<http://mangastream.com/manga/><manga name>'. Go to <http://mangastream.com/manga> to find a list.");
			}
			if (body.search("<p>We tried our best but couldn't find the page you're looking for. We moved things around in July of 2013 which resulted in a lot of URLs changing, sorry for the inconvenience! The following pages might help you find what you're looking for:</p>") == -1 && args.indexOf('mangastream.com/manga') >= 0 ) {
				var temptag = args.substr(args.indexOf('/manga/')+7);
				var mangatag = 0
				if (temptag.indexOf('/') >= 0) {
					mangatag = temptag.slice(0, temptag.indexOf('/'))
					args = args.slice(0, args.indexOf('/manga/')+7+mangatag.length)
				} else {
					mangatag = temptag
				}
				if (body.search( '<a href="http://mangastream.com/r/' + mangatag + '/') !== -1) {
					var temp = ('http://mangastream.com/r/' + mangatag + '/').length
					var begin = body.search( 'http://mangastream.com/r/' + mangatag + '/') + temp
					var othertemp = body.substr(begin)
					var end = othertemp.indexOf("/")
					mangaDB.getAll().then(function(r) {
						if (r.length != 0) {
							for(i = 0; i < r.length; i++) {
								if (r[i].url == args && r[i].server_id == msg.server.id) {
									found = true;
									if (r[i].pm_array.length == 1 && r[i].mention == false) {
										mangaDB.deleteTrack(r[i]._id);
										bot.sendMessage(msg.channel, "You are now no longer tracking ``" + args + "`` ✔.");
									} else {
										for(q = 0; q < r[i].pm_array.length; q++) {
											if (r[i].pm_array[q] == msg.author.id) {
												mangaDB.removeFromPM(r[i]._id, msg.author);
												bot.sendMessage(msg.channel, "You are now no longer tracking ``" + args + "`` ✔");
												pmfound = true
											}
											console.log(pmfound);
											if (pmfound == false && q == r[i].pm_array.length-1 ) {
												bot.sendMessage(msg.channel, "You are not tracking this manga.");
											}
										}
									}
								}
								if (found == false && i == r.length-1 ) {
									bot.sendMessage(msg.channel, "You were not tracking this manga.");
								}
							}
						} else {
							bot.sendMessage(msg.channel, "You are not tracking this manga.");
						}
					})
				} else {
					bot.sendMessage(msg.channel, "Syntax error: Not a valid mangastream link. Please give the link in the form of '<http://mangastream.com/manga/><manga name>' **MUST BE http NOT https**. Go to <http://mangastream.com/manga> to find a list.");
				}
			} else {
				bot.sendMessage(msg.channel, "Syntax error: Not a valid mangastream link. Please give the link in the form of '<http://mangastream.com/manga/><manga name>'. Go to <http://mangastream.com/manga> to find a list.");
			}
		})
  }
};

Commands.servermangatrack = {
	name: "mangatrack",
	help: "tbd",
	type: "weeb",
	lvl: 3,
	func: function(bot, msg, args) {
		if (args.indexOf(" ") > 0 || args.indexOf("\u200B") > 0) {
			bot.sendMessage(msg.channel, "Syntax error: Not a valid mangastream link. Please give the link in the form of '<http://mangastream.com/manga/><manga name>'. Go to <http://mangastream.com/manga> to find a list.");
			return;
		}
		request(args, function(error, response, body) {
			if (error) {
				console.log(error);
				bot.sendMessage(msg.channel, "Syntax error: Not a valid mangastream link. Please give the link in the form of '<http://mangastream.com/manga/><manga name>'. Go to <http://mangastream.com/manga> to find a list.");
			}
			if (body.search("<p>We tried our best but couldn't find the page you're looking for. We moved things around in July of 2013 which resulted in a lot of URLs changing, sorry for the inconvenience! The following pages might help you find what you're looking for:</p>") == -1 && args.indexOf('mangastream.com') >= 0 ) {
				var temptag = args.substr(args.indexOf('/manga/')+7);
				var mangatag = 0
				if (temptag.indexOf('/') >= 0) {
					mangatag = temptag.slice(0, temptag.indexOf('/'))
					args = args.slice(0, args.indexOf('/manga/')+7+mangatag.length)
				} else {
					mangatag = temptag
				}
				if (body.search( '<a href="http://mangastream.com/r/' + mangatag + '/') !== -1) {
					var found = false;
					var temp = ('http://mangastream.com/r/' + mangatag + '/').length
					var begin = body.search( 'http://mangastream.com/r/' + mangatag + '/') + temp
					var othertemp = body.substr(begin)
					var end = othertemp.indexOf("/")
					mangaDB.getAll().then(function(r) {
						if (r.length != 0) {
							for(i = 0; i < r.length; i++) {
								if (r[i].url == args && r[i].server_id == msg.server.id) {
									if (r[i].mention) {
										bot.sendMessage(msg.channel, "You are already tracking ``" + args + "`` in this server.");
									} else {
										mangaDB.updateChannel(r[i]._id, msg.channel.id);
										mangaDB.updateMention(r[i]._id, true);
										bot.sendMessage(msg.channel, "You are now tracking ``" + args + "``. All new chapters will be linked in this channel with an @ everyone ✔");
									}
									found = true
								}
								if (found == false && i == r.length-1 ) {
									mangaDB.trackManga(args, body.substr(begin, end), msg.channel.id, msg.server.id, true);
									bot.sendMessage(msg.channel, "You are now tracking ``" + args + "``. All new chapters will be linked in this channel with an @ everyone ✔");
								}
							}
						} else {
							mangaDB.trackManga(args, body.substr(begin, end), msg.channel.id, msg.server.id, true);
							bot.sendMessage(msg.channel, "You are now tracking ``" + args + "``. All new chapters will be linked in this channel with an @ everyone ✔");
						}
					})
				} else {
					bot.sendMessage(msg.channel, "Syntax error: Not a valid mangastream link. Please give the link in the form of '<http://mangastream.com/manga/><manga name>' **MUST BE http NOT https**. Go to <http://mangastream.com/manga> to find a list.");
				}
			} else {
				bot.sendMessage(msg.channel, "Syntax error: Not a valid mangastream link. Please give the link in the form of '<http://mangastream.com/manga/><manga name>'. Go to <http://mangastream.com/manga> to find a list.");
			}
		})
	}
};

Commands.unservermangatrack = {
	name: "mangatrack",
	help: "tbd",
	type: "weeb",
	lvl: 3,
	func: function(bot, msg, args) {
		if (args.indexOf(" ") > 0 || args.indexOf("\u200B") > 0) {
			bot.sendMessage(msg.channel, "Syntax error: Not a valid mangastream link. Please give the link in the form of '<http://mangastream.com/manga/><manga name>'. Go to <http://mangastream.com/manga> to find a list.");
			return;
		}
		request(args, function(error, response, body) {
			if (error) {
				console.log(error);
				bot.sendMessage(msg.channel, "Syntax error: Not a valid mangastream link. Please give the link in the form of '<http://mangastream.com/manga/><manga name>'. Go to <http://mangastream.com/manga> to find a list.");
			}
			if (body.search("<p>We tried our best but couldn't find the page you're looking for. We moved things around in July of 2013 which resulted in a lot of URLs changing, sorry for the inconvenience! The following pages might help you find what you're looking for:</p>") == -1 && args.indexOf('mangastream.com') >= 0 ) {
				var temptag = args.substr(args.indexOf('/manga/')+7);
				var mangatag = 0
				if (temptag.indexOf('/') >= 0) {
					mangatag = temptag.slice(0, temptag.indexOf('/'))
					args = args.slice(0, args.indexOf('/manga/')+7+mangatag.length)
				} else {
					mangatag = temptag
				}
				if (body.search( '<a href="http://mangastream.com/r/' + mangatag + '/') !== -1) {
					var found = false;
					var temp = ('http://mangastream.com/r/' + mangatag + '/').length
					var begin = body.search( 'http://mangastream.com/r/' + mangatag + '/') + temp
					var othertemp = body.substr(begin)
					var end = othertemp.indexOf("/")
					mangaDB.getAll().then(function(r) {
						if (r.length != 0) {
							for(i = 0; i < r.length; i++) {
								if (r[i].url == args && r[i].server_id == msg.server.id) {
									if (r[i].mention) {
										if (r[i].pm_array.length < 1) {
											mangaDB.deleteTrack(r[i]._id);
										} else {
											mangaDB.updateChannel(r[i]._id, 0);
											mangaDB.updateMention(r[i]._id, false);
										}
										bot.sendMessage(msg.channel, "You are now no longer tracking ``" + args + "`` in this server ✔");
									} else {
										bot.sendMessage(msg.channel, "You are already not tracking ``" + args + "`` in this server.");
									}
									found = true
								}
								if (found == false && i == r.length-1 ) {
									bot.sendMessage(msg.channel, "You are already not tracking ``" + args + "`` in this server.");
								}
							}
						} else {
							bot.sendMessage(msg.channel, "You are already not tracking ``" + args + "`` in this server.");
						}
					})
				} else {
					bot.sendMessage(msg.channel, "Syntax error: Not a valid mangastream link. Please give the link in the form of '<http://mangastream.com/manga/><manga name>' **MUST BE http NOT https** . Go to <http://mangastream.com/manga> to find a list.");
				}
			} else {
				bot.sendMessage(msg.channel, "Syntax error: Not a valid mangastream link. Please give the link in the form of '<http://mangastream.com/manga/><manga name>'. Go to <http://mangastream.com/manga> to find a list.");
			}
		})
	}
};

Commands.createcommand = {
	name: "createcommand",
	help: "tbd",
	type: "admin",
	lvl: 3,
	func: function(bot, msg, args) {
		var comexists = false
		var specific_lvl = 0;
		if (!args) {
			bot.sendMessage(msg.channel, "Syntax error. Correct usage: '!createcommand <command name> | <command text> ---<permission level>'. Command name cannot contain spaces. (permission level can be ommitted but the command will be usable by anyone)");
			return;
		}
		if (args.indexOf(" | ") < 0) {
			bot.sendMessage(msg.channel, "Syntax error. Correct usage: '!createcommand <command name> | <command text> ---<permission level>'. Command name cannot contain spaces. (permission level can be ommitted but the command will be usable by anyone)");
			return;
		}
		if (/---[0-3]|---6/.test(args)) {
			if (/---[0-3]|---6/.exec(args).index !== args.length-4) {
				bot.sendMessage(msg.channel, "Syntax error. Correct usage: '!createcommand <command name> | <command text> ---<permission level>'. Command name cannot contain spaces. (permission level can be ommitted but the command will be usable by anyone)");
				return;
			} else {
				specific_lvl = args.substr(/---[0-3]|---6/.exec(args).index+3, 1);
			}
		}
		var tempname = args.split(" ")[0].trim();
		var comname = args.split(" ")[0].toLowerCase().trim();
		if (args.split(" ")[1] != "|") {
			bot.sendMessage(msg.channel, "```diff\n- Command name cannot contain spaces.```");
			return;
		}
		var comcontent = args.replace(tempname + " | ", "").replace("---" + specific_lvl, "").trim();
		if (Commands[comname]) {
			bot.sendMessage(msg.channel, "```diff\n- Cannot overwrite core bot commands.```");
			return;
		}
		customcommands.getAllHere(msg.server).then(function(r) {
			for (i = 0; i < r.length; i++) {
				if (r[i].name === comname) {
				 comexists = true
				}
			}
			if (comexists) {
				customcommands.deleteCommand(msg.server, comname);
				customcommands.createNewCommand(comname, msg.server, comcontent, specific_lvl);
				bot.sendMessage(msg.channel, "📝 Command `" + comname + "` has been overwritten with new response: " + comcontent);
			}	else {
				customcommands.createNewCommand(comname, msg.server, comcontent, specific_lvl);
				bot.sendMessage(msg.channel, "📝 Command `" + comname + "` has been created with response: " + comcontent);
			}
		});
	}
};

Commands.deletecommand = {
	name: "deletecommand",
	help: "tbd",
	type: "admin",
	lvl: 3,
	func: function(bot, msg, args) {
		if (!args) {
			bot.sendMessage(msg.channel, "Syntax error. Correct usage: '!delete <command name>. Command name cannot contain spaces.");
			return;
		}
		customcommands.deleteCommand(msg.server, args).then(function(r) {
			bot.sendMessage(msg.channel, r)
		}).catch(function(e) {
			bot.sendMessage(msg.channel, e)
		})
	}
};

Commands.eval = {
	name: "eval",
	help: "tbd",
	type: "admin",
	lvl: 6,
	func: function(bot, msg, args) {
		if (msg.author.id == 159704938283401216) {
			try {
	        bot.sendMessage(msg.channel, eval(args));
	    }
	    catch (err) {
	        bot.sendMessage(msg.channel, "Eval failed :(");
	        bot.sendMessage(msg.channel, "`" + err + "`");
	    }
		}
  }
};

Commands.nsfw = {
	name: "nsfw",
	help: "tbd",
	type: "admin",
	lvl: 3,
	func: function(bot, msg, args) {
		serverDB.nsfwChannel(msg.channel).then(function(r) {
			bot.reply(msg, r);
		}).catch(function(e) {
			bot.reply(msg, e);
		})
  }
};

Commands.unnsfw = {
	name: "unnsfw",
	help: "tbd",
	type: "admin",
	lvl: 3,
	func: function(bot, msg, args) {
		serverDB.unNSFWChannel(msg.channel).then(function(r) {
			bot.reply(msg, r);
		}).catch(function(e) {
			bot.reply(msg, e);
		})
  }
};

Commands.rule34 = {
	name: "rule34",
	help: "tbd",
	type: "nsfw",
	lvl: 0,
	func: function(bot, msg, args) {
		request('http://rule34.xxx//index.php?page=dapi&s=post&q=index&limit=300&tags=' + args, function (error, response, body) {
		    if (!error && response.statusCode == 200) {
					if (body.length < 1) {
						bot.sendMessage(msg.channel, "Sorry, nothing found.");
						return;
					}
					if (args.length < 1) {
						args = "<no tags specified>";
					}
		      parseString(body, function (err, result) {
						bot.sendMessage(msg.channel, "You've searched for `" + args + "`. Sending 3 random images from a potential 300 results...", function(err, mesg) {
							bot.sendMessage(msg.channel, 'http:' + result.posts.post[Math.floor((Math.random() * result.posts.post.length))].$.file_url);
							bot.sendMessage(msg.channel, 'http:' + result.posts.post[Math.floor((Math.random() * result.posts.post.length))].$.file_url);
							bot.sendMessage(msg.channel, 'http:' + result.posts.post[Math.floor((Math.random() * result.posts.post.length))].$.file_url);
						});
		      });
		    }
		})
  }
};

Commands.konachan = {
	name: "konachan",
	help: "tbd",
	type: "nsfw",
	lvl: 0,
	func: function(bot, msg, args) {
		if (args.split(" ").length > 5) {
			bot.sendMessage(msg.channel, "Konachan only supports upto 6 tags.");
			return;
		}
		request('https://konachan.net/post/index.json?limit=300&tags=' + args, function (error, response, body) {
		    if (!error && response.statusCode == 200) {
					var result = JSON.parse(body);
					if (result.length < 1) {
						bot.sendMessage(msg.channel, "Sorry, nothing found.");
						return;
					}
					if (args.length < 1) {
						args = "<no tags specified>";
					}
					if ((args.toString().toLowerCase().indexOf("gaping") > -1
						|| args.toString().toLowerCase().indexOf("gape") > -1)
						|| args.toString().toLowerCase().indexOf("prolapse") > -1
						|| args.toString().toLowerCase().indexOf("toddlercon") > -1
						|| args.toString().toLowerCase().indexOf("scat") > -1
						|| args.toString().toLowerCase().indexOf("gore") > -1) {
							bot.sendMessage(msg.channel, "You've searched for `" + args + "`. Sending images in a pm...", function(err, mesg) {
								bot.sendMessage(msg.author, result[Math.floor((Math.random() * result.length))].file_url);
								bot.sendMessage(msg.author, result[Math.floor((Math.random() * result.length))].file_url);
								bot.sendMessage(msg.author, result[Math.floor((Math.random() * result.length))].file_url);
							});
					} else {
							bot.sendMessage(msg.channel, "You've searched for `" + args + "`. Sending 3 random images from a potential 300 results...", function(err, mesg) {
								bot.sendMessage(msg.channel, result[Math.floor((Math.random() * result.length))].file_url);
								bot.sendMessage(msg.channel, result[Math.floor((Math.random() * result.length))].file_url);
								bot.sendMessage(msg.channel, result[Math.floor((Math.random() * result.length))].file_url);
							});
					}
		    }
		  })
  }
};

Commands.danbooru = {
	name: "danbooru",
	help: "tbd",
	type: "nsfw",
	lvl: 0,
	func: function(bot, msg, args) {
		if (args.split(" ").length > 2) {
			bot.sendMessage(msg.channel, "Danbooru only supports upto 2 tags.");
			return;
		}
		request('https://danbooru.donmai.us/posts.json?limit=300&tags=' + args, function (error, response, body) {
		    if (!error && response.statusCode == 200) {
					var result = JSON.parse(body);
					if (result.length < 1) {
						bot.sendMessage(msg.channel, "Sorry, nothing found.");
						return;
					}
					if (args.length < 1) {
						args = "<no tags specified>";
					}
					if ((args.toString().toLowerCase().indexOf("gaping") > -1
						|| args.toString().toLowerCase().indexOf("gape") > -1)
						|| args.toString().toLowerCase().indexOf("prolapse") > -1
						|| args.toString().toLowerCase().indexOf("toddlercon") > -1
						|| args.toString().toLowerCase().indexOf("scat") > -1
						|| args.toString().toLowerCase().indexOf("gore") > -1) {
							bot.sendMessage(msg.channel, "You've searched for `" + args + "`. Sending images in a pm...", function(err, mesg) {
								bot.sendMessage(msg.author, 'https://danbooru.donmai.us' + result[Math.floor((Math.random() * result.length))].file_url);
								bot.sendMessage(msg.author, 'https://danbooru.donmai.us' + result[Math.floor((Math.random() * result.length))].file_url);
								bot.sendMessage(msg.author, 'https://danbooru.donmai.us' + result[Math.floor((Math.random() * result.length))].file_url);
							});
					} else {
							bot.sendMessage(msg.channel, "You've searched for `" + args + "`. Sending 3 random images from a potential 300 results...", function(err, mesg) {
								bot.sendMessage(msg.channel, 'https://danbooru.donmai.us' + result[Math.floor((Math.random() * result.length))].file_url);
								bot.sendMessage(msg.channel, 'https://danbooru.donmai.us' + result[Math.floor((Math.random() * result.length))].file_url);
								bot.sendMessage(msg.channel, 'https://danbooru.donmai.us' + result[Math.floor((Math.random() * result.length))].file_url);
							});
					}
		    }
		  })
  }
};

Commands.yandere = {
	name: "yandere",
	help: "tbd",
	type: "nsfw",
	lvl: 0,
	func: function(bot, msg, args) {
		request('https://yande.re/post/index.json?limit=500&tags=' + args, function (error, response, body) {
		    if (!error && response.statusCode == 200) {
					var result = JSON.parse(body);
					if (result.length < 1) {
						bot.sendMessage(msg.channel, "Sorry, nothing found.");
						return;
					}
					if (args.length < 1) {
						args = "<no tags specified>";
					}
					if ((args.toString().toLowerCase().indexOf("gaping") > -1
						|| args.toString().toLowerCase().indexOf("gape") > -1)
						|| args.toString().toLowerCase().indexOf("prolapse") > -1
						|| args.toString().toLowerCase().indexOf("toddlercon") > -1
						|| args.toString().toLowerCase().indexOf("scat") > -1
						|| args.toString().toLowerCase().indexOf("gore") > -1) {
							bot.sendMessage(msg.channel, "You've searched for `" + args + "`. Sending images in a pm...", function(err, mesg) {
								bot.sendMessage(msg.author, result[Math.floor((Math.random() * result.length))].file_url);
								bot.sendMessage(msg.author, result[Math.floor((Math.random() * result.length))].file_url);
								bot.sendMessage(msg.author, result[Math.floor((Math.random() * result.length))].file_url);
							});
					} else {
							bot.sendMessage(msg.channel, "You've searched for `" + args + "`. Sending 3 random images from a potential 300 results...", function(err, mesg) {
								bot.sendMessage(msg.channel, result[Math.floor((Math.random() * result.length))].file_url);
								bot.sendMessage(msg.channel, result[Math.floor((Math.random() * result.length))].file_url);
								bot.sendMessage(msg.channel, result[Math.floor((Math.random() * result.length))].file_url);
							});
					}
		    }
		  })
  }
};

Commands.reddit = {
	name: "reddit",
	help: "tbd",
	type: "admin",
	lvl: 3,
	func: function(bot, msg, args) {
		var found = false;
		if (args.indexOf(" ") > 0 || args.indexOf("\u200B") > 0) {
			bot.sendMessage(msg.channel, "Syntax error: Not a valid subreddit link. Please give the link in the form of '<https://www.reddit.com/r/><subreddit name>'.");
			return;
		}
		request(args, function(error, response, body) {
			if (error) {
				console.log(error);
				bot.sendMessage(msg.channel, "Syntax error: Not a valid subreddit link. Please give the link in the form of '<https://www.www.reddit.com/r/><subreddit name>'.");
			}
			if (body.search('<p id="noresults" class="error">there doesn' + "'" + 't seem to be anything here</p>') == -1 && body.search('<h3>You must be a Reddit Gold member to view this super secret community</h3>') == -1 && body.search('<h3>This community has been banned</h3>') == -1 && args.indexOf('www.reddit.com/r/') >= 0 ) {
				temp = args.substr(args.indexOf('/r/')+3);
				if (temp.indexOf("/") >= 0) {
					name = temp.slice(0, temp.indexOf('/'));
				} else {
					name = temp;
				}
				if (name.toLowerCase() == 'all' || name.toLowerCase() == 'mod' || name.toLowerCase() == 'friends' || name.toLowerCase() == 'dashboard' || name.toLowerCase() == '' || name.toLowerCase() == 'random') {
					bot.sendMessage(msg.channel, "nono <3");
					return;
				}
				redditDB.getAll().then(function(r) {
					if (r.length < 1) {
						redditDB.trackSubreddit(name, msg);
						bot.sendMessage(msg.channel, "/r/" + name + ` Is now being tracked in <#${msg.channel.id}>. All new posts will be sent as messages here.`);
					} else {
						for (i = 0; i < r.length; i++) {
							if (r[i].channel_id == msg.channel.id && r[i].subreddit_name == name) {
									bot.sendMessage(msg.channel, "You are already tracking /r/" + name + ` in <#${msg.channel.id}>. All new posts are sent as messages here.`);
									found = true
							}
							if (found == false && i == r.length-1) {
								redditDB.trackSubreddit(name, msg);
								bot.sendMessage(msg.channel, "/r/" + name + ` Is now being tracked in <#${msg.channel.id}>. All new posts will be sent as messages here.`);
							}
						}
					}
				})
			} else {
				bot.sendMessage(msg.channel, "Syntax error: Not a valid subreddit link. Please give the link in the form of '<https://www.www.reddit.com/r/><subreddit name>'.");
			}
		})
  }
};

Commands.unreddit = {
	name: "unreddit",
	help: "tbd",
	type: "admin",
	lvl: 3,
	func: function(bot, msg, args) {
		var found = false;
		if (args.indexOf(" ") > 0 || args.indexOf("\u200B") > 0) {
			bot.sendMessage(msg.channel, "Syntax error: Not a valid subreddit link. Please give the link in the form of 'reddit.com/r/<subreddit name>'.");
			return;
		}
		request(args, function(error, response, body) {
			if (error) {
				console.log(error);
				bot.sendMessage(msg.channel, "Syntax error: Not a valid subreddit link. Please give the link in the form of 'www.reddit.com/r/<subreddit name>'.");
			}
			if (body.search('<p id="noresults" class="error">there doesn' + "'" + 't seem to be anything here</p>') == -1 && args.indexOf('www.reddit.com/r/') >= 0 ) {
				temp = args.substr(args.indexOf('/r/')+3);
				if (temp.indexOf("/") >= 0) {
					name = temp.slice(0, temp.indexOf('/'));
				} else {
					name = temp;
				}
				redditDB.getAll().then(function(r) {
					if (r.length < 1) {
						redditDB.trackSubreddit(name, msg);
						bot.sendMessage(msg.channel, `/r/` + name + ` was not being tracked in <#${msg.channel.id}> to begin with.`);
					} else {
						for (i = 0; i < r.length; i++) {
							if (r[i].channel_id == msg.channel.id && r[i].subreddit_name == name) {
									redditDB.deleteTrack(msg.server, name);
									bot.sendMessage(msg.channel, `/r/` + name + ` Is now not being tracked in <#${msg.channel.id}>`);
									found = true
							}
							if (found == false && i == r.length-1) {
								bot.sendMessage(msg.channel, `/r/` + name + ` was not being tracked in <#${msg.channel.id}> to begin with.`);
							}
						}
					}
				})
			} else {
				bot.sendMessage(msg.channel, "Syntax error: Not a valid subreddit link. Please give the link in the form of 'www.reddit.com/r/<subreddit name>'.");
			}
		})
  }
};

Commands["8ball"] = {
	name: "8ball",
	help: "tbd",
	type: "general",
	lvl: 0,
	func: function(bot, msg, args) {
		var response = [];
		response.push('```diff\n+ It is certain```');
		response.push('```diff\n+ It is decidedly so```');
		response.push('```diff\n+ Without a doubt```');
		response.push('```diff\n+ Yes, definitely```');
		response.push('```diff\n+ You may rely on it```');
		response.push('```diff\n+ As I see it, yes```');
		response.push('```diff\n+ Most likely```');
		response.push('```diff\n+ Outlook good```');
		response.push('```diff\n+ Yes```');
		response.push('```diff\n+ Signs point to yes```');
		response.push('```fix\nReply hazy try again```');
		response.push('```fix\nAsk again later```');
		response.push('```fix\nBetter not tell you now```');
		response.push('```fix\nCannot predict now```');
		response.push('```fix\nConcentrate and ask again```');
		response.push("```diff\n- Don't count on it```");
		response.push('```diff\n- My reply is no```');
		response.push('```diff\n- My sources say no```');
		response.push('```diff\n- Outlook not so good```');
		response.push('```diff\n- Very doubtful```');

		var msgArray = [];
		msgArray.push(':8ball: *"' + args +  '"* :8ball:');
		var responsenum = Math.floor((Math.random())*20)
		msgArray.push(response[responsenum]);
		bot.sendMessage(msg.channel, msgArray);

  }
};

Commands.dice = {
	name: "dice",
	help: "tbd",
	type: "general",
	lvl: 0,
	func: function(bot, msg, args) {
		if (args) {
      dice = args
    } else {
      dice = 'd6'
    }
		request('https://rolz.org/api/?' + dice + '.json', function (error, response, body) {
			if (!error && response.statusCode === 200) {
        try {
          JSON.parse(body)
        } catch (e) {
          msg.channel.sendMessage('```diff\n- The API returned an unexpected response.\n```')
          return
        }
        var result = JSON.parse(body)
        msg.reply(' :game_die: ``' + result.input + '`` rolled and the result was... `` ' + result.result + ' ' + result.details + ' ``:game_die:')
			}
		})
  }
};

Commands.rip = {
	name: "rip",
	help: "tbd",
	type: "general",
	lvl: 0,
	func: function(bot, msg, args) {
		var url = ""
		if (msg.mentions.length > 0) {
			url = msg.mentions[0].avatarURL
		} else {
			url = msg.author.avatarURL
		}
		jimp.read('./runtime/jimprepo/grave' + Math.floor(Math.random()*4) + '.png', function (err, image) {
			jimp.read(url, function (err, avatar) {
				avatar.resize(90, 90).sepia().opacity(0.5);
				image.composite(avatar, 100, 68);
				var path = './runtime/jimprepo/gravepic.png'
				image.write(path, function(err) {
					bot.sendFile(msg.channel, path)
				})
			})
		});
  }
};

Commands.update = {
	name: "update",
	help: "tbd",
	type: "admin",
	lvl: 6,
	func: function(bot, msg, args) {
		if (msg.author.id == 159704938283401216) {
			userDB.update();
			serverDB.update();
		}
  }
};

Commands.triggered = {
	name: "triggered",
	help: "tbd",
	type: "general",
	lvl: 0,
	func: function(bot, msg, args) {
		var url = ""
		if (msg.mentions.length > 0) {
			url = msg.mentions[0].avatarURL
		} else {
			url = msg.author.avatarURL
		}
		jimp.read(url, function (err, avatar) {
			jimp.read('./runtime/jimprepo/triggered.png', function (err, triggered) {
				avatar.resize(150, 150);
				triggered.resize(150, jimp.AUTO);
				avatar.composite(triggered, 0, 123);
				var path = './runtime/jimprepo/trigpic.png'
				avatar.write(path, function(err) {
					bot.sendFile(msg.channel, path)
				})
			})
		});
  }
};

exports.Commands = Commands;
