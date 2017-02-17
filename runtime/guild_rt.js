var config = require("../config.json"),
  Datastore = require('nedb');

var db = new Datastore({
  filename: './runtime/databases/guild_store',
  autoload: true
});

db.persistence.setAutocompactionInterval(30000);
//*TODO* Add blacklist field
exports.newGuild = function(guild) {
  var guild_doc = {
  _id: guild.id,
  superuser_id: guild.owner.id,
  joinmsg: 'default',
  leavemsg: 'default',
  announcmentchannel: guild.defaultChannel.id,
  nsfwchannels: [],
  ignoredchannels: [],
  prefix: '!',
  welcomePM: false,
  factionPM: false
  };
  db.insert(guild_doc, function (err, result) {
    if (err) {
      console.log('Error making guild document! ' + err);
    } else if (result) {
    console.log('Sucess making a guildDB doc');
    }
  });
};

exports.get = function(guild_id) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: guild_id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('Nothing found');
        } else {
          resolve(res[0]);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.getPrefix = function(guild_id) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: guild_id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('Nothing found!');
        } else {
          resolve(res[0].prefix);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.setPrefix = function(guild_id, prefix) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: guild_id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('Nothing found!');
        } else {
          db.update({
            _id: guild_id
          }, {
            $set: {
              prefix: prefix
            }
          }, {});
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.getJoinmsg = function(guild_id) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: guild_id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('No message');
        } else {
          resolve(res[0].joinmsg);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.setJoinmsg = function(guild_id, message) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: guild_id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('No message');
        } else {
          db.update({
            _id: guild_id
          }, {
            $set: {
              joinmsg: message
            }
          }, {});
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.getLeavemsg = function(guild_id) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: guild_id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('No message');
        } else {
          resolve(res[0].leavemsg);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.setLeavemsg = function(guild_id, message) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: guild_id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('No message');
        } else {
          db.update({
            _id: guild_id
          }, {
            $set: {
              leavemsg: message
            }
          }, {});
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.getAnnouncementChannel = function(guild_id) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: guild_id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('No message');
        } else {
          resolve(res[0].announcmentchannel);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.setAnnouncementChannel = function(channel) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: channel.guild.id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('No message');
        } else {
          db.update({
            _id: channel.guild.id
          }, {
            $set: {
              announcmentchannel: channel.id
            }
          }, {});
        }
      });
    } catch (e) {
      reject(e);
    }
  });

};

exports.getGuildNum = function() {
  return new Promise(function(resolve, reject) {
    try {
      db.count({
      }, function(err, count) {
        if (err) {
          return reject(err);
        }
        if (count === 0) {
          return reject('No message');
        } else {
          resolve(count);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.getSuperUser = function(guild_id) {
    return new Promise(function(resolve, reject) {
    try {
      db.find({
    _id: guild_id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.superuser === undefined) {
          return reject('No id');
        } else {
          resolve(res[0].superuser_id);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.check = function(guild) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: guild.id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('Nothing found!');
        } else {
          resolve('This guild is known to the database.');
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.ignoreChannel = function(channel) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: channel.guild.id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('Nothing found!');
        } else {
      db.update({
        _id: channel.guild.id
      }, {
        $addToSet: {
          ignoredchannels: channel.id
        }
      }, {});
          resolve('Channel now ignored');
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.unignoreChannel = function(channel) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: channel.guild.id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('Nothing found!');
        } else {
      db.update({
        _id: channel.guild.id
      }, {
        $pull: {
          ignoredchannels: channel.id
        }
      }, {});
          resolve('Channel now unignored');
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.checkIgnore = function(channel) {

  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: channel.guild.id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('Nothing found!');
        } else {
      if (res[0].ignoredchannels.length != 0 || res[0].ignoredchannels != undefined) {
        for (m of res[0].ignoredchannels) {
          (function(x, n) {
            if (n == x.id) {
              reject('This channel is ignored')
            }
          })(channel, m)
        };
      }
          resolve('Channel not ignored');
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.nsfwChannel = function(channel) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: channel.guild.id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('Nothing found!');
        } else {
      db.update({
        _id: channel.guild.id
      }, {
        $addToSet: {
          nsfwchannels: channel.id
        }
      }, {});
          resolve('This channel is now nsfw 😳');
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.unNSFWChannel = function(channel) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: channel.guild.id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('Nothing found!');
        } else {
      db.update({
        _id: channel.guild.id
      }, {
        $pull: {
          nsfwchannels: channel.id
        }
      }, {});
          resolve('This channel is now sfw ✔');
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.checkNSFW = function(channel) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: channel.guild.id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('Nothing found!');
        } else {
      if (res[0].nsfwchannels.length != 0 || res[0].nsfwchannels != undefined) {
        for (m of res[0].nsfwchannels) {
          (function(x, n) {
            if (n == x.id) {
              reject('This channel is nsfw')
            }
          })(channel, m)
        };
      }
          resolve('This channel is not nsfw sorry 😳');
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.deleteGuild = function(guild) {
  return new Promise(function(resolve, reject) {
    try {
      db.remove({
        _id: guild.id
      }, {}, function(err, nr) {

        if (err) {
          return reject(err);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.checkWelcomePM = function(guild_id) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: guild_id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('No guild found');
        } else {
          resolve(res[0].welcomePM);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.checkFactionPM = function(guild_id) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: guild_id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('No guild found');
        } else {
          resolve(res[0].factionPM);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.toggleWelcomePM = function(guild_id) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: guild_id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('Nothing found!');
        } else {
          if (res[0].welcomePM == true) {
            db.update({
              _id: guild_id
            }, {
              $set: {
                welcomePM: false
              }
            }, {});
            resolve('The welcome message will now not be sent in a private message.')
          } else if (res[0].welcomePM == false) {
            db.update({
              _id: guild_id
            }, {
              $set: {
                welcomePM: true
              }
            }, {});
            resolve('The welcome message will now be sent in a private message to each new member.')
          }
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.toggleFactionPM = function(guild_id) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: guild_id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('Nothing found!');
        } else {
          if (res[0].factionPM == true) {
            db.update({
              _id: guild_id
            }, {
              $set: {
                factionPM: false
              }
            }, {});
            resolve('The faction join prompt message will now not be sent in a private message.')
          } else if (res[0].factionPM == false) {
            db.update({
              _id: guild_id
            }, {
              $set: {
                factionPM: true
              }
            }, {});
            resolve('The faction join prompt message will now be sent in a private message to each new member.')
          }
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};
