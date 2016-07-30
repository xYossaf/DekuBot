var config = require("../config.json"),
	Datastore = require('nedb');
	
var db = new Datastore({
  filename: './runtime/databases/manga_track_store',
  autoload: true
});

db.persistence.setAutocompactionInterval(30000);

exports.trackManga = function(urls, chap, msg) { 
  var mangadoc = {
    url: urls,
    chapter: chap,
	server_id: msg.server.id,
	channel_id: msg.channel.id
  };
  db.insert(mangadoc, function(err, result) {
    if (err) {
      console.log('Error making manga document! ' + err); 
    } else if (result) {
	  console.log('Sucess making an manga doc');
    }
  });
};
  
exports.getAll = function() {
	return new Promise(function(resolve, reject) {
		try {
			db.find({
			_id: /[0-9]/
		  }, function(err, result) {
			  if(!err || result.length > 0) {
				returnArray = [];  
				for (i = 0; i < result.length; i++ ) {
					returnArray.push(result[i])
				}
				resolve(returnArray);
			  }
			  
		   });
		} catch (e) {
			reject(e);
		}
	});
};

exports.updateChapter = function(id, chap) {
  return new Promise(function(resolve, reject) {
    try {
      db.find({
		_id: id
	  }, function(err, result) {
		  if(!err || result.length > 0) {
			if (result[0].chapter != chap) {
				db.update({
				  _id: id
				}, {
				  $set: {
					chapter: chap
				  }
				}, {});
			}
		  }
		  
	   });
    } catch (e) {
      reject(e);
    }
  });
};














