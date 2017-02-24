module.exports = function delivery(options) {

	var mongoose = require('mongoose'),
		ChildProcess = require('child_process'),
		Delivery = mongoose.model('delivery'),
		app = options.app;

	this.add('role:api, category:delivery, cmd:findAll', function(args, done) {

		var query = args.query,
			taskId = query.taskid,
			queryObj;

		if (taskId) {
			queryObj = { task: taskId };
		}

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
			data = body.data,
			seneca = this;

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

					done(err, [delivery]);

					seneca.act('role:api, category:task, cmd:findById', {
						params: { id: delivery.task }
					}, function(err, reply) {

						var task = reply[0];
						seneca.act('role:api, category:delivery, cmd:runTest', {
							delivery: delivery,
							task: task
						});
					});
				});
			}
		});
	});

	this.add('role:api, category:delivery, cmd:delete', function(args, done) {

		var params = args.params,
			taskId = params.taskid,
			studentId = params.studentid,
			id = params.id;

		function removeDeliveryFound(err, delivery) {

			if (err) {
				done(err);
			} else if (!delivery) {
				done(new Error("Not found"));
			} else {
				delivery.remove(function(err) {

					done(err);
				});
			}
		}

		function removeDeliveriesFound(err, deliveries) {

			if (!err) {
				for (var i = 0; i < deliveries.length; i++) {
					deliveries[i].remove();
				}
			}

			done(err);
		}

		if (taskId && studentId) {
			Delivery.findOne({
				task: taskId,
				student: studentId
			}, removeDeliveryFound);
		} else if (studentId) {
			Delivery.find({
				student: studentId
			}, removeDeliveriesFound);
		} else if (taskId) {
			Delivery.find({
				task: taskId
			}, removeDeliveriesFound);
		} else {
			Delivery.findById(id, removeDeliveryFound);
		}
	});

	this.add('role:api, category:delivery, cmd:runTest', function(args, done) {

		var delivery = args.delivery,
			task = args.task,

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

				var results = JSON.parse(stdout);

				if (!results || !results.summary) {
					done(err, stderr);
				}

				var score = getScore(task, results);

				delivery.score = score;
				delivery.save();

				done(null, results);
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
