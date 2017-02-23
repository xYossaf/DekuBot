var config = require("../config.json");
var userDB = require("./user_rt.js");
var guildDB = require("./guild_rt.js");
var permissionDB = require("./permission_rt.js");
var factionDB = require("./faction_rt.js");
var mangaDB = require("./manga_track_rt.js");
var redditDB = require("./reddit_rt.js");
var functions = require("./functions.js");
var battleDB = require("./battle_rt.js");
var customcommands = require("./custom_command_rt.js");

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


// GENERAL COMMANDS
Commands.help = {
  name: "help",
  help: "tbd",
  type: "general",
  lvl: 0,
  cooldown: 0,
  func: function(bot, msg) {
    msg.reply(" 📙 https://github.com/RoddersGH/DekuBot/wiki/General-Commands 📙 \nFeel free to join https://discord.gg/we8bdxJ if you have any further questions or you just want to hang with us");
  }
};

Commands.ping = {
  name: "ping",
  help: "tbd",
  type: "general",
  lvl: 0,
  cooldown: 0,
  func: function(bot, msg) {
    msg.reply(":ping_pong:");
  }
};

Commands.pong = {
  name: "pong",
  help: "tbd",
  type: "general",
  lvl: 0,
  cooldown: 0,
  func: function(bot, msg) {
    msg.reply("Received command in--- wait, hold on, you're supposed to *ping* me! I haven't the slightest clue how to respond to this *pong* nonsense.");
  }
};

