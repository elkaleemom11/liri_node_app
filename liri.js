require("dotenv").config();
// Define variables:

var fs = require("fs");
var keys = require(`./keys.js`);
var Spotify = require("node-spotify-api");
var Twitter = require("twitter");
var inquirer = require("inquirer");
var request = require("request");
var spotify = new Spotify(keys.spotify);
var twitter = new Twitter(keys.twitter);


//Commands for "tweets, spotify, movie information, and do what it says" Used the new "inquirer.prompt" and loaded the inquirer module

start();

function start() {
    inquirer.prompt([
        {
            type: "list",
            message: "Run a Command",
            choices: ["My-tweets", "Spotify-this-Song", "Movie-info", "Do-What-It-Says"],
            name: "command"
        }
    ]).then(function (response) {
        switch (response.command) {
            case "My-tweets":
                runMyTweets()
                break;
            case "Spotify-this-Song":
                runSpotify()
                break;
            case "Movie-Info":
                runGetMovieInfo()
                break;
            case "Do-What-It-Says":
                runDoWhatItSays()
                break;
            default:
                console.log("\nLiri did not understand your command, try using one of the following:");
                console.log("\n--------------------------------");
                console.log(`My-tweets`);
                console.log(`Spotify this song "Song Title"`);
                console.log(`Movie Info "Your movie information"`);
                console.log(`Do-What-It-Says`);
                console.log("------------------------------");


        }
    })
}
// Functions: 
// Tweets
function runMyTweets() {
    var params = { screen_name: 'CodeQueen' };
    console.log("Showing my tweets @" + params.screen_name);
    twitter.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (error) {
            console.log("Error: " + error);
            return
        } else {
            for (tweet of tweets.reverse()) {
                console.log("> " + tweet.text);
            }
        }
    });
}

// Spotify

function runSpotify() {
    inquirer.prompt([
        {
            type: "input",
            message: "Song Name?",
            default: "Hallelujah",
            name: "song"
        }
    ]).then(function (response) {
        spotifySongName(response.song)
    })
}

function spotifySongName(songName) {
    spotify.search({ type: 'track', query: songName })
        .then(function (response) {
            var items = response.tracks.items;
            for (item of items) {
                console.log("------------------------------");
                console.log("Song: " + item.name);
                var artists = [];
                for (artist of item.album.artists) {
                    artists.push(artist.name);
                }

                if (artists.length > 1) {
                    console.log("Artists: " + artists.join(", "));
                } else {
                    console.log("Artist: " + artists.shift());
                }

                console.log("Preview: " + item.external_urls.spotify);
                console.log("Album: " + item.album.name);
                console.log("------------------------------");
            }
        })
        .catch(function (error) {
            console.log("Error: " + error);
        });
}

// Movie Information
function runGetMovieInfo() {
    console.log("Get Movie Info");
    inquirer.prompt([
        {
            type: "input",
            message: "Movie Name?",
            default: "Titanic",
            name: "movie"
        }
    ]).then(function (response) {
        var movieName = response.movie;
        getMovieInfo(movieName);
    })
}
// Run a request to the OMDB API
function getMovieInfo(movieName) {
    var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy";
    request(queryUrl, function (error, response, body) {
        console.log("------------------------------");
        if (error) {
            console.log("Error: " + error);
            GetMovieInfo();
            return
            // If the request is successful
        } else if (response.statusCode === 200) {
            var movie = JSON.parse(body);
            // Included the Title, Ratings, Country, Language, Plot, and Actors of the movie selected
            console.log("Title: " + movie.Title);
            for (rating of movie.Ratings) {
                console.log(`${rating.Source}: ${rating.Value}`);
            }
            console.log("Country:: " + movie.Country);
            console.log("Language: " + movie.Language);
            console.log("Plot: " + movie.Plot);
            console.log("Actors: " + movie.Actors);
        } else {
            console.log("Error: Something went wrong...");
            GetMovieInfo();
        }
        console.log("------------------------------");
    });
}

function runCommand(command, input) {
    switch (command) {
        case "my-tweets":
            runMyTweets();
            break;
        case "spotify-this-song":
            spotifySongName(input)
            break;
        case "movie-this":
            getMovieInfo(input);
            break;
        default:
            console.log(`Error: Wrong command used here' ${command}'`);
            start();
            break;
    }
}
// Do what is says here, by reading  and following the directions located in the "random.txt" file
function runDoWhatItSays() {
    fs.readFile("random.txt", "utf8", function (error, data) {
        if (error) {
            return console.log(error);
        }

        var dataArr = data.split(",");
        var command = dataArr[0];

        if (dataArr.length == 0) {
            console.log("Error: No data in random.txt");
            start();
        } else if (dataArr.length == 1) {
            runCommand(dataArr[0], "")
        } else if (dataArr.length > 1) {
            runCommand(dataArr[0], dataArr[1])
        }
    });
}
