var config = require("../config.json"),
  Datastore = require('nedb');

var db = new Datastore({
  filename: './databases/permission_store',
  autoload: true
});

db.persistence.setAutocompactionInterval(30000);

exports.newPermission = function(guild, user) {
  var permissiondoc = {
  _id: (user.id.toString() + "^_^" + guild.id.toString()),
    user_id: user.id,
    guild_id: guild.id,
    permission_lvl: 0
  };
  db.insert(permissiondoc, function (err, result){
    if (err) {
      console.log('Error making permission document! ' + err);
    } else if (result) {
    console.log('Sucess making an permissionDB doc');
    }
  });
};

exports.SuperUserPermission = function(guild) {
  var permissiondoc = {
    _id: (guild.owner.id.toString() + "^_^" + guild.id.toString()),
    user_id: guild.owner.id,
    guild_id: guild.id,
    permission_lvl: 6
  };
  db.insert(permissiondoc, function (err, result){
    if (err) {
      console.log('Error making permission document! ' + err);
    } else if (result) {
    console.log('Sucess making an permissionDB doc');
    }
  });
};

exports.getPermission = function(guild_id, userid) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: (userid.toString() + "^_^" + guild_id.toString())
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('No user permission');
        } else {
      resolve(res[0].permission_lvl);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.setPermission = function(authorlvl, guild, user, num) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: (user.id.toString() + "^_^" + guild.id.toString())
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('No user permission found');
        } else {
      if ((res[0].permission_lvl < authorlvl) && (num < authorlvl)) {
        db.update({
          _id: (user.id.toString() + "^_^" + guild.id.toString())
        }, {
          $set: {
            permission_lvl: Number(num)
          }
        }, {});
        resolve("'s permission level has been changed to " + num)
      } else {
        return reject("The permission level you are trying to change/change to is greater than or equal to yours");
      }
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.check = function(guild_id, userid) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: (userid.toString() + "^_^" + guild_id.toString())
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('Nothing found!');
        } else {
          resolve('This permission is known to the database.');
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.deletePermission = function(guild, user) {
  db.remove({
    _id: (user.id.toString() + "^_^" + guild.id.toString())
  }, {},
  function(err, numRemoved) {

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
