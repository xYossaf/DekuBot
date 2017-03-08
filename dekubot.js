var config = require("./config.json");
var userDB = require("./runtime/user_rt.js");
var guildDB = require("./runtime/guild_rt.js");
var permissionDB = require("./runtime/permission_rt.js");
var factionDB = require("./runtime/faction_rt.js");
var Commands = require("./runtime/commands.js").Commands;
var functions = require("./runtime/functions.js");
var battle = require("./runtime/battle_rt.js");
var customcommands = require("./runtime/custom_command_rt.js");
var redditDB = require("./runtime/reddit_rt.js");
var music = require("./runtime/music.js");

var Discord = require("discord.js");
var youtubeNode = require("youtube-node");
var mangaDB = require("./runtime/manga_track_rt.js");
var winston = require('winston');
var dekubot = new Discord.Client({fetchAllMembers: true});
var youtubeNode = new youtubeNode();
var authorpermissionlvl = null;

var responseID = null;
var AwaitingResponse = null;
var exitloop = null;

youtubeNode.setKey(config.youtube);
dekubot.login(config.token);

var commandLogger = new (winston.Logger)({
  transports: [
    new (winston.transports.File)({
      name: 'command-file',
      filename: 'filelog-command.log',
      level: 'info'
    })
  ]
});

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.File)({
      name: 'info-file',
      filename: 'filelog-info.log',
      level: 'info'
    }),
    new (winston.transports.File)({
      name: 'error-file',
      filename: 'filelog-error.log',
      level: 'error'
    })
  ]
});



dekubot.on("guildCreate", (guild) => {

    var commandArray = [] 
    Object.keys(Commands).forEach(function (key) {
      commandArray.push({name: key, lastTS: 0})
    });
    cooldownArray.push({guildID: guild.id, tsArray: commandArray})


    logger.log('info', `Joined the guild ${guild.name}, ${guild.id}`)
    guildDB.check(guild).catch(function() {
      guildDB.newGuild(guild).catch(function(e) {
          console.log(e);
      });
    });

    permissionDB.SuperUserPermission(guild);

    var msgArray = [];

    msgArray.push("Hey! I'm " + dekubot.user.username);
    msgArray.push("Someone with `manage server` permissions invited me to this guild via OAuth.");
    msgArray.push("If I'm intended to be here, use `!help` to see what I can do.");
    msgArray.push("Else, just kick me.");

    guild.defaultChannel.sendMessage(msgArray);

});

dekubot.on("guildDelete", (guild) => {
  logger.log('info', `left the guild ${guild.name}, ${guild.id}`)
  for (j = 0; j < cooldownArray.length; j++) {
    if (cooldownArray[j].guildID == guild.id) {
      cooldownArray.splice(j, 1)
    }
  } 

  mangaDB.deleteAllHere(guild);
  redditDB.deleteAllHere(guild);
  permissionDB.deleteAllHere(guild);
  factionDB.deleteAllHere(guild);
  customcommands.deleteAllHere(guild);
  guildDB.deleteGuild(guild);
});

dekubot.on("roleDelete", (role) => {
  factionDB.deleteFaction(role.id).catch(function(e) {
    logger.log('error', e)
  })
});

dekubot.on("channelDelete", (channel) => {
  //TODO fix this as channel.guild here is pointless and a search through the bots channels is needed to get the guild id
  if (channel.type == 'text') {
    guildDB.get(channel.guild.id).then(function(r) {
      if (channel.id == r.announcmentchannel) {
        guildDB.setAnnouncementChannel(channel.guild.defaultChannel)
        dekubot.users.get(r.superuser_id).sendMessage(`The bot announcment channel (``${channel.name}``)
         on ``${channel.guild.name}`` has been deleted. Therefore the announcement channel has been
          set to ${channel.guild.defaultChannel.name} by default.`)
      }
    })
  
    mangaDB.getAll().then(function(r) {
      for (i = 0; i < r.length; i++) {
        for (j = 0; j < r[i].guild_channel_array.length; j++) {
          if (r[i].guild_channel_array[j].channel_id == channel.id) {
            mangaDB.removeGuildChannel(r[i]._id, r[i].guild_channel_array[j])
            dekubot.users.get(r.superuser_id).sendMessage(`The channel (``${channel.name}``) 
              on ``${channel.guild.name}`` has been deleted. Therefore the manga ``${r[i].aliases[0]}`` being tracked in this channel is no longer being tracked on the server.`)
          }
        }
      }
    })
  }
});

var cooldownArray = []

