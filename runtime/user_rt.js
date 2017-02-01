var config = require("../config.json"),
  Datastore = require('nedb');

var db = new Datastore({
  filename: './runtime/databases/user_store',
  autoload: true
});

db.persistence.setAutocompactionInterval(30000);

exports.trackUser = function(user) {
  var userdoc = {//need to get rid of the factions parameter entirely. Pointless. Replace with the blacklist parameter
    _id: user.id,
    known_names: [user.username],
    blacklisted: false
  };
  db.insert(userdoc, function(err, result) {
    if (err) {
      console.log('Error making user document! ' + err);
    } else if (result) {
    console.log('Sucess making an UserDB doc');
    }
  });
};

exports.nameChange = function(user) {
try {
  db.find({
    _id: user.id
  }, function(err, result) {
    if(!err && result.length > 0) {
    if (result[0].known_names.length > 20) {
      db.update({
        _id: user.id
      }, {
        $pop: {
        known_names: 1
        }
      }, {});
        }
    }

   });
  db.update({
    _id: user.id
  }, {
    $push: {
      known_names: user.username
    }
  }, {});
} catch (e) {
  console.log(e);
}

};

exports.returnNamechanges = function(user) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: user.id
      }, function(err, result) {
        if (err) {
          return reject(err);
        }
        if (result) {
          if (result.length === 0) {
            return reject('Nothing found!');
          }
          if (result[0].known_names.length > 1) {
            resolve(result[0].known_names);
          } else {
            return reject('No changes found!');
          }
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.check = function(user) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: user.id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('Nothing found!');
        } else {
          resolve('This user is known to the database.');
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};
