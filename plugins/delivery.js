module.exports = function delivery(options) {

	var mongoose = require('mongoose'),
		ChildProcess = require('child_process'),
		Delivery = mongoose.model('delivery'),
		app = options.app;

	this.add('role:api, category:delivery, cmd:findAll', function(args, done) {

		var query = args.query,
			queryObj;


		Delivery.find(queryObj, function(err, deliveries) {

			done(err, deliveries);
		});
	});

	this.add('role:api, category:delivery, cmd:findById', function(args, done) {

		var params = args.params,
			id = params.id;

		Delivery.findById(id, function(err, delivery) {

			if (err) {
				done(err);
			} else if (!delivery) {
				done(new Error("Not found"));
			} else {
				done(null, [delivery]);
			}
		});
	});

	this.add('role:api, category:delivery, cmd:create', function(args, done) {

		var body = args.body,
			data = body.data,
			delivery = new Delivery(data);

		delivery.save(function(err) {

			done(err, [delivery]);
		});
	});

	this.add('role:api, category:delivery, cmd:update', function(args, done) {

		var params = args.params,
			body = args.body,
			id = params.id,
			data = body.data;

		Delivery.findById(id, function(err, delivery) {

			if (err) {
				done(err);
			} else if (!delivery) {
				done(new Error("Not found"));
			} else {
				for (var key in data) {
					var newDeliveryPropertyValue = data[key];
					delivery[key] = newDeliveryPropertyValue;
				}

				delivery.save(function(err) {

					this.act('role:api, category:task, cmd:findById', {
						params: { id: delivery.task }
					}, function(err, reply) {

						var task = reply[0];
						this.act('role:api, category:delivery, cmd:runTest', {
							delivery: delivery,
							task: task
						});
					});

					done(err, [delivery]);
				});
			}
		});
	});

	this.add('role:api, category:delivery, cmd:delete', function(args, done) {

		var params = args.params,
			id = params.id;

		Delivery.findById(id, function(err, delivery) {

			if (err) {
				done(err);
			} else if (!delivery) {
				done(new Error("Not found"));
			} else {
				delivery.remove(function(err) {

					done(err);
				});
			}
		});
	});

	this.add('role:api, category:delivery, cmd:runTest', function(args, done) {

		var params = args.params,
			id = params.id,

			exec = ChildProcess.exec;
			cmd = "node_modules\\.bin\\intern-client",
			pathToTest = "data/tests/",
			pathToCode = "data/deliveries/",

			suites = pathToTest + task.evaluationTest.split(".")[0],
			code = pathToCode + delivery.data.split(".")[0],
			execArgs = "config=tests/intern suites=" + suites + " pathToCode=" + code;

			function getScore(task, results) {

				var passTests = results.summary.pass,
					totalTests = results.summary.total,
					maxScore = task.maxScore;

				return (passTests / totalTests) * maxScore;
			}

			function cbk(err, stdout, stderr) {

				if (!err) {
					console.log(stdout);
					var results = JSON.parse(stdout),
						score = getScore(task, results);

					delivery.score = score;
					delivery.save();
				}

				done(err);
			}

			exec(cmd + " " + execArgs, cbk);
	});

	this.add('init:delivery', function(args, done) {

		function expressCbk(cmd, req, res) {

			this.act('role:api, category:delivery, cmd:' + cmd, {
				params: req.params,
				query: req.query,
				headers: req.headers,
				body: req.body
			}, function(err, reply) {

				this.act('role:api, category:generic, cmd:sendResponse', {
					error: err,
					responseData: reply,
					responseHandler: res
				});
			});
		}

		var prefix = '/delivery/';

		app.get(prefix, /*app.oauth.authorise(), */expressCbk.bind(this, 'findAll'));
		app.get(prefix + ':id', /*app.oauth.authorise(), */expressCbk.bind(this, 'findById'));
		app.post(prefix, /*app.oauth.authorise(), */expressCbk.bind(this, 'create'));
		app.put(prefix + ':id', /*app.oauth.authorise(), */expressCbk.bind(this, 'update'));
		app.delete(prefix + ':id', /*app.oauth.authorise(), */expressCbk.bind(this, 'delete'));

		done();
	});

	return 'delivery';
}
