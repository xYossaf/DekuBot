var config = require("../config.json"),
  Datastore = require('nedb');

var db = new Datastore({
  filename: './runtime/databases/faction_store',
  autoload: true
});

db.persistence.setAutocompactionInterval(30000);

exports.createNewFaction = function(id, server, name, colour, permissions) {//need to add an _id field whihc is the id of the role. make it all based on roles.
  var factiondoc = {
    _id: id,
    server_id: server.id,
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

exports.getFactionID = function(serverid, name) {
	return new Promise(function(resolve, reject) {
    try {
      db.find({ $and:
	  [{
        server_id: serverid
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

exports.getFactionsHere = function(server) {
	var finalarray = [];
	return new Promise(function(resolve, reject) {
    try {
      db.find({
        server_id: server.id
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

exports.checkNameClash = function(server, name) {
	return new Promise(function(resolve, reject) {
    try {
      db.find({
        server_id: server.id
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
