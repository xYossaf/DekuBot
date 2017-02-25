var Discord = require("discord.js");
var youtubeNode = require("youtube-node");
var ytdl = require("ytdl-core");

var guildArray = []

exports.initGuildArray = function(bot) {
	for (i = 0; i < bot.guilds.array().length; i++) {
		if (bot.guilds.array()[i].voiceConnection) {
			var obj = {
				guildID: bot.guilds.array[i].id,
				skipArray: [],
				stream: '',
				songs: []
			}
			guildArray.push(obj)
		}
	}
}

exports.addToGuildArray = function(bot, guild) {
	var obj = {
		guildID: guild.id,
		skipArray: [],
		stream: '',
		songs: []
	}
	guildArray.push(obj)
};

exports.removeFromGuildArray = function(bot, guild) {
	for (i = 0; i < guildArray.length; i++) {
    if (guildArray[i].guildID == guild.id) {
      guildArray.splice(i, 1)
    }
  } 
};

exports.addToSongs = function(bot, guild, url) {
	for (x = 0; x < guildArray.length; x++) {
		(function(i) {

	    if (guildArray[i].guildID == guild.id) {
	    	//info
	    	if (guildArray[i].songs.length === 0) {
	    		guildArray[i].songs.push(url)
					const streamOptions = { seek: 0, volume: 0.3 };
				  const stream = ytdl(guildArray[i].songs[0], {filter : 'audioonly'});
				  stream.on('info', (info, format) => {
				  	//console.log(info)
				  	//console.log(format)
				  })
				  const dispatcher = guild.voiceConnection.playStream(stream, streamOptions)
				  guildArray[i].stream = dispatcher
				  
				  addListener(guildArray[i], guild)
					
	    	} else {
	    		guildArray[i].songs.push(url)
	    	}
	    }

		})(x)

  } 
};

var addListener = function(currentGuild, guild) {
	
	currentGuild.stream.on('end', () => {
		if (currentGuild.songs.length > 1) {

			const streamOptions = { seek: 0, volume: 0.3 };
	    const stream = ytdl(currentGuild.songs[1], {filter : 'audioonly'});
	    const dispatcher = guild.voiceConnection.playStream(stream, streamOptions)
			currentGuild.stream = dispatcher
			addListener(currentGuild, guild);

			currentGuild.songs.splice(0, 1)
		} else if (currentGuild.songs.length === 1) {
			currentGuild.songs.splice(0, 1)	
		}
	});
};

exports.clearSongs = function(bot, guild) {
	for (i = 0; i < guildArray.length; i++) {
    if (guildArray[i].guildID == guild.id) {
      guildArray[i].songs = []
      exports.endSong(bot, guild)
    }
  } 
};

exports.skipSong = function(bot, voiceChannel, id, channel) {
	for (x = 0; x < guildArray.length; x++) {
		(function(i) {		
	    if (guildArray[i].guildID == voiceChannel.guild.id) {
	   		if (skipCheck(id, guildArray[i])) {
	   			guildArray[i].skipArray.push(id)
	   			channel.sendMessage("```Votes to skip current song: " + guildArray[i].skipArray.length + " / " + Math.ceil((voiceChannel.members.array().length-1)/2) + "```")
		      if ((guildArray[i].skipArray.length) / (voiceChannel.members.array().length-1) >= 0.5) {
		      	exports.endSong(bot, voiceChannel.guild)
		      	guildArray[i].skipArray = []
		      	channel.sendMessage("```Skipping song...```")
		      }
	   		}
	    }
    })(x)
  }
};

exports.endSong = function(bot, guild) {
	for (x = 0; x < guildArray.length; x++) {
		(function(i) {
			if (guildArray[i].guildID == guild.id) {

	    	guildArray[i].stream.end()

	    }
		})(x)
  } 
};

var skipCheck = function(id, guild) {
	for (i = 0; i < guild.skipArray.length; i++) {
		if (guild.skipArray[i] == id) {
			return false
		}
	}
	return true
}
