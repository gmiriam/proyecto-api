module.exports = function task(options) {

	var mongoose = require('mongoose'),
		Task = mongoose.model('task'),
		User = mongoose.model('user'),
		app = options.app,
		commons = options.commons;

	this.add('role:api, category:task, cmd:findAll', function(args, done) {

		var query = args.query,
			subjectId = query.subjectid,
			userId = query.userid,
			queryObj;

		if (userId) {
			User.findById(userId, 'assignedTasks', function(err, user) {

				var taskIds = user.assignedTasks;

				queryObj = {
					_id: {
						$in: taskIds
					},
					subject: subjectId
				};

				Task.find(queryObj, function(err, tasks) {

					done(err, tasks);
				});
			});
		} else {
			if (subjectId) {
				queryObj = {
					subject: subjectId
				};
			}

			Task.find(queryObj, function(err, tasks) {

				done(err, tasks);
			});
		}
	});

	this.add('role:api, category:task, cmd:findById', function(args, done) {

		var params = args.params,
			id = params.id;

		Task.findById(id, function(err, task) {

			if (err) {
				done(err);
			} else if (!task) {
				done(new Error("Not found"));
			} else {
				done(null, [task]);
			}
		});
	});

	this.add('role:api, category:task, cmd:create', function(args, done) {

		var body = args.body,
			data = body.data,
			task = new Task(data);

		task.save(function(err) {

			done(err, [task]);
		});
	});

	this.add('role:api, category:task, cmd:update', function(args, done) {

		var params = args.params,
			body = args.body,
			id = params.id,
			data = body.data,
			seneca = this;

		Task.findById(id, function(err, task) {

			if (err) {
				done(err);
			} else if (!task) {
				done(new Error("Not found"));
			} else {
				var evaluateResults,
					runTest;

				if (task.maxScore !== data.maxScore && task.evaluationTest === data.evaluationTest) {
					evaluateResults = true;
				}
				if (task.evaluationTest !== data.evaluationTest) {
					runTest = true;
				}

				for (var key in data) {
					var newTaskPropertyValue = data[key];
					task[key] = newTaskPropertyValue;
				}

				task.save(function(err) {

					done(err, [task]);

					runTest && seneca.act('role:api, category:delivery, cmd:findAll', {
						query: { taskid: task._id }
					}, function(err, reply) {

						var deliveries = reply;

						for (var i = 0; i < deliveries.length; i++) {
							var delivery = deliveries[i];

							seneca.act('role:api, category:delivery, cmd:runTest', {
								delivery: delivery,
								task: task
							});
						}
					});
				});

				evaluateResults && seneca.act('role:api, category:delivery, cmd:evaluateResults', {
					task: task
				});
			}
		});
	});

	this.add('role:api, category:task, cmd:delete', function(args, done) {

		var params = args.params,
			subjectId = params.subjectid,
			id = params.id;

		function removeTaskFound(onTaskRemoved, done, err, task) {

			if (err) {
				done(err);
			} else if (!task) {
				done(new Error("Not found"));
			} else {
				var taskId = task._id;

				this.act('role:api, category:task, cmd:unassignFromStudents', {
					params: {
						taskid: task._id
					}
				}, (function(task, onTaskRemoved, done, err, reply) {

					if (err) {
						done(err);
						return;
					}

					this.act('role:api, category:delivery, cmd:delete', {
						params: {
							taskid: task._id
						}
					}, (function(task, onTaskRemoved, done, err, reply) {

						if (err) {
							done(err);
							return;
						}

						if (onTaskRemoved) {
							task.remove(onTaskRemoved.bind(this, done));
						} else {
							task.remove();
						}
					}).bind(this, task, onTaskRemoved, done));
				}).bind(this, task, onTaskRemoved, done));
			}
		}

		function onTaskRemoved(done, err) {

			done(err);
		}

		function removeTasksFound(done, err, tasks) {

			if (!err) {
				for (var i = 0; i < tasks.length; i++) {
					var task = tasks[i],
						taskId = task._id;

					removeTaskFound(null, done, null, task);
				}
			}

			done(err);
		}

		if (subjectId) {
			Task.find({
				subject: subjectId
			}, removeTasksFound.bind(this, done));
		} else {
			Task.findById(id, removeTaskFound.bind(this, onTaskRemoved, done));
		}
	});

	this.add('role:api, category:task, cmd:assign', function(args, done) {

		var body = args.body,
			data = body.data,
			taskId = data.task,
			studentIds = data.students;

		this.act('role:api, category:task, cmd:findById', {
			params: {
				id: taskId
			}
		}, (function(studentIds, err, reply) {

			User.find({
				_id: {
					$in: studentIds
				}
			}).cursor().on('data', (function(task, student) {

				if (!student) {
					return;
				}

				var taskId = task._id,
					studentId = student._id;

				if (!Array.isArray(student.assignedTasks)) {
					student.assignedTasks = [];
				}

				if (student.assignedTasks.indexOf(taskId) === -1) {
					student.assignedTasks.push(taskId);
				}

				student.save();

				this.act('role:api, category:score, cmd:calculateAndUpdateScore', {
					subjectid: task.subject,
					studentid: studentId
				});
			}).bind(this, reply[0]));

			done(null);
		}).bind(this, studentIds));
	});

	this.add('role:api, category:task, cmd:unassign', function(args, done) {

		var body = args.body,
			data = body.data,
			taskId = data.task,
			studentIds = data.students;

		this.act('role:api, category:task, cmd:findById', {
			params: {
				id: taskId
			}
		}, (function(studentIds, err, reply) {

			User.find({
				_id: {
					$in: studentIds
				}
			}).cursor().on('data', (function(task, student) {

				if (!student || !Array.isArray(student.assignedTasks)) {
					return;
				}

				var taskId = task._id,
					studentId = student._id,
					index = student.assignedTasks.indexOf(taskId);

				if (index !== -1) {
					student.assignedTasks.splice(index, 1);
				}

				student.save();

				this.act('role:api, category:score, cmd:calculateAndUpdateScore', {
					subjectid: task.subject,
					studentid: studentId
				});
			}).bind(this, reply[0]));

			done(null);
		}).bind(this, studentIds));
	});

	this.add('role:api, category:task, cmd:unassignFromStudents', function(args, done) {

		var params = args.params,
			taskId = params.taskid;

		this.act('role:api, category:task, cmd:findById', {
			params: {
				id: taskId
			}
		}, (function(err, reply) {

			this.act('role:api, category:user, cmd:findAll', {
				query: {
					assignedtaskid: taskId
				}
			}, (function(task, err, reply) {

				var students = reply,
					taskId = task._id;

				if (!students || !students.length) {
					return;
				}

				for (var i = 0; i < students.length; i++) {
					var student = students[i],
						index = student.assignedTasks.indexOf(taskId);

					if (index !== -1) {
						student.assignedTasks.splice(index, 1);
					}

					student.save();

					this.act('role:api, category:score, cmd:calculateAndUpdateScore', {
						subjectid: task.subject,
						studentid: student._id
					});
				}
			}).bind(this, reply[0]));

			done(null);
		}).bind(this));
	});

	this.add('role:api, category:task, cmd:unassignAllFromStudentBySubject', function(args, done) {

		var params = args.params,
			subjectId = params.subjectid,
			studentId = params.studentid;

		this.act('role:api, category:task, cmd:findAll', {
			query: {
				subjectid: subjectId
			}
		}, function(err, reply) {

			var tasks = reply;

			if (!tasks || !tasks.length) {
				return;
			}

			User.findById(studentId, function(err, student) {

				if (!student || !Array.isArray(student.assignedTasks)) {
					return;
				}

				for (var i = 0; i < tasks.length; i++) {
					var task = tasks[i],
						taskId = task._id,
						index = student.assignedTasks.indexOf(taskId);

					if (index !== -1) {
						student.assignedTasks.splice(index, 1);
					}
				}

				student.save();
			});
		});

		done(null);
	});

	this.add('init:task', function(args, done) {

		var prefix = '/task/';

		app.get(prefix, app.oauth.authorise(),
			commons.checkUserHasOwnToken.bind(this),
			commons.checkUserIsAdminOrRequestHasUserQueryFilterOrTeacherInSubject.bind(this),
			commons.expressCbk.bind(this, 'task', 'findAll'));

		app.get(prefix + ':id', app.oauth.authorise(),
			commons.checkUserHasOwnToken.bind(this),
			commons.expressCbk.bind(this, 'task', 'findById'));

		app.post(prefix, app.oauth.authorise(),
			commons.checkUserHasOwnToken.bind(this),
			commons.checkUserIsAdminOrTeacherInSubject.bind(this),
			commons.expressCbk.bind(this, 'task', 'create'));

		app.put(prefix + ':id', app.oauth.authorise(),
			commons.checkUserHasOwnToken.bind(this),
			commons.checkUserIsAdminOrTeacherInSubject.bind(this),
			commons.expressCbk.bind(this, 'task', 'update'));

		app.delete(prefix + ':id', app.oauth.authorise(),
			commons.checkUserHasOwnToken.bind(this),
			commons.checkUserIsAdminOrTeacherInSubject.bind(this),
			commons.expressCbk.bind(this, 'task', 'delete'));

		app.post(prefix + 'assign', app.oauth.authorise(),
			commons.checkUserHasOwnToken.bind(this),
			commons.checkUserIsAdminOrTeacherInSubject.bind(this),
			commons.expressCbk.bind(this, 'task', 'assign'));

		app.post(prefix + 'unassign', app.oauth.authorise(),
			commons.checkUserHasOwnToken.bind(this),
			commons.checkUserIsAdminOrTeacherInSubject.bind(this),
			commons.expressCbk.bind(this, 'task', 'unassign'));

		done();
	});

	return 'task';
}