Commands.rps = {
  name: "rockpaperscissors",
  help: "tbd",
  type: "general",
  lvl: 0,
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
  lvl: 0,
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
  lvl: 0,
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

Commands.faction = {
  name: "faction",
  help: "tbd",
  type: "general",
  lvl: 0,
  cooldown: 0,
  func: function(bot, msg, args) {
    var msgArray = [];
    var guildFactions = [];
    var found = false;
    factionDB.getFactionsHere(msg.guild).then(function(guildFactions) {
        for (i = 0; i < guildFactions.length; i++) {
          if (msg.member.roles.has(guildFactions[i])) {
            msg.author.sendMessage("❌ Sorry, you are already in a faction. If you really want to change faction, message a member of staff.");
            found = true;
          }
          if (!found && i == guildFactions.length-1) {
            msgArray.push("Hello member of the " + msg.channel.guild.name + " server");
            msgArray.push("Im one of the bots on this server made by RoddersGH#4702. I help with a bunch of things which you can check out by going to the following link: https://github.com/RoddersGH/DekuBot/wiki");
            msgArray.push(" ");
            msgArray.push("(If this message was an annoyance or was not intended for you then I sincerely apologise and would ask you to contact RoddersGH#4702 with any issues)");
            msgArray.push(" ");
            msgArray.push("We have different factions on the server that give you a coloured name and put you on the faction leaderboards(still being made).");
            msgArray.push("**If you want to join a faction, type the **number** next to the faction you wish to join.**" );
            msgArray.push("The factions are:" );
            for (j = 0; j < guildFactions.length; j++) {
              msgArray.push(`${j+1}. ${msg.guild.roles.get(guildFactions[j]).name}` );
            }
            functions.responseHandling(msgArray, msg.author, msg.guild, guildFactions)
          }
        }
    }).catch(function(e) {
      if (e == 'No factions found') {
        msg.channel.sendMessage('This server has no factions in it at the moment. Message an admin if you wish for them to create factions for the server.' )
      }
    })
  }
};

Commands.customcommands = {
  name: "customcommands",
  help: "tbd",
  type: "general",
  lvl: 0,
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

//*TODO* Use new library http://www.graphicsmagick.org/GraphicsMagick.html#details-compose so we can handle gifs
Commands.rip = {
  name: "rip",
  help: "tbd",
  type: "general",
  lvl: 0,
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
  lvl: 0,
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
  lvl: 0,
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

//TODO Don't forget to figure out install for gm so that it works on linux
Commands.triggered = {
  name: "triggered",
  help: "tbd",
  type: "general",
  lvl: 0,
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
  lvl: 0,
  cooldown: 0,
  func: function(bot, msg) {
    msg.author.sendMessage(`Here is the link to invite ${bot.user.username} to your server:\nhttps://discordapp.com/oauth2/authorize?client_id=${config.bot_client_id}&scope=bot&permissions=2146954327\nRemember that you need to have manage server permissions to be able to add this bot to your server.`);
  }
};

Commands.quote = {
  name: "quote",
  help: "tbd",
  type: "general",
  lvl: 0,
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
    
    msg.channel.sendEmbed(data)
  }
};

Commands.math = {
  name: "math",
  help: "tbd",
  type: "general",
  lvl: 0,
  cooldown: 0,
  func: function(bot, msg, args) {
    try {
      msg.channel.sendMessage("```prolog\n " + math.eval(args) + " ```")
    } catch(e) {
      msg.channel.sendMessage("```diff\n-" + e + "```")
    }
   
  }
};

Commands.maths = {
  name: "maths",
  help: "tbd",
  type: "general",
  lvl: 0,
  cooldown: 0,
  func: function(bot, msg, args) {
    try {
      msg.channel.sendMessage("```prolog\n " + math.eval(args) + " ```")
    } catch(e) {
      msg.channel.sendMessage("```diff\n-" + e + "```")
    }
   
  }
};

Commands.server = {
  name: "server",
  help: "I'll tell you some information about the server you're currently in.",
  lvl: 0,
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
  lvl: 6,
  cooldown: 0,
  func: function(bot, msg, args) {
   if (msg.author.id === config.dev_id) {
    bot.user.setAvatar(args)
   }
  }
};




// ADMIN COMMANDS
Commands.purge = {
  name: "purge",
  help: "tbd",
  type: "admin",
  lvl: 1,
  cooldown: 0,
  func: function(bot, msg, args) {
    if (msg.channel.type == 'dm') {
      msg.channel.sendMessage("```diff\n- You can't do that in a DM you silly silly person!```");
      return;
    }
    if (!args || isNaN(args)) {
      msg.channel.sendMessage("```diff\n- Please define an amount of messages for me to delete!```");
      return;
    }
    if (!msg.member.hasPermission("MANAGE_MESSAGES")) {
      msg.channel.sendMessage("```diff\n- Your role in this guild does not have enough permissions.```");
      return;
    }
    if (!msg.guild.members.get(bot.user.id).hasPermission("MANAGE_MESSAGES")) {
      msg.channel.sendMessage("```diff\n- I don't have permission to do that!```");
      return;
    }
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

Commands.getpermissionlevel = {
  name: "getpermissionlevel",
  help: "tbd",
  type: "admin",
  lvl: 1,
  cooldown: 0,
  func: function(bot, msg, args) {
    if ((msg.mentions.users.array().length === 0) || (msg.mentions.users.array().length > 1)) {
      msg.reply("```diff\n- Please mention a user```");
    } else {
      permissionDB.getPermission(msg.channel.guild.id, msg.mentions.users.array()[0].id).then(function(r) {
        msg.channel.sendMessage(r);
      });
    }
  }
};

Commands.setpermissionlevel = {
  name: "setpermissionlevel",
  help: "tbd",
  type: "admin",
  lvl: 3,
  cooldown: 0,
  func: function(bot, msg, args) {
    var num = args.substr(args.indexOf(" ") + 1)
    var isnum = /^\d+$/.test(num);
    if ((msg.mentions.users.array().length === 0) || (msg.mentions.users.array().length > 1)) {
      msg.reply("```diff\n- Please mention a user```");
      return;
    } else {
      if (!num || !isnum || (num == 4) || (num == 5) || (num < 0) || (num > 6)) {
        msg.channel.sendMessage("```diff\n- Please define the permission level you wish to set for the user.```");
        return;
      } else {
        permissionDB.check(msg.channel.guild.id, msg.mentions.users.array()[0].id).catch(function(e) {
          console.log(e);
          if (e == 'Nothing found!1') {
            permissionDB.newPermission(msg.channel.guild, msg.mentions.users.array()[0]);
          };
        });
        permissionDB.getPermission(msg.channel.guild.id, msg.author.id).then(function(r) {
          permissionDB.setPermission(r, msg.channel.guild, msg.mentions.users.array()[0], num).then(function(res) {
            msg.channel.sendMessage(msg.mentions.users.array()[0] + res);
          }).catch(function(e) {
            msg.channel.sendMessage(e);
          });
        }).catch(function(e) {
          console.log(e);
        });
      }
    }
  }
};

Commands.createfaction = {
  name: "createfaction",
  help: "tbd",
  type: "admin",
  lvl: 3,
  cooldown: 0,
  func: function(bot, msg, args) {
    var name = args.substr(0, args.indexOf("#") - 1).toLowerCase();
    var hex = args.substr(args.indexOf("#"))
    var isHex = /^#[0-9A-F]{6}$/i.test(hex);

    if (!isHex) {
      msg.channel.sendMessage("```diff\n- Please enter a valid Hex value of the format #<six digit hex number>.```");
      return;
    };
    factionDB.checkNameClash(msg.channel.guild, name).then(function() {
      var hex_int = parseInt("0x" + hex.substr(hex.indexOf("#") + 1), 16);
      msg.guild.createRole({
        color : hex_int,
        hoist : false,
        name : name,
        permissions : [
          "ATTACH_FILES", "SEND_MESSAGES", "READ_MESSAGES", "EMBED_LINKS", "READ_MESSAGE_HISTORY", "CREATE_INSTANT_INVITE", "CHANGE_NICKNAME", "CONNECT", "SPEAK", "USE_VAD"
        ],
        mentionable: false
      }).then(role => {
        factionDB.createNewFaction(role.id, role.guild, role.name, hex_int, role.permissions);
        msg.channel.sendMessage("The faction " + role.name + " has been created ✔");
      }).catch(function(e) {
        msg.channel.sendMessage(e);
        return;
      })
    }).catch(function(e) {
      msg.channel.sendMessage(e);
      return;
    });
  }
};

Commands.deletefaction = {
  name: "deletefaction",
  help: "tbd",
  type: "admin",
  lvl: 3,
  cooldown: 0,
  func: function(bot, msg, args) {
    var found = false
    factionDB.getFactionsHere(msg.guild).then(function(r) {
      for (i = 0; i < r.length; i++) {
        if (msg.guild.roles.get(r[i]).name == args) {
          factionDB.deleteFaction(r[i]);
          msg.guild.roles.get(r[i]).delete().then(r => {
            msg.channel.sendMessage(`The faction **${r.name}** has been deleted`)
          })
          found = true
        }
        if (!found && i == r.length-1) {
          msg.channel.sendMessage("```diff\nA faction with this name does not exist\n```")
        }
      }
    })
  }
};

Commands.ignore = {
  name: "ignore",
  help: "tbd",
  type: "admin",
  lvl: 3,
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
  lvl: 3,
  cooldown: 0,
  func: function(bot, msg, args) {
    guildDB.unignoreChannel(msg.channel).then(function(r) {
      msg.reply(r);
    }).catch(function(e) {
      msg.reply(e);
    })
  }
};

Commands.createcommand = {
  name: "createcommand",
  help: "tbd",
  type: "admin",
  lvl: 3,
  cooldown: 0,
  func: function(bot, msg, args) {
    var comexists = false
    var specific_lvl = 0;
    if (!args) {
      msg.channel.sendMessage("Syntax error. Correct usage: '!createcommand <command name> | <command text> ---<permission level>'. Command name cannot contain spaces. (permission level can be ommitted but the command will be usable by anyone)");
      return;
    }
    if (args.indexOf(" | ") < 0) {
      msg.channel.sendMessage("Syntax error. Correct usage: '!createcommand <command name> | <command text> ---<permission level>'. Command name cannot contain spaces. (permission level can be ommitted but the command will be usable by anyone)");
      return;
    }
    if (/---[0-3]|---6/.test(args)) {
      if (/---[0-3]|---6/.exec(args).index !== args.length-4) {
        msg.channel.sendMessage("Syntax error. Correct usage: '!createcommand <command name> | <command text> ---<permission level>'. Command name cannot contain spaces. (permission level can be ommitted but the command will be usable by anyone)");
        return;
      } else {
        specific_lvl = args.substr(/---[0-3]|---6/.exec(args).index+3, 1);
      }
    }
    var tempname = args.split(" ")[0].trim();
    var comname = args.split(" ")[0].toLowerCase().trim();
    if (args.split(" ")[1] != "|") {
      msg.channel.sendMessage("```diff\n- Command name cannot contain spaces.```");
      return;
    }
    var comcontent = args.replace(tempname + " | ", "").replace("---" + specific_lvl, "").trim();
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
        customcommands.createNewCommand(comname, msg.guild, comcontent, specific_lvl);
        msg.channel.sendMessage("📝 Command `" + comname + "` has been overwritten with new response: " + comcontent);
      }  else {
        customcommands.createNewCommand(comname, msg.guild, comcontent, specific_lvl);
        msg.channel.sendMessage("📝 Command `" + comname + "` has been created with response: " + comcontent);
      }
    }).catch(function(e) {
      if (e == "No custom commands found") {
        customcommands.createNewCommand(comname, msg.guild, comcontent, specific_lvl);
        msg.channel.sendMessage("📝 Command `" + comname + "` has been created with response: " + comcontent);
      }
    });
  }
};

Commands.deletecommand = {
  name: "deletecommand",
  help: "tbd",
  type: "admin",
  lvl: 3,
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
  lvl: 3,
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
  lvl: 3,
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
  lvl: 3,
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
  lvl: 3,
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
  lvl: 3,
  cooldown: 0,
  func: function(bot, msg, args) {
    var eargs = args.replace(/@everyone/g, "@\u200Beveryone").replace(/@here/g, "@\u200Bhere");
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
  lvl: 3,
  cooldown: 0,
  func: function(bot, msg, args) {
    guildDB.toggleWelcomePM(msg.guild.id).then(function(r) {
      msg.channel.sendMessage(r);
    })
  }
};

Commands.togglefactionpm = {
  name: "togglefactionpm",
  help: "tbd",
  type: "admin",
  lvl: 3,
  cooldown: 0,
  func: function(bot, msg, args) {
    guildDB.toggleFactionPM(msg.guild.id).then(function(r) {
      msg.channel.sendMessage(r);
    })
  }
};

Commands.setjoinmessage = {
  name: "setjoinmessage",
  help: "tbd",
  type: "admin",
  lvl: 3,
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
  lvl: 3,
  cooldown: 0,
  func: function(bot, msg, args) {
    guildDB.setJoinmsg(msg.guild.id, args).then(function(r) {
      msg.channel.sendMessage(`The new leave message has been set to "${r}"`);
    })
  }
};

Commands.disablejoinmessage = {
  name: "togglefactionpm",
  help: "tbd",
  type: "admin",
  lvl: 3,
  cooldown: 0,
  func: function(bot, msg, args) {
    guildDB.setJoinmsg(msg.guild.id, "").then(function(r) {
      msg.channel.sendMessage(`The new join message has been set to "${r}"`);
    })
  }
};

Commands.disableleavemessage = {
  name: "togglefactionpm",
  help: "tbd",
  type: "admin",
  lvl: 3,
  cooldown: 0,
  func: function(bot, msg, args) {
    guildDB.setJoinmsg(msg.guild.id, "").then(function(r) {
      msg.channel.sendMessage(`The new leave message has been set to "${r}"`);
    })
  }
};



// WEEB COMMANDS
Commands.anime = {
  name: "anime",
  help: "tbd",
  type: "weeb",
  lvl: 0,
  cooldown: 0,
  func: function(bot, msg, args) {
    msg.channel.sendMessage(" 🔍 *Searching...* 🔍");
    nani.get('anime/search/' + args).then(function(r) {
      if (r.length == 0 || r == null) {
        bot.reply(msg, "❌ Nothing found ");
        return
      } else {
        console.log(r[0]);
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
  lvl: 0,
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
  lvl: 0,
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
  lvl: 0,
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
  lvl: 0,
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
  lvl: 0,
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

Commands.mangalist= {
  name: "mangalist",
  help: "tbd",
  type: "weeb",
  lvl: 0,
  cooldown: 0,
  func: function(bot, msg, args) {
    mangaDB.getAll().then(function(r) {
      var msgarray = [];
      msgarray.push("This is a list of all of the manga tracked on mangastream");
      for (i = 0; i < r.length; i++) {
        msgarray.push(`<${r[i].url}> Aliases: ${r[i].aliases}`);
      }
      msg.author.sendMessage(msgarray, {split: true});
    })
  }
};

Commands.mangatrack = {
  name: "mangatrack",
  help: "tbd",
  type: "weeb",
  lvl: 0,
  cooldown: 0,
  func: function(bot, msg, args) {
    mangaDB.checkAlias(args).then(function(record) {
      mangaDB.addToPM(record._id, msg.author);
      msg.channel.sendMessage("You are now tracking ``" + args.replace(/@everyone/igm, "@\u200Beveryone").replace(/@here/igm, "@\u200Bhere") + "``. All new chapters will be linked to you in a Private Message ✔");
    }).catch(function(e) {
      if (e == "Nothing found") {
        msg.channel.sendMessage("``" + args.replace(/@everyone/igm, "@\u200Beveryone").replace(/@here/igm, "@\u200Bhere") + "`` Is not a recognised name for any of the manga on mangastream.com, if you would like a list then please check http://mangastream.com/manga or do !mangalist");
      }
    })
  }
};

Commands.unmangatrack = {
  name: "unmangatrack",
  help: "tbd",
  type: "weeb",
  lvl: 0,
  cooldown: 0,
  func: function(bot, msg, args) {
    mangaDB.checkAlias(args).then(function(record) {
      mangaDB.removeFromPM(record._id, msg.author);
      msg.channel.sendMessage("You are now no longer tracking ``" + args.replace(/@everyone/igm, "@\u200Beveryone").replace(/@here/igm, "@\u200Bhere") + "`` ✔");
    }).catch(function(e) {
      if (e == "Nothing found") {
        msg.channel.sendMessage("``" + args.replace(/@everyone/igm, "@\u200Beveryone").replace(/@here/igm, "@\u200Bhere") + "`` Is not a recognised name for any of the manga on mangastream.com, if you would like a list then please check http://mangastream.com/manga or do !mangalist");
      }
    })
  }
};

Commands.servermangatrack = {
  name: "mangatrack",
  help: "tbd",
  type: "weeb",
  lvl: 3,
  cooldown: 0,
  func: function(bot, msg, args) {

    var mentionVal = ""

    if (args.includes(" | ")) {
      mentionVal = args.substring(args.indexOf(" | ")+3)
      args = args.substring(0, args.indexOf(" | "))
    }

    mangaDB.checkAlias(args).then(function(record) {
      mangaDB.checkGuildChannel(msg.guild.id).then(function(r) {
        msg.channel.sendMessage("You are already tracking ``" + args.replace(/@everyone/igm, "@\u200Beveryone").replace(/@here/igm, "@\u200Bhere") + "`` in this server.");
      }).catch(function(e) {
        var obj = {
          guild_id: msg.guild.id,
          channel_id: msg.channel.id,
          mention: mentionVal
        }
        mangaDB.addGuildChannel(record._id, obj);
        msg.channel.sendMessage("You are now tracking ``" + args.replace(/@everyone/igm, "@\u200Beveryone").replace(/@here/igm, "@\u200Bhere") + "``. All new chapters will be linked in this channel ✔");
      })
    }).catch(function(e) {
      if (e == "Nothing found") {
        msg.channel.sendMessage("``" + args.replace(/@everyone/igm, "@\u200Beveryone").replace(/@here/igm, "@\u200Bhere") + "`` Is not a recognised name for any of the manga on mangastream.com, if you would like a list then please check http://mangastream.com/manga or do !mangalist");
      }
    })
  }
};

Commands.unservermangatrack = {
  name: "mangatrack",
  help: "tbd",
  type: "weeb",
  lvl: 3,
  cooldown: 0,
  func: function(bot, msg, args) {
    mangaDB.checkAlias(args).then(function(record) {
      mangaDB.checkGuildChannel(msg.guild.id).then(function(r) {
        mangaDB.removeGuildChannel(record._id, r);
        msg.channel.sendMessage("You are now no longer tracking ``" + args.replace(/@everyone/igm, "@\u200Beveryone").replace(/@here/igm, "@\u200Bhere") + "`` In this server.");
      }).catch(function(e) {
        msg.channel.sendMessage("You are already not tracking ``" + args.replace(/@everyone/igm, "@\u200Beveryone").replace(/@here/igm, "@\u200Bhere") + "`` in this server.");
      })
    }).catch(function(e) {
      if (e == "Nothing found") {
        msg.channel.sendMessage("``" + args.replace(/@everyone/igm, "@\u200Beveryone").replace(/@here/igm, "@\u200Bhere") + "`` Is not a recognised name for any of the manga on mangastream.com, if you would like a list then please check http://mangastream.com/manga or do !mangalist");
      }
    })
  }
};




// NSFW COMMANDS
Commands.rule34 = {
  name: "rule34",
  help: "tbd",
  type: "nsfw",
  lvl: 0,
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
  lvl: 0,
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
  lvl: 0,
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
  lvl: 0,
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
