const Discord = require("discord.js");
const request = require("request");
const {
  Intents,
  Client,
  MessageActionRow,//Not used
  MessageButton,//Not used
  ClientApplication,
} = require("discord.js");
const options = {
  intents: [
    "GUILDS",
    "GUILD_MESSAGES",
  "GUILD_MESSAGE_REACTIONS",//Not used
  "GUILD_VOICE_STATES",//Not used
    "GUILD_WEBHOOKS",
  ],
};
const cacheWebhooks = new Map();
const commands = [
    {
      name: "ping",
  description: "Returns the ping value.",
    },
    {
      name: "automatictranslation",
  description: "Start/stop automatic translation in the channel where the command is sent.",
    },
  ];
const fs = require("fs");
const client = new Discord.Client(options);
const prefix = "";//Set your own prefix here
const fetch = require("node-fetch");
const cash = new Object();
const trmsgid = new Object();
var packagejson = require("./package.json");
var settings = require("./settings.json");
cash.trst = settings.trst
cash.msgch = settings.msgch
client.on("ready", async () => {
  console.log(client.user.tag + " has logged in");
  client.user.setPresence({
    status: "online",
  });
  client.user.setActivity(
    `ver ${packagejson.version} | d.js : ${packagejson.dependencies["discord.js"].replace("^", "")},wake up time : ${Date.now()}`,
    { type: "PLAYING" }
  );
  await client.application.commands.set(commands);//Register slash commands
});

client.on("messageCreate", async (message) => {
  var args = message.content.slice(prefix.length).trim().split(/ +/g);
  var command = args.shift().toLowerCase();
  if(message.author.bot) return;//Do not respond to bot messages. You can remove this, but beware of infinite translation loops.
  if (command === 'tr') { //Manual translation by command
     var target = encodeURIComponent(args[0])
     var text = encodeURIComponent(message.content.replace(args[0],"").replace(prefix+"tr",""))
     var content = await fetch(`https://script.google.com/macros/s/AKfycbyZzeACcCpM2PNgoYN1jg64CTzZcXCx-xYHp9WC6yNQYdrCmyYcER-_vR8A-D2Epvok_w/exec?text=${text}&source=&target=${target}`).then(res => res.text())
     message.channel.send({
      embeds: [
        {
          author: {
            name: message.author.displayName,
          },
          title: content,
          footer: {
            text: `to : ${args[0]}`,
          },
        },
      ],
     })
  }
    if(command==="start"){
      if(cash["trst"]===1){
        return message.reply(`This feature is being used in https://discord.com/channels/${message.guild.id}/${cash["msgch"]}`)
      }
      var FilePath = "./settings.json";
      var Structure = JSON.parse(fs.readFileSync(FilePath));
      Structure["trst"] = 1;
      Structure["msgch"] = message.channel.id
      fs.writeFileSync(FilePath, JSON.stringify(Structure));
      cash["trst"]=1
      cash["msgch"]=message.channel.id
  return message.reply("Automatic translation enabled")
    }
    if(command==="stop"){
      if(cash["trst"]===0){
        return message.reply(`Already disabled`)
      }
      if(cash["trst"]===undefined){
        return message.reply(`Already disabled`)
      }
      var FilePath = "./settings.json";
      var Structure = JSON.parse(fs.readFileSync(FilePath));
      Structure["trst"] = 0;
      Structure["msgch"] = 0
      fs.writeFileSync(FilePath, JSON.stringify(Structure));
      cash["trst"]=0
      cash["msgch"]=0
  return message.reply("Automatic translation stopped")
    }
    if(command==="help"){
        return message.channel.send({
      embeds: [
        {
          author: {
            name: client.user.name,
          },
          title: "help[" + prefix + "]",
          fields: [
                {
                  name: "start",
                  value: "Start automatic translation in the channel where the command is sent.",
                  inline:true
                },
                {
                  name: "stop",
                  value: "Stop automatic message translation feature.",
                  inline:true
                },
                {
                  name: "tr [language] [text]",
                  value: "Translate a message.\nSupported languages are [here](https://developers.google.com/admin-sdk/directory/v1/)",
                  inline: false
                }
              ],
          footer: {
            text: "made by maka_7264 ©2023-2024 maka_7264", //Change as needed.
          },
          timestamp: new Date(),
        },
      ],
    })
    }
    if(message.content.match("")){
      if(message.content.startsWith(prefix)){
        return
      }//prefixが含まれてたら翻訳しない
  const nickname = message.member.displayName; //webhook author name
  const avatarURL = message.author.avatarURL({dynamic : true}); //webhook avatar (specified by URL)
      const webhook = await getWebhookInChannel(message.channel);
      if(cash["trst"]===1){
        if(message.channel.id===cash["msgch"]){
          let trtext;
          if (message.mentions.members.size > 0) {
            const mentionmember = message.mentions.members.first(); // Get the first mentioned member
            trtext = message.content.replace(`<@${mentionmember.user.id}>`, ""); // Replace the mention (does not support multiple mentions, can be improved)
          } else {
            trtext = message.content;
          }
          try {
            const jares = await fetch('https://script.google.com/macros/s/AKfycbyZzeACcCpM2PNgoYN1jg64CTzZcXCx-xYHp9WC6yNQYdrCmyYcER-_vR8A-D2Epvok_w/exec?text=' + encodeURIComponent(trtext) + '&source=&target=' + encodeURIComponent('ja')).then(res => res.text());
            const enres = await fetch('https://script.google.com/macros/s/AKfycbyZzeACcCpM2PNgoYN1jg64CTzZcXCx-xYHp9WC6yNQYdrCmyYcER-_vR8A-D2Epvok_w/exec?text=' + encodeURIComponent(trtext) + '&source=&target=' + encodeURIComponent('en')).then(res => res.text());
            if (jares === '[Link omitted]') {
              return;
            }
            if (message.content === '') {
              return;
            }
            if (jares === '') {
              return;
            }
            if (enres === '') {
              return;
            }
            if (jares === enres) {
              return;
            }
            if (jares.match('<H1>Bad Request</H1>')) {
              await webhook.send({
                content: 'Cannot translate.',
                username: 'Error',
                avatarURL: avatarURL
              });
              return;
            }
            if (jares.match('<title>Error</title>')) {
              await webhook.send({
                content: 'Cannot translate.',
                username: 'Error',
                avatarURL: avatarURL
              });
              return;
            }
            const translatemsg = await webhook.send({
              content: '...',
              username: 'from: ' + nickname,
              avatarURL: avatarURL
            });
            trmsgid[message.id] = translatemsg.id;
            webhook.editMessage(translatemsg.id, 'ja: ' + jares + '\nen: ' + enres);
          } catch (err) {
            console.error(err);
          }
        }
      }
    }
});

