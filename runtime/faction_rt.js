var config = require("../config.json"),
  Datastore = require('nedb');

var db = new Datastore({
  filename: './runtime/databases/faction_store',
  autoload: true
});

db.persistence.setAutocompactionInterval(30000);

exports.createNewFaction = function(id, guild, name, colour, permissions) {//need to add an _id field whihc is the id of the role. make it all based on roles.
  var factiondoc = {
    _id: id,
    guild_id: guild.id,
    faction_name: name,
    faction_colour: colour,
    permissions: permissions
  };
  db.insert(factiondoc, function (err, result){
    if (err) {
      console.log('Error making faction document! ' + err);
    } else if (result) {
    console.log('Sucess making a faction doc');
    }
  });
};

exports.getFactionName = function(factionid) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: factionid
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('No faction found');
        } else {
      resolve(res[0].faction_name);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.getFactionID = function(guild_id, name) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({ $and:
    [{
        guild_id: guild_id
      }, {
    faction_name: name
    }] }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('No faction found');
        } else {
      resolve(res[0]._id);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.getFactionsHere = function(guild) {
  var finalarray = [];
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        guild_id: guild.id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('No factions found');
        } else {
          for(faction of res) {
            finalarray.push(faction._id);
          };
          resolve(finalarray);
        };
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.checkNameClash = function(guild, name) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        guild_id: guild.id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          resolve('No factions found for this server');
        } else {
      for (result of res) {
        if (result.faction_name == name) {
          return reject('A faction with this name already exists on this server.');
        }
      };
      resolve("Name available");
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.deleteFaction = function(id) {
  return new Promise(function(resolve, reject) {
    try {
      db.remove({
        _id: id
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
