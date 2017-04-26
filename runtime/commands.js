var config = require("../config.json");
var userDB = require("./user_rt.js");
var guildDB = require("./guild_rt.js");
var assignableRolesDB = require("./assignable_roles_rt.js");
var redditDB = require("./reddit_rt.js");
var functions = require("./functions.js");
var battleDB = require("./battle_rt.js");
var rssDB = require("./rss_rt.js");
var customcommands = require("./custom_command_rt.js");
var music = require("./music.js");
var logDB = require("./log_rt.js");

var math = require('mathjs');
var Discord = require("discord.js");
var winston = require('winston');
var jimp = require("jimp");
var gm = require("gm");
var request = require("request");
var parseString = require('xml2js').parseString;
var nani = require("nani").init(config.anilistID, config.anilist_Secret);
var nedb = require("nedb")
var request = require("request");
var youtubeNode = require("youtube-node");
var ytdl = require("ytdl-core");
var Commands = [];

var youtube = new youtubeNode();

youtube.setKey(config.youtube);
youtube.addParam('type', 'video');

// GENERAL COMMANDS
// Commands.test = {
//   name: "test",
//   help: "tbd",
//   type: "general",
//   perms: ["ADMINISTRATOR"],
//   cooldown: 0,
//   func: function(bot, msg) {
//     testest.test()
//   }
// };

Commands.help = {
  name: "help",
  help: "tbd",
  type: "general",
  perms: ["SEND_MESSAGES"],
  pm: true,
  cooldown: 0,
  func: function(bot, msg) {
    msg.reply(" 📙 https://github.com/RoddersGH/DekuBot/wiki/General-Commands 📙 \nFeel free to join https://discord.gg/we8bdxJ if you have any further questions or you just want to hang with us");
  }
};

Commands.ping = {
  name: "ping",
  help: "tbd",
  type: "general",
  perms: ["SEND_MESSAGES"],
  pm: true,
  cooldown: 0,
  func: function(bot, msg) {
    msg.reply(":ping_pong:");
  }
};

Commands.pong = {
  name: "pong",
  help: "tbd",
  type: "general",
  perms: ["SEND_MESSAGES"],
  pm: true,
  cooldown: 0,
  func: function(bot, msg) {
    msg.reply("Received command in--- wait, hold on, you're supposed to *ping* me! I haven't the slightest clue how to respond to this *pong* nonsense.");
  }
};

Commands.rps = {
  name: "rockpaperscissors",
  help: "tbd",
  type: "general",
  perms: ["SEND_MESSAGES"],
  pm: true,
  cooldown: 0,
  func: function(bot, msg, args) {
    args = args.toLowerCase();
    if (!args || args != "rock" && args != "paper" && args != "scissors") {
      msg.reply("Please enter either rock, paper or scissors");
    } else {
      if (args == "rock") {
        args = ":right_facing_fist:"
      } else if (args == "paper") {
        args = ":raised_hand:"
      } else if (args == "scissors") {
        args = ":v:"
      }

      var response = [];
      response.push(":right_facing_fist:");
      response.push(":raised_hand:");
      response.push(":v:");

      var responsenum = Math.floor((Math.random())*3)
      var botJanken = response[responsenum]; //Bot's choice

      var msgArray = [];
      msgArray.push('Player: ' + args +  '\n     **VS**\nDekuBot: ' + botJanken);

      //Check who wins
      if (botJanken == args) {
        msgArray.push("```fix\nDraw!```");
      }
      else if (args == ":right_facing_fist:" && botJanken == ":v:" ||
               args == ":raised_hand:" && botJanken == ":right_facing_fist:" ||
               args == ":v:" && botJanken == ":raised_hand:") {
        msgArray.push("```diff\n+ You Win!```");
      }
      else if (args == ":right_facing_fist:" && botJanken == ":raised_hand:" ||
               args == ":raised_hand:" && botJanken == ":v:" ||
               args == ":v:" && botJanken == ":right_facing_fist:") {
        msgArray.push("```diff\n- You Lose!```");
      }
      else msgArray.push("```fix\nSomething went wrong! Try again!```");

      msg.channel.sendMessage(msgArray); //Send message
    }
  }
};

//TODO Could look nicer
Commands.namechanges = {
  name: "namechanges",
  help: "tbt",
  type: "general",
  perms: ["SEND_MESSAGES"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg) {
    if ((msg.mentions.users.array().length === 0) || (msg.mentions.users.array().length > 1)) {
      msg.channel.sendMessage("```diff\n- Please mention a single user.```");
    } else {
      msg.mentions.users.map(function(user) {
        userDB.returnNamechanges(user).then(function(reply) {
          msg.channel.sendMessage(reply.join(', ').replace(/@/g, " @ "));
        }).catch(function(err) {
          if (err === 'No changes found!') {
            msg.channel.sendMessage("I don't have any changes registered 📒");
            return;
          }
          msg.channel.sendMessage('❌ Something went wrong, try again later.');
        });
      });
    }
  }
};

Commands.botstatus = {
  name: "botstatus",
  help: "tbd",
  type: "general",
  perms: ["SEND_MESSAGES"],
  pm: true,
  cooldown: 0,
  func: function(bot, msg) {
    var channelcount = 0;
    var usercount = 0;
    var finalstring = [];

    for (guild of bot.guilds.array()) {
      for (channel of guild.channels.array() ) {
        channelcount++;
      };
      for (member of guild.members.array()) {
        usercount++;
      };
    };

    var seconds = (Math.round(bot.uptime / 1000) % 60)
    var minutes = (Math.round(bot.uptime / (1000 * 60)) % 60)
    var hours = (Math.round(bot.uptime / (1000 * 60 * 60)))
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    var data = new Discord.RichEmbed(data)
    data.setAuthor("Hi! Im DekuBot 🤖")

    data.addField("📗 Servers", bot.guilds.array().length, true)
    data.addField("📃 Channels", channelcount, true)
    data.addField("👤 Users", usercount, true)
    data.addField("🐏 Memory Usage", Math.round(process.memoryUsage().rss / 1024 / 1000) + "MB", true)
    data.addField("⏲️ Up time", hours + ":" + minutes + ":" + seconds, true)
    data.addField("🖥️ Development Server", "https://discord.gg/we8bdxJ", true)
    data.addField("🔗 Invite Link", "https://discordapp.com/oauth2/authorize?client_id=282126217275244545&scope=bot&permissions=2146954327", true)
    data.setDescription("If you have any questions or need some help, contact **RoddersGH#4702**")
    data.setThumbnail("https://cdn.discordapp.com/attachments/239907411899580417/282597112485642241/pretty_much_finished.png")
    data.setColor("#66D6CC")

    msg.channel.sendEmbed(data);
  }
};

Commands.selfrole = Commands.srole = Commands.sarole = Commands.sar = {
  name: "selfassignrole",
  help: "tbd",
  type: "general",
  perms: ["SEND_MESSAGES"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    if (!args) {
      var msgArray = [];
      msgArray.push("This is the self assignable role command. below are the different options:")
      msgArray.push("``selfrole list`` : This will list all of the self assignable roles")
      msgArray.push("``selfrole give <role name>`` : This will give you the role with the specified name")
      msgArray.push("``selfrole take <role name>`` : This will take away the role with the specified name")
      msgArray.push("``selfrole assign <pre-existing role id>`` : This is used to make pre-existing roles self assignable")
      msg.channel.sendMessage(msgArray)
    } else {
      args = args.split(" ")
      switch(args[0]) {
          case "l":
          case "list":
              var msgArray = [];
              assignableRolesDB.getRolesHere(msg.guild).then(function(guildRoles) {
                msgArray.push("We have different self assignable roles on the server that give you a coloured name.")
                msgArray.push("If you want one of these roles, type the command ``selfrole give <role name>``")
                msgArray.push("The roles are:")
                for (i = 0; i < guildRoles.length; i++) {
                  msgArray.push(`➖ ${functions.escapeMentions(msg.guild.roles.get(guildRoles[i]).name, true)}` );
                }
                msg.channel.sendMessage(msgArray)
              }).catch(function(e) {
                if (e == 'No roles found') {
                  msg.channel.sendMessage('```This server has no self assignable roles on it at the moment. Message an admin if you wish for them to create some for the server.```' )
                }
              })
              break;
          case "a":
          case "assign":
              if (msg.member.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
                if (args[1]) {
                  var role = msg.guild.roles.find("name", args[1])
                  if (role) {
                    assignableRolesDB.checkName(msg.guild, role.name).then(function(r) {
                      msg.channel.sendMessage('The role **' + role.name + '** will now be made self assignable.').then(function(mesg) {
                        mesg.author = msg.author
                        functions.responseHandlingREG(bot, mesg, 'Would you like to prompt members when they join, asking if they want this role? **[Y/N]**', msg.author).then(function(res) {
                          var prompt
                          if (res.toLowerCase() == "y") {
                            msg.channel.sendMessage('💾 The role **' + role.name + '** has been made self assignable and will be prompted. 💾')
                            prompt = true
                          } else {
                            msg.channel.sendMessage('💾 The role **' + role.name + '** has been made self assignable. 💾')
                            prompt = false
                          }
                          assignableRolesDB.createNewRole(role.id, msg.guild, role.name, role.color, prompt)
                        })
                      })
                    }).catch(function(e) {
                      if (e == 'exists') {
                        msg.channel.sendMessage('```diff\n- Error: A role with this name is already self assignable.```')
                      } else {
                        console.log(e)
                      }
                    })
                  } else {
                    msg.channel.sendMessage('```diff\n- Error: No role with this name was found (role name is case sensitive)```')
                  }
                } else {
                  msg.channel.sendMessage('```diff\n- Error: no role name given. Correct format - selfrole assign <role name>```')
                }
              } else {
                msg.channel.sendMessage('```diff\n- Error: You do not have the appropriate permissions```')
              }
              break;
          case "g":
          case "give":
              if (args[1]) {
                assignableRolesDB.checkName(msg.guild, args[1]).then(function(r) {
                  msg.channel.sendMessage('```diff\n- Error: No self assignable role with this name was found (role name is case sensitive). To see a list do -  selfrole list```')
                }).catch(function(e) {
                  if (e == 'exists') {
                    assignableRolesDB.getRoleID(msg.guild.id, args[1]).then(function(r) {
                      msg.member.addRole(r)
                      msg.channel.sendMessage(msg.member + ' You now have the **' + functions.escapeMentions(args[1], true) + '** role')
                    })
                  }
                })
              } else {
                msg.channel.sendMessage('```diff\n- Error: no role name given. Correct format -  selfrole give <role name>```')
              }
              break;
          case "t":
          case "take":
              if (args[1]) {
                assignableRolesDB.checkName(msg.guild, args[1]).then(function(r) {
                  msg.channel.sendMessage('```diff\n- Error: No self assignable role with this name was found (role name is case sensitive). To see a list do -  selfrole list```')
                }).catch(function(e) {
                  if (e == 'exists') {
                    assignableRolesDB.getRoleID(msg.guild.id, args[1]).then(function(r) {
                      if (msg.member.roles.has(r)) {
                        msg.member.removeRole(r)
                        msg.channel.sendMessage(msg.member + ' You no longer have the **' + functions.escapeMentions(args[1], true) + '** role')
                      } else {
                        msg.channel.sendMessage('```diff\n- Error: you already do not have this role```')
                      }
                    })
                  }
                })
              } else {
                msg.channel.sendMessage('```diff\n- Error: no role name given. Correct format -  selfrole take <role name>```')
              }
              break;
          default:
              var msgArray = [];
              msgArray.push("This is the self assignable role command. below are the different options:")
              msgArray.push("``selfrole list`` : This will list all of the self assignable roles")
              msgArray.push("``selfrole give <role name>`` : This will give you the role with the specified name")
              msgArray.push("``selfrole take <role name>`` : This will take away the role with the specified name")
              msgArray.push("``selfrole assign <pre-existing role id>`` : This is used to make pre-existing roles self assignable")
              msg.channel.sendMessage(msgArray)
      }
    }
  }
};

