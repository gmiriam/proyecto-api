var express = require('express'),
    seneca = require('seneca')(),
    session = require('express-session'),
    app = express(),
    bodyParser  = require("body-parser"),
    methodOverride = require("method-override"),
    mongoose = require('mongoose'),
    querystring = require('querystring'),
    http = require('http'),
    cors = require('cors'),
    oauthserver = require('oauth2-server');


var port = 3002;

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

app.oauth = oauthserver({
  model: require('./model.js'),
  grants: ['password']
});

app.use(app.oauth.errorHandler());

app.all('/oauth/token', app.oauth.grant());

//*******************************************************

app.get('/login', function (req,res){
  var postOptions = {
    host: 'localhost',
    port: port,
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
    pwdDecoded = new Buffer(password.toString(), 'base64').toString('ascii');

  var postReq = http.request(postOptions, function(postRes) {
    postRes.setEncoding('utf8');
    postRes.on('data', function (chunk) {
      console.log("dentro del post", chunk);
      var accessToken = JSON.parse(chunk).access_token;
      res.send(chunk);
    });
  });
  postReq.write('grant_type=password&username=' + usrDecoded + '&password=' + pwdDecoded);
  postReq.end();
});

function checkUserMiddleware(req, res, next) {

  var authorization = req.get("Authorization"),
    token = authorization.split(" ").pop(),
    tokenModel = require("./mongo/model/token");
  console.log("me vino", token);
  tokenModel.findOne({
    accessToken: token
  }, function(err, tokenFound) {
    var user = tokenFound.user.username;
    console.log("el token era de ", user);
    if (user === "pedroetb") {
      res.end("eres pedroetb, no te dejo pasar");
    } else {
      next();
    }
  })
}

//*******************************************************
   /* app.use(function(req, res, next) { //allow cross origin requests
            res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
            res.header("Access-Control-Allow-Origin", "http://localhost:3000");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.header("Access-Control-Allow-Credentials", true);
            next();
        });*/

//*******************************************************

require('./models/admin');
require('./models/delivery');
require('./models/score');
require('./models/student');
require('./models/subject');
require('./models/task');
require('./models/teacher');

seneca
  .use("plugins/generic")
  .use("plugins/upload", { app:app })
  .use("plugins/admin", {})
  .use("plugins/delivery", {})
  .use("plugins/score", {})
  .use("plugins/student", {})
  .use("plugins/subject", {})
  .use("plugins/task", { app:app })
  .use("plugins/teacher", {});

app.use( seneca.export('web'))


//*************************************************************

app.listen(port, function() {
  console.log("Node server running on http://localhost:" + port);
});