dekubot.on("ready", () => {
  if (cooldownArray.length == 0) {
    for (j = 0; j < dekubot.guilds.array().length; j++) {
      var commandArray = [] 
      Object.keys(Commands).forEach(function (key) {
        commandArray.push({name: key, lastTS: 0})
      });
      cooldownArray.push({guildID: dekubot.guilds.array()[j].id, tsArray: commandArray})
    }  
  }
  logger.log('info', "I'm ready!")
  for (x = 0; x < dekubot.guilds.array().length; x++) {
    (function(i) {
      guildDB.check(dekubot.guilds.array()[i]).catch(function(e) {
        if (e == 'Nothing found!') {
          guildDB.newGuild(dekubot.guilds.array()[i]);

          permissionDB.SuperUserPermission(dekubot.guilds.array()[i]);

          var msgArray = [];

          msgArray.push("Hey! I'm " + dekubot.user.username);
          msgArray.push("Someone with `manage server` permissions invited me to this guild via OAuth.");
          msgArray.push("If I'm intended to be here, use `!help` to see what I can do.");
          msgArray.push("Else, just kick me.");

          dekubot.guilds.array()[i].defaultChannel.sendMessage(msgArray);
        }
      })
    })(x)
  }
  functions.initMangaDB()
  functions.checkManga(dekubot);
  functions.checkReddit(dekubot);
});

//Bot start:
dekubot.on("message", (message) => {
  if (message.author.id == dekubot.user.id) {
    return;
  } else if (message.channel.type == 'dm' || message.channel.type == 'group') {
    return;
  } else {

    guildDB.check(message.guild).catch(function(e) {
      if (e == 'Nothing found!') {
        guildDB.newGuild(message.guild);

        permissionDB.SuperUserPermission(message.guild);

        var msgArray = [];

        msgArray.push("Hey! I'm " + dekubot.user.username);
        msgArray.push("Someone with `manage server` permissions invited me to this guild via OAuth.");
        msgArray.push("If I'm intended to be here, use `!help` to see what I can do.");
        msgArray.push("Else, just kick me.");

        message.guild.defaultChannel.sendMessage(msgArray);
      }
    })

   guildDB.checkIgnore(message.channel).then(function(r) {
    userDB.check(message.author).catch(function() {
      userDB.trackUser(message.author).catch(function(e) {
          console.log(e);
      });
    });
    permissionDB.check(message.channel.guild.id, message.author.id).catch(function() {
      permissionDB.newPermission(message.channel.guild, message.author).catch(function(e) {
          console.log(e);
      });
    });
    var temp = message.content.toLowerCase();
    var words = temp.split(' ');
    var firstWord = words[0];
    var args = message.content.substr(words[0].length+1);

    //Commands
    guildDB.getPrefix(message.guild.id).then(function(p) {

      if (firstWord.substr(0, p.length) === p) {
        //permissionDB.getPermission(message.channel.guild.id, message.author.id).then(function(r) {
          //authorpermissionlvl = r;
          var command = firstWord.slice(p.length);
          customcommands.getAllHere(message.guild).then(function(r) {
            if (r != 'No custom commands found') {
              for (i = 0; i < r.length; i++) {
                if (r[i].name == command && message.guild.id == r[i].guild_id && authorpermissionlvl >= r[i].lvl) {
                  message.channel.sendMessage(r[i].text);
                }
              }
            }
          }).catch(function(e) {
            console.log(e)
          })
          //console.log(message.member)
          if (message.member.hasPermissions(Commands[command].lvl)) {
            //console.log("if")
            if (Commands[command].type == 'nsfw') {
              guildDB.checkNSFW(message.channel).then(function(r) {
                if (r != 'Channel is not nsfw') {
                  // console.log(r);
                } else {
                  message.channel.sendMessage(r);
                }
              }).catch(function(e) {
                if (e != 'This channel is nsfw') {
                  console.log(e);
                } else {
                  for (x = 0; x < cooldownArray.length; x++) {
                    (function (i) {
                      if (cooldownArray[i].guildID == message.guild.id) {
                        for (j = 0; j < cooldownArray[i].tsArray.length; j++) {
                          if (cooldownArray[i].tsArray[j].name == command) {
                            if (message.createdAt.getTime()-cooldownArray[i].tsArray[j].lastTS > Commands[command].cooldown) {
                              Commands[command].func(dekubot, message, args);
                              commandLogger.log('info', `${command}`, {
                                guildID: message.guild.id,
                                guildName: message.guild.name,
                                channel: message.channel.id, 
                                authorID: message.author.id, 
                                authorName: message.author.name
                              })
                              cooldownArray[i].tsArray[j].lastTS = message.createdAt.getTime()
                            }
                          }
                        }
                      }
                    })(x)
                  }
                }
              })
            } else {
              for (x = 0; x < cooldownArray.length; x++) {
                (function (i) {
                  if (cooldownArray[i].guildID == message.guild.id) {
                    for (j = 0; j < cooldownArray[i].tsArray.length; j++) {
                      if (cooldownArray[i].tsArray[j].name == command) {
                        if (message.createdAt.getTime()-cooldownArray[i].tsArray[j].lastTS > Commands[command].cooldown) {
                          Commands[command].func(dekubot, message, args);
                          commandLogger.log('info', `${command}`, {
                            guildID: message.guild.id,
                            guildName: message.guild.name,
                            channel: message.channel.id, 
                            authorID: message.author.id, 
                            authorName: message.author.name
                          })
                          cooldownArray[i].tsArray[j].lastTS = message.createdAt.getTime()
                        }
                      }
                    }
                  }
                })(x)
              }
            }
          } else {
            //console.log("else")
            message.channel.sendMessage("You dont have a high enough permission level to use this command.")
          }
        //});
      }
    });
  }).catch(function(e) {
    if (e) {
      if (e != 'This channel is ignored') {
        console.log(e);
      }

      var temp = message.content.toLowerCase();
      var words = temp.split(' ');
      var firstWord = words[0];
      var args = message.content.substr(message.content.indexOf(" ") + 1);

      guildDB.getPrefix(message.guild.id).then(function(p) {

        if (firstWord.substr(0, p.length) === p) {
          //permissionDB.getPermission(message.channel.guild.id, message.author.id).then(function(r) {
            //authorpermissionlvl = r;
            var command = firstWord.slice(p.length);
            if (message.member.hasPermissions(["MANAGE_CHANNELS"])) {
              for (x = 0; x < cooldownArray.length; x++) {
                (function (i) {
                  if (cooldownArray[i].guildID == message.guild.id) {
                    for (j = 0; j < cooldownArray[i].tsArray.length; j++) {
                      if (cooldownArray[i].tsArray[j].name == command) {
                        if (message.createdAt.getTime()-cooldownArray[i].tsArray[j].lastTS > Commands[command].cooldown) {
                          Commands[command].func(dekubot, message, args);
                          commandLogger.log('info', `${command}`, {
                            guildID: message.guild.id,
                            guildName: message.guild.name,
                            channel: message.channel.id, 
                            authorID: message.author.id, 
                            authorName: message.author.name
                          })
                          cooldownArray[i].tsArray[j].lastTS = message.createdAt.getTime()
                        }
                      }
                    }
                  }
                })(x)
              }
            }
          //});
        }
      });

      return;
    }
  });
  };
});