Commands.customcommands = {
  name: "customcommands",
  help: "tbd",
  type: "general",
  perms: ["SEND_MESSAGES"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    customcommands.getAllHere(msg.guild).then(function(r) {
      var msgarray = [];
      for (i = 0; i < r.length; i++) {
        msgarray.push(r[i].name);
      }
      msg.author.sendMessage(msgarray, {split: true});
    }).catch(function(e) {
      msg.author.sendMessage(e);
    });
  }
};

Commands.rip = {
  name: "rip",
  help: "tbd",
  type: "general",
  perms: ["SEND_MESSAGES"],
  pm: true,
  cooldown: 4000,
  func: function(bot, msg, args) {
    var url = ""
    if (msg.mentions.users.array().length > 0) {
      url = msg.mentions.users.array()[0].displayAvatarURL
    } else {
      url = msg.author.displayAvatarURL
    }
    if (url == null) {
      msg.reply("Sorry, you need a profile picture to use this command.")
      return;
    } else {
      gm(request(url))
        .resize(90)
        .raise(3,3)
        //.emboss(1)
        .noise('laplacian')
        .sepia()
        .write('./images/tempavatar.png',function (err, buffer) {
          if (err) {console.log(err)}
          gm('./images/grave' + Math.floor(Math.random()*4) + '.png')
            .composite('./images/tempavatar.png')
            .geometry('+102+68')
            .toBuffer('PNG',function (err, buffer) {
              msg.channel.sendFile(buffer)
            })
        })
    }
  }
};

Commands["8ball"] = {
  name: "8ball",
  help: "tbd",
  type: "general",
  perms: ["SEND_MESSAGES"],
  pm: true,
  cooldown: 0,
  func: function(bot, msg, args) {
    var response = [];
    response.push('```diff\n+ It is certain```');
    response.push('```diff\n+ It is decidedly so```');
    response.push('```diff\n+ Without a doubt```');
    response.push('```diff\n+ Yes, definitely```');
    response.push('```diff\n+ You may rely on it```');
    response.push('```diff\n+ As I see it, yes```');
    response.push('```diff\n+ Most likely```');
    response.push('```diff\n+ Outlook good```');
    response.push('```diff\n+ Yes```');
    response.push('```diff\n+ Signs point to yes```');
    response.push('```fix\nReply hazy try again```');
    response.push('```fix\nAsk again later```');
    response.push('```fix\nBetter not tell you now```');
    response.push('```fix\nCannot predict now```');
    response.push('```fix\nConcentrate and ask again```');
    response.push("```diff\n- Don't count on it```");
    response.push('```diff\n- My reply is no```');
    response.push('```diff\n- My sources say no```');
    response.push('```diff\n- Outlook not so good```');
    response.push('```diff\n- Very doubtful```');

    var msgArray = [];
    msgArray.push(':8ball: *"' + args.replace(/@/g, " @ ") +  '"* :8ball:');
    var responsenum = Math.floor((Math.random())*20)
    msgArray.push(response[responsenum]);
    msg.channel.sendMessage(msgArray);

  }
};

Commands.dice = {
  name: "dice",
  help: "tbd",
  type: "general",
  perms: ["SEND_MESSAGES"],
  pm: true,
  cooldown: 0,
  func: function(bot, msg, args) {
    if (args) {
      dice = args
    } else {
      dice = 'd6'
    }
    request('https://rolz.org/api/?' + dice + '.json', function (error, response, body) {
      if (!error && response.statusCode === 200) {
        try {
          JSON.parse(body)
        } catch (e) {
          msg.channel.sendMessage('```diff\n- The API returned an unexpected response.\n```')
          return
        }
        var result = JSON.parse(body)
        msg.reply(' :game_die: ``' + result.input + '`` rolled and the result was... `` ' + result.result + ' ' + result.details + ' ``:game_die:')
      }
    })
  }
};

Commands.triggered = {
  name: "triggered",
  help: "tbd",
  type: "general",
  perms: ["SEND_MESSAGES"],
  pm: true,
  cooldown: 4000,
  func: function(bot, msg, args) {
    var url = ""
    if (msg.mentions.users.array().length > 0) {
      url = msg.mentions.users.array()[0].displayAvatarURL
    } else {
      url = msg.author.displayAvatarURL
    }
    if (url == null) {
      msg.reply("Sorry, you need a profile picture to use this command.")
    } else {
      gm(request(url))
        .resize(150)
        .composite('./images/triggered.png')
        .geometry('+0+123')
        .toBuffer('PNG',function (err, buffer) {
          msg.channel.sendFile(buffer)
        })
    }
    //Possible alt version for the gifs moving
      // var gifLength = 0
      // gm(request(url))
      //   .identify(function (err, gifVal) {
      //     gifLength = gifVal.Format.length
      //     gm(request(url))
      //       .write('./images/temp.gif',function (err) {
      //         for (i = 0; i < gifLength; i++) {
      //             gm(`./images/temp.gif[${i}]`)
      //               .resize(150)
      //               .composite('./images/triggered.png')
      //               .geometry('+0+123')
      //               .write(`./images/temp${i}.jpg`,function (err) {
      //                 if (err) {console.log(err)}
      //               })
      //             if (i == gifLength-1) {
      //               var evalString = "gm()"
      //               for (j = 0; j < gifLength; j++) {
      //                 evalString = evalString + `.in('./images/temp${j}.jpg')`
      //               }
      //               evalString = evalString + ".delay(8).write('./images/trig.gif', function(err){if (err) throw err;msg.channel.sendFile('./images/trig.gif')});"
      //               eval(evalString)
      //             }
      //         }
      //     })
      //   })
  }
};

Commands.invite = {
  name: "invite",
  help: "tbd",
  type: "general",
  perms: ["SEND_MESSAGES"],
  pm: true,
  cooldown: 0,
  func: function(bot, msg) {
    msg.author.sendMessage(`Here is the link to invite ${bot.user.username} to your server:\nhttps://discordapp.com/oauth2/authorize?client_id=${config.bot_client_id}&scope=bot&permissions=2146954327\nRemember that you need to have manage server permissions to be able to add this bot to your server.`);
  }
};

Commands.quote = {
  name: "quote",
  help: "tbd",
  type: "general",
  perms: ["SEND_MESSAGES"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    var quote = ""
    var data = new Discord.RichEmbed(data)

    if (msg.mentions.users.array().length <= 0) {
      quote = args
      data.setAuthor(` ${msg.author.username}`, msg.author.avatarURL)
    } else if (args.split(" ")[0] === "<@" + msg.mentions.users.array()[0].id + ">" || args.split(" ")[0] === "<@!" + msg.mentions.users.array()[0].id + ">") {
      data.setAuthor(` ${msg.mentions.users.array()[0].username}`, msg.mentions.users.array()[0].avatarURL)
      quote = args.replace(msg.guild.members.get(msg.mentions.users.array()[0].id), "").substring(1);
    } else {
      msg.reply("Sorry, you need to mention a user you want to quote, followed by the quote.")
    }

    var randomHex = "#000000".replace(/0/g, function() {
      return (~~(Math.random() * 16)).toString(16);
    });

    data.setColor(randomHex)
    data.setDescription(quote)
    data.setFooter('Quoted by ' + msg.member.displayName)

    msg.channel.sendEmbed(data)
    msg.delete()
  }
};

Commands.math = Commands.maths = {
  name: "math",
  help: "tbd",
  type: "general",
  perms: ["SEND_MESSAGES"],
  pm: true,
  cooldown: 0,
  func: function(bot, msg, args) {
    try {
      msg.channel.sendMessage("```prolog\n " + math.eval(args) + " ```")
    } catch(e) {
      msg.channel.sendMessage("```diff\n-" + e + "```")
    }
  }
};

//TODO Add online members field
Commands.server = {
  name: "server",
  help: "I'll tell you some information about the server you're currently in.",
  type: "general",
  perms: ["SEND_MESSAGES"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    if (msg.channel.guild) {
      var data = new Discord.RichEmbed(data);

      var randomHex = "#000000".replace(/0/g, function() {
        return (~~(Math.random() * 16)).toString(16);
      });
      data.setColor(randomHex)

      data.setTitle(`${msg.guild.name} (${msg.guild.id})`)
      data.addField("Members", msg.guild.members.array().length, true)
      data.addField("Roles", msg.guild.roles.array().length, true)
      data.addField("Region", msg.guild.region, true)
      data.addField("Server Created", `${msg.guild.createdAt.toDateString()}`, true)
      data.addField("Server Owner", `${msg.guild.owner.user.username}#${msg.guild.owner.user.discriminator}`, true)
      data.addField("Channels", msg.guild.channels.array().length, true);
      if (msg.guild.iconURL) data.setThumbnail(msg.guild.iconURL);
      if (msg.guild.emojis.array().length === 0) data.addField("Server Emojis", "None", true);
      else {
        var emojis = []
        var emojis2 = []
        msg.guild.emojis.array().map(function(emoje) {
          if (emojis.join(" ").length <= 950) emojis.push(`${emoje}`);
          else (emojis2.push(`${emoje}`))
        })
        data.addField("Server Emojis", emojis.join(" "), true);
        if (emojis2.length > 0) data.addField("​", emojis2.join(" "));
      }
      msg.channel.sendEmbed(data)
    }
  }
};

Commands.setavatar = {
  name: "setavatar",
  help: "tbd",
  perms: ["ADMINISTRATOR"],
  pm: true,
  cooldown: 0,
  func: function(bot, msg, args) {
   if (msg.author.id === config.dev_id) {
    bot.user.setAvatar(args)
   }
  }
};

Commands.setgame = {
  name: "setgame",
  help: "tbd",
  perms: ["ADMINISTRATOR"],
  pm: true,
  cooldown: 0,
  func: function(bot, msg, args){
    if (msg.author.id === config.dev_id) {
      bot.user.setGame(args);
    }
  }
};

