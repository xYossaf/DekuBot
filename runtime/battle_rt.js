var config = require("../config.json"),
  Datastore = require('nedb');

var db = new Datastore({
  filename: './runtime/databases/battle_store',
  autoload: true
});

db.persistence.setAutocompactionInterval(30000);

exports.createNewBattle = function(user, server) {
  var battledoc = {
    user_id: user.id,
    server_id: server.id,
    rp_name: "",
  	rp_desc: "",
    strength: 1,
    vitality: 1,
    agility: 1,
    armour: "",
    special: "",
    weapon: "",
    inventory: []
  };
	db.insert(battledoc, function (err, result){
    if (err) {
      console.log('Error making battle document! ' + err);
    } else if (result) {
	  console.log('Sucess making a battle doc');
    }
  });
};

exports.getBattleRecord = function(user, server) {
	return new Promise(function(resolve, reject) {
    try {
      db.find({ $and:
	  [{
        server_id: server.id
      }, {
		user_id: user.id
	  }] }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('No battle record found');
        } else {
			       resolve(res[0]);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};
