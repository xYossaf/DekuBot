var config = require("../config.json"),
  Datastore = require('nedb');

var db = new Datastore({
  filename: './runtime/databases/permission_store',
  autoload: true
});

db.persistence.setAutocompactionInterval(30000);

exports.newPermission = function(server, user) { 
  var permissiondoc = {
	_id: (user.id.toString() + "^_^" + server.id.toString()),  
    user_id: user.id,
    server_id: server.id,
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

exports.SuperUserPermission = function(server) { 
  var permissiondoc = {
    _id: (server.owner.id.toString() + "^_^" + server.id.toString()),
	user_id: server.owner.id,
    server_id: server.id,
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

exports.getPermission = function(serverid, userid) {
	return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: (userid.toString() + "^_^" + serverid.toString())
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

exports.setPermission = function(authorlvl, server, user, num) {
	return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: (user.id.toString() + "^_^" + server.id.toString())
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('No user permission found');
        } else {
			if ((res[0].permission_lvl < authorlvl) && (num < authorlvl)) {
				db.update({
					_id: (user.id.toString() + "^_^" + server.id.toString())
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

exports.check = function(serverid, userid) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: (userid.toString() + "^_^" + serverid.toString())
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

exports.deletePermission = function(server, user) {
	db.remove({
		_id: (user.id.toString() + "^_^" + server.id.toString())
	}, {}, 
	function(err, numRemoved) {
		console.log(numRemoved);
	});
};