Commands.ud = Commands.urbandictionary = Commands.urbdic = {
  name: "ud",
  help: "tbd",
  type: "general",
  perms: ["SEND_MESSAGES"],
  pm: true,
  cooldown: 0,
  func: function (bot, msg, args) {
    if (!args) {
      msg.reply("You need to specify a word to look up")
      return;
    }
    request("http://api.urbandictionary.com/v0/define?term=" + args, function (error, response, body) {
        var result = JSON.parse(body)

        if (result.result_type !== "no_results" && (result.list[0].definition.length > 2000 || result.list[0].example.length > 2000)) {
          msg.reply("The definition of this word is to long to fit in a discord message. \n" + result.list[0].permalink)
          return
        }

        if (result.result_type !== "no_results") {
          var data = new Discord.RichEmbed(data);
          data.setColor('#134FE6')
          data.setTitle(result.list[0].word)
          data.setDescription(result.list[0].definition)
          if (result.list[0].example) {
            data.addField("Example", result.list[0].example)
          }
          data.setAuthor('Urban Dictionary', 'https://pilotmoon.com/popclip/extensions/icon/ud.png')
          data.setURL(result.list[0].permalink)
          data.setFooter("👍 " + result.list[0].thumbs_up + " : " + result.list[0].thumbs_down + " 👎   |  Made by " + result.list[0].author)

          msg.channel.sendEmbed(data)
        } else {
          msg.reply("**" + args + "** does not exist in urbandictionary database")
          return
        }
    })
  }
}

Commands.rss = {
  name: "rss",
  help: "tbd",
  type: "weeb",
  perms: ["SEND_MESSAGES"],
  pm: true,
  cooldown: 0,
  func: function(bot, msg, args) {
    if (!args) {
      var msgArray = []
      msgArray.push("📰 This is the RSS feed command. Below are a few popular RSS feeds. To track one of these, do ``rss <rss feed link> <filter for the rss feed>`` 📰 : ")
      msgArray.push(" ➖ <http://feeds.feedburner.com/crunchyroll/rss> ⬅️ Crunchyroll anime releases")
      msgArray.push(" ➖ <https://jaiminisbox.com/reader/feeds/rss> ⬅️ Manga scanlating website")
      msgArray.push(" ➖ <http://mangastream.com/rss> ⬅️ Another manga scanlating website")
      msgArray.push(" ➖ <http://feeds.bbci.co.uk/news/rss.xml> ⬅️ Good ol' British news")
      msgArray.push(" ➖ <http://feeds.feedburner.com/techcrunch> ⬅️ Crunchy Tech YumYum")
      msgArray.push(" ➖ <https://www.nasa.gov/rss/dyn/breaking_news.rss> ⬅️ Space news for blues clues yo")
      msg.channel.sendMessage(msgArray)
    } else {
      var raw = args
      args = args.split(" ")
      var url = args[0]
      var filter = ""
      var channel
      var isUser
      var track = true
      if (args.length > 1) {
        filter = raw.substr(raw.indexOf(args[0]) + args[0].length).trim()
      }
      rssDB.parseRSS(url).then(function(r) {
        var ts = new Date(r[0].date)
        ts = ts.getTime()
        if (msg.channel.type == "dm") {
          channel = msg.author.id
          isUser = true
        } else if (msg.channel.type == "text") {
          if (msg.member.hasPermission("MANAGE_CHANNELS")) {
            channel = msg.channel.id
            isUser = false
          } else {
            track = false
            msg.channel.sendMessage(`You don't have high enough permissions to track this RSS feed for this entire channel.`).then(function(mesg) {
              mesg.author = msg.author
              functions.responseHandlingREG(bot, mesg, '```If you wanted to track the RSS feed so that it private messages you directly, please respond with "y"```', msg.author).then(function(res) {
                if (res.toLowerCase() == "y") {
                  channel = msg.author.id
                  isUser = true
                  rssDB.check(url, channel, filter).then(function(re) {
                    if (re == "tracking all") {
                      msg.channel.sendMessage("```diff\n- Error: you are already tracking this RSS feed with no filter```")
                    } else if (re == "same filter") {
                      msg.channel.sendMessage("```diff\n- Error: you are already tracking this RSS feed with the same filter```")
                    } else {
                      rssDB.trackRSS(channel, isUser, url, filter, ts)
                      if (filter == "") {
                        msg.author.sendMessage("📰 You are now tracking the RSS feed **" + r[0].meta.title + "** 📰. All updates to the RSS feed will be posted here.")
                      } else {
                        msg.author.sendMessage("📰 You are now tracking the RSS feed **" + r[0].meta.title + "** with filter **" + filter + "** 📰. All updates to the RSS feed will be posted here.")
                      }
                    }
                  })
                }
              })
            })
          }
        }
        if (track) {
          rssDB.check(url, channel, filter).then(function(re) {
            if (re == "tracking all") {
              msg.channel.sendMessage("```diff\n- Error: you are already tracking this RSS feed with no filter```")
            } else if (re == "same filter") {
              msg.channel.sendMessage("```diff\n- Error: you are already tracking this RSS feed with the same filter```")
            } else {
              rssDB.trackRSS(channel, isUser, url, filter, ts)
              if (isUser) {
                if (filter == "") {
                  msg.author.sendMessage("📰 You are now tracking the RSS feed **" + r[0].meta.title + "** 📰. All updates to the RSS feed will be posted here.")
                } else {
                  msg.author.sendMessage("📰 You are now tracking the RSS feed **" + r[0].meta.title + "** with filter **" + filter + "** 📰. All updates to the RSS feed will be posted here.")
                }
              } else {
                if (filter == "") {
                  msg.channel.sendMessage("📰 The RSS feed **" + r[0].meta.title + "** is now being tracked in " + msg.channel + " 📰. All updates to the RSS feed will be posted here.")
                } else {
                  msg.channel.sendMessage("📰 The RSS feed **" + r[0].meta.title + "** is now being tracked in " + msg.channel + " with filter **" + filter + "** 📰. All updates to the RSS feed will be posted here.")
                }
              }
            }
          })
        }
      }).catch(function(e) {
        msg.channel.sendMessage("```diff\n- Error: Invalid RSS feed link```")
      })
    }
  }
};

Commands.rsslist = {
  name: "rsslist",
  help: "tbd",
  type: "weeb",
  perms: ["SEND_MESSAGES"],
  pm: true,
  cooldown: 0,
  func: function(bot, msg, args) {
    var msgArray = []
    if (msg.channel.type == "dm") {
      rssDB.getByUser(msg.author).then(function(r) {
        msgArray.push("📰 The RSS feeds you are currently tracking are as follows 📰 : ")
        var count = 0
        for (item of r) {
          var filter
          if (item.filter == "") {
            filter = "no"
          } else {
            filter = item.filter
          }
          msgArray.push(`**${count+1}** ➖ ` + `<${item.url}>  Being tracked with ${filter} filter`)
          count++
        }
        msg.channel.sendMessage(msgArray).then(function(mesg) {
          mesg.author = msg.author
          functions.responseHandlingREG(bot, mesg, "❗ If you would like to delete one of the RSS feeds currently being tracked, type the number next to the RSS feed above E.G. '2'. To delete them all type 'all'", msg.author).then(function(res) {
            if (res.toLowerCase() == "all") {
              for (item of r) {
                rssDB.deleteTrack(item._id)
              }
              msg.channel.sendMessage("All RSS feeds have been deleted 🗑️")
            } else if (res > 0 && res <= r.length) {
              rssDB.deleteTrack(r[res-1]._id)
              msg.channel.sendMessage("The RSS feed <" + r[res-1].url + "> has been deleted 🗑️")
            }
          })
        })
      }).catch(function(e) {
        if (e == "No RSS found here") {
          msgArray.push("📰 You are currently not tracking any RSS feeds 📰")
        }
        msg.channel.sendMessage(msgArray)
      })
    } else if (msg.channel.type == "text") {
      rssDB.getByGuild(msg.guild).then(function(r) {
        msgArray.push("📰 The RSS feeds currently being tracked on this server are as follows 📰 : ")
        var count = 0
        for (item of r) {
          var filter
          if (item.filter == "") {
            filter = "no"
          } else {
            filter = item.filter
          }
          msgArray.push(`**${count+1}** ➖ ` + `<${item.url}>  Being tracked in ${bot.channels.get(item.discordID)} with ${filter} filter`)
          count++
        }
        msg.channel.sendMessage(msgArray).then(function(mesg) {
          if (msg.member.hasPermission("MANAGE_CHANNELS")) {
            mesg.author = msg.author
            functions.responseHandlingREG(bot, mesg, "❗ If you would like to delete one of the RSS feeds currently being tracked, type the number next to the RSS feed above E.G. '2'. To delete them all type 'all'", msg.author).then(function(res) {
              if (res.toLowerCase() == "all") {
                for (item of r) {
                  rssDB.deleteTrack(item._id)
                }
                msg.channel.sendMessage("All RSS feeds have been deleted 🗑️")
              } else if (res > 0 && res <= r.length) {
                rssDB.deleteTrack(r[res-1]._id)
                msg.channel.sendMessage("The RSS feed <" + r[res-1].url + "> has been deleted 🗑️")
              }
            })
          }
        })
      }).catch(function(e) {
        if (e == "No RSS found here") {
          msgArray.push("📰 There are currently no RSS feeds being tracked in any channels on this server 📰")
        }
        msg.channel.sendMessage(msgArray)
      })
    }
  }
};




// ADMIN COMMANDS
Commands.purge = {
  name: "purge",
  help: "tbd",
  type: "admin",
  perms: ["MANAGE_MESSAGES"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    // if (msg.channel.type == 'dm') {
    //   msg.channel.sendMessage("```diff\n- You can't do that in a DM you silly silly person!```");
    //   return;
    // }
    // if (!args || isNaN(args)) {
    //   msg.channel.sendMessage("```diff\n- Please define an amount of messages for me to delete!```");
    //   return;
    // }
    // if (!msg.member.hasPermission("MANAGE_MESSAGES")) {
    //   msg.channel.sendMessage("```diff\n- Your role in this guild does not have enough permissions.```");
    //   return;
    // }
    // if (!msg.guild.members.get(bot.user.id).hasPermission("")) {
    //   msg.channel.sendMessage("```diff\n- I don't have permission to do that!```");
    //   return;
    // }
    if (args > 100) {
      msg.channel.sendMessage("```diff\n- The maximum is 100.```");
      return;
    }
    msg.channel.fetchMessages({limit: args}).then(messages => {
      msg.channel.bulkDelete(messages).then(deleted => {
        msg.channel.sendMessage("Done ✔ Deleted " + deleted.array().length + " messages.");
      })
    })
  }
};

Commands.ignore = {
  name: "ignore",
  help: "tbd",
  type: "admin",
  perms: ["MANAGE_CHANNELS"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    guildDB.ignoreChannel(msg.channel).then(function(r) {
      msg.reply(r);
    }).catch(function(e) {
      msg.reply(e);
    })
  }
};

