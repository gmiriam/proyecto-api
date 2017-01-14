var express = require('express'),
    seneca = require('seneca')(),
    session = require('express-session'),
    app = express(),
    bodyParser  = require("body-parser"),
    methodOverride = require("method-override"),
    mongoose = require('mongoose'),
    querystring = require('querystring'),
    http = require('http'),
    //cors = require('cors'),
    oauthserver = require('oauth2-server'),
    childProcess = require('child_process');

var port = 3002;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());
//app.use(cors());

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

app.get('/test', app.oauth.authorise(), checkUserMiddleware, function (req,res) {

  var exec = childProcess.exec;
    cmd = "node_modules\\.bin\\intern-client",
    args = "config=tests/intern pathToCode=alu0100";

  function cbk(err, stdout, stderr) {

    res.send(err + ' ' + stdout + ' ' + stderr);
  }

  exec(cmd + " " + args, cbk);
});

//*******************************************************

var multer = require('multer');
var unzip = require('unzip');
var fs = require('fs');
var uuid = require('uuid/v4');

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
    
        cb(null, './data/');
    },
    filename: function (req, file, cb) {
        var fileName = uuid();
        cb(null, fileName + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
    }
});

var upload = multer({ //multer settings
  storage: storage
}).single('file');

app.use(function(req, res, next) { //allow cross origin requests
        res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header("Access-Control-Allow-Credentials", true);
        next();
    });
app.post('/upload', function(req, res) {
  upload(req,res,function(err){
    var file = req.file,
      body = req.body,
      fileTarget = body.fileTarget;

      if(err){
           res.json({error_code:1,err_desc:err});
           return;
      }

      var filename = file.filename,
        filenameWithoutExtension = filename.split('.')[0];
        path = file.destination,
        fileMimeType = file.mimetype;

      if (fileTarget === "attached") {
        var exec = childProcess.exec;
          cmd = "mv",
          args = path + "/" + filename + " " + path + "/attachments/";

        function cbk(err, stdout, stderr) {

          console.log("err:", err, " stdout:", stdout, " stderr:", stderr);
        }

        exec(cmd + " " + args, cbk);
      } else if (fileTarget === "tests") {
        var exec = childProcess.exec;
          cmd = "mv",
          args = path + "/" + filename + " " + path + "/tests/";

        function cbk(err, stdout, stderr) {

          console.log("err:", err, " stdout:", stdout, " stderr:", stderr);
        }

        exec(cmd + " " + args, cbk);
      } else if (fileTarget === "deliveries") {

        var outputPath = path + "/deliveries/" + filenameWithoutExtension;
        if (fileMimeType === 'application/x-zip-compressed') {
          fs.createReadStream(path + filename)
            .pipe(unzip.Extract({
              path: outputPath
            }))
            .on('finish', function () {
                var exec = childProcess.exec;
                  cmd = "rm",
                  args =  path + "/" + filename;

                function cbk(err, stdout, stderr) {

                  console.log("err:", err, " stdout:", stdout, " stderr:", stderr);
                }

                exec(cmd + " " + args, cbk);
            });
          res.json({error_code:0,err_desc:null,filename:filenameWithoutExtension});
          return;
        }
      }

      res.json({error_code:0,err_desc:null,filename:filename});
  });
});


//*******************************************************
require('./models/admin');
require('./models/delivery');
require('./models/course');
require('./models/score');
require('./models/student');
require('./models/subject');
require('./models/task');
require('./models/teacher');


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

app.listen(port, function() {
  console.log("Node server running on http://localhost:" + port);
});