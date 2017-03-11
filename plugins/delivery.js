module.exports = function delivery(options) {

	var path = require('path'),
		mongoose = require('mongoose'),
		Delivery = mongoose.model('delivery'),
		childProcess = require('child_process'),
		exec = childProcess.exec,
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

		Delivery.find(queryObj, (function(args, err, deliveries) {

			var done = args.done;
			done(err, deliveries);
		}).bind(this, { done }));
	});

	this.add('role:api, category:delivery, cmd:findById', function(args, done) {

		var params = args.params,
			id = params.id;

		Delivery.findById(id, (function(args, err, delivery) {

			var done = args.done;
			if (err) {
				done(err);
			} else if (!delivery) {
				done(new Error("Not found"));
			} else {
				done(null, [delivery]);
			}
		}).bind(this, { done }));
	});

	this.add('role:api, category:delivery, cmd:create', function(args, done) {

		var body = args.body,
			data = body.data;

		delete data.score;

		var delivery = new Delivery(data);

		this.act('role:api, category:delivery, cmd:saveAndRunTest', {
			delivery: delivery
		}, (function(args, err, reply) {

			var done = args.done;
			done(err, reply);
		}).bind(this, { done }));
	});

	this.add('role:api, category:delivery, cmd:updateData', function(args, done) {

		var params = args.params,
			body = args.body,
			id = params.id,
			data = body.data,
			deliveredData = data.data;

		Delivery.findById(id, (function(args, err, delivery) {

			var done = args.done,
				deliveredData = args.deliveredData;

			if (err) {
				done(err);
			} else if (!delivery) {
				done(new Error("Not found"));
			} else {
				delivery.data = deliveredData;

				this.act('role:api, category:delivery, cmd:saveAndRunTest', {
					delivery: delivery
				}, (function(args, err, reply) {

					var done = args.done;
					done(err, reply);
				}).bind(this, { done }));
			}
		}).bind(this, { done, deliveredData }));
	});

	this.add('role:api, category:delivery, cmd:updateScore', function(args, done) {

		var params = args.params,
			body = args.body,
			id = params.id,
			data = body.data,
			score = data.score;

		Delivery.findById(id, (function(args, err, delivery) {

			var done = args.done,
				score = args.score;

			if (err) {
				done(err);
			} else if (!delivery) {
				done(new Error("Not found"));
			} else {
				delivery.score = score;

				delivery.save((function(args, err) {

					var done = args.done,
						delivery = args.delivery;

					done(err, [delivery]);
				}).bind(this, { done, delivery }));

				var studentId = delivery.student;
				this.act('role:api, category:task, cmd:findById', {
					params: { id: delivery.task }
				}, (function(args, err, reply) {

					var studentId = args.studentId,
						task = reply[0],
						subjectId = task.subject;

					this.act('role:api, category:score, cmd:calculateAndUpdateScore', {
						subjectid: subjectId,
						studentid: studentId
					});
				}).bind(this, { studentId }));
			}
		}).bind(this, { done, score }));
	});

	this.add('role:api, category:delivery, cmd:saveAndRunTest', function(args, done) {

		var delivery = args.delivery;

		delivery.save((function(args, err) {

			var done = args.done,
				delivery = args.delivery;

			done(err, [delivery]);

			this.act('role:api, category:task, cmd:findById', {
				params: { id: delivery.task }
			}, (function(args, err, reply) {

				var delivery = args.delivery,
					task = reply[0];

				this.act('role:api, category:delivery, cmd:runTest', {
					delivery: delivery,
					task: task
				});
			}).bind(this, { delivery }));
		}).bind(this, { done, delivery }));
	});

	this.add('role:api, category:delivery, cmd:evaluateResults', function(args, done) {

		var task = args.task;

		if (!task) {
			done(null);
			return;
		}

		this.act('role:api, category:delivery, cmd:findAll', {
			query: { taskid: task._id }
		}, (function(args, err, reply) {

			var done = args.done,
				task = args.task,
				deliveries = reply,
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
				}, (function(args, err, reply) {

					var delivery = args.delivery,
						promiseHandler = args.promiseHandler,
						score = reply.score;

					delivery.score = score;
					delivery.save();

					promiseHandler.resolve(delivery);
				}).bind(this, { delivery, promiseHandler }));
			}

			done(err);

			Promise.all(promises).then((function(args, deliveriesUpdated) {

				var task = args.task,
					subjectId = task.subject;

				for (var i = 0; i < deliveriesUpdated.length; i++) {
					var deliveryUpdated = deliveriesUpdated[i];

					this.act('role:api, category:score, cmd:calculateAndUpdateScore', {
						subjectid: subjectId,
						studentid: deliveryUpdated.student
					});
				}
			}).bind(this, { task }));

		}).bind(this, { done, task }));
	});

	this.add('role:api, category:delivery, cmd:delete', function(args, done) {

		var params = args.params,
			taskId = params.taskid,
			studentId = params.studentid,
			subjectId = params.subjectid,
			id = params.id;

		function removeDeliveryFound(args, err, delivery) {

			var done = args.done;
			if (err) {
				done(err);
			} else if (!delivery) {
				done(new Error("Not found"));
			} else {
				delivery.remove((function(args, err) {

					var done = args.done;
					done(err);
				}).bind(this, { done }));
			}
		}

		function removeDeliveriesFound(args, err, deliveries) {

			var done = args.done;
			if (!err) {
				for (var i = 0; i < deliveries.length; i++) {
					deliveries[i].remove();
				}
			}

			done && done(err);
		}

		if (taskId && studentId) {
			Delivery.findOne({
				task: taskId,
				student: studentId
			}, removeDeliveryFound.bind(this, { done }));
		} else if (subjectId && studentId) {
			this.act('role:api, category:task, cmd:findAll', {
				query: { subjectid: subjectId }
			}, (function(args, err, reply) {

				var done = args.done,
					studentId = args.studentId,
					tasks = reply;

				for (var i = 0; i < tasks.length; i++) {
					var task = tasks[i];

					Delivery.find({
						task: task._id,
						student: studentId
					}, removeDeliveriesFound.bind(this, {}));
				}
			}).bind(this, { done, studentId }));
		} else if (studentId) {
			Delivery.find({
				student: studentId
			}, removeDeliveriesFound.bind(this, { done }));
		} else if (taskId) {
			Delivery.find({
				task: taskId
			}, removeDeliveriesFound.bind(this, { done }));
		} else {
			Delivery.findById(id, (function(args, err, delivery) {

				var done = args.done,
					taskId = delivery.task,
					studentId = delivery.student;

				removeDeliveryFound({ done }, err, delivery);

				this.act('role:api, category:task, cmd:findById', {
					params: {
						id: taskId
					}
				}, (function(args, err, reply) {

					var studentId = args.studentId,
						task = reply[0],
						subjectId = task.subject;

					this.act('role:api, category:score, cmd:calculateAndUpdateScore', {
						subjectid: subjectId,
						studentid: studentId
					});
				}).bind(this, { studentId }));

			}).bind(this, { done }));
		}
	});

	this.add('role:api, category:delivery, cmd:runTest', function(args, done) {

		var delivery = args.delivery,
			task = args.task;

		if (!task || !task.evaluationTest || !delivery || !delivery.data) {
			done(null);
			return;
		}

		var cmd = path.resolve("node_modules", ".bin", "intern-client"),
			pathToTest = "data/tests/",
			pathToCode = "data/deliveries/",

			suites = pathToTest + task.evaluationTest.split(".")[0],
			code = pathToCode + delivery.data.split(".")[0],
			execArgs = "config=tests/intern suites=" + suites + " pathToCode=" + code;

			function cbk(args, err, stdout, stderr) {

				var done = args.done,
					task = args.task,
					delivery = args.delivery,
					results = JSON.parse(stdout);

				if (!results || !results.summary) {
					done(err, stderr);
				}

				delivery.results = results;

				this.act('role:api, category:delivery, cmd:getScore', {
					task: task,
					results: results
				}, (function(args, err, reply) {

					var done = args.done,
						task = args.task,
						delivery = args.delivery,
						score = reply.score;

					delivery.score = score;
					delivery.save();

					done(null);

					this.act('role:api, category:score, cmd:calculateAndUpdateScore', {
						subjectid: task.subject,
						studentid: delivery.student
					});
				}).bind(this, { done, task, delivery }));
			}

			exec(cmd + " " + execArgs, cbk.bind(this, { done, task, delivery }));
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
};