Commands.unignore = {
  name: "unignore",
  help: "tbd",
  type: "admin",
  perms: ["MANAGE_CHANNELS"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    guildDB.unignoreChannel(msg.channel).then(function(r) {
      msg.reply(r);
    }).catch(function(e) {
      msg.reply(e);
    })
  }
};

//TODO REMOVE LVL FROM THE CC DB AND WORK OUT EVERYTHING MENTION WISES
Commands.createcommand = {
  name: "createcommand",
  help: "tbd",
  type: "admin",
  perms: ["MANAGE_MESSAGES"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    var comexists = false
    //var specific_lvl = 0;
    if (!args) {
      msg.channel.sendMessage("Syntax error. Correct usage: '!createcommand <command name> | <command text> '. Command name cannot contain spaces. (permission level can be ommitted but the command will be usable by anyone)");
      return;
    }
    if (args.indexOf(" | ") < 0) {
      msg.channel.sendMessage("Syntax error. Correct usage: '!createcommand <command name> | <command text> '. Command name cannot contain spaces. (permission level can be ommitted but the command will be usable by anyone)");
      return;
    }
    // if (/---[0-3]|---6/.test(args)) {
    //   if (/---[0-3]|---6/.exec(args).index !== args.length-4) {
    //     msg.channel.sendMessage("Syntax error. Correct usage: '!createcommand <command name> | <command text> ---<permission level>'. Command name cannot contain spaces. (permission level can be ommitted but the command will be usable by anyone)");
    //     return;
    //   } else {
    //     specific_lvl = args.substr(/---[0-3]|---6/.exec(args).index+3, 1);
    //   }
    // }
    var tempname = args.split(" ")[0].trim();
    var comname = args.split(" ")[0].toLowerCase().trim();
    if (args.split(" ")[1] != "|") {
      msg.channel.sendMessage("```diff\n- Command name cannot contain spaces.```");
      return;
    }
    var comcontent = args.replace(tempname + " | ", "").trim().replace(/@/igm, "@\u200B")
    if (Commands[comname]) {
      msg.channel.sendMessage("```diff\n- Cannot overwrite core bot commands.```");
      return;
    }
    customcommands.getAllHere(msg.guild).then(function(r) {
      for (i = 0; i < r.length; i++) {
        if (r[i].name === comname) {
         comexists = true
        }
      }
      if (comexists) {
        customcommands.deleteCommand(msg.guild, comname);
        customcommands.createNewCommand(comname, msg.guild, comcontent);
        msg.channel.sendMessage("📝 Command `" + comname + "` has been overwritten with new response: " + comcontent);
      }  else {
        customcommands.createNewCommand(comname, msg.guild, comcontent);
        msg.channel.sendMessage("📝 Command `" + comname + "` has been created with response: " + comcontent);
      }
    }).catch(function(e) {
      if (e == "No custom commands found") {
        customcommands.createNewCommand(comname, msg.guild, comcontent);
        msg.channel.sendMessage("📝 Command `" + comname + "` has been created with response: " + comcontent);
      }
    });
  }
};

Commands.deletecommand = {
  name: "deletecommand",
  help: "tbd",
  type: "admin",
  perms: ["MANAGE_MESSAGES"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    if (!args) {
      msg.channel.sendMessage("Syntax error. Correct usage: '!delete <command name>. Command name cannot contain spaces.");
      return;
    }
    customcommands.deleteCommand(msg.guild, args).then(function(r) {
      msg.channel.sendMessage(r)
    }).catch(function(e) {
      msg.channel.sendMessage(e)
    })
  }
};

Commands.nsfw = {
  name: "nsfw",
  help: "tbd",
  type: "admin",
  perms: ["MANAGE_CHANNELS"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    guildDB.nsfwChannel(msg.channel).then(function(r) {
      msg.reply(r);
    }).catch(function(e) {
      msg.reply(e);
    })
  }
};

Commands.unnsfw = {
  name: "unnsfw",
  help: "tbd",
  type: "admin",
  perms: ["MANAGE_CHANNELS"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    guildDB.unNSFWChannel(msg.channel).then(function(r) {
      msg.reply(r);
    }).catch(function(e) {
      msg.reply(e);
    })
  }
};
//TODO: Fix error message so that link isnt broken
Commands.reddit = {
  name: "reddit",
  help: "tbd",
  type: "admin",
  perms: ["MANAGE_CHANNELS"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    var found = false;
    if (args.indexOf(" ") > 0 || args.indexOf("\u200B") > 0) {
      msg.channel.sendMessage("Syntax error: Not a valid subreddit link. Please give the link in the form of '<https://www.reddit.com/r/><subreddit name>'.");
      return;
    }
    request(args, function(error, response, body) {
      if (error) {
        console.log(error);
        msg.channel.sendMessage("Syntax error: Not a valid subreddit link. Please give the link in the form of '<https://www.reddit.com/r/><subreddit name>'.");
      }
      if (body.search('<p id="noresults" class="error">there doesn' + "'" + 't seem to be anything here</p>') == -1 && body.search('<h3>You must be a Reddit Gold member to view this super secret community</h3>') == -1 && body.search('<h3>This community has been banned</h3>') == -1 && args.indexOf('www.reddit.com/r/') >= 0 ) {
        temp = args.substr(args.indexOf('/r/')+3);
        if (temp.indexOf("/") >= 0) {
          name = temp.slice(0, temp.indexOf('/'));
        } else {
          name = temp;
        }
        if (name.toLowerCase() == 'all' || name.toLowerCase() == 'mod' || name.toLowerCase() == 'friends' || name.toLowerCase() == 'dashboard' || name.toLowerCase() == '' || name.toLowerCase() == 'random') {
          msg.channel.sendMessage("nono <3");
          return;
        }
        redditDB.getAll().then(function(r) {
          if (r.length < 1) {
            redditDB.trackSubreddit(name, msg);
            msg.channel.sendMessage("/r/" + name + ` Is now being tracked in <#${msg.channel.id}>. All new posts will be sent as messages here.`);
          } else {
            for (i = 0; i < r.length; i++) {
              if (r[i].channel_id == msg.channel.id && r[i].subreddit_name == name) {
                  msg.channel.sendMessage("You are already tracking /r/" + name + ` in <#${msg.channel.id}>. All new posts are sent as messages here.`);
                  found = true
              }
              if (!found && i == r.length-1) {
                redditDB.trackSubreddit(name, msg);
                msg.channel.sendMessage("/r/" + name + ` Is now being tracked in <#${msg.channel.id}>. All new posts will be sent as messages here.`);
              }
            }
          }
        })
      } else {
        msg.channel.sendMessage("Syntax error: Not a valid subreddit link. Please give the link in the form of '<https://www.reddit.com/r/><subreddit name>'.");
      }
    })
  }
};

Commands.unreddit = {
  name: "unreddit",
  help: "tbd",
  type: "admin",
  perms: ["MANAGE_CHANNELS"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    var found = false;
    if (args.indexOf(" ") > 0 || args.indexOf("\u200B") > 0) {
      msg.channel.sendMessage("Syntax error: Not a valid subreddit link. Please give the link in the form of 'reddit.com/r/<subreddit name>'.");
      return;
    }
    request(args, function(error, response, body) {
      if (error) {
        console.log(error);
        msg.channel.sendMessage("Syntax error: Not a valid subreddit link. Please give the link in the form of 'www.reddit.com/r/<subreddit name>'.");
      }
      if (body.search('<p id="noresults" class="error">there doesn' + "'" + 't seem to be anything here</p>') == -1 && args.indexOf('www.reddit.com/r/') >= 0 ) {
        temp = args.substr(args.indexOf('/r/')+3);
        if (temp.indexOf("/") >= 0) {
          name = temp.slice(0, temp.indexOf('/'));
        } else {
          name = temp;
        }
        redditDB.getAll().then(function(r) {
          if (r.length < 1) {
            redditDB.trackSubreddit(name, msg);
            msg.channel.sendMessage(`/r/` + name + ` was not being tracked in <#${msg.channel.id}> to begin with.`);
          } else {
            for (i = 0; i < r.length; i++) {
              if (r[i].channel_id == msg.channel.id && r[i].subreddit_name == name) {
                  redditDB.deleteTrack(msg.guild, name);
                  msg.channel.sendMessage(`/r/` + name + ` Is now not being tracked in <#${msg.channel.id}>`);
                  found = true
              }
              if (!found && i == r.length-1) {
                msg.channel.sendMessage(`/r/` + name + ` was not being tracked in <#${msg.channel.id}> to begin with.`);
              }
            }
          }
        })
      } else {
        msg.channel.sendMessage("Syntax error: Not a valid subreddit link. Please give the link in the form of 'www.reddit.com/r/<subreddit name>'.");
      }
    })
  }
};

Commands.setprefix = {
  name: "setprefix",
  help: "tbd",
  type: "admin",
  perms: ["ADMINISTRATOR"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    var eargs = functions.escapeMentions(args, true);
    if (eargs.length > 140) {
      msg.channel.sendMessage("This prefix is too long :|");
    } else {
      guildDB.setPrefix(msg.guild.id, eargs);
      msg.channel.sendMessage("New prefix `" + eargs + "` set.");
    }
  }
};

Commands.togglewelcomepm = {
  name: "togglewelcomepm",
  help: "tbd",
  type: "admin",
  perms: ["ADMINISTRATOR"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    guildDB.toggleWelcomePM(msg.guild.id).then(function(r) {
      msg.channel.sendMessage(r);
    })
  }
};

Commands.toggleselfrolepm = {
  name: "toggleselfrolepm",
  help: "tbd",
  type: "admin",
  perms: ["ADMINISTRATOR"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    guildDB.toggleSelfRolePM(msg.guild.id).then(function(r) {
      msg.channel.sendMessage(r);
    })
  }
};

Commands.setjoinmessage = {
  name: "setjoinmessage",
  help: "tbd",
  type: "admin",
  perms: ["ADMINISTRATOR"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    guildDB.setJoinmsg(msg.guild.id, " " + args).then(function(r) {
      msg.channel.sendMessage(`The new join message has been set to "${r}"`);
    })
  }
};

Commands.setleavemessage = {
  name: "setleavemessage",
  help: "tbd",
  type: "admin",
  perms: ["ADMINISTRATOR"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    guildDB.setJoinmsg(msg.guild.id, args).then(function(r) {
      msg.channel.sendMessage(`The new leave message has been set to "${r}"`);
    })
  }
};

Commands.disablejoinmessage = {
  name: "disablejoinmessage",
  help: "tbd",
  type: "admin",
  perms: ["ADMINISTRATOR"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    guildDB.setJoinmsg(msg.guild.id, "").then(function(r) {
      msg.channel.sendMessage(`The new join message has been set to "${r}"`);
    })
  }
};

Commands.disableleavemessage = {
  name: "disableleavemessage",
  help: "tbd",
  type: "admin",
  perms: ["ADMINISTRATOR"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    guildDB.setLeavemsg(msg.guild.id, "").then(function(r) {
      msg.channel.sendMessage(`The new leave message has been set to "${r}"`);
    })
  }
};

