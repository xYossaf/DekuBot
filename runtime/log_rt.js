var config = require("../config.json"),
  Datastore = require('nedb');

var db = new Datastore({
  filename: './databases/log_store',
  autoload: true
});

db.persistence.setAutocompactionInterval(30000);

exports.createNewLog = function(guild, channel, type) {
  var logdoc = {
    guildID: guild.id,
    channelID: channel.id,
    type: type
  };
  db.insert(logdoc, function (err, result) {
    if (err) {
      console.log('Error making log document! ' + err);
    } else if (result) {
    console.log('Success making a log doc');
    }
  });
};


exports.getLogID = function(guildID, type) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({ $and:[{guildID: guildID}, {type: type}] }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('No log found');
        } else {
          resolve(res[0]._id)
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.getLogChannel = function(guild, type) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({ $and:[{guildID: guild.id}, {type: type}] }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('No log found')
        } else {
          resolve(res[0].channelID);
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
      db.find({guildID: guild.id}, function(err, result) {
        if(!err && result.length > 0) {
          resolve(result)
        } else {
          reject("No logs found here")
        }
       });
    } catch (e) {
      reject(e);
    }
  })
}

exports.checkLog = function(guild, type) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({ $and:[{guildID: guild.id}, {type: type}] }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          resolve('No log found')
        } else {
          reject("exists")
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.checkLogAll = function(guild) {
  return new Promise(function(resolve, reject) {
    try {
      var typeArray = ["traffic", "kicks", "bans", "deletes", "warnings", "channels", "roles", "emojis", "voice"]
      var returnArray = []
      var i = 0
      function pushItem(type, callback) {
        returnArray.push(type)
        i++
        callback()
      }

      function next() {
        if (i < typeArray.length) {
          exports.checkLog(guild, typeArray[i]).then(function(r) {
            pushItem(typeArray[i], next)
          }).catch(function(e) {
            if (e == 'exists') {
              i++
              next()  
            }
          })
        } else {
          resolve(returnArray)
        }
      }
      next()
    } catch (e) {
      reject(e);
    }
  });
};

exports.deleteLog = function(id) {
  return new Promise(function(resolve, reject) {
    try {
      db.remove({_id: id}, {}, function(err, nr) {
        if (err) {
          return reject(err);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.deleteAllHere = function(guild) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({guildID: guild.id}, function(err, result) {
        if (!err || result.length > 0) {
          for (i = 0; i < result.length; i++) {
            db.remove({_id: result[i]._id}, {}, function(err, nr) {
              if (err) {
                return reject(err);
              }
            })
          }
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};
