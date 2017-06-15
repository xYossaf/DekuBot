Here is a full list of every bloody command.

##Contents
- [General Purpose](#general)
- [Administration](#administration)
- [Music](#music)
- [NSFW](#nsfw)
- [RSS](#rss)
- [Self Assignable Roles](#SelfAssignableRoles)
- [Logs](#logs)
- [Custom Commands](#customcommands)
- [Reddit Feeds](#RedditFeeds)
- [Anime/Manga](#AnimeManga)


### General
Commands and aliases | Description | Usage
----------------|--------------|-------
`!help` | This will link you to this command list and general help | `!help`
`!ping` | The bot will immediately respond with pong  | `!ping`
`!pong` | The bot will immediately respond with ping   | `!pong`
`!rps` | Use to play rock paper scissors with DekuBot  | `!`
`!namechanges` | Returns the known name changes of the member  | `!namechanges @member`
`!botstatus` | Gives the status of the bot  | `!botstatus`
`!rip` | Posts a picture of your profile picture on a grave with random text  | `!rip` or optionally '!rip @member'
`!8ball` | Shake the magic 8ball that is deku  | `!8ball <text you wish to ask>`
`!dice` | Roll a variety of dice  | `!dice <type of dice>` or just `!dice` which rolls a d6
`!triggered` | Posts a picture of your profile picture with triggered text  | `!triggered` or optionally '!triggered @member'
`!invite` | This will give the invite link for DekuBot  | `!invite`
`!quote` | This will quote the mentioned user saying the text you give  | `!quote @member <quote text>`
`!maths` `!math` | Allows you to do basically all the calculations you could want  | `!maths <expression>`
`!server` | This will give general information about the current server  | `!server`
`!urbandictionary` `ud` `urbdic` | This will do a search on urban dictionary for the tag given  | `!ud <text>`
`!spoiler` | This will hide the text behind a gif to avoid spoilers  | `!spoiler <thing you are spoiling>:<spoiler text>`
`!spoils` | This will hide the message with the given id behind a gif to avoid spoiler (to get the id turn on dev mode in discord and right click the message) **Requires MANAGE_MESSAGES server permission.** | `!spoils <thing its spoiling>:<message ID>`

###### [Back to ToC](#contents)

### Administration  
Commands and aliases | Description | Usage
----------------|--------------|-------
`!purge` | This will delete the specified amount of messages from the channel the command was sent in. **Requires MANAGE_MESSAGES server permission.** | `!purge <number of messages to delete>`
`!ignore` | This will make the bot ignore any command that isn't made by a person with permissions high enough in the channel the command was sent. **Requires MANAGE_CHANNELS server permission.** | `!ignore`
`!unignore` | This is the will make the bot stop ignoring a channel that was ignored using the command above. **Requires MANAGE_CHANNELS server permission.** | `!unignore`
`!setprefix` | This will set the command prefix on the server to the prefix given (the default is `!`) **Requires ADMINISTRATOR server permission.** | `!setprefix <new prefix>`
`!togglewelcomepm` | This will toggle whether the welcome message is sent in a private message or in the server. **Requires ADMINISTRATOR server permission.** | `!togglewelcomepm`
`!toggleselfrolepm` | This will toggle whether a member is private messaged when the member joins the server prompting them to choose one of the prompt self roles or whether the user has to use the `!selfrole` command. **Requires ADMINISTRATOR server permission.** | `!toggleselfrolepm`
`!setjoinmessage` | This will change the join message sent to members when they join (if enabled) **Requires ADMINISTRATOR server permission.** | `!setjoinmessage <new join message>`
`!setleavemessage` | This will change the leave message sent when members leave the server (if enabled) **Requires ADMINISTRATOR server permission.** | `!setleavemessage <new leave message>`
`!disablejoinmessage` | This disables the join message. To enable again use `!setjoinmessage` to set it to the join message you want (to make it the default, set the join message to 'default') **Requires ADMINISTRATOR server permission.** | `!disablejoinmessage`
`!disableleavemessage` | This disables the leave message. To enable again use `!setleavemessage` to set it to the leave message you want (to make it the default, set the leave message to 'default') **Requires ADMINISTRATOR server permission.** | `!disableleavemessage`

###### [Back to ToC](#contents)

### Music  
Commands and aliases | Description | Usage
----------------|--------------|-------
`!dj` | This will create the DJ role that is required to use a multitude of music commands and give it to you **Requires MANAGE_GUILD and MANAGE_ROLES_OR_PERMISSIONS server permission.** | `!dj`
`!joinvoice` | This will make the bot join the voice channel you are in and make it ready to play music **Requires DJ role.** | `!joinvoice`
`!leavevoice` | This will make the bot leave the voice channel **Requires DJ role.** | `!leavevoice`
`!request` | Used to add a song to the queue of music for dekubot to play  | `!request <valid youtube link>`
`!skipsong` | This will vote to skip the current song being played. Needs the majority of the room to vote skip to skip the song  | `!skipsong`
`!clearqueue` | This will clear the current song queue of all songs **Requires DJ role.** | `!clearqueue`
`!endsong` | This will end the current song and move on to the next without a vote **Requires DJ role.** | `!endsong`
`!queue` | This will show the current song queue  | `!queue`
`!pause` | This will pause the song currently playing **Requires DJ role.** | `!pause`
`!resume` | This will resume the currently paused song **Requires DJ role.** | `!resume`
`!volume` | This will change the current volume for the song (the default is 40%) **Requires DJ role.** | `!volume <new volume percentage from 1 to 100>`

###### [Back to ToC](#contents)

### NSFW  
Commands and aliases | Description | Usage
----------------|--------------|-------
`!nsfw` | This will enable the use of nsfw commands in this channel **Requires MANAGE_CHANNELS server permission.** | `!nsfw`
`!unnsfw` | This will disable the use of nsfw commands in this channel **Requires MANAGE_CHANNELS server permission.** | `!unnsfw`
`!rule34` | This will search for the tags given on rule34 and send a random selection of those images  | `!rule34 <tags>`
`!konachan` | This will search for the tags given on konachan and send a random selection of those images  | `!konachan <tags>`
`!danbooru` | This will search for the tags given on danbooru and send a random selection of those images  | `!danbooru <tags>`
`!yandere` | This will search for the tags given on yandere and send a random selection of those images  | `!yandere <tags>`

###### [Back to ToC](#contents)

### SelfAssignableRoles  
Commands and aliases | Description | Usage
----------------|--------------|-------
`!selfrole assign` `!srole a` `!sarole assign` `!sar a` | This will make the given role a self assignable role **Requires MANAGE_ROLES_OR_PERMISSIONS server permission.** | `!sar a <role name>`
`!selfrole list` `!srole l` `!sarole list` `!sar l` | This will list out all the self assignable roles you can choose from  | `!sar l`
`!selfrole give` `!srole g` `!sarole give` `!sar g` | This will give you the self assignable role with the name you specified  | `!sar g <self role name>`
`!selfrole take` `!srole t` `!sarole take` `!sar t` | This will take the self assignable role with the name you specified away from you  | `!sar t <self role name>`

###### [Back to ToC](#contents)

### RSS  
Commands and aliases | Description | Usage
----------------|--------------|-------
`!rss` | This will start tracking the rss feed given in the current channel **Requires MANAGE_CHANNELS server permission.** | `!rss <valid RSS feed link>` also possible through pm
`!rsslist` | This will list all the rss feeds being tracked and give you options to edit them  | `!rsslist` also possible through pm

###### [Back to ToC](#contents)

### Logs  
Commands and aliases | Description | Usage
----------------|--------------|-------
`!log all` `!logs a` | This will start logging **everything** listed below **Requires MANAGE_SERVER and MANAGE_CHANNELS server permissions.** | `!log a`
`!log traffic` `!logs t` | This will start logging all the **member joins/leaves**  **Requires MANAGE_SERVER and MANAGE_CHANNELS server permission.** | `!log t`
`!log kicks` `!logs k` | This will start logging all the **kicked members** using the ``punish`` command **Requires MANAGE_SERVER and MANAGE_CHANNELS server permission.** | `!`
`!log bans` `!logs b` | This will start logging all the **banned members** **Requires MANAGE_SERVER and MANAGE_CHANNELS server permission.** | `!`
`!log deletes` `!logs d` | This will start logging all the **deleted messages** **Requires MANAGE_SERVER and MANAGE_CHANNELS server permission.** | `!`
`!log warnings` `!logs w` | This will start logging all the **warnings** given to members using the ``punish`` command **Requires MANAGE_SERVER and MANAGE_CHANNELS server permission.** | `!`
`!log channels` `!logs c` | This will start logging all changes made to **channels** **Requires MANAGE_SERVER and MANAGE_CHANNELS server permission.** | `!`
`!log roles` `!logs r` | This will start logging all changes made to **roles** **Requires MANAGE_SERVER and MANAGE_CHANNELS server permission.** | `!`
`!log emojis` `!logs e` | This will start logging all changes made to **emojis** **Requires MANAGE_SERVER and MANAGE_CHANNELS server permission.** | `!`
`!log voice` `!logs v` | This will start logging all traffic for **voice channels** **Requires MANAGE_SERVER and MANAGE_CHANNELS server permission.** | `!`
`!loglist` | This will list all the logs and give you options to edit them  | `!loglist`

###### [Back to ToC](#contents)

### CustomCommands  
Commands and aliases | Description | Usage
----------------|--------------|-------
`!customcommands` | The bot will PM you with a list of all the names for all the custom commands on the server  | `!customcommands`
`!createcommand` | This will create the given custom commands **Requires MANAGE_MESSAGES server permission.** | `!createcommand <command name> | <command text>`
`!deletecommand` | This will delete the given custom command **Requires MANAGE_MESSAGES server permission.** | `!deletecommand <commandname>`

`!` |  **Requires  server permission.** | `!`

###### [Back to ToC](#contents)

### RedditFeeds  
Commands and aliases | Description | Usage
----------------|--------------|-------
`!reddit` | This will start tracking the given subreddit in this channel **Requires MANAGE_CHANNELS server permission.** | `!reddit <valid subreddit link>`
`!unreddit` | This will stop tracking the given subreddit in this channel **Requires MANAGE_CHANNELS server permission.** | `!unreddit <valid subreddit link>`

###### [Back to ToC](#contents)

### AnimeManga  
Commands and aliases | Description | Usage
----------------|--------------|-------
`!anime` | Will return the top result for the tag given and all info about the anime  | `!anime <anime name>`
`!manga` | Will return the top result for the tag given and all info about the manga  | `!manga <manga name>`
`!character` | Will do a search for the character name given and return all the results with info | `!character <character name>`
`!animesearch` | Will do a search for the anime name given and return all the results with info  | `!animesearch <anime name>`
`!mangasearch` | Will do a search for the manga name given and return all the results with info  | `!mangasearch <manga name>`
`!animeairdate` |  Will return the air date for the next episode of the anime name given  | `!animeairdate <anime name>`

###### [Back to ToC](#contents)
