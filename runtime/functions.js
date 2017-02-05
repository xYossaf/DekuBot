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

exports.checkManga = function(bot) {
  var timercheck = 30000;
  var check = function() {
  mangaDB.getAll().then(function(mangaArray) {
    var request = require("request");
    request('http://mangastream.com/rss', function(error, response, body) {
      if (error) {
        console.log(error)
      } else {
        for (manga of mangaArray) {
          (function(m, b) {
            var mangatag = m.url.substr(29);
              if ((parseInt(m.chapter)+1) < 10) {
                chapnum = '00' + (parseInt(m.chapter)+1).toString()
              } else if ((parseInt(m.chapter)+1) < 100) {
                chapnum = '0' + (parseInt(m.chapter)+1).toString()
              } else {
                chapnum = (parseInt(m.chapter)+1).toString()
              }
              //*TODO*
              //Change this so that chapnum is any number greater than the current chapter number
              if (b.search('<link>http://mangastream.com/read/' + mangatag + '/' + chapnum) !== -1) {

                var temp = ('http://mangastream.com/read/' + mangatag + '/').length
                var begin = b.search( 'http://mangastream.com/read/' + mangatag + '/') + temp
                var othertemp = b.substr(begin)
                var linktemp = othertemp.indexOf('<')
                var end = othertemp.indexOf("/")

                mangaDB.updateChapter(m._id, b.substr(begin, end));
                for (j = 0; j < m.guild_channel_array.length; j++) {
                  (function(x) {
                    if (m.guild_channel_array[x].mention != "") {
                      bot.channels.get(m.guild_channel_array[x].channel_id).sendMessage(`@${m.guild_channel_array[x].mention} New chapter of: ` + b.substr(begin-temp, temp+linktemp));
                    } else {
                      bot.channels.get(m.guild_channel_array[x].channel_id).sendMessage("New chapter of: " + b.substr(begin-temp, temp+linktemp));
                    }
                  })(j)
                }
                for (i = 0; i < m.pm_array.length; i++) {
                  (function(x) {
                    bot.users.get(m.pm_array[x]).sendMessage("New chapter of: " + b.substr(begin-temp, temp+linktemp));
                  })(i)
                }
              }
          })(manga, body)
        }
      }
    })
  });
  }
  check();
  var timer = setInterval(check, timercheck);
};

exports.initMangaDB = function() {
  request('http://mangastream.com/manga', function(error, response, body) {
    var start = body.indexOf('<table class="table table-striped">')
    var end = body.indexOf('</table>')

    var urlArray = body.substring(start, end).match(/http:[/]{2}mangastream[.]com[/]r[/]\w+[/][^/]+[/]/g);
    var altUrlArray = body.substring(start, end).match(/http:[/]{2}mangastream[.]com[/]manga[/]\w+/g);
    
    for (i=0; i < urlArray.length; i++) {
      (function(url, altUrl) {
        var temp = url.substring(25, url.length-1)
        var chapter = temp.substring(temp.indexOf("/")+1)
        var name = temp.substring(0, temp.indexOf("/"))

        mangaDB.check(altUrl).then(function(r) {
          if (r == "No doc found" ) {
            mangaDB.trackManga(altUrl, chapter, name)
          }
        })
      })(urlArray[i], altUrlArray[i])
    }
  })
};






