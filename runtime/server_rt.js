var config = require("../config.json"),
  Datastore = require('nedb');

var db = new Datastore({
  filename: './runtime/databases/server_store',
  autoload: true
});

db.persistence.setAutocompactionInterval(30000);

exports.newServer = function(server) {
  var serverdoc = {
    _id: server.id,
    superuser_id: server.owner.id,
    nsfw: false,
	spoiler: false,
	joinmsg: 'default',
	leavemsg: 'default',
	announcmentchannel: server.defaultChannel.name,
	spoilerchannels: [],
	nsfwchannels: [],
	ignoredchannels: []
  };
	db.insert(serverdoc, function (err, result){
    if (err) {
      console.log('Error making server document! ' + err);
    } else if (result) {
	  console.log('Sucess making an serverDB doc');
    }
  });
};

exports.togglensfw = function(serverid) {
	db.find({
    _id: serverid
  }, function(err, result) {
    if (result.length === 0) {
      this.newServer(server);
    } else {
      if (result[0] === undefined) {
        this.newServer(server);
        return;
      }
      if (result[0].nsfw == true) {
        db.update({
          _id: serverid
        }, {
          $set: {
            nsfw: false
          }
        }, {});
      } else {
		db.update({
		_id: serverid
		}, {
	 	  $set: {
			nsfw: true
			}
		}, {});
	  }
    }
  });
}

exports.togglespoiler = function(serverid) {
	db.find({
    _id: serverid
  }, function(err, result) {
    if (result.length === 0) {
      return;
    } else {
      if (result[0] === undefined) {
        return;
      }
      if (result[0].spoiler == true) {
        db.update({
          _id: serverid
        }, {
          $set: {
            spoiler: false
          }
        }, {});
      } else {
		db.update({
		_id: serverid
		}, {
	 	  $set: {
			spoiler: true
			}
		}, {});
	  }
    }
  });
}

exports.getJoinmsg = function(serverid) {
	return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: serverid
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('No message');
        } else {
          resolve(res[0].joinmsg);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.getLeavemsg = function(serverid) {
	return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: serverid
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('No message');
        } else {
          resolve(res[0].leavemsg);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.getAnnouncementChannel = function(serverid) {
	return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: serverid
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('No message');
        } else {
		  console.log(res[0].announcmentchannel);
          resolve(res[0].announcmentchannel);
        }
      });
    } catch (e) {
      reject(e);
    }
  });

};

exports.getServerNum = function() {
	return new Promise(function(resolve, reject) {
    try {
      db.count({
      }, function(err, count) {
        if (err) {
          return reject(err);
        }
        if (count === 0) {
          return reject('No message');
        } else {
          resolve(count);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.getSuperUser = function(serverid) {
    return new Promise(function(resolve, reject) {
    try {
      db.find({
		_id: serverid
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.superuser === undefined) {
          return reject('No id');
        } else {
          resolve(res[0].superuser_id);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.check = function(server) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: server.id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('Nothing found!');
        } else {
          resolve('This server is known to the database.');
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.ignoreChannel = function(channel) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: channel.server.id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('Nothing found!');
        } else {
			db.update({
				_id: channel.server.id
			}, {
				$push: {
					ignoredchannels: channel.id
				}
			}, {});
          resolve('Channel now ignored');
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.unignoreChannel = function(channel) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: channel.server.id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('Nothing found!');
        } else {
			db.update({
				_id: channel.server.id
			}, {
				$pull: {
					ignoredchannels: channel.id
				}
			}, {});
          resolve('Channel now unignored');
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.checkIgnore = function(channel) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: channel.server.id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('Nothing found!');
        } else {
			if (res[0].ignoredchannels.length != 0 || res[0].ignoredchannels != undefined) {
				for (m of res[0].ignoredchannels) {
					(function(x, n) {
						if (n == x.id) {
							reject('This channel is ignored')
						}
					})(channel, m)
				};
			}
          resolve('Channel not ignored');
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.nsfwChannel = function(channel) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: channel.server.id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('Nothing found!');
        } else {
			db.update({
				_id: channel.server.id
			}, {
				$push: {
					nsfwchannels: channel.id
				}
			}, {});
          resolve('Channel now nsfw');
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.unNSFWChannel = function(channel) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: channel.server.id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('Nothing found!');
        } else {
			db.update({
				_id: channel.server.id
			}, {
				$pull: {
					nsfwchannels: channel.id
				}
			}, {});
          resolve('Channel now not nsfw');
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.checkNSFW = function(channel) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
        _id: channel.server.id
      }, function(err, res) {
        if (err) {
          return reject(err);
        }
        if (res.length === 0) {
          return reject('Nothing found!');
        } else {
			if (res[0].nsfwchannels.length != 0 || res[0].nsfwchannels != undefined) {
				for (m of res[0].nsfwchannels) {
					(function(x, n) {
						if (n == x.id) {
							reject('This channel is nsfw')
						}
					})(channel, m)
				};
			}
          resolve('Channel is not nsfw');
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};
