var config = require("./config.json");
var userDB = require("./runtime/user_rt.js");
var serverDB = require("./runtime/server_rt.js");
var permissionDB = require("./runtime/permission_rt.js");
var factionDB = require("./runtime/faction_rt.js");
var mangaDB = require("./runtime/manga_track_rt.js");

var aniscrape = require("aniscrape");
var kissanime = require("aniscrape-kissanime")
var Discord = require("discord.js");
var nani = require("nani").init(config.anilistID, config.anilist_Secret);
var nedb = require("nedb")
var request = require("request");
var youtubeNode = require("youtube-node");
var ytdl = require("ytdl-core");
var reddit = require('redwrap');

var dekubot = new Discord.Client({forceFetchUsers: true});
var youtubeNode = new youtubeNode();
var authorpermissionlvl = null;
var botID = config.botID;

var responseID = null;
var AwaitingResponse = null;
var exitloop = null;

//config stuff
youtubeNode.setKey(config.youtube);

if (config.token_mode ===  true) {
	dekubot.loginWithToken(config.token);
} else if (config.token_mode ===  false) {
	console.log("well fuck");
} else {
	console.log("well even more fuck");
}

dekubot.on("serverCreated", function(server) {
	if (server.id == config.server_id) {																								//IDSPECIFIC
	serverDB.check(server).catch(function() {
	serverDB.newServer(server).catch(function(e) {
        console.log(e);
		});
	});
	permissionDB.SuperUserPermission(server);
	var msgArray = [];
	msgArray.push("Hey! I'm " + dekubot.user.username);
	if (config.token_mode === true) {
		msgArray.push("Someone with `manage server` permissions invited me to this server via OAuth.");
	} else {
		msgArray.push('I followed an instant-invite from someone.');
	}
	msgArray.push("If I'm intended to be here, use `!help` to see what I can do.");
	msgArray.push("Else, just kick me.");
	dekubot.sendMessage(server.defaultChannel, msgArray);
	}
});

var Commands = [];

Commands.help = {
	name: "help",
	help: "tbd",
	type: "general",
	lvl: 0,
	func: function(bot, msg) {
  	bot.reply(msg, "https://github.com/RoddersGH/DekuBot/wiki/General-Commands");
  }
};

Commands.ping = {
	name: "ping",
	help: "tbd",
	type: "general",
	lvl: 0,
	func: function(bot, msg) {
  	bot.reply(msg, "pong");
  }
};

