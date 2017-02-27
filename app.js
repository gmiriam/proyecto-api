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

		var commons = require('./commons');

		this
			.use("plugins/oauth", {
				app: app,
				commons: commons
			})
			.use("plugins/download", {
				app: app,
				commons: commons
			})
			.use("plugins/upload", {
				app: app,
				commons: commons
			})
			.use("plugins/user", {
				app: app,
				commons: commons
			})
			.use("plugins/delivery", {
				app: app,
				commons: commons
			})
			.use("plugins/score", {
				app: app,
				commons: commons
			})
			.use("plugins/subject", {
				app: app,
				commons: commons
			})
			.use("plugins/task", {
				app: app,
				commons: commons
			});
	});
