var config = require("../config.json");
var userDB = require("./user_rt.js");
var serverDB = require("./server_rt.js");
var permissionDB = require("./permission_rt.js");
var factionDB = require("./faction_rt.js");
var mangaDB = require("./manga_track_rt.js");
var redditDB = require("./reddit_rt.js");

var aniscrape = require("aniscrape");
var kissanime = require("aniscrape-kissanime")
var nani = require("nani").init(config.anilistID, config.anilist_Secret);
var nedb = require("nedb")
var request = require("request");
var youtubeNode = require("youtube-node");
var ytdl = require("ytdl-core");

var reddit = require('redwrap');
var lastID = 0

exports.checkManga = function(bot) {
	var timercheck = 20000;
	var check = function() {
	mangaDB.getAll().then(function(mangaArray) {
		for (manga of mangaArray) {
			(function(m) {
				var request = require("request");
				var mangatag = m.url.substr(29);
				request(m.url, function(error, response, body) {
						if (body.search( '<a href="http://mangastream.com/r/' + mangatag + '/' + (parseInt(m.chapter)+1)) !== -1) {
							var temp = ('http://mangastream.com/r/' + mangatag + '/').length
							var begin = body.search( 'http://mangastream.com/r/' + mangatag + '/') + temp
							var othertemp = body.substr(begin)
							var linktemp = othertemp.indexOf('"')
							var end = othertemp.indexOf("/")
							if (m.mention == true) {
								bot.sendMessage(bot.channels.get("id", m.channel_id), "@everyone, New chapter of: " + body.substr(begin-temp, temp+linktemp));
							}
							mangaDB.updateChapter(m._id, body.substr(begin, end));
							for (i = 0; i < m.pm_array.length; i++) {
								(function(x) {
									bot.sendMessage(bot.users.get("id", m.pm_array[x]), "New chapter of: " + body.substr(begin-temp, temp+linktemp));
								})(i)
							}
						}
				})
			})(manga)
		}
	});
	}
	var timer = setInterval(check, timercheck);
};

exports.checkReddit = function(bot) {
	var checkR = function() {
		redditDB.getAll().then(function(redditArray) {
			for (reddit of redditArray) {
				(function(red) {
				var reddit = require('redwrap');
				var itempos = 0
				if (red.last_id == 0) {
					reddit.r(red.subreddit_name).new().limit(25, function(err, data, res) {
						if (err) {
							console.log(err);
						} else {
							var msgArray = [];
							msgArray.push('\n────────────────────────────────────────────────────────────────────────\n');
							msgArray.push('*Posted by /u/' + data.data.children[0].data.author + ' in /r/' + red.subreddit_name + '*');
							if (data.data.children[0].data.url == 'https://www.reddit.com' + data.data.children[0].data.permalink) {
								msgArray.push('*https://redd.it/' + data.data.children[0].data.id + '*\n');
								msgArray.push('**' + data.data.children[0].data.title.replace(/&amp;/g, "&") + '**:');
								if (data.data.children[0].data.selftext.length >= 1500) {
									for (i = 0; i < Math.ceil(data.data.children[0].data.selftext.length/1500); i++) {
										(function (x) {
											msgArray.push(data.data.children[0].data.selftext.substr(1500*i, 1500).replace(/&amp;/g, "&"));
											bot.sendMessage(bot.channels.get("id", red.channel_id), msgArray);
											msgArray = [];
										})(i)
									}
								} else {
									msgArray.push(data.data.children[0].data.selftext.replace(/&amp;/g, "&") + "\n");
								}
							} else {
								msgArray.push('**' + data.data.children[0].data.title.replace(/&amp;/g, "&") + '**');
								msgArray.push(data.data.children[0].data.url.replace(/&amp;/g, "&") + '\n');
							}
							bot.sendMessage(bot.channels.get("id", red.channel_id), msgArray)
							redditDB.updateLastPost(red._id, data.data.children[0].data.name);
						}
					});
				} else {
					reddit.r(red.subreddit_name).new().limit(25, function(err, data, res) {
						if (err) {
							console.log(err);
						} else {
							if (data.data.children[0].data.name != red.last_id) {
								for (i = 0; i < data.data.children.length; i++) {
									if (data.data.children[i].data.name == red.last_id) {
										itempos = i;
									}
								}
								for (i = 0; i < itempos; i++) {
									var msgArray = [];
									msgArray.push('\n────────────────────────────────────────────────────────────────────────\n');
									msgArray.push('*Posted by /u/' + data.data.children[i].data.author + ' in /r/' + red.subreddit_name + '*');
									if (data.data.children[i].data.url == 'https://www.reddit.com' + data.data.children[i].data.permalink) {
										msgArray.push('*https://redd.it/' + data.data.children[i].data.id + '*\n');
										msgArray.push('**' + data.data.children[i].data.title.replace(/&amp;/g, "&") + '**:');
										if (data.data.children[i].data.selftext.length >= 1500) {
											for (j = 0; j < Math.ceil(data.data.children[i].data.selftext.length/1500); j++) {
												(function (x) {
													msgArray.push(data.data.children[i].data.selftext.substr(1500*j, 1500).replace(/&amp;/g, "&"));
													bot.sendMessage(bot.channels.get("id", red.channel_id), msgArray);
													msgArray = [];
												})(j)
											}
										} else {
											msgArray.push(data.data.children[i].data.selftext.replace(/&amp;/g, "&") + "\n");
										}
									} else {
										msgArray.push('**' + data.data.children[i].data.title.replace(/&amp;/g, "&") + '**');
										msgArray.push(data.data.children[i].data.url.replace(/&amp;/g, "&"))+ '\n';
									}
									bot.sendMessage(bot.channels.get("id", red.channel_id), msgArray)
									console.log(data.data.children[i].data.name);
								}
								redditDB.updateLastPost(red._id, data.data.children[0].data.name);
							}
						}
					});
				}
			})(reddit);
			}
		})
	}
	var timer = setInterval(checkR, 20000);
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
	console.log("here");
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
					exports.choice(bot, user, server, response, responsechannel);
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