Commands.purge = {
	name: "purge",
	help: "tbd",
	type: "admin",
	lvl: 1,
	func: function(bot, msg, args) {
    if (!msg.channel.server) {
      bot.sendMessage(msg.channel, "You can't do that in a DM you silly silly person!");
      return;
    }
    if (!args || isNaN(args)) {
      bot.sendMessage(msg.channel, "Please define an amount of messages for me to delete!");
      return;
    }
    if (!msg.channel.permissionsOf(msg.sender).hasPermission("manageMessages")) {
      bot.sendMessage(msg.channel, "Your role in this server does not have enough permissions.");
      return;
    }
    if (!msg.channel.permissionsOf(bot.user).hasPermission("manageMessages")) {
      bot.sendMessage(msg.channel, "I don't have permission to do that!");
      return;
    }
    if (args > 50) {
      bot.sendMessage(msg.channel, "The maximum is 50.");
      return;
    }
    bot.getChannelLogs(msg.channel, args, function(error, messages) {
      if (error) {
        bot.sendMessage(msg.channel, "Something went wrong while getting logs thing.");
        return;
      } else {
        var msgsleft = messages.length,
          delcount = 0;
        for (msg of messages) {
          bot.deleteMessage(msg);
          msgsleft--;
          delcount++;
          if (msgsleft === 0) {
            bot.sendMessage(msg.channel, "Done! Deleted " + delcount + " messages.");
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
			bot.sendMessage(msg.channel, "Please mention a single user.");
		} else {
			msg.mentions.map(function(user) {
	      userDB.returnNamechanges(user).then(function(reply) {
	        bot.sendMessage(msg.channel, reply.join(', '));
	      }).catch(function(err) {
	        if (err === 'No changes found!') {
	          bot.sendMessage(msg.channel, "I don't have any changes registered.");
	          return;
	        }
	        bot.sendMessage(msg.channel, 'Something went wrong, try again later.');
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
		var date = new Date(bot.uptime);
		// Hours part from the timestamp
		var hours = date.getHours();
		// Minutes part from the timestamp
		var minutes = "0" + date.getMinutes();
		// Seconds part from the timestamp
		var seconds = "0" + date.getSeconds();
		// Will display time in 10:30:23 format
		var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);


		finalstring.push("Hi! Im DekuBot.");
		finalstring.push("Im currently used in " + bot.servers.length + " server(s), in " + channelcount + " channels used by " + usercount + " users.");
		finalstring.push("I've been up and ready for " + formattedTime + ".");
	  finalstring.push("If you have any questions or need some help, contact " + (bot.servers.get("name", msg.channel.server).members.get("id", 159704938283401216).mention()))
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

Commands.serverspoilertoggle = {
	name: "serverspoilertoggle",
	help: "tbd",
	type: "admin",
	lvl: 3,
	func: function(bot, msg, args, lvl) {
	  if (msg.channel.permissionsOf(msg.sender).hasPermission("manageServer")) {
			serverDB.togglespoiler(msg.channel.server.id);
	  } else {
			bot.sendMessage(msg.channel, "Your role in this server does not have enough permissions.")
	  }
  }
};

Commands.getpermissionlvl = {
	name: "getpermissionlvl",
	help: "tbd",
	type: "admin",
	lvl: 1,
	func: function(bot, msg, args, lvl) {
		if ((msg.mentions.length === 0) || (msg.mentions.length > 1)) {
			bot.reply(msg, "Please mention a user");
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
	func: function(bot, msg, args, lvl) {
		var num = args.substr(args.indexOf(" ") + 1)
		var isnum = /^\d+$/.test(num);
		if ((msg.mentions.length === 0) || (msg.mentions.length > 1)) {
			bot.reply(msg, "Please mention a user");
			return;
		} else {
			if (!num || isnum == false || (num == 4) || (num == 5) || (num < 0) || (num > 6)) {
				bot.sendMessage(msg.channel, "Please define the permission level you wish to set for the user.");
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
	func: function(bot, msg, args, lvl) {
		var name = args.substr(0, args.indexOf("#") - 1)
		var hex = args.substr(args.indexOf("#"))
		var isHex = /^#[0-9A-F]{6}$/i.test(hex);

		if (isHex == false) {
			bot.sendMessage(msg.channel, "Please enter a valid Hex value of the format #<six digit hex number>.");
			return;
		};
		factionDB.checkNameClash(msg.channel.server, name).then(function() {
			var hex_int = parseInt("0x" + hex.substr(hex.indexOf("#") + 1), 16);
			factionDB.createNewFaction(msg.channel.server, name, hex);
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
				}
			});
			bot.sendMessage(msg.channel, "The faction " + name + " has been created.");
		}).catch(function(e) {
			bot.sendMessage(msg.channel, e);
			return;
		});
  }
};

Commands.manualjoinfaction = {
	name: "manualjoinfaction",
	help: "tbd",
	type: "admin",
	lvl: 3,
	func: function(bot, msg, args, lvl) {
		var name = args.substr(args.indexOf(" ") + 1)
		var exitloop2 = false;
		if ((msg.mentions.length === 0) || (msg.mentions.length > 1)) {
			bot.reply(msg, "Please mention a user");
			return;
		} else {
			if (!name) {
				bot.sendMessage(msg.channel, "Please define the faction you wish the user to join.");
				return;
			} else {
				factionDB.getFactionsHere(msg.channel.server).then(function(r) {     //r is servers factions
					for (factionid of r) {
						if (exitloop2 == true) {
							break;
						};
						factionDB.getFactionName(factionid).then(function(v) {
							if (v == name) {
								userDB.getFactionIDs(msg.mentions[0]).then(function(q){
									for (facid of q) {
										factionDB.getFactionID(msg.channel.server.id, v).then(function(j) { //j is id of a given server faction
										if ((j == facid) || (facid = r[0]) || (facid = r[1]) || (facid = r[2])) {
											bot.sendMessage(msg.channel, "The user is already in a faction on this server.");
											return;
										} else {
											userDB.addToFaction(msg.mentions[0], j);
											bot.sendMessage(msg.channel, "The user has successfully been added to " + name);
										};
										});
									};
								}).catch(function(e) {
									if (e == 'No factions found!') {
											factionDB.getFactionID(msg.channel.server.id, v).then(function(m) {
												userDB.addToFaction(msg.mentions[0], m);
												bot.sendMessage(msg.channel, "The user has successfully been added to " + name);
											});
									}
								});
								exitloop2 = true;
							};
						});
					}

				}).catch(function(e) {
					bot.sendMessage(msg.channel, e);
				});
			}
	  }
  }
};

Commands.manualleavefaction = {
	name: "manualleavefaction",
	help: "tbd",
	type: "admin",
	lvl: 3,
	func: function(bot, msg, args, lvl) {
		var name = args.substr(args.indexOf(" ") + 1)
		exitloop = false;
		if ((msg.mentions.length === 0) || (msg.mentions.length > 1)) {
			bot.reply(msg, "Please mention a user");
			return;
		} else {
			if (!name) {
				bot.sendMessage(msg.channel, "Please define the faction you wish the user to leave.");
				return;
			} else {
				factionDB.getFactionsHere(msg.channel.server).then(function(r) {
					for (factionid of r) {
						factionDB.getFactionName(factionid).then(function(v) {
							if (v == name) {
								userDB.getFactionIDs(msg.mentions[0]).then(function(q){
									for (facid of q) {
										if (exitloop = true) {
											break;
										};
										factionDB.getFactionID(msg.channel.server.id, v).then(function(j) { //j is id of a given server faction
										if (j == facid) {
											userDB.removeFromFaction(msg.mentions[0], j);
											bot.sendMessage(msg.channel, "The user has successfully been removed from " + name);

											exitloop = true;
											return;
										};
										});
									};
								}).catch(function(e) {
									if (e == 'No factions found!') {
										bot.sendMessage(msg.channel, "The user is not in any faction");
										exitloop = true;
									}
								})

							}
						})
					}
					if (exitloop == false) {
						bot.sendMessage(msg.channel, "The user is not a member of the faction " + name);
					}
				})
			}
	  }
  }
};

Commands.faction = {
	name: "faction",
	help: "tbd",
	type: "general",
	lvl: 0,
	func: function(bot, msg, args, lvl) {
	  var msgArray = [];
	  var serverFactions = [];
	  var userFactions = [];
	  factionDB.getFactionsHere(msg.server).then(function(serverFactions) {
		  userDB.getFactionIDs(msg.author).then(function(userFactions) {
				for (m of serverFactions) {
						for (n of userFactions) {
								if (m == n) {
									bot.sendMessage(msg.author, "Sorry, you are already in a faction :heart:", {}, function(err, sentmsg) {
										if (err) {
											console.log(err);
										}
									});
									return;
								} else {
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
										responseHandling(dekubot, sentmsg, "**Which faction would you like to join?**", msg.author, msg.server);
									});
								}
						}
				}
		  }).catch (function(e) {
			  if (e == 'No factions found!') {
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
						responseHandling(dekubot, sentmsg, "**Which faction would you like to join?**", msg.author, msg.server);
					});
			  }
		  });
	  });
  }
};

Commands.ignore = {
	name: "ignore",
	help: "tbd",
	type: "admin",
	lvl: 3,
	func: function(bot, msg, args, lvl) {
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
	func: function(bot, msg, args, lvl) {
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
		nani.get('anime/search/' + args).then(function(r) {
			if (r.length == 0) {
				bot.reply(msg, "Nothing found");
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
		});
  }
};

Commands.manga = {
	name: "manga",
	help: "tbd",
	type: "weeb",
	lvl: 0,
	func: function(bot, msg, args) {
		nani.get('manga/search/' + args).then(function(r) {
			if (r.length == 0) {
				bot.reply(msg, "Nothing found");
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
		});
  }
};

Commands.character = {
	name: "character",
	help: "tbd",
	type: "weeb",
	lvl: 0,
	func: function(bot, msg, args) {
		nani.get('character/search/' + args).then(function(r) {
			if (r.length == 0) {
				bot.reply(msg, "Nothing found");
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
					responseHandlingREG(bot, mesg, msgArray1, msg.author).then(function(num){
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
		nani.get('anime/search/' + args).then(function(r) {
			if (r.length == 0) {
				bot.reply(msg, "Nothing found");
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
					responseHandlingREG(bot, mesg, msgArray1, msg.author).then(function(num){
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
		nani.get('manga/search/' + args).then(function(r) {
			if (r.length == 0) {
				bot.reply(msg, "Nothing found");
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
					responseHandlingREG(bot, mesg, msgArray1, msg.author).then(function(num){
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

Commands.track = {
	name: "track",
	help: "tbd",
	type: "weeb",
	lvl: 3,
	func: function(bot, msg, args, lvl) {
		var url = args;
		var mangatag = url.substr(29);
		request(url, function(error, response, body) {
			if (body.search( '<a href="http://mangastream.com/r/' + mangatag + '/') !== -1) {
				var n = body.search( 'http://mangastream.com/r/' + mangatag + '/')
				mangaDB.trackManga(url, body.substr(n+35, 3), msg);
			}
		})
  }
};

var responseHandlingREG = function(bot, msg, promptmsg, user) {
  return new Promise(function(resolve, reject) {
    try {
      bot.awaitResponse(msg, promptmsg, {}, function(error, message) {
				if (error) {
					bot.sendMessage(msg.channel, error);
					return;
				}
				bot.getChannelLogs(msg.channel, 100, {after: msg}, function(error, messages) {
					for (var i = 0; i < 100; i++) {
						if (messages[i].author.id == user.id) {
							var response = messages[i].content.toLowerCase();
							resolve(response);
							break;
						}
					}
				})
	  	});
    } catch (e) {
      reject(e);
    }
  });
};

var lastID = 0

var checkReddit = function(bot, channel) {
	var checkR = function() {
		console.log("checking reddit");
		console.log(lastID);
		if (lastID == 0) {
			reddit.r('OnePiece').new().limit(25, function(err, data, res) {
				if (err) {
					console.log(err);
				} else {
					var msgArray = [];
					msgArray.push('\n\n\n────────────────────────────────────────────────────────────────────────\n');
					msgArray.push('*Posted by /u/' + data.data.children[0].data.author + ' in /r/OnePiece*');
					if (data.data.children[0].data.url == 'https://www.reddit.com' + data.data.children[0].data.permalink) {
						msgArray.push('*https://redd.it/' + data.data.children[0].data.id + '*\n');
						msgArray.push('**' + data.data.children[0].data.title + '**:');
						msgArray.push(data.data.children[0].data.selftext + "\n\n\n\n");
					} else {
						msgArray.push('\n**' + data.data.children[0].data.title + '**');
						msgArray.push(data.data.children[0].data.url + '\n');
					}
					bot.sendMessage(channel, msgArray)
					lastID = data.data.children[0].data.name
				}
			});
		} else {
			reddit.r('OnePiece').new().before(lastID).limit(25, function(err, data, res) {
				console.log(lastID);
				if (err) {
					console.log(err);
				} else {
					for (i = 0; i < data.data.children.length; i++) {
						if (data.data.children[i].data.name != lastID) {
							var msgArray = [];
							msgArray.push('\n\n\n────────────────────────────────────────────────────────────────────────\n');
							msgArray.push('*Posted by /u/' + data.data.children[0].data.author + ' in /r/OnePiece*');
							if (data.data.children[i].data.url == 'https://www.reddit.com' + data.data.children[0].data.permalink) {
								msgArray.push('*https://redd.it/' + data.data.children[i].data.id + '*\n');
								msgArray.push('**' + data.data.children[i].data.title + '**:');
								msgArray.push(data.data.children[i].data.selftext + "\n\n\n\n");
							} else {
								msgArray.push('\n**' + data.data.children[i].data.title + '**');
								msgArray.push(data.data.children[i].data.url)+ '\n';
							}
							bot.sendMessage(channel, msgArray)
							lastID = data.data.children[0].data.name
							console.log(data.data.children[i].data.name);
						}
						console.log(data.data.children[i].data.name);
					}
				}
			});
		}
	}
	var timer = setInterval(checkR, 20000);
};

var checkManga = function(bot, channel) {
	var timercheck = 20000;
	var check = function() {
	mangaDB.getAll().then(function(mangaArray) {
		for (m of mangaArray) {
			var mangatag = m.url.substr(29);
			request(m.url, function(error, response, body) {
				console.log("checking");
				if (body.search( '<a href="http://mangastream.com/r/' + mangatag + '/' + (parseInt(m.chapter)+1)) !== -1) {
					var n = body.search('http://mangastream.com/r/' + mangatag + '/')
					bot.sendMessage(channel, "@everyone, " + body.substr(n, 45));
					mangaDB.updateChapter(m._id, body.substr(n+35, 3));
					//timercheck = 345600000;
				}
			})
		}
	});
	}
	var timer = setInterval(check, timercheck);
};


dekubot.on("ready", function() {
	var server = dekubot.servers.get("id", config.server_id)                                        //IDSPECIFIC
	var channel = server.channels.get("name", "general")
	checkManga(dekubot, channel);
	checkReddit(dekubot, channel);
});

//Bot start:
dekubot.on("message", function(message) {

if (message.author.id == config.botID) {
	return;
} else if (message.channel.isPrivate == true) {
	return;
} else if (message.server.id != config.server_id) {														//IDSPECIFIC
	return;
} else {
 serverDB.checkIgnore(message.channel).then(function(r) {
  userDB.check(message.author).catch(function() {
    userDB.trackUser(message.author).catch(function(e) {
        console.log(e);
    });
  });
  permissionDB.check(message.channel.server.id, message.author.id).catch(function() {
    permissionDB.newPermission(message.channel.server, message.author).catch(function(e) {
        console.log(e);
    });
  });
  var temp = message.content.toLowerCase();
  var words = temp.split(' ');
  var firstWord = words[0];
  var args = message.content.substr(message.content.indexOf(" ") + 1);


  //Commands
  if (firstWord.charAt(0) == '!') {
		permissionDB.getPermission(message.channel.server.id, message.author.id).then(function(r) {
			authorpermissionlvl = r;
		});
		var command = firstWord.slice(1);
    if (authorpermissionlvl >= Commands[command].lvl) {
			Commands[command].func(dekubot, message, args, authorpermissionlvl);
		} else {
			dekubot.sendMessage(message.channel, "You dont have a high enough permission level to use this command.")
		}
  }
}).catch(function(e) {
    if (e) {
		if (e != 'This channel is ignored') {
			console.log(e);
		}

		var temp = message.content.toLowerCase();
		var words = temp.split(' ');
		var firstWord = words[0];
		var args = message.content.substr(message.content.indexOf(" ") + 1);

		if (firstWord.charAt(0) == '!') {
			permissionDB.getPermission(message.channel.server.id, message.author.id).then(function(r) {
				authorpermissionlvl = r;
			});
			var command = firstWord.slice(1);
			try {
				if (authorpermissionlvl >= 3) {
					Commands[command].func(dekubot, message, args, authorpermissionlvl);
				}
			} catch (err) {
			console.log(err);
			}
		}
		return;
	}
});
};
});


dekubot.on("serverNewMember", function(server, user) {
	if (user.id == config.botID || server.id != config.server_id) {												//IDSPECIFIC
		return;
	} else {
    userDB.check(user).catch(function() {
    userDB.trackUser(user).catch(function(e) {
        console.log(e);
      });
	});
    permissionDB.check(server.id, user.id).catch(function() {
    permissionDB.newPermission(server, user).catch(function(e) {
        console.log(e);
      });
	});
	serverDB.getAnnouncementChannel(server.id).then(function(announce) {
		serverDB.getJoinmsg(server.id).then(function(r) {
			if (r === 'default') {
				dekubot.sendMessage(server.channels.get("name", announce), user.mention() + " Welcome to the server!");
			} else {
				dekubot.sendMessage(server.channels.get("name", announce), user.mention() + r);
			}
		});
	});

			var msgArray = [];
			var response;
			msgArray.push("Hi! Welcome to the " + server.name + " server");
			msgArray.push("Im the servers bot, DekuBot. I help with a bunch of things which you can check out by doing `!help`");
			msgArray.push("I hope you have lots of fun discussing one piece with us!");
			msgArray.push(" ");
			msgArray.push("We have different factions on the server that give you access to exclusive channels and faction leaderboards!");
			msgArray.push("**If you want to join a faction, type the number next to the faction you wish to join.**" );
			msgArray.push("The factions are:" );
			msgArray.push("1. Pirates" );
			msgArray.push("2. Marines" );
			msgArray.push("3. Revolutionary Army" );

			dekubot.sendMessage(user, msgArray, {}, function(err, sentmsg) {
				sentmsg.author = user
				responseHandling(dekubot, sentmsg, "**Which faction would you like to join?**", user, server);
			});
	};
});

function responseHandling(bot, msg, promptmsg, user, server) {
	bot.awaitResponse(msg, promptmsg, {}, function(error, message) {
		if (error) {
			bot.sendMessage(msg.author, error);
			return;
		}
		bot.getChannelLogs(msg.author, 100, {after: msg}, function(error, messages) {
			for (var i = 0; i < 100; i++) {
				if (messages[i].author.id == user.id) {
					var response = messages[i].content.toLowerCase();
					var responsechannel = messages[i].channel;
					choice(dekubot, user, server, response, responsechannel);
					break;
				}
			}
		})
	});
};

function choice(bot, user, server, response, responsechannel) {
	if (response === "1" || response === "one" || response === "pirate" || response === "pirates") {
		factionDB.getFactionID(server.id, "pirate").then(function(r) {
			userDB.addToFaction(user, r);
		});
		var currentrole = server.roles.get("name", "pirate")
		bot.addUserToRole(user, currentrole, function(err) {
			if (err) {
				console.log(err);
			}
		});
		bot.sendMessage(responsechannel, "Thanks for choosing the Pirates!");
	}
	else if (response === "2" || response === "two" || response === "marine" || response === "marines") {
		factionDB.getFactionID(server.id, "marine").then(function(r) {
			userDB.addToFaction(user, r);
		});
		var currentrole = server.roles.get("name", "marine")
		bot.addUserToRole(user, currentrole, function(err) {
			if (err) {
				console.log(err);
			}
		});
		bot.sendMessage(responsechannel, "Thanks for choosing the Marines!");
	}
	else if (response === "3" || response === "three" || response === "revolutionary" || response === "army" || response === "revolutionary army") {
		factionDB.getFactionID(server.id, "revolutionary army").then(function(r) {
			userDB.addToFaction(user, r);
		});
		var currentrole = server.roles.get("name", "revolutionary army")
		bot.addUserToRole(user, currentrole, function(err) {
			if (err) {
				console.log(err);
			}
		});
		bot.sendMessage(responsechannel, "Thanks for choosing the Revolutionary Army!");
	} else {
		bot.sendMessage(responsechannel, "Im sorry, but that response doesn't match any of the faction options listed above. \nTo choose a faction, type the number next to the faction name you wish to join <3", function(err, message) {
			message.author = user;
			responseHandling(bot, message, " ", user, server.id);
		});

	}
};





dekubot.on("serverMemberRemoved", function(server, user) {
	if (user.id == config.botID || server.id != config.server_id) {												//IDSPECIFIC
		return;
	} else {
	permissionDB.deletePermission(server, user);
  userDB.check(user).catch(function() {
    userDB.trackUser(user).catch(function(e) {
        console.log(e);
      });
	});
	serverDB.getAnnouncementChannel(server.id).then(function(announce) {
		serverDB.getLeavemsg(server.id).then(function(r) {
			if (r === 'default') {
				dekubot.sendMessage(server.channels.get("name", announce), user.username + " has left the server.");
			} else {
				dekubot.sendMessage(server.channels.get("name", announce), user.username + r);
			}
		});
	});
	};
});

dekubot.on('presence', function(olduser, newuser) {
	if (newuser.id == config.botID) {
		return;
	} else {
//	userDB.check(newuser).catch(function() {
//    userDB.trackUser(newuser).catch(function(e) {
//        console.log(e);
//      });
//	});
    if (olduser.username === newuser.username) {
      return;
    } else try {
      userDB.nameChange(newuser);
    } catch(e) {
		console.log(e);
	};
	};
});

dekubot.on("error", function(error) {
    process.exit(0)
});

dekubot.on("disconnected", function() {
  process.exit(0)
});

process.on('uncaughtException', function(err) {
	if (err.code == 'ECONNRESET') {
		console.log('Got an ECONNRESET! This is *probably* not an error. Stacktrace:');
		console.log(err.stack);
	} else {
		console.log(err);
		console.log(err.stack);
		process.exit(0);
	}
});
