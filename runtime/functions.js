var mangaDB = require("./manga_track_rt.js");

var reddit = require('redwrap');
var lastID = 0

exports.checkReddit = function(bot, channel) {
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

exports.checkManga = function(bot, channel) {
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

exports.responseHandlingREG = function(bot, msg, promptmsg, user) {
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

exports.responseHandling = function(bot, msg, promptmsg, user, server) {
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
					exports.choice(dekubot, user, server, response, responsechannel);
					break;
				}
			}
		})
	});
};

exports.choice = function (bot, user, server, response, responsechannel) {
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