// Commands.setup = {
//   name: "setup",
//   help: "tbd",
//   type: "admin",
//   lvl: 3,
//   cooldown: 0,
//   func: function(bot, msg, args) {
//     guildDB.get(msg.guild.id).then(r => {
//       var data = new Discord.RichEmbed(data);
//       data.setAuthor(`The ${msg.guild.name} server`)
//       data.setTitle(`The following are the current settings for the server:`)
//       data.addField("ID", r._id, true)
//       data.addField("Superuser", `${bot.users.get(r.superuser_id).username} (${r.superuser_id})`, true)
//       data.addField("Announcment Channel", "``" + bot.channels.get(r.announcmentchannel).name + "``", true)
//       //console.log(r.nsfwchannels)
//       data.addField("NSFW Channel(s)", r.nsfwchannels, true)
//       //data.addField("Ignored Channel(s)", r.ignoredchannels, true)
//       data.addField("Bot Prefix", r.prefix, true)
//       data.addField("Welcome Message", r.welcomePM, true)
//       data.addField("Faction Join Message", r.factionPM, true)

//       msg.author.sendEmbed(data)


//     })

//   }
// };

Commands.log = Commands.logs = {
  name: "log",
  help: "tbd",
  type: "admin",
  perms: ["MANAGE_SERVER", "MANAGE_CHANNELS"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    if (!args) {
      var msgArray = [];
      msgArray.push("This is the log command. below are the different options:\n")
      msgArray.push("``log all`` : This will start logging **everything** listed below\n")
      msgArray.push("``log traffic`` : This will start logging all the **member joins/leaves**\n")
      msgArray.push("``log kicks `` : This will start logging all the **kicked members** using the ``punish`` command\n")
      msgArray.push("``log bans`` : This will start logging all the **banned members**\n")
      msgArray.push("``log deletes`` : This will start logging all the **deleted messages**\n")
      msgArray.push("``log warnings`` : This will start logging all the **warnings** given to members using the ``punish`` command\n")
      msgArray.push("``log channels`` : This will start logging all changes made to **channels**\n")
      msgArray.push("``log roles`` : This will start logging all changes made to **roles**\n")
      msgArray.push("``log emojis`` : This will start logging all changes made to **emojis**\n")
      msgArray.push("``log voice`` : This will start logging all traffic for **voice channels**\n")
      msg.channel.sendMessage(msgArray)
    } else {
      args = args.split(" ")

      var handleLog = function(guild, channel, type) {
        logDB.checkLog(guild, type).then(function(r) {
          logDB.createNewLog(guild, channel, type)
          msg.channel.sendMessage("📩 **" + type + "** is now being logged in " + channel + " 📩")
        }).catch(function(e) {
          if (e == 'exists') {
            logDB.getLogChannel(guild, type).then(function(r) {
              msg.channel.sendMessage('You are already tracking **' + type + '** in ' + bot.channels.get(r) + '. To see a list of your logs, do the command  ``loglist``')
            })
          } else {
            console.log(e)
          }
        })
      }

      switch(args[0]) {
          case "a":
          case "all":
              logDB.checkLogAll(msg.guild).then(function(r) {
                if (r.length > 0) {
                  var typeString = r.join(", ")
                  for (type of r) {
                    logDB.createNewLog(msg.guild, msg.channel, type)
                  }
                  var grammar
                  if (r.length > 1) {
                    grammar = "are"
                  } else {
                    grammar = "is"
                  }
                  msg.channel.sendMessage("📩 **" + typeString + "** " + grammar + " now being logged in " + msg.channel + " 📩")
                } else {
                  msg.channel.sendMessage('```diff\n- Error: you are already tracking all types of logs on this server. To see a list do the command -  loglist```')
                }
              }).catch(function(e) {
                console.log(e)
              })
              break;
          case "t":
          case "traffic":
              handleLog(msg.guild, msg.channel, 'traffic')
              break;
          case "k":
          case "kicks":
              handleLog(msg.guild, msg.channel, 'kicks')
              break;
          case "b":
          case "bans":
              handleLog(msg.guild, msg.channel, 'bans')
              break;
          case "d":
          case "deletes":
              handleLog(msg.guild, msg.channel, 'deletes')
              break;
          case "w":
          case "warnings":
              handleLog(msg.guild, msg.channel, 'warnings')
              break;
          case "c":
          case "channels":
              handleLog(msg.guild, msg.channel, 'channels')
              break;
          case "r":
          case "roles":
              handleLog(msg.guild, msg.channel, 'roles')
              break;
          case "e":
          case "emojis":
              handleLog(msg.guild, msg.channel, 'emojis')
              break;
          case "v":
          case "voice":
              handleLog(msg.guild, msg.channel, 'voice')
              break;
          default:
              var msgArray = [];
              msgArray.push("This is the log command. below are the different options:\n")
              msgArray.push("``log all`` : This will start logging **everything** listed below\n")
              msgArray.push("``log traffic`` : This will start logging all the **member joins/leaves**\n")
              msgArray.push("``log kicks `` : This will start logging all the **kicked members** using the ``punish`` command\n")
              msgArray.push("``log bans`` : This will start logging all the **banned members**\n")
              msgArray.push("``log deletes`` : This will start logging all the **deleted messages**\n")
              msgArray.push("``log warnings`` : This will start logging all the **warnings** given to members using the ``punish`` command\n")
              msgArray.push("``log channels`` : This will start logging all changes made to **channels**\n")
              msgArray.push("``log roles`` : This will start logging all changes made to **roles**\n")
              msgArray.push("``log emojis`` : This will start logging all changes made to **emojis**\n")
              msg.channel.sendMessage(msgArray)
      }
    }
  }
};

Commands.loglist = {
  name: "loglist",
  help: "tbd",
  type: "admin",
  perms: ["MANAGE_SERVER", "MANAGE_CHANNELS"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    var msgArray = []
    logDB.getByGuild(msg.guild).then(function(r) {
      msgArray.push("📩 The types of logs currently implemented on this server are as follows 📩 : ")
      var count = 0
      for (item of r) {
        msgArray.push(`**${count+1}** ➖ ` + `**${item.type}**  Being tracked in ${bot.channels.get(item.channelID)}`)
        count++
      }
      msg.channel.sendMessage(msgArray).then(function(mesg) {
        mesg.author = msg.author
        functions.responseHandlingREG(bot, mesg, "❗ If you would like to delete one of the logs currently implemented, type the number next to the log type above E.G. '2'. To delete them all type 'all'", msg.author).then(function(res) {
          if (res.toLowerCase() == "all") {
            logDB.deleteAllHere(msg.guild)
            msg.channel.sendMessage("All logs have been deleted 🗑️")
          } else if (res > 0 && res <= r.length) {
            logDB.deleteLog(r[res-1]._id)
            msg.channel.sendMessage("The log for **" + r[res-1].type + "** has been deleted 🗑️")
          }
        })
      })
    }).catch(function(e) {
      if (e == "No logs found here") {
        msgArray.push("📩 There are currently no logs of any type implemented in any channels on this server 📩")
      }
      msg.channel.sendMessage(msgArray)
    })
  }
};


Commands.spoiler = {
  name: "spoiler",
  help: "tbd",
  type: "admin",
  perms: ["SEND_MESSAGES"],
  pm: true,
  cooldown: 0,
  func: function(bot, msg, args) {
    //console.log(msg.member.displayName)
    args = args.replace(/\n/ig, " ").replace(/\u200B/ig, "")
    if (args.indexOf(':') <= 0) {
      msg.channel.sendMessage('```fix\n- Error: You need give the title of the thing you are spoiling```')
    } else {
      var text = ""
      var height = Math.ceil(args.length / 60)
      if (("! This is a spoiler for " + args.substring(0, args.indexOf(':')) + " ! - Hover over to reveal").length > 60) {
        text = "! This is a spoiler for " + args.substring(0, args.indexOf(':')) + " !\n - Hover over to reveal"
        height++
      } else {
        text = "! This is a spoiler for " + args.substring(0, args.indexOf(':')) + " ! - Hover over to reveal"
      }
      //max height should be 15
      //console.log(height)
      gm(385, height*20, "#36393E")
        .font("C:/Users/ME/Documents/Discord/Bots/Dekubot-Indev/DekuBot/images/source-sans-pro.regular.ttf")
        .fontSize(14)
        .fill("#B9BABC")
        .drawText(5, 15, text)
        .write('./images/tempspoil.png',function (err) {
          if (err) {console.log(err)}
          gm(385, height*20, "#36393E")
            .toBuffer('PNG',function (err, buffer) {
              functions.handleText(buffer, height, args.substr(args.indexOf(':') + 1), msg.channel, 0, msg.member.displayName)
              msg.delete()
            })
        })
    }

  }
};

Commands.spoils = {
  name: "spoils",
  help: "tbd",
  type: "admin",
  perms: ["MANAGE_MESSAGES"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    //console.log(msg.member.displayName)
    args = args.replace(/\n/ig, " ").replace(/\u200B/ig, "")
    var id = args.substr(args.indexOf(':') + 1).trim()
    //console.log(msg.channel.messages.array().length)

    msg.channel.fetchMessage(id).then(mesg => {
      if (args.indexOf(':') <= 0) {
        msg.channel.sendMessage('```fix\n- Error: You need give the title of the thing you are spoiling```')
      } else {
        var height = Math.ceil(args.length / 60)
        //max height should be 15
        //console.log(height)
        gm(385, height*20, "#36393E")
          .font("C:/Users/ME/Documents/Discord/Bots/Dekubot-Indev/DekuBot/images/source-sans-pro.regular.ttf")
          .fontSize(14)
          .fill("#B9BABC")
          .drawText(5, 15, "! This is a spoiler for " + args.substring(0, args.indexOf(':')) + " ! - Hover over to reveal")
          .write('./images/tempspoil.png',function (err) {
            if (err) {console.log(err)}
            gm(385, height*20, "#36393E")
              .toBuffer('PNG',function (err, buffer) {
                functions.handleText(buffer, height, mesg.content, msg.channel, 0, mesg.member.displayName)
                msg.delete()
                mesg.delete()
              })
          })
      }
    })
    //onsole.log(mesg)


  }
};




