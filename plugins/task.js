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
			this.act('role:api, category:user, cmd:findById', {
				params: {
					subjectid: subjectId,
					id: userId
				}
			}, (function(args, err, reply) {

				var done = args.done,
					subjectId = args.subjectId,
					user = reply[0],
					taskIds = user.assignedTasks,
					queryObj = {
						_id: {
							$in: taskIds
						},
						subject: subjectId
					};

				Task.find(queryObj, (function(args, err, tasks) {

					var done = args.done;
					done(err, tasks);
				}).bind(this, { done }));
			}).bind(this, { done, subjectId }));
		} else {
			if (subjectId) {
				queryObj = {
					subject: subjectId
				};
			}

			Task.find(queryObj, (function(args, err, tasks) {

				var done = args.done;
				done(err, tasks);
			}).bind(this, { done }));
		}
	});

	this.add('role:api, category:task, cmd:findById', function(args, done) {

		var params = args.params,
			id = params.id;

		Task.findById(id, (function(args, err, task) {

			var done = args.done;
			if (err) {
				done(err);
			} else if (!task) {
				done(new Error("Not found"));
			} else {
				done(null, [task]);
			}
		}).bind(this, { done }));
	});

	this.add('role:api, category:task, cmd:create', function(args, done) {

		var body = args.body,
			data = body.data,
			task = new Task(data);

		task.save((function(args, err) {

			var done = args.done,
				task = args.task;

			done(err, [task]);
		}).bind(this, { done, task }));
	});

	this.add('role:api, category:task, cmd:update', function(args, done) {

		var params = args.params,
			body = args.body,
			id = params.id,
			data = body.data;

		Task.findById(id, (function(args, err, task) {

			var done = args.done,
				data = args.data;

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

				task.save((function(args, err) {

					var done = args.done,
						task = args.task,
						runTest = args.runTest;

					done(err, [task]);

					runTest && this.act('role:api, category:delivery, cmd:findAll', {
						query: {
							taskid: task._id
						}
					}, (function(args, err, reply) {

						var task = args.task,
							deliveries = reply;

						for (var i = 0; i < deliveries.length; i++) {
							var delivery = deliveries[i];

							this.act('role:api, category:delivery, cmd:runTest', {
								delivery: delivery,
								task: task
							});
						}
					}).bind(this, { task }));
				}).bind(this, { done, task, runTest }));

				evaluateResults && this.act('role:api, category:delivery, cmd:evaluateResults', {
					task: task
				});
			}
		}).bind(this, { done, data }));
	});

	this.add('role:api, category:task, cmd:delete', function(args, done) {

		var params = args.params,
			subjectId = params.subjectid,
			id = params.id;

		function removeTaskFound(args, err, task) {

			var done = args.done,
				onTaskRemoved = args.onTaskRemoved;

			if (err) {
				done && done(err);
			} else if (!task) {
				done && done(new Error("Not found"));
			} else {
				var taskId = task._id;

				this.act('role:api, category:task, cmd:unassignFromStudents', {
					params: {
						taskid: task._id
					}
				}, (function(args, err, reply) {

					var done = args.done,
						onTaskRemoved = args.onTaskRemoved,
						task = args.task;

					if (err) {
						done && done(err);
						return;
					}

					this.act('role:api, category:delivery, cmd:delete', {
						params: {
							taskid: task._id
						}
					}, (function(args, err, reply) {

						var done = args.done,
							onTaskRemoved = args.onTaskRemoved,
							task = args.task;

						if (err) {
							done && done(err);
							return;
						}

						if (onTaskRemoved) {
							task.remove(onTaskRemoved);
						} else {
							task.remove();
						}
					}).bind(this, { done, onTaskRemoved, task }));
				}).bind(this, { done, onTaskRemoved, task }));
			}
		}

		function removeTasksFound(args, err, tasks) {

			var done = args.done;
			if (!err) {
				for (var i = 0; i < tasks.length; i++) {
					var task = tasks[i],
						taskId = task._id;

					removeTaskFound.bind(this, {})(null, task);
				}
			}

			done(err);
		}

		var onTaskRemoved = (function onTaskRemoved(args, err) {

			var done = args.done;
			done && done(err);
		}).bind(this, { done });

		if (subjectId) {
			Task.find({
				subject: subjectId
			}, removeTasksFound.bind(this, { done }));
		} else {
			Task.findById(id, removeTaskFound.bind(this, { done, onTaskRemoved }));
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
		}, (function(args, err, reply) {

			var done = args.done,
				studentIds = args.studentIds,
				task = reply[0];

			User.find({
				_id: {
					$in: studentIds
				}
			}).cursor().on('data', (function(args, student) {

				var task = args.task;
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
			}).bind(this, { task }));

			done();
		}).bind(this, { done, studentIds }));
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
		}, (function(args, err, reply) {

			var done = args.done,
				studentIds = args.studentIds,
				task = reply[0];

			User.find({
				_id: {
					$in: studentIds
				}
			}).cursor().on('data', (function(args, student) {

				var task = args.task;
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
			}).bind(this, { task }));

			done();
		}).bind(this, { done, studentIds }));
	});

	this.add('role:api, category:task, cmd:unassignFromStudents', function(args, done) {

		var params = args.params,
			taskId = params.taskid;

		this.act('role:api, category:task, cmd:findById', {
			params: {
				id: taskId
			}
		}, (function(args, err, reply) {

			var done = args.done,
				task = reply[0];

			this.act('role:api, category:user, cmd:findAll', {
				query: {
					assignedtaskid: taskId
				}
			}, (function(args, err, reply) {

				var task = args.task,
					students = reply,
					taskId = task._id;

				if (!students || !students.length) {
					return;
				}

				for (var i = 0; i < students.length; i++) {
					var student = students[i],
						index = student.assignedTasks ? student.assignedTasks.indexOf(taskId) : -1;

					if (index !== -1) {
						student.assignedTasks.splice(index, 1);
					}

					student.save();

					this.act('role:api, category:score, cmd:calculateAndUpdateScore', {
						subjectid: task.subject,
						studentid: student._id
					});
				}
			}).bind(this, { task }));

			done();
		}).bind(this, {done }));
	});

	this.add('role:api, category:task, cmd:unassignAllFromStudentBySubject', function(args, done) {

		var params = args.params,
			subjectId = params.subjectid,
			studentId = params.studentid;

		this.act('role:api, category:task, cmd:findAll', {
			query: {
				subjectid: subjectId
			}
		}, (function(args, err, reply) {

			var studentId = args.studentId,
				tasks = reply;

			if (!tasks || !tasks.length) {
				return;
			}

			this.act('role:api, category:user, cmd:findById', {
				params: {
					id: studentId
				}
			}, (function(args, err, reply) {

				var tasks = args.tasks,
					student = reply[0];

				if (!student || !Array.isArray(student.assignedTasks)) {
					return;
				}

				for (var i = 0; i < tasks.length; i++) {
					var task = tasks[i],
						taskId = task._id,
						index = student.assignedTasks ? student.assignedTasks.indexOf(taskId) : -1;

					if (index !== -1) {
						student.assignedTasks.splice(index, 1);
					}
				}

				student.save();
			}).bind(this, { tasks }));
		}).bind(this, { studentId }));

		done();
	});

	this.add('init:task', function(args, done) {

		var prefix = '/task/';

		app.get(prefix, app.oauth.authorise(),
			commons.checkUserHasOwnToken.bind(this),
			commons.checkUserIsAdminOrRequestHasUserQueryFilterOrTeacherInSubject.bind(this),
			commons.expressCbk.bind(this, {
				cat: 'task',
				cmd: 'findAll'
			}));

		app.get(prefix + ':id', app.oauth.authorise(),
			commons.checkUserHasOwnToken.bind(this),
			commons.expressCbk.bind(this, {
				cat: 'task',
				cmd: 'findById'
			}));

		app.post(prefix, app.oauth.authorise(),
			commons.checkUserHasOwnToken.bind(this),
			commons.checkUserIsAdminOrTeacherInSubject.bind(this),
			commons.expressCbk.bind(this, {
				cat: 'task',
				cmd: 'create'
			}));

		app.put(prefix + ':id', app.oauth.authorise(),
			commons.checkUserHasOwnToken.bind(this),
			commons.checkUserIsAdminOrTeacherInSubject.bind(this),
			commons.expressCbk.bind(this, {
				cat: 'task',
				cmd: 'update'
			}));

		app.delete(prefix + ':id', app.oauth.authorise(),
			commons.checkUserHasOwnToken.bind(this),
			commons.checkUserIsAdminOrTeacherInSubject.bind(this),
			commons.expressCbk.bind(this, {
				cat: 'task',
				cmd: 'delete'
			}));

		app.post(prefix + 'assign', app.oauth.authorise(),
			commons.checkUserHasOwnToken.bind(this),
			commons.checkUserIsAdminOrTeacherInSubject.bind(this),
			commons.expressCbk.bind(this, {
				cat: 'task',
				cmd: 'assign'
			}));

		app.post(prefix + 'unassign', app.oauth.authorise(),
			commons.checkUserHasOwnToken.bind(this),
			commons.checkUserIsAdminOrTeacherInSubject.bind(this),
			commons.expressCbk.bind(this, {
				cat: 'task',
				cmd: 'unassign'
			}));

		done();
	});

	return 'task';
};
