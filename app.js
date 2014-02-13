
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var mongodb = require('mongodb');
var Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    ReplSetServers = require('mongodb').ReplSetServers,
    ObjectID = require('mongodb').ObjectID,
    Binary = require('mongodb').Binary,
    GridStore = require('mongodb').GridStore,
    Grid = require('mongodb').Grid,
    Code = require('mongodb').Code,
    BSON = require('mongodb').pure().BSON,
    assert = require('assert');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

var mongoclient = new MongoClient(new Server("localhost", 27017), { native_parser: true });

//This function opens MongoDb and gets the data out of MongoDb 
function gradeAdd(req, err) {
    var allGrades = null;
    var testScores = 0;

    mongoclient.open(function (err, mongoclient) {
        var db = mongoclient.db("test");
        var items = null;
        //Note: I was unable to solve the problem of finding certain subjects scores, you
        //will have to change this manually.
        db.collection('scores').find({ 'Subject': 'Math' }).toArray(function (err, docs) {
            if (err) throw err;
            var results = 0;
            var avg = 0;
            for (var i = 0; i < docs.length; i++) {
                results = results + parseFloat(docs[i].Score);
                console.dir(results);
            }
            avg = results / docs.length;
            console.log(avg);
            mongoclient.close(console.log('success'));
        });
    });
}


//This is where you insert your form data into MongoDb
function insertData(req, res, err) {
    var userdata = req;
    console.log(userdata);
    mongoclient.open(function (err, mongoclient) {
        if (err) throw err
        var db = mongoclient.db('test');
        db.collection('scores').insert(userdata, function (err, inserted) {
            if (err) throw err
            mongoclient.close('It works!');
        });
    });
}

app.get('/', routes.index);
app.get('/ users', user.list);

//This gets the average of your scores
app.get('/gpa', function (req, res) {
    gradeAdd(res);
});

//This POSTs the data to a function that enters it into MongoDb
app.post('/testScoresData', function (req, res) {
    insertData(req.body);
    res.end('Thank you for entering your score');
});

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});