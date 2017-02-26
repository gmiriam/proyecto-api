var express = require('express'),
	seneca = require('seneca'),
	bodyParser	= require("body-parser"),
	methodOverride = require("method-override"),
	http = require('http'),
	cors = require('cors'),

	port = 3002,
	app = express(),
	senecaInstance = seneca();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(cors());

app.listen(port, function() {

	console.log("Node server running on http://localhost:" + port);
});

senecaInstance
	.use("plugins/generic")
	.use("plugins/mongodb")
	.ready(function(err) {
		this
			.use("plugins/oauth", { app:app })
			.use("plugins/download", { app:app })
			.use("plugins/upload", { app:app })
			.use("plugins/user", { app:app })
			.use("plugins/delivery", { app:app })
			.use("plugins/score", { app:app })
			.use("plugins/subject", { app:app })
			.use("plugins/task", { app:app });
	});

//*******************************************************
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