//*TODO* Create embeds instead of sending formatted messages.
exports.checkReddit = function(bot) {
  var rID = null;

  var checkR = function() {
    var rawjs = require('raw.js');
    var reddit = new rawjs("DekuBot v1.0.0 by RoddersGH");

    if (rID == null) {
      reddit.new({
        "r": "all",
        "limit": 100,
        "all": true
      }, function(error, response) {


        rID = response.children[0].data.name;
        redditDB.getAll().then(function(redditArray) {
             for (reddit of redditArray) {
               (function(red) {

                var post_array = [];
                for (i = 0; i < response.children.length; i++) {

                  if (response.children[i].data.subreddit == red.subreddit_name) {

                    if (red.last_id == 0) {
                      post_array.push(response.children[i].data)
                    }
                    else if (response.children[i].data.name == red.last_id) {
                        break;
                    } else {

                        post_array.push(response.children[i].data);
                    }
                  }
                }

                if (post_array.length > 0) {
                  redditDB.updateLastPost(red._id, post_array[0].name);
                }

                for (j = post_array.length-1; j >= 0; j--) {
                  var msgArray = [];

                  msgArray.push('\n────────────────────────────────────────────────────────────────────────\n');
                  msgArray.push('*Posted by /u/' + post_array[j].author.replace(/@everyone/g, "@\u200Beveryone").replace(/@here/g, "@\u200Bhere")  + ' in /r/' + red.subreddit_name.replace(/@everyone/g, "@\u200Beveryone").replace(/@here/g, "@\u200Bhere") + '*');
                  msgArray.push('*https://redd.it/' + post_array[j].id + '*\n');
                  if (post_array[j].url == 'https://www.reddit.com' + post_array[j].permalink) {

                    msgArray.push('**' + post_array[j].title.replace(/&amp;/g, "&").replace(/@everyone/g, "@\u200Beveryone").replace(/@here/g, "@\u200Bhere") + '**:');
                    msgArray.push(post_array[j].selftext.replace(/&amp;/g, "&").replace(/@everyone/g, "@\u200Beveryone").replace(/@here/g, "@\u200Bhere"));
                  } else {
                    msgArray.push('**' + post_array[j].title.replace(/&amp;/g, "&").replace(/@everyone/g, "@\u200Beveryone").replace(/@here/g, "@\u200Bhere") + '**');
                    msgArray.push(post_array[j].url.replace(/&amp;/g, "&").replace(/@everyone/g, "@\u200Beveryone").replace(/@here/g, "@\u200Bhere") + '\n');
                  }

                  bot.channels.get(red.channel_id).sendMessage(msgArray, {split: true})

                }
              })(reddit)
            }
        })
      })
    } else {
      reddit.new({
        "r": "all",
        "before": rID,
        "limit": 100,
        "all": true
      }, function(error, response) {
        if (error) {
          console.log(error);
        } else {

          if (response.children == [] || response.children[0] == undefined) {

          } else {
            rID = response.children[0].data.name;
            redditDB.getAll().then(function(redditArray) {
               for (reddit of redditArray) {
                 (function(red) {

                  var post_array = [];
                  for (i = 0; i < response.children.length; i++) {

                    if (response.children[i].data.subreddit == red.subreddit_name) {

                      if (red.last_id == 0) {
                        post_array.push(response.children[i].data)
                      }
                      else if (response.children[i].data.name == red.last_id) {
                          break;
                      } else {

                          post_array.push(response.children[i].data);
                      }
                    }
                  }

                  if (post_array.length > 0) {
                    redditDB.updateLastPost(red._id, post_array[0].name);
                  }

                  for (j = post_array.length-1; j >= 0; j--) {
                    var msgArray = [];

                    msgArray.push('\n────────────────────────────────────────────────────────────────────────\n');
                    msgArray.push('*Posted by /u/' + post_array[j].author.replace(/@everyone/g, "@\u200Beveryone").replace(/@here/g, "@\u200Bhere")  + ' in /r/' + red.subreddit_name.replace(/@everyone/g, "@\u200Beveryone").replace(/@here/g, "@\u200Bhere") + '*');
                    msgArray.push('*https://redd.it/' + post_array[j].id + '*\n');
                    if (post_array[j].url == 'https://www.reddit.com' + post_array[j].permalink) {

                      msgArray.push('**' + post_array[j].title.replace(/&amp;/g, "&").replace(/@everyone/g, "@\u200Beveryone").replace(/@here/g, "@\u200Bhere") + '**:');
                      msgArray.push(post_array[j].selftext.replace(/&amp;/g, "&").replace(/@everyone/g, "@\u200Beveryone").replace(/@here/g, "@\u200Bhere"));
                    } else {
                      msgArray.push('**' + post_array[j].title.replace(/&amp;/g, "&").replace(/@everyone/g, "@\u200Beveryone").replace(/@here/g, "@\u200Bhere") + '**');
                      msgArray.push(post_array[j].url.replace(/&amp;/g, "&").replace(/@everyone/g, "@\u200Beveryone").replace(/@here/g, "@\u200Bhere") + '\n');
                    }

                    bot.channels.get(red.channel_id).sendMessage(msgArray, {split: true})

                  }
                })(reddit)
              }
            })
          }
        }
      })
    }

  }
  checkR();
  var timer = setInterval(checkR, 10000);
};

exports.responseHandlingREG = function(bot, msg, promptmsg, user) {
  return new Promise(function(resolve, reject) {
    try {
      msg.channel.sendMessage(promptmsg);

      var id = 0;
      var responseCollector = msg.channel.createCollector(
        function(message, collector) {
          if (message.author.id == msg.author.id) {
            return true;
          }
          return false;
        }, {time: 300000});

      responseCollector.on('message', (message, collector) => {
        id = message.id
        collector.stop('recieved');
      });

      responseCollector.on('end', (collection, reason) => {
        if (reason == 'recieved') {
          resolve(collection.get(id).content);
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

exports.responseHandling = function(msg, user, guild, guildFactions) {
  user.sendMessage(msg).then(mesg => {
    var id = 0;
    var response = "";
    var responsechannel = "";
    var responseCollector = mesg.channel.createCollector(
      function(message, collector) {
        if (message.author.id == user.id) {
          return true;
        }
        return false;
      }, {time: 300000});
    responseCollector.on('message', (message, collector) => {
      id = message.id
      collector.stop('recieved');
    });

    responseCollector.on('end', (collection, reason) => {
      if (reason == 'recieved') {
        response = collection.get(id).content
        exports.choice(user, guild, response, guildFactions);
      }
    });
  })
};

exports.choice = function (user, guild, response, guildFactions) {
  var found = false
  for (i = 1; i < guildFactions.length+1; i++) {
    if (response == i.toString()) {
      var currentrole = guild.roles.get(guildFactions[i-1])
      guild.members.get(user.id).addRole(currentrole).then(member => {
        member.sendMessage(`Thanks for choosing the faction **${currentrole.name}**`);
      })
      found = true
    }
    if (found == false && i == guildFactions.length) {
      user.sendMessage("Im sorry, but that response doesn't match any of the faction options listed above.").then(message => {
        exports.responseHandling("**To choose a faction, type the number next to the faction name you wish to join <3 **", user, guild, guildFactions)
      });
    }
  }
};
