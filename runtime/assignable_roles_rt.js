var config = require("../config.json"),
  Datastore = require('nedb');

var db = new Datastore({
  filename: './databases/assignable_roles_store',
  autoload: true
});

db.persistence.setAutocompactionInterval(30000);

exports.createNewRole = function(id, guild, name, colour, required) {//need to add an _id field whihc is the id of the role. make it all based on roles.
  var roledoc = {
    _id: id,
    guildID: guild.id,
    roleName: name,
    roleColour: colour,
    required: required,
    prompt: prompt
  };
  db.insert(roledoc, function (err, result) {
    if (err) {
      console.log('Error making role document! ' + err);
    } else if (result) {
    console.log('Success making a role doc');
    }
  });
};

exports.getRoleName = function(roleid) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({_id: roleid}, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('No role found');
        } else {
          resolve(res[0].faction_name);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.getRoleID = function(guildID, name) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({ $and:[{guildID: guildID}, {roleName: name}] }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('No role found');
        } else {
          resolve(res[0]._id);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.getRolesHere = function(guild) {
  var finalarray = [];
  return new Promise(function(resolve, reject) {
    try {
      db.find({guildID: guild.id}, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('No roles found')
        } else {
          for(role of res) {
            finalarray.push(role._id);
          };
          resolve(finalarray);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

// exports.checkNameClash = function(guild, name) {
//   return new Promise(function(resolve, reject) {
//     try {
//       db.find({guildID: guild.id}, function(err, res) {
//         if (err) {
//           return reject(err);
//         }
//         if (res.length === 0) {
//           resolve('No factions found for this server');
//         } else {
//       for (result of res) {
//         if (result.faction_name == name) {
//           return reject('A faction with this name already exists on this server.');
//         }
//       };
//       resolve("Name available");
//         }
//       });
//     } catch (e) {
//       reject(e);
//     }
//   });
// };

exports.deleteRole = function(id) {
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
