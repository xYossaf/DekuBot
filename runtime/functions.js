var config = require("../config.json");
var userDB = require("./user_rt.js");
var guildDB = require("./guild_rt.js");
var permissionDB = require("./permission_rt.js");
var factionDB = require("./faction_rt.js");
var mangaDB = require("./manga_track_rt.js");
var redditDB = require("./reddit_rt.js");

var nani = require("nani").init(config.anilistID, config.anilist_Secret);
var nedb = require("nedb")
var request = require("request");
var youtubeNode = require("youtube-node");
var ytdl = require("ytdl-core");

var reddit = require('redwrap');
var lastID = 0

exports.checkManga = function(bot) {//need to switch this to check the rss feed instead of the url
	var timercheck = 20000;
	var check = function() {
	mangaDB.getAll().then(function(mangaArray) {
		for (manga of mangaArray) {
			(function(m) {
				var request = require("request");
				var mangatag = m.url.substr(29);
				console.log(m.url.substr(29))
				request(m.url, function(error, response, body) {
						if ((parseInt(m.chapter)+1) < 10) {
							chapnum = '00' + (parseInt(m.chapter)+1).toString()
						} else if ((parseInt(m.chapter)+1) < 100) {
							chapnum = '0' + (parseInt(m.chapter)+1).toString()
						} else {
							chapnum = (parseInt(m.chapter)+1).toString()
						}
						if (body.search( '<a href="http://mangastream.com/r/' + mangatag + '/' + chapnum) !== -1) {
							var temp = ('http://mangastream.com/r/' + mangatag + '/').length
							var begin = body.search( 'http://mangastream.com/r/' + mangatag + '/') + temp
							var othertemp = body.substr(begin)
							var linktemp = othertemp.indexOf('"')
							var end = othertemp.indexOf("/")
							if (m.mention == true) {
								bot.channels.find("id", m.channel_id).sendMessage("@everyone, New chapter of: " + body.substr(begin-temp, temp+linktemp));
							}
							mangaDB.updateChapter(m._id, body.substr(begin, end));
							for (i = 0; i < m.pm_array.length; i++) {
								(function(x) {
									bot.users.find("id", m.pm_array[x]).sendMessage("New chapter of: " + body.substr(begin-temp, temp+linktemp));
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
								msgArray.push('**' + data.data.children[0].data.title.replace(/&amp;/g, "&").replace(/@everyone/g, "@\u200Beveryone").replace(/@here/g, "@\u200Bhere") + '**:');
								if (data.data.children[0].data.selftext.length >= 1500) {
									for (i = 0; i < Math.ceil(data.data.children[0].data.selftext.length/1500); i++) {
										(function (x) {
											msgArray.push(data.data.children[0].data.selftext.substr(1500*i, 1500).replace(/&amp;/g, "&").replace(/@everyone/g, "@\u200Beveryone").replace(/@here/g, "@\u200Bhere"));
											bot.channels.find("id", red.channel_id).sendMessage(msgArray);
											msgArray = [];
										})(i)
									}
								} else {
									msgArray.push(data.data.children[0].data.selftext.replace(/&amp;/g, "&").replace(/@everyone/g, "@\u200Beveryone").replace(/@here/g, "@\u200Bhere") + "\n");
								}
							} else {
								msgArray.push('**' + data.data.children[0].data.title.replace(/&amp;/g, "&").replace(/@everyone/g, "@\u200Beveryone").replace(/@here/g, "@\u200Bhere") + '**');
								msgArray.push(data.data.children[0].data.url.replace(/&amp;/g, "&").replace(/@everyone/g, "@\u200Beveryone").replace(/@here/g, "@\u200Bhere") + '\n');
							}
							bot.channels.find("id", red.channel_id).sendMessage(msgArray)
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
										msgArray.push('**' + data.data.children[i].data.title.replace(/&amp;/g, "&").replace(/@everyone/g, "@\u200Beveryone").replace(/@here/g, "@\u200Bhere") + '**:');
										if (data.data.children[i].data.selftext.length >= 1500) {
											for (j = 0; j < Math.ceil(data.data.children[i].data.selftext.length/1500); j++) {
												(function (x) {
													msgArray.push(data.data.children[i].data.selftext.substr(1500*j, 1500).replace(/&amp;/g, "&").replace(/@everyone/g, "@\u200Beveryone").replace(/@here/g, "@\u200Bhere"));
													bot.channels.find("id", red.channel_id).sendMessage(msgArray);
													msgArray = [];
												})(j)
											}
										} else {
											msgArray.push(data.data.children[i].data.selftext.replace(/&amp;/g, "&").replace(/@everyone/g, "@\u200Beveryone").replace(/@here/g, "@\u200Bhere") + "\n");
										}
									} else {
										msgArray.push('**' + data.data.children[i].data.title.replace(/&amp;/g, "&").replace(/@everyone/g, "@\u200Beveryone").replace(/@here/g, "@\u200Bhere") + '**');
										msgArray.push(data.data.children[i].data.url.replace(/&amp;/g, "&").replace(/@everyone/g, "@\u200Beveryone").replace(/@here/g, "@\u200Bhere"))+ '\n';
									}
									bot.channels.find("id", red.channel_id).sendMessage(msgArray)
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
			msg.channel.sendMessage(promptmsg);

			var id = 0;
			var responseCollector = msg.channel.createCollector(
				function(message, collector) {
				  if (message.author.id == msg.author.id) {
				    return true; // passed the filter test
				  }
				  return false; // failed the filter test
				}, {time: 300000});

			responseCollector.on('message', (message, collector) => {
				id = message.id
				collector.stop('recieved');
			});

			responseCollector.on('end', (collection, reason) => {
  			if (reason == 'recieved') {
					resolve(collection.find("id", id).content);
				}
				if (reason == 'time') {
					resolve('A message was not recieved');
				}
			});
    } catch (e) {
      reject(e);
    }
  });
};

exports.responseHandling = function(bot, msg, user, guild) {
	user.sendMessage(msg).then(mesg => {
		var id = 0;
		var response = "";
		var responsechannel = "";
		var responseCollector = mesg.channel.createCollector(
			function(message, collector) {
				if (message.author.id == user.id) {
					return true; // passed the filter test
				}
				return false; // failed the filter test
			}, {time: 300000});

		responseCollector.on('message', (message, collector) => {
			id = message.id
			collector.stop('recieved');
		});

		responseCollector.on('end', (collection, reason) => {
			if (reason == 'recieved') {
				response = collection.find("id", id).content
				responsechannel = collection.find("id", id).channel
				console.log(response)
				console.log(responsechannel)
				exports.choice(bot, user, guild, response, responsechannel);
			}
		});
	})
};

exports.choice = function (bot, user, guild, response, responsechannel) {
	if (response === "1" || response === "one" || response === "pirate" || response === "pirates") {
		factionDB.getFactionID(guild.id, "pirate").then(function(r) {
			var currentrole = guild.roles.find("id", r)
			guild.members.find("id", user.id).addRole(currentrole).then(member => {
				member.sendMessage("Thanks for choosing the Pirates!");
			})
		});
	}
	else if (response === "2" || response === "two" || response === "marine" || response === "marines") {
		factionDB.getFactionID(guild.id, "marine").then(function(r) {
			var currentrole = guild.roles.find("id", r)
			guild.members.find("id", user.id).addRole(currentrole).then(member => {
				member.sendMessage("Thanks for choosing the Marines!");
			})
		});
	}
	else if (response === "3" || response === "three" || response === "revolutionary" || response === "army" || response === "revolutionary army") {
		factionDB.getFactionID(guild.id, "revolutionary army").then(function(r) {
			var currentrole = guild.roles.find("id", r)
			guild.members.find("id", user.id).addRole(currentrole).then(member => {
				member.sendMessage("Thanks for choosing the Revolutionary Army!");
			})
		});
	} else {
		responsechannel.sendMessage("Im sorry, but that response doesn't match any of the faction options listed above.").then(message => {
			console.log('W2')
			exports.responseHandling(bot, "**To choose a faction, type the number next to the faction name you wish to join <3 **", user, guild)
			console.log('W3')
		});
	}
};
