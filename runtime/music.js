var Discord = require("discord.js");
var youtubeNode = require("youtube-node");
var ytdl = require("ytdl-core");

var guildArray = []

exports.initGuildArray = function(bot) {
	for (i = 0; i < bot.guilds.array().length; i++) {
		if (bot.guilds.array()[i].voiceConnection) {
			var obj = {
				guildID: bot.guilds.array[i].id,
				skipCount: 0,
				stream: '',
				tracks: []
			}
			guildArray.push(obj)
		}
	}
}

exports.addToGuildArray = function(bot, guild) {
	var obj = {
		guildID: guild.id,
		skipCount: 0,
		stream: '',
		tracks: []
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

exports.addToTracks = function(bot, guild, url) {
	for (x = 0; x < guildArray.length; x++) {
		(function(i) {

	    if (guildArray[i].guildID == guild.id) {

	    	if (guildArray[i].tracks.length === 0) {
	    		guildArray[i].tracks.push(url)
					const streamOptions = { seek: 0, volume: 0.4 };
				  const stream = ytdl(guildArray[i].tracks[0], {filter : 'audioonly'});
				  const dispatcher = guild.voiceConnection.playStream(stream, streamOptions)
				  guildArray[i].stream = dispatcher
				  
				  addListener(guildArray[i], guild)
					
	    	} else {
	    		guildArray[i].tracks.push(url)
	    	}
	    }

		})(x)

  } 
};

var addListener = function(currentGuild, guild) {
	
	currentGuild.stream.on('end', () => {
		if (currentGuild.tracks.length > 1) {

			const streamOptions = { seek: 0, volume: 0.4 };
	    const stream = ytdl(currentGuild.tracks[1], {filter : 'audioonly'});
	    const dispatcher = guild.voiceConnection.playStream(stream, streamOptions)
			currentGuild.stream = dispatcher
			addListener(currentGuild, guild);

			currentGuild.tracks.splice(0, 1)
		} else if (currentGuild.tracks.length === 1) {
			currentGuild.tracks.splice(0, 1)	
		}
	});
};

exports.clearTracks = function(bot, guild) {
	for (i = 0; i < guildArray.length; i++) {
    if (guildArray[i].guildID == guild.id) {
      guildArray[i].tracks = []
      exports.endTrack(bot, guild)
    }
  } 
};

exports.skipTrack = function(bot, voiceChannel) {
	for (i = 0; i < guildArray.length; i++) {
    if (guildArray[i].guildID == voiceChannel.guild.id) {
      guildArray[i].skipCount++
      if (guildArray[i].skipCount / voiceChannel.members.array().length-1 > 0.5) {
      	exports.endTrack(bot, voiceChannel.guild)
      	guildArray[i].skipCount = 0
      }
    }
  }
};

exports.endTrack = function(bot, guild) {
	for (x = 0; x < guildArray.length; x++) {
		(function(i) {
			if (guildArray[i].guildID == guild.id) {

	    	guildArray[i].stream.end()

	    }
		})(x)
  } 
};
