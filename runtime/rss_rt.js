var FeedParser = require('feedparser');
var request = require('request');
var Discord = require("discord.js");
var config = require("../config.json"),
  Datastore = require('nedb');

var db = new Datastore({
  filename: './databases/rss_store',
  autoload: true
});

db.persistence.setAutocompactionInterval(30000);

exports.trackRSS = function(id, isUser, url, filter, ts) {
  var rssdoc = {
    discordID: id,
    isUser: isUser,
    url: url,
    filter: filter,
    timestamp: ts
  };
  db.insert(rssdoc, function(err, result) {
    if (err) {
      console.log('Error making rss document! ' + err);
    } else if (result) {
    console.log('Sucess making rss doc');
    }
  });
};

exports.checkAllRSS = function(bot) {
  var timercheck = 30000;
  var check = function() {
    var checkedURLArray = []
    exports.getAll().then(function(rssArray) {
      for (rss of rssArray) {
        if (!checkedURLArray.includes(rss.url)) {
          exports.checkRSS(rss.url, bot)
          checkedURLArray.push(rss.url)
        }
      }
    })
  }
  check();
  var timer = setInterval(check, timercheck);
}

exports.checkRSS = function(url, bot) {
  exports.getByURL(url).then(function(res) {
    exports.parseRSS(url).then(function(articleArray) {
      if (res.length > 1) {
        for (rss of res) {
          checkTS(articleArray, rss, bot)      
        }
      } else {
        checkTS(articleArray, res, bot)  
      }
    }).catch(function(e) {
      console.log(e)
    })
        
  })
}

exports.parseRSS = function(url) {
  return new Promise(function(resolve, reject) {
    var articleArray = []
    
    var req = request(url)
    var feedparser = new FeedParser()

    req.on('error', function (error) {
      reject(error)
    });

    req.on('response', function (res) {
      var stream = this

      if (res.statusCode !== 200) {
        this.emit('error', new Error('Bad status code'))
      } else {
        stream.pipe(feedparser)
      }
    })

    feedparser.on('error', function (error) {
      reject(error)
    })

    feedparser.on('readable', function () {
        var stream = this 
        var article = stream.read()
        articleArray.push(article)
    })

    feedparser.on('end', function () {
      resolve(articleArray);
    })
  })
}

var checkTS = function(articleArray, rss, bot) {
  var filteredArray = articleFilter(articleArray, rss.filter)
  filteredArray = filteredArray.reverse()
  for (artic of filteredArray) {
    (function(article) {
      var newTS = new Date(article.date)
      var newTS = newTS.getTime()
      if (newTS > rss.timestamp) {
        makePost(article, rss, bot)
        exports.updateTS(rss._id, newTS)
      }
    })(artic)
  }
}

var articleFilter = function(articleArray, filter) {
  var regex = new RegExp(filter, "gi")
  var filteredArray = []
  for (article of articleArray) {
    if (article) {
      try {
        if (filter == "") {
          filteredArray.push(article)
        } else {
          if (article.title) {
            if (article.title.match(regex)) {
              filteredArray.push(article)
              continue
            }
          }
          if (article.description) {
            if (article.description.match(regex)) {
              filteredArray.push(article)
              continue
            }
          }
          if (article.summary) {
            if (article.summary.match(regex)) {
              filteredArray.push(article)
              continue
            }
          }
          if (article.link) {
            if (article.link.match(regex)) {
              filteredArray.push(article)
              continue
            }
          }
          if (article.author) {
            if (article.author.match(regex)) {
              filteredArray.push(article)
              continue
            }
          }
        }
      } catch (e) {
        console.log(e)
      }
      
    }
  }
  if (filteredArray.length > 5) {
    filteredArray = filteredArray.slice(0, 5)
  }
  
  return filteredArray

}

var makePost = function(article, rss, bot) {
  var data = new Discord.RichEmbed(data);
  var upndown = require('upndown');

  var und = new upndown();
  und.convert(article.summary, function(err, markdown) {
      if(err) { console.log(err) }
      else { data.setDescription(unescape(markdown.substring(0, 2000))) } // Outputs: # Hello, World !
  })

  data.setColor('#FF7B0A')
  data.setTitle(article.title.substring(0, 500))
  data.setAuthor(article.meta.title, 'http://icons.iconarchive.com/icons/cornmanthe3rd/plex/512/Communication-RSS-icon.png')
  data.setImage(article.image.url)
  data.setURL(article.link)
  data.setTimestamp(article.date)

  if (rss.isUser) {
    bot.users.get(rss.discordID).sendEmbed(data)
  } else {
    bot.channels.get(rss.discordID).sendEmbed(data)
  } 
}

exports.check = function(url, id, filter) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({ $and:[{url: url}, {discordID: id}] }, function(err, result) {
        if (err) {
          console.log(err)
        } else if (result.length == 0) {
          resolve("No doc found")
        } else {
          for (res of result) {
            if (res.filter == "") {
              resolve("tracking all")
            } else if (res.filter == filter) {
              resolve("same filter")
            } else {
              if (filter == "") { 
                exports.deleteTrack(res._id)
              }
              resolve("No doc found")  
            }
          }
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};


exports.getAll = function() {
  return new Promise(function(resolve, reject) {
    try {
      db.find({_id: /[0-9]|[^0-9]/}, function(err, result) {
        if(!err || result.length > 0) {
          returnArray = [];
          for (i = 0; i < result.length; i++ ) {
            returnArray.push(result[i])
          }
          resolve(returnArray);
        }
       });
    } catch (e) {
      reject(e);
    }
  });
};

exports.updateTS = function(id, ts) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({_id: id}, function(err, result) {
      if(!err && result.length > 0) {
        if (result[0].timestamp != ts) {
          db.update({_id: id}, {$set: {
              timestamp: ts
          }}, {});
        }
      }
     });
    } catch (e) {
      reject(e);
    }
  });
};


exports.getByURL = function(url) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
      url: url
      }, function(err, result) {
        if(!err && result.length > 0) {
          if (result.length == 1) {
            resolve(result[0]);
          } else {
            resolve(result)
          }
        }
       });
    } catch (e) {
      reject(e);
    }
  });
};

exports.getByGuild = function(guild) {
  return new Promise(function(resolve, reject) {
    try {
      var returnArray = []
      db.find({isUser: false}, function(err, result) {
        if(!err && result.length > 0) {
          for (record of result) {
            if (guild.channels.has(record.discordID)) {
              returnArray.push(record)
            } 
          }
          if (returnArray.length > 0) {
            resolve(returnArray)
          } else {
            reject("No RSS found here")
          }
        } else {
          reject("No RSS found here")
        }
       });
    } catch (e) {
      reject(e);
    }
  })
}

exports.getByUser = function(user) {
  return new Promise(function(resolve, reject) {
    try {
      var returnArray = []
      db.find({isUser: true}, function(err, result) {
        if(!err && result.length > 0) {
          for (record of result) {
            if (user.id == record.discordID) {
              returnArray.push(record)
            } 
          }
          if (returnArray.length > 0) {
            resolve(returnArray)
          } else {
            reject("No RSS found here")
          }
        } else {
          reject("No RSS found here")
        }
       });
    } catch (e) {
      reject(e);
    }
  })
}

exports.deleteTrack = function(id) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
      _id: id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('Not tracking this rss feed');
        } else {
          db.remove({
            _id: res[0]._id
          }, {}, function(err, nr) {
            if (err) {
              return reject(err);
            }
            if (nr >= 1) {
              resolve('No longer tracking.');
            }
          });
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};