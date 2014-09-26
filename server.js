var Mongolian = require("mongolian")
var mongo = new Mongolian("localhost");
var db = mongo.db("test");
var posts = db.collection("Tweets");

var express = require('express');
var url = require('url');
var app = express();
var fs = require("fs");
var http = require('http');
var fs = require("fs");
var server = http.createServer(app).listen(4444);

app.configure(function () {
    app.use(express.static(__dirname + '/public'));

    app.use(express.methodOverride());

    app.use(app.router);
    app.use(express.errorHandler());
    app.use(express.cookieParser());
    app.use(express.session({
        secret: 'mongo',
        cookie: {
            path: '/',
            domain: '74.74.170.219:5555',
            maxAge: 1000 * 60 * 24 // 24 hours
        }
    }));
    app.use(function (req, res, next) {
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
        next();
    });
});


app.get('/', function (req, res) {

    fs.readFile('./index.html', function (err, data) {

        res.writeHead(200, {
            'content-Type': 'text/html'
        });
        res.end(data, 'utf-8');
    })

})

app.get('/search/:query/:id/history/:history', function (req, res) {


    res.setHeader('Content-Type', 'text/json');
    var tweets = new Array();
    var query = req.params.query;
    var id = req.params.id;
    var count;
    var index = 0;
    var history = req.params.history;

    posts.find({
        text: {
            $regex: ".*" + query + ".*",
            $options: 'i'
        }
    }).count(function (err, c) {
        count = c;
    });

    posts.find({
        text: {
            $regex: ".*" + query + ".*",
            $options: 'i'
        }
    }).limit(10).sort({
        createdAt: 1
    }).forEach(function (post) {
        tweets.push(post);

    }, function (err) {


        if (typeof tweets[0] === "object")
            tweets[0].count = count;

        res.end(JSON.stringify(tweets));

        posts.find({
            text: {
                $regex: ".*" + query + ".*",
                $options: 'i'
            }
        }).sort({
            createdAt: 1
        }).forEach(function (post) {




            var tempposts = db.collection(id);
            index = index + 1;
            tempposts.insert({
                "profileImageUrl": post.profileImageUrl,
                "fromUserName": post.fromUserName,
                "fromUser": post.fromUser,
                "createdAt": post.createdAt,
                "text": post.text,
                "index": index
            })


        }, function (err) {

            var hist = db.collection(history);

            hist.drop(function (err, coll) {



            });

        });
    })

});


app.get('/search/:query/:index/:id', function (req, res) {
    res.setHeader('Content-Type', 'text/json');
    var nextweets = new Array();
    var query = req.params.query;
    var count;
    var id = req.params.id;
    var index = req.params.index;

    var tempposts = db.collection(id);

    tempposts.find({
        text: {
            $regex: ".*" + query + ".*",
            $options: 'i'
        }
    }).count(function (err, c) {
        count = c;
    });

    var from = (index - 1) * 10 + 1;
    var to = from + 9;

    tempposts.find({
        "index": {
            "$gte": from,
            "$lte": to
        }
    }).forEach(function (post) {
        nextweets.push(post);

    }, function (err) {

        if (typeof nextweets[0] === "object")
            nextweets[0].count = count;

        res.end(JSON.stringify(nextweets));


    })

});

app.get('/admin/mongo/delete/', function (req, res) {

    db.collectionNames(function (err, coll) {

        nom = db.collection(coll);
        name = nom.name;

        for (i = 0; i < name.length; i++) {

            n = name[i];
            if (n != 'system.indexes') {

                if (n != 'Tweets') {
                    var t = db.collection(n);
                    t.drop(function (err, coll) {

                    });

                }

            }
            res.end("deleted all collections except system.indexes and Tweets");
        }
    })

});