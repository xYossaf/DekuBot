var config = require("../config.json"),
  Datastore = require('nedb');

var db = new Datastore({
  filename: './databases/manga_track_store',
  autoload: true
});

db.persistence.setAutocompactionInterval(30000);

exports.trackManga = function(url, chap, name) {
  var mangadoc = {
    url: url,
    chapter: chap,
    aliases: [name],
    pm_array: [],
    guild_channel_array: []
  };
  db.insert(mangadoc, function(err, result) {
    if (err) {
      console.log('Error making manga document! ' + err);
    } else if (result) {
    console.log('Sucess making a manga doc');
    }
  });
};

exports.check = function(url) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
      url: url
      }, function(err, result) {
        if (err) {
          console.log(err)
        } else if (result.length == 0) {
          resolve("No doc found")
        } else {
          resolve("Doc found")
        }
       });
    } catch (e) {
      reject(e);
    }
  });
};

exports.checkAlias = function(name) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
      _id: /[0-9]|[^0-9]/
      }, function(err, result) {
        if(!err || result.length > 0) {
          returnArray = [];
          for (i = 0; i < result.length; i++ ) {
            for (j = 0; j < result[i].aliases.length; j++) {
              if (result[i].aliases[j] == name) {
                resolve(result[i]);
              }
            }
          }
          reject("Nothing found");
        }
       });
    } catch (e) {
      reject(e);
    }
  });
};

exports.checkGuildChannel = function(id) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
      _id: /[0-9]|[^0-9]/
      }, function(err, result) {
        if(!err || result.length > 0) {
          returnArray = [];
          for (i = 0; i < result.length; i++ ) {
            for (j = 0; j < result[i].guild_channel_array.length; j++) {
              if (result[i].guild_channel_array[j].guild_id == id) {
                resolve(result[i].guild_channel_array[j]);
              }
            }
          }
          reject("Nothing found");
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
      db.find({
      _id: /[0-9]|[^0-9]/
      }, function(err, result) {
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

exports.updateChapter = function(id, chap) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
    _id: id
    }, function(err, result) {
      if(!err && result.length > 0) {
      if (result[0].chapter != chap) {
        db.update({
          _id: id
        }, {
          $set: {
          chapter: chap
          }
        }, {});
      }
      }

     });
    } catch (e) {
      reject(e);
    }
  });
};

exports.addGuildChannel = function(id, guild_channel) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('Nothing found!9');
        } else {
      db.update({
        _id: id
      }, {
        $addToSet: {
          guild_channel_array: guild_channel
        }
      }, {});
          resolve('User now tracking');
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.removeGuildChannel = function(id, guild_channel) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('Nothing found!');
        } else {
          db.update({
            _id: id
          }, {
            $pull: {
              guild_channel_array: guild_channel
            }
          }, {});
          resolve('User now not tracking');
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.updateMention = function(id, mention) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
    _id: id
    }, function(err, result) {
      if(!err && result.length > 0) {
      if (result[0].mention != mention) {
        db.update({
          _id: id
        }, {
          $set: {
          mention: mention
          }
        }, {});
      }
      }

     });
    } catch (e) {
      reject(e);
    }
  });
};

exports.addToPM = function(id, user) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('Nothing found!9');
        } else {
      db.update({
        _id: id
      }, {
        $addToSet: {
          pm_array: user.id
        }
      }, {});
          resolve('User now tracking');
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.removeFromPM = function(id, user) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('Nothing found!');
        } else {
          db.update({
            _id: id
          }, {
            $pull: {
              pm_array: user.id
            }
          }, {});
          resolve('User now not tracking');
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.removeFromAllHere = function(guild, user) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        guild_id: guild.id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('Nothing found!');
        } else {
          for (i=0; i < res.length; i++) {
            db.update({
              _id: res[i]._id
            }, {
              $pull: {
                pm_array: user.id
              }
            }, {});

          }
          resolve('User now not tracking');
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
      db.find({
        guild_id: guild.id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('Nothing found!');
        } else {
          for (i=0; i < res.length; i++) {
            db.remove({
              _id: res[i]._id
            }, {}, function(err, nr) {
              if (err) {
                return reject(err);
              }
            });
          }
          resolve('User now not tracking');
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.get = function(id) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
      _id: id
      }, function(err, result) {
        if(!err && result.length > 0) {
          resolve(result[0]);
        }
       });
    } catch (e) {
      reject(e);
    }
  });
};

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
          return reject('Not tracking a manga with this name');
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