client.on('messageDelete', async message => { //Detect message deletion
   if (!message.guild) return //Exclude if deleted message is not from a server
  if(trmsgid[message.id]===undefined){ //Exclude if deleted message id is not in cache
    return
  }else{
    await client.channels.cache.get(message.channel.id).messages.cache.get(trmsgid[message.id]).delete() //Get and delete the webhook message sent using cached message id
  }
})
client.on("interactionCreate", async (interaction) => {
  
  if (!interaction.isCommand()) {
    return;
  }//If you use buttons, write code before this
  if (interaction.commandName === "ping") {//Common example (all in milliseconds)
    cash.timestamp0 = Date.now()
    await interaction.deferReply();
    cash.timestamp = Date.now()
    const webhook = await getWebhookInChannel(interaction.channel);
    const msg = await webhook.send({
      content: "test",
      username: "test",
      avatarURL: "https://cdn.discordapp.com/avatars/1190995174030053476/0bbe1045e85da9c0aab26f649f0fc0c6.png?size=1024"
    });
    cash.timestamp1 = Date.now()
    msg
    cash.timestamp2 = Date.now()
    webhook.editMessage(msg.id,"editedmessage")
    cash.timestamp3 = Date.now()
    await client.channels.cache.get(interaction.channel.id).messages.cache.get(msg.id).delete()
    cash.timestamp4 = Date.now()
  await fetch('https://script.google.com/macros/s/AKfycbyZzeACcCpM2PNgoYN1jg64CTzZcXCx-xYHp9WC6yNQYdrCmyYcER-_vR8A-D2Epvok_w/exec?text=' + encodeURIComponent('test') + '&source=&target=' + encodeURIComponent('ja')).then(res => res.text());
    cash.timestamp5 = Date.now()
    return await interaction.editReply({
      content: 'EndPoint : ' + (cash.timestamp0 - Date.parse(interaction.createdAt)) + '(Not so accurate.)\nsendmessage : ' + (cash.timestamp - cash.timestamp0) + '\nsendwebhook : ' + (cash.timestamp3 - cash.timestamp) + '\ndeletemessage : ' + (cash.timestamp4 - cash.timestamp3) + '\ntranslateapi : ' + (cash.timestamp5 - cash.timestamp4),
      ephemeral: false
    });
  }
  if (interaction.commandName === "automatictranslation") { //Start/stop automatic translation
    if(cash["trst"]===1){
        var FilePath = "./settings.json";
      var Structure = JSON.parse(fs.readFileSync(FilePath));
      Structure["trst"] = 0;
      Structure["msgch"] = 0
      fs.writeFileSync(FilePath, JSON.stringify(Structure));
    cash["trst"]=0
    cash["msgch"]=0
    return interaction.reply("stop translation")
      }else{
      var FilePath = "./settings.json";
      var Structure = JSON.parse(fs.readFileSync(FilePath));
      Structure["trst"] = 1;
      Structure["msgch"] = interaction.channel.id
      fs.writeFileSync(FilePath, JSON.stringify(Structure));
    cash["trst"]=1
    cash["msgch"]=interaction.channel.id
    return interaction.reply("start translation")
    }
  }
})

