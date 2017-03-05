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

		var commons = require('./commons'),
			props = {
				app: app,
				commons: commons
			};

		this
			// Uncomment next plugin line to clear and load initial content (both files and database)
			//.use("plugins/loadInitialDataExample", props)
			.use("plugins/oauth", props)
			.use("plugins/download", props)
			.use("plugins/upload", props)
			.use("plugins/user", props)
			.use("plugins/delivery", props)
			.use("plugins/score", props)
			.use("plugins/subject", props)
			.use("plugins/task", props);
	});
