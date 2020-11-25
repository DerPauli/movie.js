'use strict';

const Discord       = require('discord.js');
const { create }    = require('domain');
const axios         = require('axios').default;
var fs              = require("fs");


const client        = new Discord.Client();


/* dotenv */
require('dotenv').config();
const BOT_TOKEN = process.env.BOT_TOKEN;


/* API */
var bUrl = "http://www.omdbapi.com/?apikey=" + process.env.API_KEY;






client.on('ready', () => {

    // setup the client
    client.user.setStatus("online");

    client.user.setActivity('Movies', { type: 'WATCHING' })
    .then(presence => console.log(`Activity set to ${presence.activities[0].name}`))
    .catch(console.error);


    // split(2016) = tt4972582
    // halloween(2018) = tt1502407


    // var URL = "http://www.omdbapi.com/?apikey=1f63a71&i=tt1502407"

    // axios.get(URL)
    // .then(function (response) {
    //     console.log(response.data);
    // })


    console.log('Bot running');
});


client.on('message', message => {

    // read db
    var content = fs.readFileSync("movies.json");
    var json    = JSON.parse(content);

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

    if(message.content.includes("!movie") && message.content != "!movielist"){

        var msgs = message.content.split(' ');
        msgs.shift();
        var movieDel = msgs[0]; // _ delimited
        var movie = (movieDel.split('_')).join(' ');

        message.reply("Searching the list for \"" + movie + "\" ...");
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


    if(message.content.includes("!addmovie")) {

        var msgs = message.content.split(' ');
        msgs.shift();
        var movieDel = msgs[0]; // _ delimited
        var year = msgs[1];
        var movie = (movieDel.split('_')).join('+');

        // var link;

        // if(typeof msgs[3] === 'undefined')
        //     link = "N/A";
        // else
        //     link = msgs[3];

        var mUrl = bUrl + "&s="+ movie + "&y=" + year;



        axios.get(mUrl)
        .then(function (response) {
            var dArray = response.data.Search;
            var entO = dArray[0];

            var dUrl = bUrl + "&i=" + entO.imdbID;

            axios.get(dUrl)
            .then(function (response) {

                var ent = response.data;

                // set/prepare data
                var typ = "";
                if(ent.Type === "movie") typ = "Film";
                if(ent.Type === "series") typ = "Serie";
    
                var tbn = ent.Poster;
                if(ent.Poster == "N/A") tbn = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Blue_question_mark_icon.svg/1200px-Blue_question_mark_icon.svg.png";
    
                var runtime = (ent.Runtime).split(' ')[0];
                var genre   = (ent.Genre).split(', ');
                var reviews = [];

                for(var rev of ent.Ratings) {
                    reviews.push(rev.Source + ": " + rev.Value);
                }

    
                var obj = 
                {
                    "name": ent.Title,
                    "thumbnail": tbn,
                    "type": typ,
                    "genres": genre,
                    "length": runtime,
                    "release": ent.Year,
                    "reviews": reviews,
                    "link": "N/A"    
                };
    
                json.movies.push(obj);
    
                var ret = JSON.stringify(json, null, 2);
                fs.writeFileSync("movies.json", ret);
    
                message.reply("Your title was added to the database!");

                var embed = createEmbed(obj);
                message.channel.send(embed);

            })
        })
        .catch(function (error) {
            message.channel.send("There was an error searching for \"" + movie.split('+').join(' ') + "\"");
            console.log(error);
        })
        .then(function () { });
    }


    if(message.content.includes("!delmovie")){


        var msgs = message.content.split(' ');
        msgs.shift();
        var movieDel = msgs[0]; // _ delimited
        var movie = (movieDel.split('_')).join(' ');

        var idx = searchDBForIndex(movie, json.movies);

        if(idx != -1) {
            json.movies.splice(idx, 1);

            var ret = JSON.stringify(json, null, 2);
            fs.writeFileSync("movies.json", ret);

            message.reply("The movie was deleted");
        }
        else {
            message.channel.send("No entry with name " + movie + " found!");
        }

    }

});


client.login(BOT_TOKEN);



function createEmbed(el) {

    // var preperation
    var genres  = el.genres.join(", ");
    var reviews = el.reviews.join("\n");
    var hours   = Math.floor(el.length / 60);          
    var minutes = el.length % 60;


    const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(el.name)
        //.setDescription('Some description here')
        //.setThumbnail(el.thumbnail)
        .addFields(
            //{ name: '\u200B', value: '\u200B' },
            { name: 'Type', value: el.type, inline: true },
            { name: 'Genres', value: genres, inline: true },
            { name: 'Länge', value: `${hours}h ${minutes}min`, inline: true },
            { name: 'Erscheinungsjahr', value: el.release, inline: true },
            { name: 'Reviews', value: el.reviews, inline: true },
        )
        .setImage(el.thumbnail)
        .setTimestamp()
        .setFooter('Generiert von movie.js, API by Brian Fritz');

        if(el.link != "N/A")
            embed.setURL(el.link);

    return embed;

}


function searchDB(movie, db) {

    for(var el of db) {
        if(movie.toLowerCase() === (el.name).toLowerCase())
            return el;
    }

    return null;
}

function searchDBForIndex(movie, db) {

    for(var el of db) {
        if(movie.toLowerCase() === (el.name).toLowerCase())
            return db.indexOf(el);
    }

    return -1;
}