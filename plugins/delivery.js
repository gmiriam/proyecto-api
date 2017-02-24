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
			data = body.data;

		delete data.score;

		var delivery = new Delivery(data);

		this.act('role:api, category:delivery, cmd:saveAndRunTest', {
			delivery: delivery
		}, function(err, reply) {

			done(err, reply);
		});
	});

	this.add('role:api, category:delivery, cmd:updateData', function(args, done) {

		var params = args.params,
			body = args.body,
			id = params.id,
			data = body.data,
			deliveredData = data.data,
			seneca = this;

		Delivery.findById(id, function(err, delivery) {

			if (err) {
				done(err);
			} else if (!delivery) {
				done(new Error("Not found"));
			} else {
				delivery.data = deliveredData;

				seneca.act('role:api, category:delivery, cmd:saveAndRunTest', {
					delivery: delivery
				}, function(err, reply) {

					done(err, reply);
				});
			}
		});
	});

	this.add('role:api, category:delivery, cmd:updateScore', function(args, done) {

		var params = args.params,
			body = args.body,
			id = params.id,
			data = body.data,
			score = data.score,
			seneca = this;

		Delivery.findById(id, function(err, delivery) {

			if (err) {
				done(err);
			} else if (!delivery) {
				done(new Error("Not found"));
			} else {
				delivery.score = score;

				delivery.save(function(err) {

					done(err, [delivery]);
				});
			}
		});
	});

	this.add('role:api, category:delivery, cmd:saveAndRunTest', function(args, done) {

		var delivery = args.delivery,
			seneca = this;

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
	});

	this.add('role:api, category:delivery, cmd:evaluateResults', function(args, done) {

		var task = args.task,
			delivery = args.delivery,
			seneca = this;

		if (!delivery) {
			this.act('role:api, category:delivery, cmd:findAll', {
				query: { taskid: task._id }
			}, function(err, reply) {

				var deliveries = reply;
				for (var i = 0; i < deliveries.length; i++) {
					var delivery = deliveries[i];

					seneca.act('role:api, category:delivery, cmd:getScore', {
						task: task,
						results: delivery.results
					}, (function(delivery, err, reply) {

						var score = reply.score;

						delivery.score = score;
						delivery.save();
					}).bind(this, delivery));
				}

				done(err);
			});
		} else {
			done(null);
		}
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
			seneca = this,

			exec = ChildProcess.exec;
			cmd = "node_modules\\.bin\\intern-client",
			pathToTest = "data/tests/",
			pathToCode = "data/deliveries/",

			suites = pathToTest + task.evaluationTest.split(".")[0],
			code = pathToCode + delivery.data.split(".")[0],
			execArgs = "config=tests/intern suites=" + suites + " pathToCode=" + code;

			function cbk(delivery, err, stdout, stderr) {

				var results = JSON.parse(stdout);

				if (!results || !results.summary) {
					done(err, stderr);
				}

				delivery.results = results;

				seneca.act('role:api, category:delivery, cmd:getScore', {
					task: task,
					results: results
				}, (function(delivery, err, reply) {

					var score = reply.score;

					delivery.score = score;
					delivery.save();

					done(null);
				}).bind(this, delivery));
			}

			exec(cmd + " " + execArgs, cbk.bind(this, delivery));
	});

	this.add('role:api, category:delivery, cmd:getScore', function(args, done) {

		var task = args.task,
			results = args.results,
			passTests = results.summary.pass,
			totalTests = results.summary.total,
			maxScore = task.maxScore;

		done(null, { score: (passTests / totalTests) * maxScore });
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
		app.put(prefix + ':id/updatescore', /*app.oauth.authorise(), */expressCbk.bind(this, 'updateScore'));
		app.put(prefix + ':id/updatedata', /*app.oauth.authorise(), */expressCbk.bind(this, 'updateData'));
		app.delete(prefix + ':id', /*app.oauth.authorise(), */expressCbk.bind(this, 'delete'));

		done();
	});

	return 'delivery';
}
