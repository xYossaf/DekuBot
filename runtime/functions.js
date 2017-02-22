var config = require("../config.json");
var userDB = require("./user_rt.js");
var guildDB = require("./guild_rt.js");
var permissionDB = require("./permission_rt.js");
var factionDB = require("./faction_rt.js");
var mangaDB = require("./manga_track_rt.js");
var redditDB = require("./reddit_rt.js");

var Discord = require("discord.js");
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
            var regex = new RegExp("[<]link[>]http[:][/][/]mangastream[.]com[/]read[/]" + mangatag + "[/]((.|\n){30})", 'gi')
            var chapterTest = b.match(regex)
            if (chapterTest !== null) {
              for (k = 0; k < chapterTest.length; k++) {
                
                var temporary = chapterTest[k].substr(chapterTest[k].indexOf(mangatag) + mangatag.length + 1)
                var chapVal = temporary.substring(0, temporary.indexOf("/"))
                if (chapVal > unescape(m.chapter).match(/[0-9\.]+/ig)[0]){
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
                break;
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

                  var data = new Discord.RichEmbed(data);

                  data.setTitle(post_array[j].title)
                  data.setURL(`https://redd.it/${post_array[j].id}`)
                  data.setTimestamp()
                  data.setAuthor(`Posted by /u/${post_array[j].author} in /r/${red.subreddit_name}`, "https://cdn.discordapp.com/attachments/239907411899580417/282016131848339458/fullxfull.png")
                  data.setColor("#FF4500")

                  if (post_array[j].url == 'https://www.reddit.com' + post_array[j].permalink) {
                    if (post_array[j].selftext.length > 2048) {
                      data.setDescription(post_array[j].selftext.substring(0, 2040) + '...')
                    } else {
                      data.setDescription(post_array[j].selftext)
                    }  
                  } else {
                    if (post_array[j].url.includes("imgur")) {
                      data.setImage("http://i." + post_array[j].url.substring(7).replace(/amp;/g, "") + ".jpg")
                    } else {
                      data.setImage(post_array[j].url.replace(/amp;/g, ""))
                    }
                      
                  }

                  bot.channels.get(red.channel_id).sendEmbed(data)

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
                      
                    var data = new Discord.RichEmbed(data);

                    data.setTitle(post_array[j].title)
                    data.setURL(`https://redd.it/${post_array[j].id}`)
                    data.setTimestamp()
                    data.setAuthor(`Posted by /u/${post_array[j].author} in /r/${red.subreddit_name}`, "https://cdn.discordapp.com/attachments/239907411899580417/282016131848339458/fullxfull.png")
                    data.setColor("#FF4500")

                    if (post_array[j].url == 'https://www.reddit.com' + post_array[j].permalink) {
                      if (post_array[j].selftext.length > 2048) {
                        data.setDescription(post_array[j].selftext.substring(0, 2040) + '...')
                      } else {
                        data.setDescription(post_array[j].selftext)
                      }  
                    } else {
                      if (post_array[j].url.includes("imgur")) {
                        data.setImage("http://i." + post_array[j].url.substring(7).replace(/amp;/g, "") + ".jpg")
                      } else {
                        data.setImage(post_array[j].url.replace(/amp;/g, ""))
                      }
                    }

                    bot.channels.get(red.channel_id).sendEmbed(data)

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
          return message.author.id == msg.author.id;
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
        return message.author.id == user.id;
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
      if (currentrole == undefined) {
        return
      }
      guild.members.get(user.id).addRole(currentrole).then(member => {
        member.sendMessage(`Thanks for choosing the faction **${currentrole.name}**`);
      })
      found = true
    }
    if (!found && i == guildFactions.length) {
      user.sendMessage("Im sorry, but that response doesn't match any of the faction options listed above.").then(message => {
        exports.responseHandling("**To choose a faction, type the number next to the faction name you wish to join <3 **", user, guild, guildFactions)
      });
    }
  }
};

exports.checkBlacklist = string => {
  return config.blacklisted_tags.some(tag => string.toLowerCase().includes(tag));
};
