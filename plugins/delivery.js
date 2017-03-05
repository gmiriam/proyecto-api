module.exports = function delivery(options) {

	var mongoose = require('mongoose'),
		ChildProcess = require('child_process'),
		Delivery = mongoose.model('delivery'),
		app = options.app,
		commons = options.commons;

	this.add('role:api, category:delivery, cmd:findAll', function(args, done) {

		var query = args.query,
			taskId = query.taskid,
			studentId = query.studentid,
			queryObj = {};

		if (taskId) {
			queryObj.task = taskId;
		}

		if (studentId) {
			queryObj.student = studentId;
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
			score = data.score;

		Delivery.findById(id, (function(score, err, delivery) {

			if (err) {
				done(err);
			} else if (!delivery) {
				done(new Error("Not found"));
			} else {
				delivery.score = score;

				delivery.save(function(err) {

					done(err, [delivery]);
				});

				this.act('role:api, category:task, cmd:findById', {
					params: { id: delivery.task }
				}, (function(studentId, err, reply) {

					var task = reply[0],
						subjectId = task.subject;

					this.act('role:api, category:score, cmd:calculateAndUpdateScore', {
						subjectid: subjectId,
						studentid: studentId
					});
				}).bind(this, delivery.student));
			}
		}).bind(this, score));
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

		var task = args.task;

		if (!task) {
			done(null);
			return;
		}

		this.act('role:api, category:delivery, cmd:findAll', {
			query: { taskid: task._id }
		}, (function(task, err, reply) {

			var deliveries = reply,
				promises = [];

			for (var i = 0; i < deliveries.length; i++) {
				var delivery = deliveries[i],
					promiseHandler = {},
					promise = new Promise((function(resolve, reject) {
						this.resolve = resolve;
						this.reject = reject;
					}).bind(promiseHandler));

				promises.push(promise);

				this.act('role:api, category:delivery, cmd:getScore', {
					task: task,
					results: delivery.results
				}, (function(delivery, promiseHandler, err, reply) {

					var score = reply.score;

					delivery.score = score;
					delivery.save();

					promiseHandler.resolve(delivery);
				}).bind(this, delivery, promiseHandler));
			}

			done(err);

			Promise.all(promises).then((function(task, deliveriesUpdated) {

				var subjectId = task.subject;

				for (var i = 0; i < deliveriesUpdated.length; i++) {
					var deliveryUpdated = deliveriesUpdated[i];

					this.act('role:api, category:score, cmd:calculateAndUpdateScore', {
						subjectid: subjectId,
						studentid: deliveryUpdated.student
					});
				}
			}).bind(this, task));

		}).bind(this, task));
	});

	this.add('role:api, category:delivery, cmd:delete', function(args, done) {

		var params = args.params,
			taskId = params.taskid,
			studentId = params.studentid,
			subjectId = params.subjectid,
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
		} else if (subjectId && studentId) {
			this.act('role:api, category:task, cmd:findAll', {
				query: { subjectid: subjectId }
			}, (function(studentId, err, reply) {

				var tasks = reply;
				for (var i = 0; i < tasks.length; i++) {
					var task = tasks[i];

					Delivery.find({
						task: task._id,
						student: studentId
					}, removeDeliveriesFound);
				}
			}).bind(this, studentId));
		} else if (studentId) {
			Delivery.find({
				student: studentId
			}, removeDeliveriesFound);
		} else if (taskId) {
			Delivery.find({
				task: taskId
			}, removeDeliveriesFound);
		} else {
			Delivery.findById(id, (function(err, delivery) {

				var taskId = delivery.task,
					studentId = delivery.student;

				removeDeliveryFound(err, delivery);

				this.act('role:api, category:task, cmd:findById', {
					params: {
						id: taskId
					}
				}, (function(studentId, err, reply) {

					var task = reply[0],
						subjectId = task.subject;

					this.act('role:api, category:score, cmd:calculateAndUpdateScore', {
						subjectid: subjectId,
						studentid: studentId
					});
				}).bind(this, studentId));

			}).bind(this));
		}
	});

	this.add('role:api, category:delivery, cmd:runTest', function(args, done) {

		var delivery = args.delivery,
			task = args.task;

		if (!task || !task.evaluationTest) {
			done(null);
			return;
		}

		var seneca = this,
			exec = ChildProcess.exec;
			cmd = "node_modules\\.bin\\intern-client",
			pathToTest = "data/tests/",
			pathToCode = "data/deliveries/",

			suites = pathToTest + task.evaluationTest.split(".")[0],
			code = pathToCode + delivery.data.split(".")[0],
			execArgs = "config=tests/intern suites=" + suites + " pathToCode=" + code;

			function cbk(task, delivery, err, stdout, stderr) {

				var results = JSON.parse(stdout);

				if (!results || !results.summary) {
					done(err, stderr);
				}

				delivery.results = results;

				seneca.act('role:api, category:delivery, cmd:getScore', {
					task: task,
					results: results
				}, (function(task, delivery, err, reply) {

					var score = reply.score;

					delivery.score = score;
					delivery.save();

					done(null);

					this.act('role:api, category:score, cmd:calculateAndUpdateScore', {
						subjectid: task.subject,
						studentid: delivery.student
					});
				}).bind(this, task, delivery));
			}

			exec(cmd + " " + execArgs, cbk.bind(this, task, delivery));
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

		var prefix = '/delivery/';

		app.get(prefix, app.oauth.authorise(),
			commons.checkUserHasOwnToken.bind(this),
			commons.checkUserIsAdminOrRequestHasUserQueryFilterOrTeacherInSubject.bind(this),
			commons.expressCbk.bind(this, 'delivery', 'findAll'));

		app.get(prefix + ':id', app.oauth.authorise(),
			commons.checkUserHasOwnToken.bind(this),
			commons.expressCbk.bind(this, 'delivery', 'findById'));

		app.post(prefix, app.oauth.authorise(),
			commons.checkUserHasOwnToken.bind(this),
			commons.checkUserIsAdminOrStudentInSubject.bind(this),
			commons.checkUserIsAdminOrStudentWithTask.bind(this),
			commons.expressCbk.bind(this, 'delivery', 'create'));

		app.put(prefix + ':id/updatescore', app.oauth.authorise(),
			commons.checkUserHasOwnToken.bind(this),
			commons.checkUserIsAdminOrTeacherInSubject.bind(this),
			commons.expressCbk.bind(this, 'delivery', 'updateScore'));

		app.put(prefix + ':id/updatedata', app.oauth.authorise(),
			commons.checkUserHasOwnToken.bind(this),
			commons.checkUserIsAdminOrStudentInSubject.bind(this),
			commons.checkUserIsAdminOrStudentWithTask.bind(this),
			commons.expressCbk.bind(this, 'delivery', 'updateData'));

		app.delete(prefix + ':id', app.oauth.authorise(),
			commons.checkUserHasOwnToken.bind(this),
			commons.checkUserIsAdminOrStudentInSubject.bind(this),
			commons.checkUserIsAdminOrStudentWithTask.bind(this),
			commons.expressCbk.bind(this, 'delivery', 'delete'));

		done();
	});

	return 'delivery';
}
