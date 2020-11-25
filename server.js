'use strict';

const Discord       = require('discord.js');
const client        = new Discord.Client();

var fs          = require("fs");

var content     = fs.readFileSync("movies.json");
var movies      = JSON.parse(content);


/* dotenv */
require('dotenv').config();
const BOT_TOKEN = process.env.BOT_TOKEN;



client.on('ready', () => {

    // setup the client
    client.user.setStatus("online");

    client.user.setActivity('Movies', { type: 'WATCHING' })
    .then(presence => console.log(`Activity set to ${presence.activities[0].name}`))
    .catch(console.error);

    console.log('Bot running');
});


client.on('message', message => {
    if(message.content === '!hc') {
        var uptime = (client.uptime / 1000) / 60;
        message.reply(`${client.user.username} is up for ${uptime} minutes or ${client.uptime / 1000} seconds`);
    }

    if(message.content === "!movielist") {
        for(var element in json.movies) {
            var embed = createEmbed(movies);
            message.channel.send(embed);
        }

        // JSON.stringify(movies, null, 2), { code: true }
    }
});


client.login(BOT_TOKEN);



function createEmbed(el) {

    var genres = {};

    for(var gEl in el.genres) {
        genres["name"]
    }

    const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(el.name)
        .setURL(el.link)
        //.setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
        //.setDescription('Some description here')
        .setThumbnail(el.thumbnail)
        .addFields(
            { name: '\u200B', value: '\u200B' },
            { name: 'Type', value: el.type, inline: true },
            { name: 'Type', value: el.type, inline: true },
            { name: 'Type', value: el.type, inline: true },
            { name: 'Type', value: el.type, inline: true },
            { name: 'Type', value: el.type, inline: true },
        )
        .addField('Inline field title', 'Some value here', true)
        .setImage('https://i.imgur.com/wSTFkRM.png')
        .setTimestamp()
        .setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png');

    return embed;

}