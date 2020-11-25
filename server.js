'use strict';

const Discord       = require('discord.js');
const { create } = require('domain');
const client        = new Discord.Client();

var fs          = require("fs");

var content     = fs.readFileSync("movies.json");
var json      = JSON.parse(content);


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
        for (var element of json.movies) {
            var embed = createEmbed(element);
            message.channel.send(embed);
        }

        // JSON.stringify(movies, null, 2), { code: true }
    }

    if(message.content.includes("!movie")){
        var msgs = message.content.split(' ');
        msgs.shift();
        var movie = msgs.join(' ');

        message.reply("Searching the list for movie " + movie + " ...");
        setTimeout( function() { 
            var entry = searchDB(movie, json.movies);

            if(entry) {
                var embed = createEmbed(entry);
                message.channel.send(embed);
            }
            else {
                message.channel.send("No entry with name " + movie + " found!");
            }

        }, 4500);

    }

});


client.login(BOT_TOKEN);



function createEmbed(el) {

    // var preperation
    var genres = el.genres.join(", ");
    var hours = Math.floor(el.length / 60);          
    var minutes = el.length % 60;


    const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(el.name)
        .setURL(el.link)
        .setAuthor('Review', el.reviewThumbnail, el.review)
        //.setDescription('Some description here')
        //.setThumbnail(el.thumbnail)
        .addFields(
            //{ name: '\u200B', value: '\u200B' },
            { name: 'Type', value: el.type, inline: true },
            { name: 'Genres', value: genres, inline: true },
            { name: 'Länge', value: `${hours}h ${minutes}min`, inline: true },
            { name: 'Erscheinungsjahr', value: el.release, inline: true },
            { name: 'Plattform', value: el.platform, inline: true }
        )
        .setImage(el.thumbnail)
        .setTimestamp()
        .setFooter('Generiert von movie.js');

    return embed;

}


function searchDB(movie, db) {

    for(var el of db) {
        if(movie === el.name)
            return el;
    }

    return null;
}