// WEEB COMMANDS
Commands.anime = {
  name: "anime",
  help: "tbd",
  type: "weeb",
  perms: ["SEND_MESSAGES"],
  pm: true,
  cooldown: 0,
  func: function(bot, msg, args) {
    msg.channel.sendMessage(" 🔍 *Searching...* 🔍");
    nani.get('anime/search/' + args).then(function(r) {
      if (r.length == 0 || r == null) {
        bot.reply(msg, "❌ Nothing found ");
        return
      } else {
        nani.get('anime/' + r[0].id).then(function(data) {
          msg.channel.sendMessage('http://anilist.co/anime/' + data.id + "   " + data.image_url_lge).then(message => {
            var msgArray = [];
            msgArray.push("**Names: **" + data.title_japanese + ", " + data.title_romaji + ", " + data.title_english);
            msgArray.push("**Type: **" + data.type);
            msgArray.push("**Genres: **" + data.genres);
            msgArray.push("**Score: **" + data.average_score);
            msgArray.push("**Status: **" + data.airing_status);
            if (data.total_episodes != 0) {
              msgArray.push("**# of Episodes: **" + data.total_episodes);
            }
            msgArray.push("**Start Date: **" + data.start_date.substr(0, 10));
            if (data.end_date) {
              msgArray.push("**End Date: **" + data.end_date.substr(0, 10));
            }
            var cleanText = data.description.replace(/<\/?[^>]+(>|$)/g, "");
            msgArray.push("**Description: **" + cleanText);
            msg.channel.sendMessage(msgArray);
          })
        }).catch(function(e) {
          console.log(e);
        });
      }
    }).catch(function(e) {
      console.log(e);
      msg.reply("❌ Nothing found ");
    });
  }
};

Commands.manga = {
  name: "manga",
  help: "tbd",
  type: "weeb",
  perms: ["SEND_MESSAGES"],
  pm: true,
  cooldown: 0,
  func: function(bot, msg, args) {
    msg.channel.sendMessage(" 🔍 *Searching...* 🔍");
    nani.get('manga/search/' + args).then(function(r) {
      if (r.length == 0 || r == null) {
        msg.reply("❌ Nothing found ");
        return
      } else {
        nani.get('manga/' + r[0].id).then(function(data) {
          msg.channel.sendMessage('http://anilist.co/manga/' + data.id + "   " + data.image_url_lge).then(message => {
            var msgArray = [];
            msgArray.push("**Names: **" + data.title_japanese + ", " + data.title_romaji + ", " + data.title_english);
            msgArray.push("**Type: **" + data.type);
            msgArray.push("**Genres: **" + data.genres);
            msgArray.push("**Score: **" + data.average_score);
            msgArray.push("**Status: **" + data.airing_status);
            if (data.total_chapters != 0) {
              msgArray.push("**# of Chapters: **" + data.total_chapters + " In " + data.total_volumes + " Volumes.");
            }
            msgArray.push("**Start Date: **" + data.start_date.substr(0, 10));
            if (data.end_date) {
              msgArray.push("**End Date: **" + data.end_date.substr(0, 10));
            }
            var cleanText = data.description.replace(/<\/?[^>]+(>|$)/g, "");
            msgArray.push("**Description: **" + cleanText);
            msg.channel.sendMessage(msgArray);
          });
        }).catch(function(e) {
          console.log(e);
        });
      }
    }).catch(function(e) {
      console.log(e);
      msg.reply("❌ Nothing found ");
    });
  }
};

