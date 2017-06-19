var config = require("../config.json"),
  Datastore = require('nedb');

var db = new Datastore({
  filename: './databases/reddit_track_store',
  autoload: true
});

db.persistence.setAutocompactionInterval(30000);

exports.trackSubreddit = function(name, msg) {
  var redditdoc = {
    subreddit_name: name,
    guild_id: msg.guild.id,
    channel_id: msg.channel.id,
    last_id: 0
  };
  db.insert(redditdoc, function(err, result) {
    if (err) {
      console.log('Error making reddit document! ' + err);
    } else if (result) {
    console.log('Sucess making a reddit doc');
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

exports.deleteAllHere = function(guild) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        guild_id: guild.id
      }, function(err, result) {
        if (!err || result.length > 0) {
          for (i = 0; i < result.length; i++ ) {
            db.remove({
              _id: result[i]._id
            }, {}, function(err, nr) {
              
              if (err) {
                return reject(err);
              }
            });
          }
        }
       });
    } catch (e) {
      reject(e);
    }
  });
};

exports.updateLastPost = function(id, postid) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
    _id: id
    }, function(err, result) {
      if(!err && result.length > 0) {
        if (result[0].last_id != postid) {
          db.update({
            _id: id
          }, {
            $set: {
            last_id: postid
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

exports.deleteTrack = function(guild, name) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({ $and:
    [{
        guild_id: guild.id
      }, {
    subreddit_name: name
    }] }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('Not tracking a subreddit with this name');
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

exports.deleteAllChannelHere = function(channel) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        channel_id: channel.id
      }, function(err, result) {
        if (!err || result.length > 0) {
          for (i = 0; i < result.length; i++ ) {
            db.remove({
              _id: result[i]._id
            }, {}, function(err, nr) {
              
              if (err) {
                return reject(err);
              }
            });
          }
        }
       });
    } catch (e) {
      reject(e);
    }
  });
};

