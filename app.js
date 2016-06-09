var express = require('express'),
    seneca = require('seneca')(),
    session = require('express-session'),
    app = express(),
    bodyParser  = require("body-parser"),
    methodOverride = require("method-override"),
    mongoose = require('mongoose'),
    querystring = require('querystring'),
    http = require('http'),
    cors = require('cors');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(cors());

mongoose.connect('mongodb://localhost/users', function(err, res) {
    if (err)
        console.log('Error:' + err);
    else
        console.log('Conectado a la base de datos');
});

//*******************************************************

app.get('/login', function (req,res){
  var postOptions = {
    host: 'localhost',
    port: 3001,
    path: '/oauth/token',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic YXBwbGljYXRpb246c2VjcmV0'
    }

  };
  var userName = req.query.usr,
    password = req.query.pwd;

  var usrDecoded = new Buffer(userName.toString(), 'base64').toString('ascii'),
    pwdDecoded = new Buffer(password.toString(), 'base64').toString('ascii')
  var postReq = http.request(postOptions, function(postRes) {
      postRes.setEncoding('utf8');
      postRes.on('data', function (chunk) {
        var accessToken = JSON.parse(chunk).access_token;

        var getOptions = {
          host: 'localhost',
          port: 3001,
          path: '/',
          method: 'GET',
          headers: {
              'Authorization': 'Bearer ' + accessToken
          }
        };
        var getReq = http.request(getOptions, function(getRes) {
          getRes.setEncoding('utf8');
          getRes.on('data', function (chunk) {
            res.send(chunk);
          })
        })
        getReq.end();
      });
  });
  postReq.write('grant_type=password&username='+usrDecoded +'&password=' +  pwdDecoded);
  postReq.end();


})

seneca.use("plugins/admin", {})
seneca.use("plugins/course", {})
seneca.use("plugins/delivery", {})
seneca.use("plugins/score", {})
seneca.use("plugins/course", {})
seneca.use("plugins/student", {})
seneca.use("plugins/subject", {})
seneca.use("plugins/task", {})
seneca.use("plugins/teacher", {})

app.use( seneca.export('web'))


//*************************************************************

app.listen(3000, function() {
  console.log("Node server running on http://localhost:3000");
});