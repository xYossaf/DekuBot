var config = require("../config.json");
var userDB = require("./user_rt.js");
var guildDB = require("./guild_rt.js");
var assignableRolesDB = require("./assignable_roles_rt.js");
var redditDB = require("./reddit_rt.js");

var Discord = require("discord.js");
var nani = require("nani").init(config.anilistID, config.anilist_Secret);
var nedb = require("nedb")
var request = require("request");
var youtubeNode = require("youtube-node");
var ytdl = require("ytdl-core");
var gm = require("gm");

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
        }, {time: 2400000});

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

exports.responseHandling = function(msg, user, guild, guildRoles) {
  user.sendMessage(msg).then(mesg => {
    var id = 0;
    var response = "";
    var responsechannel = "";
    var responseCollector = mesg.channel.createCollector(
      function(message, collector) {
        return message.author.id == user.id;
      }, {time: 2400000});
    responseCollector.on('message', (message, collector) => {
      id = message.id
      collector.stop('recieved');
    });

    responseCollector.on('end', (collection, reason) => {
      if (reason == 'recieved') {
        response = collection.get(id).content
        exports.choice(user, guild, response, guildRoles);
      }
    });
  })
};

exports.choice = function (user, guild, response, guildRoles) {
  var found = false
  for (i = 1; i < guildRoles.length+1; i++) {
    if (response == i.toString()) {
      var currentrole = guild.roles.get(guildRoles[i-1])
      if (currentrole == undefined) {
        return
      }
      guild.members.get(user.id).addRole(currentrole).then(member => {
        member.sendMessage(`Thanks for choosing the role **${currentrole.name}**`);
      })
      found = true
    }
    if (!found && i == guildRoles.length) {
      user.sendMessage("Im sorry, but that response doesn't match any of the options listed above.").then(message => {
        exports.responseHandling("**To choose a role, type the number next to the role name <3 in this DM**", user, guild, guildRoles)
      });
    }
  }
};

exports.checkBlacklist = string => {
  return config.blacklisted_tags.some(tag => string.toLowerCase().includes(tag));
};

exports.handleText = function(buf, height, text, channel, count, name) {
  // console.log("here1")
  // console.log((height*20)+1)
  // console.log(text)
  //console.log(name)
  var end = text.substring(0, 60).lastIndexOf(" ")
  if (text.length < 60) {
    end = text.length
  }
  if (end === -1) {
    end = 60
  }
  gm(buf, 'temp.png')
    .font("C:/Users/ME/Documents/Discord/Bots/Dekubot-Indev/DekuBot/images/source-sans-pro.regular.ttf")
    .fontSize(14)  
    .fill("#B9BABC")
    .drawText(5, (count*20)+15, text.substring(0, end))
    .toBuffer('PNG',function (err, buffer) {
      // console.log("here2")
      // console.log(height)
      if (count === height) {
        gm(buf, 'temp2.png')
          .write('./images/tempspoil2.png',function (err) {
            if (err) {console.log(err)}
            gm()
              .in('-delay', 60)
              .in('./images/tempspoil.png')
              .in('-delay', 65535)
              .in('./images/tempspoil2.png')
              .write('./images/spoil.gif',function(err) {
                channel.sendFile('./images/spoil.gif', "spoilergif.gif", '**Sent By ' + name + ': **')
                // gm('./images/spoil.gif')
                //   .identify(function (err, data) {
                //     if (!err) console.log(data.Delay[1])
                //   })
              })
          })
      } else {
        exports.handleText(buffer, height, text.substr(end+1), channel, count+1, name)
      }
    })
};

/**
 * Escapes regex from a string.
 * @param {String} str The string for which to escape regex.
 * @return {String} A new string with regex escaped.
 */
exports.escapeRegex = function (str) {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};


/**
 * Returns a new string with global mentions (@everyone, @here) escaped,
 * and optionally does the same for mentionable roles and users in a guild.
 * Yes, it's a hack for globals. Unfortunately, there is no easy way to disable
 * these mentions on a per-message basis.
 * @summary Escapes mentions from a string.
 * @param {String} str The string for which to escape mentions.
 * @param {Boolean} escapeAll (optional) Toggle to escape user and role mentions.
 * @return {String} A new string with zero-width spaces inserted to escape mentions.
 */
exports.escapeMentions = function (str, escapeAll) {
  if (escapeAll) {
    str = str.replace(/<(@[&!]?[0-9]+?)>/g, '$1')
  }
  return str.replace(/@(everyone|here)/gi, '@\u200B$1');
};