client.on('messageUpdate',async (oldMessage,newMessage) => { //Detect message edit
  if(trmsgid[oldMessage.id]===undefined){ //Exclude if message id is not in cache
    return
  }else{
    const webhook = await getWebhookInChannel(oldMessage.channel);
    const translatemsg = trmsgid[oldMessage.id]
    try {
      var jares = await fetch('https://script.google.com/macros/s/AKfycbyZzeACcCpM2PNgoYN1jg64CTzZcXCx-xYHp9WC6yNQYdrCmyYcER-_vR8A-D2Epvok_w/exec?text=' + encodeURIComponent(newMessage.content) + '&source=&target=' + encodeURIComponent('ja')).then(res => res.text());
      var enres = await fetch('https://script.google.com/macros/s/AKfycbyZzeACcCpM2PNgoYN1jg64CTzZcXCx-xYHp9WC6yNQYdrCmyYcER-_vR8A-D2Epvok_w/exec?text=' + encodeURIComponent(newMessage.content) + '&source=&target=' + encodeURIComponent('en')).then(res => res.text());
      if (jares === '[Link omitted]') {
        return;
      }
      if (newMessage.content === '') {
        return;
      }
      if (jares === '') {
        return;
      }
      if (enres === '') {
        return;
      }
      if (jares.match('<H1>Bad Request</H1>')) {
        await webhook.editMessage(translatemsg, 'Cannot translate.');
        return;
      }
      if (jares.match('<title>Error</title>')) {
        await webhook.editMessage(translatemsg, 'Cannot translate.');
        return;
      }
      webhook.editMessage(translatemsg, 'ja: ' + jares + '\nen: ' + enres);
    } catch (err) {
      console.error(err);
    }
  }
})


if (process.env.DISCORD_BOT_TOKEN == undefined) {
  console.log("DISCORD_BOT_TOKEN is not set.");
  process.exit(0);
}

client.login(process.env.DISCORD_BOT_TOKEN);

async function getWebhookInChannel(channel) {
   //Keep webhook cache for speed improvement
   const webhook = cacheWebhooks.get(channel.id) ?? await getWebhook(channel)
   return webhook;
 }
 
async function getWebhook(channel) {
  // Get all webhooks in the channel
  const webhooks = await channel.fetchWebhooks();
  // Get webhook with token (created by bot itself), or create if not found
  const webhook = webhooks?.find((v) => v.token) ?? await channel.createWebhook("Bot Webhook");
  // Add to cache for reuse
  if (webhook) cacheWebhooks.set(channel.id, webhook);
  return webhook;
}
