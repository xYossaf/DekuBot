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

var Discord = require("discord.js");
var youtubeNode = require("youtube-node");
var mangaDB = require("./runtime/manga_track_rt.js");

var dekubot = new Discord.Client({fetchAllMembers: true});
var youtubeNode = new youtubeNode();
var authorpermissionlvl = null;

var responseID = null;
var AwaitingResponse = null;
var exitloop = null;

//config stuff
youtubeNode.setKey(config.youtube);

if (config.token_mode ===  true) {
  dekubot.login(config.token);
} else if (config.token_mode ===  false) {
  console.log("well fuck");
} else {
  console.log("well even more fuck");
}

dekubot.on("guildCreate", (guild) => {

    guildDB.check(guild).catch(function() {
      guildDB.newGuild(guild).catch(function(e) {
          console.log(e);
      });
    });

    permissionDB.SuperUserPermission(guild);

    var msgArray = [];

    msgArray.push("Hey! I'm " + dekubot.user.username);

    if (config.token_mode === true) {
      msgArray.push("Someone with `manage server` permissions invited me to this guild via OAuth.");
    } else {
      msgArray.push('I followed an instant-invite from someone.');
    }

    msgArray.push("If I'm intended to be here, use `!help` to see what I can do.");
    msgArray.push("Else, just kick me.");

    guild.defaultChannel.sendMessage(msgArray);

});

dekubot.on("guildDelete", (guild) => {
  mangaDB.deleteAllHere(guild);
  redditDB.deleteAllHere(guild);
  permissionDB.deleteAllHere(guild);
  factionDB.deleteAllHere(guild);
  customcommands.deleteAllHere(guild);
  guildDB.deleteGuild(guild);
});

dekubot.on("ready", () => {
  for (i = 0; i < dekubot.guilds.array().length; i++) {
    guildDB.check(dekubot.guilds.array()[i]).catch(function(e) {
      if (e == 'Nothing found!') {
        guildDB.newGuild(dekubot.guilds.array()[i]);

        permissionDB.SuperUserPermission(dekubot.guilds.array()[i]);

        var msgArray = [];

        msgArray.push("Hey! I'm " + dekubot.user.username);

        if (config.token_mode === true) {
          msgArray.push("Someone with `manage server` permissions invited me to this guild via OAuth.");
        } else {
          msgArray.push('I followed an instant-invite from someone.');
        }

        msgArray.push("If I'm intended to be here, use `!help` to see what I can do.");
        msgArray.push("Else, just kick me.");

        dekubot.guilds.array()[i].defaultChannel.sendMessage(msgArray);
      }
    })
  }

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

        if (config.token_mode === true) {
          msgArray.push("Someone with `manage server` permissions invited me to this guild via OAuth.");
        } else {
          msgArray.push('I followed an instant-invite from someone.');
        }

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
        permissionDB.getPermission(message.channel.guild.id, message.author.id).then(function(r) {
          authorpermissionlvl = r;
          var command = firstWord.slice(p.length);
          customcommands.getAllHere(message.guild).then(function(r) {
            for (i = 0; i < r.length; i++) {
              if (r[i].name == command && message.guild.id == r[i].guild_id && authorpermissionlvl >= r[i].lvl) {
                message.channel.sendMessage(r[i].text);
              }
            }
          })
          if (authorpermissionlvl >= Commands[command].lvl) {
            if (Commands[command].type == 'nsfw') {
              guildDB.checkNSFW(message.channel).then(function(r) {
                if (r != 'Channel is not nsfw') {
                  console.log(r);
                } else {
                  message.channel.sendMessage(r);
                }
              }).catch(function(e) {
                if (e != 'This channel is nsfw') {
                  console.log(e);
                } else {
                  Commands[command].func(dekubot, message, args);
                }
              })
            } else {
              Commands[command].func(dekubot, message, args);
            }
          } else {
            message.channel.sendMessage("You dont have a high enough permission level to use this command.")
          }
        });
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
          permissionDB.getPermission(message.channel.guild.id, message.author.id).then(function(r) {
            authorpermissionlvl = r;
            var command = firstWord.slice(p.length);
            if (authorpermissionlvl >= 3) {
              Commands[command].func(dekubot, message, args);
            }
          });
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
            if (bool == true) {
              member.user.sendMessage("Welcome to the " + member.guild.name + " server!" );
            } else if (bool == false) {
              member.guild.channels.get(announce).sendMessage(member + " Welcome to the server!");
            }
          } else if (r !== '') {
            if (bool == true) {
              member.user.sendMessage("Welcome to the " + member.guild.name + " server!\n" + r);
            } else if (bool == false) {
              member.guild.channels.get(announce).sendMessage(member + r);
            }
          }
        });
      });
    })

    guildDB.checkFactionPM(member.guild.id).then(function(bool) {

      if (bool == true) {
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

//Change so that guild members are removed from everything necessary
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
  guildDB.getAnnouncementChannel(member.guild.id).then(function(announce) {
    guildDB.getLeavemsg(member.guild.id).then(function(r) {
      if (r === 'default') {
        member.guild.channels.get(announce).sendMessage(member.user.username + " has left the server.");
      } else if (r !== '') {
        member.guild.channels.get(announce).sendMessage(member.user.username + r);
      }
    });
  });
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