//TODO: Should throw err when no result found
Commands.character = {
  name: "character",
  help: "tbd",
  type: "weeb",
  perms: ["SEND_MESSAGES"],
  pm: true,
  cooldown: 0,
  func: function(bot, msg, args) {
    msg.channel.sendMessage(" 🔍 *Searching...* 🔍");
    nani.get('character/search/' + args).then(function(r) {
      if (r.length == 0 || r == null) {
        msg.reply("❌ Nothing found ");
        return
      } else {
        var msgArray1 = [];
        if (r.length > 1 ) {
          for (i = 0; i < r.length; i++) {
            msgArray1.push("[ " + (i+1) + " ]  -  " + r[i].name_last + " " + r[i].name_first);
          }
        } else if (r.length == 1) {
        nani.get('character/' + r[0].id).then(function(data) {
          msg.channel.sendMessage('http://anilist.co/character/' + data.id + "   " + data.image_url_lge).then(message => {
            var msgArray = [];
            msgArray.push("**Names: **" + data.name_last + " " + data.name_first + ", " + data.name_alt + ", " + data.name_japanese);
            var a = data.info.replace(/__/g, "**");
            var b = a.replace(/~!/g, " ");
            var c = b.replace(/!~/g, " ");
            if (data.info.length >= 1600) {
              msgArray.push("**Description: **\n\n" + c.substr(0, 1600) + "...       _click the first link above to read more_");
            } else {
              msgArray.push("**Description: **\n\n" + c);
            }
            msg.channel.sendMessage(msgArray);
          });
        }).catch(function(e) {
          console.log(e);
          msg.reply("❌ Nothing found ");
        });
        return;
        }
        msg.channel.sendMessage("**Please choose one be giving a number:**").then(mesg => {
          mesg.author = msg.author
          functions.responseHandlingREG(bot, mesg, msgArray1, msg.author).then(function(num){
            if (num > 0 && num <= r.length && num.length <= 2) {
              nani.get('character/' + r[num-1].id).then(function(data) {
                msg.channel.sendMessage('http://anilist.co/character/' + data.id + "   " + data.image_url_lge).then(message => {
                  var msgArray = [];
                  msgArray.push("**Names: **" + data.name_last + " " + data.name_first + ", " + data.name_alt + ", " + data.name_japanese);
                  var a = data.info.replace(/__/g, "**");
                  var b = a.replace(/~!/g, " ");
                  var c = b.replace(/!~/g, " ");
                  var d = c.replace(/&#039;/, "'")
                  if (data.info.length >= 1600) {
                    msgArray.push("**Description: **\n\n" + d.substr(0, 1600) + "...       _click the first link above to read more_");
                  } else {
                    msgArray.push("**Description: **\n\n" + d);
                  }
                  msg.channel.sendMessage(msgArray);
                });
              }).catch(function(e) {
                console.log(e);
              });
            }
          }).catch(function(e) {
            console.log(e);
            msg.reply("❌ Nothing found ");
          });

        });
      }
    }).catch(function(e) {
      msg.reply("❌ Nothing found ");
      console.log(e);
    });
  }
};

Commands.animesearch = {
  name: "animesearch",
  help: "tbd",
  type: "weeb",
  perms: ["SEND_MESSAGES"],
  pm: true,
  cooldown: 0,
  func: function(bot, msg, args) {
    msg.channel.sendMessage(" 🔍 *Searching...* 🔍");
    nani.get('anime/search/' + args).then(function(r) {
      if (r.length == 0 || r == null) {
        msg.reply("❌ Nothing found ");
        return
      } else {
        var msgArray1 = [];
        if (r.length > 1 ) {
          for (i = 0; i < r.length; i++) {
            msgArray1.push("[ " + (i+1) + " ]  -  " + r[i].title_english);
          }
        } else if (r.length == 1) {
        nani.get('anime/' + r[0].id).then(function(data) {
          msg.channel.sendMessage('http://anilist.co/anime/' + data.id + "   " + data.image_url_lge).then(message => {
            var msgArray = [];
            msgArray.push("**Names: **" + data.title_japanese + ", " + data.title_romaji + ", " + data.title_english);
            msgArray.push("**Type: **" + data.type);
            msgArray.push("**Genres: **" + data.genres);
            if (data.average_score == 0) {
              msgArray.push("**Score: **Undecided" );
            } else {
              msgArray.push("**Score: **" + data.average_score);
            }
            msgArray.push("**Status: **" + data.airing_status);
            if (data.total_episodes != 0) {
              msgArray.push("**# of Episodes: **" + data.total_episodes);
            }
            msgArray.push("**Start Date: **" + data.start_date.substr(0, 10));
            if (data.end_date) {
              msgArray.push("**End Date: **" + data.end_date.substr(0, 10));
            }
            if (data.description) {
              var cleanText = data.description.replace(/<\/?[^>]+(>|$)/g, "");
              msgArray.push("**Description: **" + cleanText);
            }
            msg.channel.sendMessage(msgArray);
          });
        }).catch(function(e) {
          console.log(e);
          msg.reply("❌ Nothing found ");
        });
        return;
        }
        msg.channel.sendMessage("**Please choose one be giving a number:**").then(mesg => {
          mesg.author = msg.author
          functions.responseHandlingREG(bot, mesg, msgArray1, msg.author).then(function(num){
            if (num > 0 && num <= r.length && num.length <= 2) {
              nani.get('anime/' + r[num-1].id).then(function(data) {
                msg.channel.sendMessage('http://anilist.co/anime/' + data.id + "   " + data.image_url_lge).then(message => {
                  var msgArray = [];
                  msgArray.push("**Names: **" + data.title_japanese + ", " + data.title_romaji + ", " + data.title_english);
                  msgArray.push("**Type: **" + data.type);
                  msgArray.push("**Genres: **" + data.genres);
                  if (data.average_score == 0) {
                    msgArray.push("**Score: **Undecided" );
                  } else {
                    msgArray.push("**Score: **" + data.average_score);
                  }
                  msgArray.push("**Status: **" + data.airing_status);
                  if (data.total_episodes != 0) {
                    msgArray.push("**# of Episodes: **" + data.total_episodes);
                  }
                  msgArray.push("**Start Date: **" + data.start_date.substr(0, 10));
                  if (data.end_date) {
                    msgArray.push("**End Date: **" + data.end_date.substr(0, 10));
                  }
                  if (data.description) {
                    var cleanText = data.description.replace(/<\/?[^>]+(>|$)/g, "");
                    msgArray.push("**Description: **" + cleanText);
                  }
                  msg.channel.sendMessage(msgArray);
                });
              }).catch(function(e) {
                console.log(e);
                msg.reply("❌ Nothing found ");
              });
            }
          }).catch(function(e) {
            console.log(e);
            msg.reply("❌ Nothing found ");
          });

        });
      }
    }).catch(function(e) {
      console.log(e);
      msg.reply("❌ Nothing found ");
    });
  }
};

Commands.mangasearch = {
  name: "mangasearch",
  help: "tbd",
  type: "weeb",
  perms: ["SEND_MESSAGES"],
  pm: true,
  cooldown: 0,
  func: function(bot, msg, args) {
    msg.channel.sendMessage(" 🔍 *Searching...* 🔍");
    nani.get('manga/search/' + args).then(function(r) {
      if (r.length == 0 || r == null) {
        msg.reply("❌ Nothing found ");
        return
      } else {
        var msgArray1 = [];
        if (r.length > 1 ) {
          for (i = 0; i < r.length; i++) {
            msgArray1.push("[ " + (i+1) + " ]  -  " + r[i].title_english);
          }
        } else if (r.length == 1) {
          nani.get('manga/' + r[0].id).then(function(data) {
            msg.channel.sendMessage('http://anilist.co/manga/' + data.id + "   " + data.image_url_lge).then(message => {
              var msgArray = [];
              msgArray.push("**Names: **" + data.title_japanese + ", " + data.title_romaji + ", " + data.title_english);
              msgArray.push("**Type: **" + data.type);
              msgArray.push("**Genres: **" + data.genres);
              msgArray.push("**Score: **" + data.average_score);
              msgArray.push("**Status: **" + data.airing_status);
              if (data.total_chapters != 0) {
                msgArray.push("**# of Chapters: **" + data.total_chapters + " In " + data.total_volumes + " Volumes.");
              }
              msgArray.push("**Start Date: **" + data.start_date.substr(0, 10));
              if (data.end_date) {
                msgArray.push("**End Date: **" + data.end_date.substr(0, 10));
              }
              var cleanText = data.description.replace(/<\/?[^>]+(>|$)/g, "");
              msgArray.push("**Description: **" + cleanText);
              msg.channel.sendMessage(msgArray);
            });
          }).catch(function(e) {
            console.log(e);
            msg.reply("❌ Nothing found ");
          });
        return;
        }
        msg.channel.sendMessage("**Please choose one be giving a number:**").then(mesg => {
          mesg.author = msg.author
          functions.responseHandlingREG(bot, mesg, msgArray1, msg.author).then(function(num){
            if (num > 0 && num <= r.length && num.length <= 2) {
              nani.get('manga/' + r[num-1].id).then(function(data) {
                msg.channel.sendMessage('http://anilist.co/manga/' + data.id + "   " + data.image_url_lge).then(message => {
                  var msgArray = [];
                  msgArray.push("**Names: **" + data.title_japanese + ", " + data.title_romaji + ", " + data.title_english);
                  msgArray.push("**Type: **" + data.type);
                  msgArray.push("**Genres: **" + data.genres);
                  msgArray.push("**Score: **" + data.average_score);
                  msgArray.push("**Status: **" + data.airing_status);
                  if (data.total_chapters != 0) {
                    msgArray.push("**# of Chapters: **" + data.total_chapters + " In " + data.total_volumes + " Volumes.");
                  }
                  msgArray.push("**Start Date: **" + data.start_date.substr(0, 10));
                  if (data.end_date) {
                    msgArray.push("**End Date: **" + data.end_date.substr(0, 10));
                  }
                  var cleanText = data.description.replace(/<\/?[^>]+(>|$)/g, "");
                  msgArray.push("**Description: **" + cleanText);
                  msg.channel.sendMessage(msgArray);
                });
              }).catch(function(e) {
                console.log(e);
                msg.reply("❌ Nothing found ");
              });
            }
          }).catch(function(e) {
            console.log(e);
            msg.reply("❌ Nothing found ");
          });
        });
      }
    }).catch(function(e) {
      console.log(e);
      msg.reply("❌ Nothing found ");
    });
  }
};

Commands.animeairdate = {
  name: "animeairdate",
  help: "tbd",
  type: "weeb",
  perms: ["SEND_MESSAGES"],
  pm: true,
  cooldown: 0,
  func: function(bot, msg, args) {
    msg.channel.sendMessage(" 🔍 *Searching...* 🔍");
    nani.get('anime/search/' + args).then(function(r) {
      if (r.length == 0 || r == null) {
        msg.reply("❌ Nothing found ");
        return
      } else {
        nani.get('anime/' + r[0].id).then(function(data) {
          msg.channel.sendMessage('http://anilist.co/anime/' + data.id + "   " + data.image_url_lge).then(message => {
            var msgArray = [];

            if (data.airing_status == 'finished airing' || data.airing_status == 'not yet aired') {
              msgArray.push("**Status: **" + data.airing_status);
            } else {
              var date = new Date(null);
              date.setSeconds(data.airing.countdown); // specify value for SECONDS here
              var formattedDate = date.toISOString().substr(8,2)-1 + " Days, " + date.toISOString().substr(11,2) + " Hours, " + date.toISOString().substr(14,2) + " Minutes"

              msgArray.push("**Next Episode: **" + data.airing.next_episode);
              msgArray.push("**Airing On: **" + data.airing.time.substr(0, 10));
              msgArray.push("**Countdown: ** :hourglass_flowing_sand: " + formattedDate);
            }

            msg.channel.sendMessage(msgArray);
          });
        }).catch(function(e) {
          console.log(e);
          msg.reply("❌ Nothing found ");
        });
      }
    }).catch(function(e) {
      console.log(e);
      msg.reply("❌ Nothing found ");
    });
  }
};

// Commands.mangalist= {
//   name: "mangalist",
//   help: "tbd",
//   type: "weeb",
//   perms: ["SEND_MESSAGES"],
//   cooldown: 0,
//   func: function(bot, msg, args) {
//     mangaDB.getAll().then(function(r) {
//       var msgarray = [];
//       msgarray.push("This is a list of all of the manga tracked on mangastream");
//       for (i = 0; i < r.length; i++) {
//         msgarray.push(`<${r[i].url}> Aliases: ${r[i].aliases}`);
//       }
//       msg.author.sendMessage(msgarray, {split: true});
//     })
//   }
// };

// Commands.mangatrack = {
//   name: "mangatrack",
//   help: "tbd",
//   type: "weeb",
//   perms: ["SEND_MESSAGES"],
//   cooldown: 0,
//   func: function(bot, msg, args) {
//     mangaDB.checkAlias(args).then(function(record) {
//       mangaDB.addToPM(record._id, msg.author);
//       msg.channel.sendMessage("You are now tracking ``" + functions.escapeMentions(args, true) + "``. All new chapters will be linked to you in a Private Message ✔");
//     }).catch(function(e) {
//       if (e == "Nothing found") {
//         msg.channel.sendMessage("``" + functions.escapeMentions(args, true) + "`` Is not a recognised name for any of the manga on mangastream.com, if you would like a list then please check http://mangastream.com/manga or do !mangalist");
//       }
//     })
//   }
// };


//MUSIC COMMANDS
//TODO Make it auto leave when trying to join the servers afk channel
Commands.dj = {
  name: "dj",
  help: "tbd",
  perms: ["MANAGE_GUILD", "MANAGE_ROLES_OR_PERMISSIONS"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    guildDB.get(msg.guild.id).then(r => {
      if (r.DJRole) {
        msg.channel.sendMessage('```fix\nA DJ role already exists, it is the role:```' + msg.guild.roles.get(r.DJRole))
      } else {
        msg.guild.createRole({name: 'DJ'}).then(role => {
          msg.channel.sendMessage('```fix\nA DJ role has been created. People with this role can use all of the music commands.```')
          guildDB.setDJRole(msg.guild.id, role.id)
          msg.member.addRole(role)
        })
      }
    })
  }
};

Commands.joinvoice = {
  name: "joinvoice",
  help: "tbd",
  perms: ["SEND_MESSAGES"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    //have the d role to use this command
    guildDB.get(msg.guild.id).then(r => {
      if (r.DJRole) {
        if (msg.member.roles.has(r.DJRole)) {
          if (msg.member.voiceChannel) {
            msg.member.voiceChannel.join().then(connection => {
              music.addToGuildArray(bot, msg.guild)
              msg.channel.sendMessage('I have successfully connected to the ``' + connection.channel.name + '`` voice channel.');
            })
          } else {
            msg.channel.sendMessage('```diff\n- Error: You need to join a voice channel first```');
          }
        } else {
          msg.channel.sendMessage('```diff\n- Error: You need to have the DJ role to use this command```');
        }
      } else {
        msg.channel.sendMessage('```fix\n- Error: You need to have the DJ role to use this command. To create the DJ role, please do ' + r.prefix + 'dj```');
      }
    })
  }
};

Commands.leavevoice = {
  name: "leavevoice",
  help: "tbd",
  perms: ["SEND_MESSAGES"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    guildDB.get(msg.guild.id).then(r => {
      if (r.DJRole) {
        if (msg.member.roles.has(r.DJRole)) {
          if (msg.guild.voiceConnection) {
            music.removeFromGuildArray(bot, msg.guild)
            msg.guild.voiceConnection.channel.leave()
            msg.channel.sendMessage('Disconnected from the ``' + msg.guild.voiceConnection.channel.name + '`` voice channel.');
          }
        } else {
          msg.channel.sendMessage('```diff\n- Error: You need to have the DJ role to use this command```');
        }
      } else {
        msg.channel.sendMessage('```fix\n- Error: You need to have the DJ role to use this command. To create the DJ role, please do ' + r.prefix + 'dj```');
      }
    })
  }
};

Commands.request = {
  name: "request",
  help: "tbd",
  perms: ["SEND_MESSAGES"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    if (msg.guild.voiceConnection) {
      if (msg.member.voiceChannel && msg.member.voiceChannel.id == msg.guild.voiceConnection.channel.id) {
        var regex = new RegExp("https:[/][/]www[.]youtube[.]com[/]watch[?]v[=][a-zA-Z0-9\-_]{11}", "ig")
        var str = regex.exec(args)
        if (str) {
          youtube.getById(str[0].substr(32), function(error, result) {
            if (error) {
              console.log(error);
            }
            else {
              console.log(result)
              var data = new Discord.RichEmbed(data);
              data.setAuthor(msg.member.displayName + ' added the following to the queue:')
              data.setTitle('▶️️ Title:     ' + result.items[0].snippet.title)
              data.setThumbnail(result.items[0].snippet.thumbnails.default.url)
              data.setColor("#FF4500")
              data.setDescription("🔗 **URL:** " + str[0])

              msg.channel.sendEmbed(data);
              music.addToSongs(bot, msg.guild, str[0], msg.member, result.items[0])
            }
          })
        } else {
          if (args) {
            youtube.search(args, 2, function(error, result) {
              if (error) {
                console.log(error);
              } else if (result.items.length < 1) {
                msg.channel.sendMessage('```diff\n- Error: You need to give a valid youtube video link E.G. https://www.youtube.com/watch?v=YLO7tCdBVrA or give a search term```');
                return;
              } else {
                var link = 'https://www.youtube.com/watch?v=' + result.items[0].id.videoId

                var data = new Discord.RichEmbed(data);
                data.setAuthor(msg.member.displayName + ' added the following to the queue:')
                data.setTitle('▶️️ Title:     ' + result.items[0].snippet.title)
                data.setThumbnail(result.items[0].snippet.thumbnails.default.url)
                data.setColor("#FF4500")
                data.setDescription("🔗 **URL:** " + link)

                msg.channel.sendEmbed(data)
                music.addToSongs(bot, msg.guild, link, msg.member, result.items[0])
              }
            })
          } else {
            msg.channel.sendMessage('```diff\n- Error: You need to give a valid youtube video link E.G. https://www.youtube.com/watch?v=YLO7tCdBVrA or give a search term```');
          }
        }
      } else {
        msg.channel.sendMessage('```diff\n- Error: You need to join the voice channel the bot is in first```');
      }
    } else {
      msg.channel.sendMessage('```diff\n- Error: I need to be added to a voice channel before I can play music```');
    }
  }
};

Commands.skipsong = {
  name: "skipsong",
  help: "tbd",
  perms: ["SEND_MESSAGES"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    if (msg.guild.voiceConnection) {
      if (msg.member.voiceChannel && msg.member.voiceChannel.id == msg.guild.voiceConnection.channel.id) {
        music.skipSong(bot, msg.guild.voiceConnection.channel, msg.member.id, msg.channel)
      } else {
        msg.channel.sendMessage("```diff\n- Error:You aren't listening to the music```");
      }
    } else {
      msg.channel.sendMessage("```diff\n- Error: I'm not playing any music```");
    }
  }
};

Commands.clearqueue = {
  name: "clearsongs",
  help: "tbd",
  perms: ["SEND_MESSAGES"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    guildDB.get(msg.guild.id).then(r => {
      if (r.DJRole) {
        if (msg.member.roles.has(r.DJRole)) {
          if (msg.guild.voiceConnection) {
            music.clearSongs(bot, msg.guild)
            msg.channel.sendMessage('```fix\nAll songs cleared from the queue```');
          } else {
            msg.channel.sendMessage("```diff\n- Error: I'm not playing any music```");
          }
        } else {
          msg.channel.sendMessage('```diff\n- Error: You need to have the DJ role to use this command```');
        }
      } else {
        msg.channel.sendMessage('```fix\n- Error: You need to have the DJ role to use this command. To create the DJ role, please do ' + r.prefix + 'dj```');
      }
    })
  }
};

Commands.endsong = {
  name: "endsong",
  help: "tbd",
  perms: ["SEND_MESSAGES"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    guildDB.get(msg.guild.id).then(r => {
      if (r.DJRole) {
        if (msg.member.roles.has(r.DJRole)) {
          if (msg.guild.voiceConnection) {
            music.endSong(bot, msg.guild)
            msg.channel.sendMessage('```fix\nSong ended...```');
          } else {
            msg.channel.sendMessage("```diff\n- Error: I'm not playing any music```");
          }
        } else {
          msg.channel.sendMessage('```diff\n- Error: You need to have the DJ role to use this command```');
        }
      } else {
        msg.channel.sendMessage('```fix\n- Error: You need to have the DJ role to use this command. To create the DJ role, please do ' + r.prefix + 'dj```');
      }
    })
  }
};

Commands.queue = {
  name: "queue",
  help: "tbd",
  perms: ["SEND_MESSAGES"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    if (msg.guild.voiceConnection) {
      music.getQueue(bot, msg.guild, msg.channel)
    } else {
      msg.channel.sendMessage("```diff\n- Error: I'm not playing any music```");
    }
  }
};

Commands.pause = {
  name: "pause",
  help: "tbd",
  perms: ["SEND_MESSAGES"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    guildDB.get(msg.guild.id).then(r => {
      if (r.DJRole) {
        if (msg.member.roles.has(r.DJRole)) {
          if (msg.guild.voiceConnection) {
            music.pause(bot, msg.guild)
          } else {
            msg.channel.sendMessage("```diff\n- Error: I'm not playing any music```");
          }
        } else {
           msg.channel.sendMessage('```fix\n- Error: You need to have the DJ role to use this command```');
        }
      } else {
          msg.channel.sendMessage('```fix\n- Error: You need to have the DJ role to use this command. To create the DJ role, please do ' + r.prefix + 'dj```');
      }
    })
  }
};

Commands.resume = {
  name: "resume",
  help: "tbd",
  perms: ["SEND_MESSAGES"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    guildDB.get(msg.guild.id).then(r => {
      if (r.DJRole) {
        if (msg.member.roles.has(r.DJRole)) {
          if (msg.guild.voiceConnection) {
            music.resume(bot, msg.guild)
          } else {
            msg.channel.sendMessage("```diff\n- Error: I'm not playing any music```");
          }
        } else {
           msg.channel.sendMessage('```fix\n- Error: You need to have the DJ role to use this command```');
        }
      } else {
          msg.channel.sendMessage('```fix\n- Error: You need to have the DJ role to use this command. To create the DJ role, please do ' + r.prefix + 'dj```');
      }
    })

  }
};

Commands.volume = {
  name: "resume",
  help: "tbd",
  perms: ["SEND_MESSAGES"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    guildDB.get(msg.guild.id).then(r => {

      if (r.DJRole) {
        if (msg.member.roles.has(r.DJRole)) {
          if (msg.guild.voiceConnection) {
            var vol = parseFloat(args)
            if (vol && vol > 0 && vol < 350) {
              music.setVolume(bot, msg.guild, vol)
              msg.channel.sendMessage('```fix\n- The volume has been set to ' + vol + '%```');
            } else {
              msg.channel.sendMessage("```diff\n- Error: a number between 1 and 100 was not given; where 40 is average volume```");
            }

          } else {
            msg.channel.sendMessage("```diff\n- Error: I'm not playing any music```");
          }
        } else {
           msg.channel.sendMessage('```fix\n- Error: You need to have the DJ role to use this command```');
        }
      } else {
          msg.channel.sendMessage('```fix\n- Error: You need to have the DJ role to use this command. To create the DJ role, please do ' + r.prefix + 'dj```');
      }
    })

  }
};



// NSFW COMMANDS
Commands.rule34 = {
  name: "rule34",
  help: "tbd",
  type: "nsfw",
  perms: ["SEND_MESSAGES"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    request('http://rule34.xxx//index.php?page=dapi&s=post&q=index&limit=300&tags=' + args, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        if (body.length < 1) {
          msg.channel.sendMessage("Sorry, nothing found.");
          return;
        }
        if (args.length < 1) {
          args = "<no tags specified>";
        }
        if (functions.checkBlacklist(args)) {
          parseString(body, function (err, result) {
            msg.channel.sendMessage("You've searched for `" + args + "`. Sending images in a pm...").then(mesg => {
              msg.author.sendMessage('http:' + result.posts.post[Math.floor((Math.random() * result.posts.post.length))].$.file_url);
              msg.author.sendMessage('http:' + result.posts.post[Math.floor((Math.random() * result.posts.post.length))].$.file_url);
              msg.author.sendMessage('http:' + result.posts.post[Math.floor((Math.random() * result.posts.post.length))].$.file_url);
            });
          });
        } else {
          parseString(body, function (err, result) {
            msg.channel.sendMessage("You've searched for `" + args + "`. Sending 3 random images from a potential 300 results...").then(mesg => {
              msg.channel.sendMessage('http:' + result.posts.post[Math.floor((Math.random() * result.posts.post.length))].$.file_url);
              msg.channel.sendMessage('http:' + result.posts.post[Math.floor((Math.random() * result.posts.post.length))].$.file_url);
              msg.channel.sendMessage('http:' + result.posts.post[Math.floor((Math.random() * result.posts.post.length))].$.file_url);
            });
          });
        }
      }
    });
  }
};