dekubot.on("guildMemberAdd", (member) => {
  
  if (member.id == dekubot.user.id) {
    return;
  } else {

    userDB.check(member.user).catch(function() {
      userDB.trackUser(member.user).catch(function(e) {
        console.log(e);
      });
    });

    permissionDB.check(member.guild.id, member.id).catch(function() {
      permissionDB.newPermission(member.guild, member.user).catch(function(e) {
        console.log(e);
      });
    });

    guildDB.checkWelcomePM(member.guild.id).then(function(bool) {
      guildDB.getAnnouncementChannel(member.guild.id).then(function(announce) {
        guildDB.getJoinmsg(member.guild.id).then(function(r) {
          if (r === 'default') {
            if (bool) {
              member.user.sendMessage("Welcome to the " + member.guild.name + " server!" );
            } else {
              member.guild.channels.get(announce).sendMessage(member + " Welcome to the server!");
            }
          } else if (r !== '') {
            if (bool) {
              member.user.sendMessage("Welcome to the " + member.guild.name + " server!\n" + r);
            } else {
              member.guild.channels.get(announce).sendMessage(member + r);
            }
          }
        });
      });
    })

    guildDB.checkFactionPM(member.guild.id).then(function(bool) {

      if (bool) {
        factionDB.getFactionsHere(member.guild).then(function(guildFactions) {
          var msgArray = [];

          msgArray.push("We have different factions on the server that give you a role and coloured name.");
          msgArray.push("**If you want to join a faction, type the **number** next to the faction you wish to join.**" );
          msgArray.push("The factions are:" );
          for (j = 0; j < guildFactions.length; j++) {
            msgArray.push(`${j+1}. ${member.guild.roles.get(guildFactions[j]).name}` );
          }
          functions.responseHandling(msgArray, member.user, member.guild, guildFactions);
        }).catch(function(e) {
          if (e == 'No factions found') {

            var msgArray = []

            msgArray.push("This server has no factions in it at the moment. Message an admin if you would like for them to create factions for the server.");

            member.user.sendMessage(msgArray);
          }
        })
      }
    })


  };
});


dekubot.on("guildMemberRemove", function(member) {
  if (member.id == dekubot.user.id) {
    return;
  } else {
  mangaDB.removeFromAllHere(member.guild, member.user);
  permissionDB.deletePermission(member.guild, member.user);
  userDB.check(member.user).catch(function() {
    userDB.trackUser(member.user).catch(function(e) {
        console.log(e);
      });
  });
  guildDB.checkWelcomePM(member.guild.id).then(function(bool) {
    if (!bool) {
      guildDB.getAnnouncementChannel(member.guild.id).then(function(announce) {
        guildDB.getLeavemsg(member.guild.id).then(function(r) {
          if (r === 'default') {
            member.guild.channels.get(announce).sendMessage(member.user.username + " has left the server.");
          } else if (r !== '') {
            member.guild.channels.get(announce).sendMessage(member.user.username + r);
          }
        });
      });
    }
   }) 
  };
});

dekubot.on('presenceUpdate', function(olduser, newuser) {
  if (newuser.id == dekubot.user.id) {
    return;
  } else {
  // userDB.check(newuser).catch(function() {
  //  userDB.trackUser(newuser).catch(function(e) {
  //      console.log(e);
  //    });
  // });
    if (olduser.username === newuser.username) {
      return;
    } else try {
      userDB.nameChange(newuser);
    } catch(e) {
    console.log(e);
  };
  };
});

dekubot.on("error", (error) => {
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
