var config = require("./config.json");
var userDB = require("./runtime/user_rt.js");
var serverDB = require("./runtime/server_rt.js");
var permissionDB = require("./runtime/permission_rt.js");
var factionDB = require("./runtime/faction_rt.js");
var Commands = require("./runtime/commands.js").Commands;
var functions = require("./runtime/functions.js");

var Discord = require("discord.js");
var youtubeNode = require("youtube-node");
var reddit = require('redwrap');
var mangaDB = require("./runtime/manga_track_rt.js");

var dekubot = new Discord.Client({forceFetchUsers: true});
var youtubeNode = new youtubeNode();
var authorpermissionlvl = null;

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

dekubot.on("ready", function() {
	var server = dekubot.servers.get("id", config.server_id)                                        //IDSPECIFIC
	var channel = server.channels.get("name", "general")
	functions.checkManga(dekubot, channel);
	functions.checkReddit(dekubot, channel);
});

//Bot start:
dekubot.on("message", function(message) {

if (message.author.id == dekubot.user.id) {
	return;
} else if (message.channel.isPrivate) {
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
			var command = firstWord.slice(1);
	    if (authorpermissionlvl >= Commands[command].lvl) {
				Commands[command].func(dekubot, message, args, authorpermissionlvl);
			} else {
				dekubot.sendMessage(message.channel, "You dont have a high enough permission level to use this command.")
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
			permissionDB.getPermission(message.channel.server.id, message.author.id).then(function(r) {
				authorpermissionlvl = r;
				var command = firstWord.slice(1);
				if (authorpermissionlvl >= 3) {
					Commands[command].func(dekubot, message, args, authorpermissionlvl);
				}
			});
		}
		return;
	}
});
};
});


dekubot.on("serverNewMember", function(server, user) {
	if (user.id == dekubot.user.id || server.id != config.server_id) {												//IDSPECIFIC
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
				functions.responseHandling(dekubot, sentmsg, "**Which faction would you like to join?**", user, server);
			});
	};
});

dekubot.on("serverMemberRemoved", function(server, user) {
	if (user.id == dekubot.user.id || server.id != config.server_id) {												//IDSPECIFIC
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
	if (newuser.id == dekubot.user.id) {
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
