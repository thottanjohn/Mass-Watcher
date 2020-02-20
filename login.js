var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
var app = express();
const userService = require('./user.service');
var alert =require('alert-node');
var VerifyToken = require('./verifytoken');
app.use(express.static(path.join(__dirname)));
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/crowdAnalytics',{ useCreateIndex: true,useUnifiedTopology: true, useNewUrlParser: true} );

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(cors());
app.use(VerifyToken);

app.get('/', function(req, res) {

    if(req.userId){
        res.sendFile(path.join(__dirname + '/login.html'));
    }else{
        res.writeHead(301, { "Location": "http://" + req.headers['host'] + "/log" });
        return res.end();
    }
});
app.get('/home', function(req, res) {

    if(req.userId){
        res.sendFile(path.join(__dirname + '/index.html'));
    }else{
        res.writeHead(301, { "Location": "http://" + req.headers['host'] + "/log" });
        return res.end();
    }
});
app.post('/sign_out', function(req, res) {
    req.header['x-access-token']=null;
    req.header['auth']=false;
    res.writeHead(301, { "Location": "http://" + req.headers['host'] + "/log" });
    return res.end();
    });

app.get('/log', function(req, res) {
    if(req.userId){
        res.writeHead(301, { "Location": "http://" + req.headers['host'] + "/home" });
        return res.end();
    }else{
        res.sendFile(path.join(__dirname + '/login.html'));
    }


});
app.get('/register', function(req, res) {

    if(req.userId){
        res.writeHead(301, { "Location": "http://" + req.headers['host'] + "/home" });
        return res.end();
    }else{
        res.sendFile(path.join(__dirname + '/registration_form.html'));
    }


});
app.post('/login', function(req, res) {
    userService.authenticate(req,res);
   
});
app.post('/register', function(req, res) {
    userService.create(req.body)
    .then(() => {
    res.writeHead(301, { "Location": "http://" + req.headers['host'] + "/log" });
    return res.end();
    })
    .catch(err => {
        alert(err);
        res.writeHead(301, { "Location": "http://" + req.headers['host'] + "/register" });
        return res.end();
    });
});


app.listen(3001, () => console.log(`Server is up on port:3001`));