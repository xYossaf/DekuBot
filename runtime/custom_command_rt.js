var config = require("../config.json"),
  Datastore = require('nedb');

var db = new Datastore({
  filename: './runtime/databases/custom_command_store',
  autoload: true
});

db.persistence.setAutocompactionInterval(30000);

exports.createNewCommand = function(name, server, text, lvl) {
  var commanddoc = {
    server_id: server.id,
    name: name,
    text: text,
    lvl: lvl
  };
	db.insert(commanddoc, function (err, result) {
    if (err) {
      console.log('Error making command document! ' + err);
    } else if (result) {
	  console.log('Sucess making a command doc');
    }
  });
};

exports.getAllHere = function(server) {
	return new Promise(function(resolve, reject) {
    try {
      db.find({ $and:
	  [{
        server_id: server.id
      }, {
		_id: /[0-9]/
	  }] }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          resolve('No custom commands found');
        } else {
			       resolve(res);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.deleteCommand = function(server, name) {
	return new Promise(function(resolve, reject) {
    try {
      db.find({ $and:
	  [{
        server_id: server.id
      }, {
		name: name
	  }] }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('No custom commands with this name found');
        } else {
          db.remove({
            _id: res[0]._id
          }, {}, function(err, nr) {
            if (err) {
              return reject(err);
            }
            if (nr >= 1) {
              resolve('Command `' + name + '` has been deleted.');
            }
          });
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};
