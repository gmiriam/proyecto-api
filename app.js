var express = require('express'),
	seneca = require('seneca')(),
	bodyParser	= require("body-parser"),
	methodOverride = require("method-override"),
	http = require('http'),
	cors = require('cors');

var port = 3002,
	app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(cors());


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

seneca
	.use("plugins/generic")
	.use("plugins/mongodb")
	.ready(function(err) {
		this
			.use("plugins/oauth", { app:app })
			.use("plugins/upload", { app:app })
			.use("plugins/user", { app:app })
			.use("plugins/delivery", { app:app })
			.use("plugins/score", { app:app })
			.use("plugins/subject", { app:app })
			.use("plugins/task", { app:app });
	});

app.listen(port, function() {

	console.log("Node server running on http://localhost:" + port);
});
