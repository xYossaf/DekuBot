var config = require("./config.json");
var userDB = require("./runtime/user_rt.js");
var guildDB = require("./runtime/guild_rt.js");
var permissionDB = require("./runtime/permission_rt.js");
var factionDB = require("./runtime/faction_rt.js");
var Commands = require("./runtime/commands.js").Commands;
var functions = require("./runtime/functions.js");
var battle = require("./runtime/battle_rt.js");
var customcommands = require("./runtime/custom_command_rt.js");

var Discord = require("discord.js");
var youtubeNode = require("youtube-node");
var reddit = require('redwrap');
var mangaDB = require("./runtime/manga_track_rt.js");

var dekubot = new Discord.Client({fetch_all_members: true});
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
	if (guild.id == config.server_id) {																								//IDSPECIFIC
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
	}
});

dekubot.on("ready", () => {
	functions.checkManga(dekubot);
	functions.checkReddit(dekubot);
});

//Bot start:
dekubot.on("message", (message) => {

if (message.author.id == dekubot.user.id) {
	return;
} else if (message.channel.type == 'dm' || message.channel.type == 'group') {
	return;
} else if (message.guild.id != config.guild_id) {														//IDSPECIFIC
	return;
} else {
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
  if (firstWord.charAt(0) == '!') {
		permissionDB.getPermission(message.channel.guild.id, message.author.id).then(function(r) {
			authorpermissionlvl = r;
			var command = firstWord.slice(1);
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
			permissionDB.getPermission(message.channel.guild.id, message.author.id).then(function(r) {
				authorpermissionlvl = r;
				var command = firstWord.slice(1);
				if (authorpermissionlvl >= 3) {
					Commands[command].func(dekubot, message, args);
				}
			});
		}
		return;
	}
});
};
});


dekubot.on("guildMemberAdd", (guild, user) => {
	if (user.id == dekubot.user.id || guild.id != config.server_id) {												//IDSPECIFIC
		return;
	} else {
    userDB.check(user).catch(function() {
    userDB.trackUser(user).catch(function(e) {
        console.log(e);
      });
	});
    permissionDB.check(guild.id, user.id).catch(function() {
    permissionDB.newPermission(guild, user).catch(function(e) {
        console.log(e);
      });
	});
	guildDB.getAnnouncementChannel(guild.id).then(function(announce) {
		guildDB.getJoinmsg(guild.id).then(function(r) {
			if (r === 'default') {
				guild.channels.find("name", announce).sendMessage(user.mention() + " Welcome to the server!");
			} else {
			guild.channels.find("name", announce).sendMessage(user.mention() + r);
			}
		});
	});
			//Need to make the factions general. Make it search through the factions here and give a response
			var msgArray = [];
			msgArray.push("Hi! Welcome to the " + guild.name + " server");
			msgArray.push("Im the servers bot, DekuBot. I help with a bunch of things which you can check out by doing `!help`");
			msgArray.push("I hope you have lots of fun discussing one piece with us!");
			msgArray.push(" ");
			msgArray.push("We have different factions on the server that give you access to exclusive channels and faction leaderboards!");
			msgArray.push("**If you want to join a faction, type the number next to the faction you wish to join.**" );
			msgArray.push("The factions are:" );
			msgArray.push("1. Pirates" );
			msgArray.push("2. Marines" );
			msgArray.push("3. Revolutionary Army" );

			user.sendMessage(msgArray).then(sentmsg => {
				sentmsg.author = user
				functions.responseHandling(dekubot, sentmsg, "**Which faction would you like to join?**", user, guild);
			});
	};
});

dekubot.on("guildMemberRemove", function(guild, user) {
	if (user.id == dekubot.user.id || guild.id != config.server_id) {												//IDSPECIFIC
		return;
	} else {
	permissionDB.deletePermission(guild, user);
  userDB.check(user).catch(function() {
    userDB.trackUser(user).catch(function(e) {
        console.log(e);
      });
	});
	guildDB.getAnnouncementChannel(guild.id).then(function(announce) {
		guildDB.getLeavemsg(guild.id).then(function(r) {
			if (r === 'default') {
				guild.channels.find("name", announce).sendMessage(user.username + " has left the server.");
			} else {
				guild.channels.find("name", announce).sendMessage(user.username + r);
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