Commands.konachan = {
  name: "konachan",
  help: "tbd",
  type: "nsfw",
  perms: ["SEND_MESSAGES"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    if (args.split(" ").length > 5) {
      msg.channel.sendMessage("Konachan only supports upto 6 tags.");
      return;
    }
    request('https://konachan.net/post/index.json?limit=300&tags=' + args, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var result = JSON.parse(body);
        if (result.length < 1) {
          msg.channel.sendMessage("Sorry, nothing found.");
          return;
        }
        if (args.length < 1) {
          args = "<no tags specified>";
        }
        if (functions.checkBlacklist(args)) {
          msg.channel.sendMessage("You've searched for `" + args + "`. Sending images in a pm...").then(mesg => {
            msg.author.sendMessage('http:' + result[Math.floor((Math.random() * result.length))].file_url);
            msg.author.sendMessage('http:' + result[Math.floor((Math.random() * result.length))].file_url);
            msg.author.sendMessage('http:' + result[Math.floor((Math.random() * result.length))].file_url);
          });
        } else {
          msg.channel.sendMessage("You've searched for `" + args + "`. Sending 3 random images from a potential 300 results...").then(mesg => {
            msg.channel.sendMessage('http:' + result[Math.floor((Math.random() * result.length))].file_url);
            msg.channel.sendMessage('http:' + result[Math.floor((Math.random() * result.length))].file_url);
            msg.channel.sendMessage('http:' + result[Math.floor((Math.random() * result.length))].file_url);
          });
        }
      }
    });
  }
};

Commands.danbooru = {
  name: "danbooru",
  help: "tbd",
  type: "nsfw",
  perms: ["SEND_MESSAGES"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    if (args.split(" ").length > 2) {
      msg.channel.sendMessage("Danbooru only supports upto 2 tags.");
      return;
    }
    request('https://danbooru.donmai.us/posts.json?limit=300&tags=' + args, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var result = JSON.parse(body);
        if (result.length < 1) {
          msg.channel.sendMessage("Sorry, nothing found.");
          return;
        }
        if (args.length < 1) {
          args = "<no tags specified>";
        }
        if (functions.checkBlacklist(args)) {
          msg.channel.sendMessage("You've searched for `" + args + "`. Sending images in a pm...").then(mesg => {
            msg.author.sendMessage('https://danbooru.donmai.us' + result[Math.floor((Math.random() * result.length))].file_url);
            msg.author.sendMessage('https://danbooru.donmai.us' + result[Math.floor((Math.random() * result.length))].file_url);
            msg.author.sendMessage('https://danbooru.donmai.us' + result[Math.floor((Math.random() * result.length))].file_url);
          });
        } else {
          msg.channel.sendMessage("You've searched for `" + args + "`. Sending 3 random images from a potential 300 results...").then(mesg =>  {
            msg.channel.sendMessage('https://danbooru.donmai.us' + result[Math.floor((Math.random() * result.length))].file_url);
            msg.channel.sendMessage('https://danbooru.donmai.us' + result[Math.floor((Math.random() * result.length))].file_url);
            msg.channel.sendMessage('https://danbooru.donmai.us' + result[Math.floor((Math.random() * result.length))].file_url);
          });
        }
      }
    });
  }
};

Commands.yandere = {
  name: "yandere",
  help: "tbd",
  type: "nsfw",
  perms: ["SEND_MESSAGES"],
  pm: false,
  cooldown: 0,
  func: function(bot, msg, args) {
    request('https://yande.re/post/index.json?limit=500&tags=' + args, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var result = JSON.parse(body);
        if (result.length < 1) {
          msg.channel.sendMessage("Sorry, nothing found.");
          return;
        }
        if (args.length < 1) {
          args = "<no tags specified>";
        }
        if (functions.checkBlacklist(args)) {
          msg.channel.sendMessage("You've searched for `" + args + "`. Sending images in a pm...").then(mesg => {
            msg.author.sendMessage(result[Math.floor((Math.random() * result.length))].file_url);
            msg.author.sendMessage(result[Math.floor((Math.random() * result.length))].file_url);
            msg.author.sendMessage(result[Math.floor((Math.random() * result.length))].file_url);
          });
        } else {
          msg.channel.sendMessage("You've searched for `" + args + "`. Sending 3 random images from a potential 300 results...", function(err, mesg) {
            msg.channel.sendMessage(result[Math.floor((Math.random() * result.length))].file_url);
            msg.channel.sendMessage(result[Math.floor((Math.random() * result.length))].file_url);
            msg.channel.sendMessage(result[Math.floor((Math.random() * result.length))].file_url);
          });
        }
      }
    });
  }
};



exports.Commands = Commands;
