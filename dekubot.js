var aniscrape = require("aniscrape");
var kissanime = require("aniscrape-kissanime")
var Discord = require("discord.js");
var nani = require("nani");
var nedb = require("nedb")
var request = require("request");
var youtubeNode = require("youtube-node");
var ytdl = require("ytdl-core");


var config = require("./config.json");
var userDB = require("./runtime/user_rt.js");
var serverDB = require("./runtime/server_rt.js");
var permissionDB = require("./runtime/permission_rt.js");
var factionDB = require("./runtime/faction_rt.js");

var dekubot = new Discord.Client();
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

//commands
var userCommands = {
  "help": function(bot, msg) {
	dekubot.reply(msg, "https://github.com/RoddersGH/DekuBot/wiki/General-Commands");
  },
  "ping": function(bot, msg) {
    dekubot.reply(msg, "pong");
  },
  /* "joinvc": function(bot, msg, args) {
    var channel = dekubot.channels.get("name", args);
	if ((channel == null) || (channel.type == "text")) {
		"please enter a valid voice channel"
	} else {
		dekubot.joinVoiceChannel(channel, function() {
			dekubot.reply(msg, "Joining " + channel);
		});
	}
  },
  "leavevc": function(bot, msg) {
    dekubot.leaveVoiceChannel(bot.voiceConnection.voiceChannel, function() {
      dekubot.reply(msg, "Bye...");
    });
  }, */
  "purge": function(bot, msg, args) {
    if (!msg.channel.server) {
      dekubot.sendMessage(msg.channel, "You can't do that in a DM you silly silly person!");
      return;
    }
    if (!args || isNaN(args)) {
      dekubot.sendMessage(msg.channel, "Please define an amount of messages for me to delete!");
      return;
    }
    if (!msg.channel.permissionsOf(msg.sender).hasPermission("manageMessages")) {
      dekubot.sendMessage(msg.channel, "Your role in this server does not have enough permissions.");
      return;
    }
    if (!msg.channel.permissionsOf(bot.user).hasPermission("manageMessages")) {
      dekubot.sendMessage(msg.channel, "I don't have permission to do that!");
      return;
    }
    if (args > 50) {
      dekubot.sendMessage(msg.channel, "The maximum is 50.");
      return;
    }
    dekubot.getChannelLogs(msg.channel, args, function(error, messages) {
      if (error) {
        bot.sendMessage(msg.channel, "Something went wrong with the whole getting logs thing.");
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
  },
  "namechanges": function(bot, msg) {
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
  },
  "botstatus": function(bot, msg) {
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
  },
  "serverspoilertoggle": function(bot, msg, args, lvl) {
	  if (msg.channel.permissionsOf(msg.sender).hasPermission("manageServer")) {
		serverDB.togglespoiler(msg.channel.server.id);
	  } else {
		bot.sendMessage(msg.channel, "Your role in this server does not have enough permissions.")
	  }

  },
  "getpermissionlvl": function(bot, msg, args, lvl) {
	if (lvl >= 1) {
		if ((msg.mentions.length === 0) || (msg.mentions.length > 1)) {
			bot.reply(msg, "Please mention a user");
		} else {
			permissionDB.getPermission(msg.channel.server.id, msg.mentions[0].id).then(function(r) {
				bot.sendMessage(msg.channel, r);
		});
		}
	} else {
		bot.sendMessage(msg.channel, "you don't have a high enough permission level to use this command")
	}
  },
  "setpermissionlvl": function(bot, msg, args, lvl) {
	if (lvl >= 3) {
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
	} else {
		bot.sendMessage(msg.channel, "you don't have a high enough permission level to use this command")
	}
  },
  "createfaction": function(bot, msg, args, lvl) {
	if (lvl >= 3) {
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
  },
  "manualjoinfaction": function(bot, msg, args, lvl) {
	if (lvl >= 3) {
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
	} else {
		bot.sendMessage(msg.channel, "you don't have a high enough permission level to use this command")
	}
  },
  "manualleavefaction": function(bot, msg, args, lvl) {
	if (lvl >= 3) {
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
	} else {
		bot.sendMessage(msg.channel, "you don't have a high enough permission level to use this command")
	}
  },
  "faction": function(bot, msg, args, lvl) {
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
  },
  "ignore": function(bot, msg, args, lvl) {
	if (lvl >= 3) {
		serverDB.ignoreChannel(msg.channel).then(function(r) {
			bot.reply(msg, r);
		}).catch(function(e) {
			bot.reply(msg, e);
		})
	}
  },
  "unignore": function(bot, msg, args, lvl) {
	if (lvl >= 3) {
		serverDB.unignoreChannel(msg.channel).then(function(r) {
			bot.reply(msg, r);
		}).catch(function(e) {
			bot.reply(msg, e);
		})
	}
  }
  /* "pushfactionmessage": function(bot, msg, args, lvl) {
	if (lvl = 6) {
	  var msgArray = [];
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
	  for (var i = 0; i < msg.server.members.length-1; i++) {
		(function(x) {
		  console.log(msg.server.members[x].id + msg.server.members[x].username);
		  if (msg.server.members[x].id != config.botID) {
			dekubot.sendMessage(msg.server.members[x], msgArray, {}, function(err, sentmsg) {
				sentmsg.author = msg.server.members[x];
				responseHandling(dekubot, sentmsg, "**Which faction would you like to join?**", msg.server.members[x], msg.server);
			});
		  }
	    })(i);
	  }
	}
  } */





};

/* dekubot.on("ready", function() {
	dekubot.setAvatar("https://cdn.discordapp.com/app-icons/183665303450943491/f8a7fa28680a5d6e0dc1c7b47ebfbdcd.jpg", function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log("done bby");
		}
	})
}); */

//Bot start:
dekubot.on("message", function(message) {
serverDB.checkIgnore(message.channel).then(function(r) {
if (message.author.id == config.botID) {
	return;
} else if (message.channel.isPrivate == true) {
	return;
} else if (message.server.id != config.server_id) {														//IDSPECIFIC
	return;
} else {

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
    try {
      userCommands[command](dekubot, message, args, authorpermissionlvl);
    } catch (err) {
      console.log(err);
    }
  } //else {
//   function() {
//   if ((firstWord.substr(0, 1) == "1") || (firstWord.substr(0, 1) == "2") || (firstWord.substr(0, 1) == "3")) {
//	  if (message.channel.isPrivate == true) {
//		  factionDB.getFactionsHere(message.channel.server).then(function(v) {
//				userDB.getFactionIDs(message.author).then(function(r) {
//					for (userfaction of r) {
//						for(serverfaction of v) {
//							if (userfaction == serverfaction) {
//								return;
//							}
//						}
//					}
//				});
//		  });
//		if (firstWord.substr(0, 1) == "1") {
//			factionDB.addToFaction(message.author, )
//		}
//
//
//
//
//	  }
//    }
//
//  };
//  };
  };
  //Automated functions:
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
				if (command == "unignore") {
					userCommands[command](dekubot, message, args, authorpermissionlvl);
				}
			} catch (err) {
			console.log(err);
			}
		}
		return;
	}
});
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
