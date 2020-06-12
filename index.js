const Discord = require('discord.js');
const client = new Discord.Client();

quotesJSON = require('./quotes.json');
keywords = [];
aliases = [];
quotes = [];
mutedServers = [];

for (let i = 0; i < quotesJSON.quotes.length; i++)
{
  const quoteInfo = quotesJSON.quotes[i];
  aliases[quoteInfo.origin] = quoteInfo.aliases;
  for (const alias of quoteInfo.aliases)
    keywords[alias] = quoteInfo.origin;
  quotes[quoteInfo.origin] = quoteInfo.quotes;
}

client.on('ready', () => {
  let clientUser = client.user;
  clientUser.setActivity("Type !rb for info");
  console.log('Hullo! From ' + clientUser.username + ' (' + clientUser.id + ')');
})

client.on("guildCreate", guild => {
    let channelID;
    let channels = guild.channels.cache;
    channelLoop:
    for (let c in channels) {
        if (channels[c].type === "text") {
            channelID = channels[c].id;
            break channelLoop;
        }
    }

    let channel = client.channels.cache.get(guild.systemChannelID || channelID);
    channel.send("I detect trigger words and spout nonsense quotes from movies, vines, and the like\nType `!rb` to see what quotes I have in store");
});

client.on('message', message => {
	if (message.author.bot) return;
  
  const channel = message.channel;
  const messageStr = message.content.toLowerCase();

  if (messageStr.substring(0, 3) === "!rb")
  {
    let args = messageStr.split(" ");
    
    if (args.length >= 2 && (args[1] === "shutup" || args[1] === "mute") && (args.length == 2 || !isNaN(args[2])))
    {
      let mins = 1;
      if (args.length == 3) 
        mins = parseInt(args[2])
      let until = new Date();
      until.setMinutes(until.getMinutes() + mins);
      until = new Date(until);
      mutedServers[message.channel.id] = until;
      channel.send("You have now muted me for " + mins + " minute(s). Type `!rb status` to check how many more minutes remain before I unleash havoc once more");
    }
    else if (args.length == 2 && args[1] === "unmute")
    {
      delete mutedServers[message.channel.id];
      channel.send("I am now unmuted and ready to wreak havoc");
    }
    else if (args.length == 2 && args[1] === "status")
    {
      let muted = false;

      if (message.channel.id in mutedServers)
      {
        let remainingMins = Math.ceil((mutedServers[message.channel.id] - new Date()) / 60000);  
        if (remainingMins <= 0)
          delete mutedServers[message.channel.id];
        else
        {
          muted = true;
          channel.send("I'm muted for " + remainingMins + " more minute(s)! Type `!rb unmute` to unmute me");
        }
      }
          
      if (!muted)
        channel.send("I am not muted and ready to wreak havoc");
    }
    else if (args.length == 1)
    {
      let table = "```markdown\n< Commands >\n!rb shutup [minutes] OR !rb mute [minutes] to mute me temporarily\n!rb unmute to unmute me\n!rb status to get status\n\n< Current Media Sources and Trigger Words >\n";

      for (let key in aliases)
        if (aliases.hasOwnProperty(key))
          table += key.padEnd(45) + aliases[key] + "\n";
      message.author.send(table + "```");
    }
    else
      channel.send("I'm sorry, I don't recognize that command. If you're unsure, type `!rb` for information")
  }
  else
  {
    let unmuted = true;

    if (message.channel.id in mutedServers)
    {
      let remainingMins = Math.ceil((mutedServers[message.channel.id] - new Date()) / 60000);

      if (remainingMins <= 0)
        delete mutedServers[message.channel.id];
      else
        unmuted = false;
    }
    
    if (unmuted)
    {
      for (const keyword in keywords)
        if (messageStr.includes(keyword))
        {
          let possibleQuotes = quotes[keywords[keyword]];
          channel.send(possibleQuotes[Math.floor(Math.random() * possibleQuotes.length)]);
        }
    }
  }

});

client.login(TOKEN);