var config = require("../config.json"),
  Datastore = require('nedb');

var db = new Datastore({
  filename: './runtime/databases/battle_store',
  autoload: true
});

var enemy_list = [];

// var enemy = {
//   id: 1,
//   name: "lonely Pirate",
//   description: "boop",
//   level: 1,
//   strength: 1,
//   vitality: 1,
//   agility: 1
// }
//
// var enemy1 = {
//   id: 2,
//   name: "lonely marine",
//   description: "boop",
//   level: 1,
//   strength: 1,
//   vitality: 1,
//   agility: 1
// }
//
// var enemy2 = {
//   id: 3,
//   name: "lonely revolutionairy",
//   description: "boop",
//   level: 4,
//   strength: 2,
//   vitality: 2,
//   agility: 3
// }
//
// var enemy3 = {
//   id: 4,
//   name: "dad",
//   description: "boop",
//   level: 6,
//   strength: 3,
//   vitality: 2,
//   agility: 3
// }
//
// for (i = 0; i < 5; i++) {
//   enemy_list.push(enemy[i])
// }

db.persistence.setAutocompactionInterval(30000);

exports.createNewBattle = function(user, guild) {
  var battledoc = {
    user_id: user.id,
    guild_id: guild.id,
    rp_name: "",
  	rp_desc: "",
    strength: 1,
    vitality: 1,
    agility: 1,
    armour: "",
    special: "",
    weapon: "",
    exp: 0,
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

exports.getBattleRecord = function(user, guild) {
	return new Promise(function(resolve, reject) {
    try {
      db.find({ $and:
	  [{
        guild_id: guild.id
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

// exports.getEnemy = function(record) {
// 	return new Promise(function(resolve, reject) {
//     var val = false
//     try {
//       var check = function(level) {
//         var num = Math.random()*((enemylist.length) - 1) + 1
//         if (enemy_list[num].level == level
//         || enemy_list[num].level == level-1
//         || enemy_list[num].level == level+1) {
//           return num;
//         } else {
//           return false;
//         }
//       }
//       while (val == false) {
//         if (check(record.level) == false) {
//           return;
//         } else {
//           val == num
//         }
//       }
//       if (escape != false) {
//         resolve(enemy_list[val])
//       }
//     } catch (e) {
//       reject(e);
//     }
//   });
// };
