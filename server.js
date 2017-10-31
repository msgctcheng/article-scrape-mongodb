var cheerio = require("cheerio");
var request = require("request");
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

var Note = require("./models/note.js");
var Article = require("./models/article.js");

mongoose.Promise = Promise;

var app = express();

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(express.static("public"));

mongoose.connect("mongodb://heroku_2xghhc00:e585sjmuhe2i2b04tr2bfti0u7@ds243345.mlab.com:43345/heroku_2xghhc00");
var db = mongoose.connection;

db.on("error", function (err) {
    console.log("Mongoose Error", err);
});
db.once("open", function(){
    console.log ("MongoDB Connection Sucessful!");
});

app.get("/scrape", function (req, res) {
    request("https://www.nytimes.com/section/us?action=click&pgtype=Homepage&region=TopBar&module=HPMiniNav&contentCollection=U.S.&WT.nav=page", function (err, resp, html) {
        var $ = cheerio.load(html);



        $("a.story-link").each(function (i, element) {
            var result = {};
            result.link = $(element).attr("href");

            result.title = $(element).children("div.story-meta").children("h2.headline").text();

            result.summary = $(element).children("div.story-meta").children("p.summary").text();

            var entry = new Article(result);
            entry.save(function(error, doc) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(doc);
                }
            });
        });
    });
    res.send("scrape complete");

}); 

app.get("/articles", function(req, res){
    Article.find({}, function(err, doc) {
        if (err) {
            res.send(err);
        } else {
            res.send(doc);
        }
    });
});

app.get("/articles/:id", function(req, res) {
    Article.findOne({_id: req.params.id}).populate("note").exec(function (err, doc) {
        if (err) {
            res.send(err);
        } else {
            res.send(doc);
        }
    });
});

app.post("/articles/:id", function (req, res) {
    var newNote = Note(req.body);
    newNote.save(function(err, doc){
        if (err) {
            res.send(err);
            console.log("Error!");
        } else {
            console.log("No Error");
            Article.findOneAndUpdate(
                {_id: req.params.id},
                {$set: {note: doc._id}},
                {new: true},
                function (error, newDoc) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log(newDoc);
                        res.json(newDoc);
                    }
                }
            )
        }
    });
});

app.listen(3000, function() {
    console.log("App Running on Port 3000");
});