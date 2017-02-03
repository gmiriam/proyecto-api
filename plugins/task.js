module.exports = function task(options) {

	var mongoose = require('mongoose'),
		Task = mongoose.model('task'),
		Student = mongoose.model('student'),
		app = options.app;
	
	this.add('role:api, category:task, cmd:findAll', function(args, done) {

		var query = args.query,
			subjectId = query.subjectid,
			studentId = query.studentid,
			queryObj;

		if (studentId) {
			Student.findById(studentId, 'tasks', function(err, student) {

				var taskIds = student.tasks;

				queryObj = Task.where('_id').in(taskIds)
					.where('subject', subjectId);

				Task.find(queryObj, function(err, tasks) {

					done(err, tasks);
				});
			});
		} else {
			if (subjectId) {
				queryObj.subject = subjectId;
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
			data = body.data;

		Task.findById(id, function(err, task) {

			if (err) {
				done(err);
			} else if (!task) {
				done(new Error("Not found"));
			} else {
				for (var key in data) {
					var newTaskPropertyValue = data[key];
					task[key] = newTaskPropertyValue;
				}

				task.save(function(err) {

					done(err, [task]);
				});
			}
		});
	});

	this.add('role:api, category:task, cmd:delete', function(args, done) {

		var params = args.params,
			id = params.id;

		Task.findById(id, function(err, task) {

			if (err) {
				done(err);
			} else if (!task) {
				done(new Error("Not found"));
			} else {
				task.remove(function(err) {

					done(err);
				});
			}
		});
	});

	this.add('init:task', function(args, done) {

		function expressCbk(cmd, req, res) {

			this.act('role:api, category:task, cmd:' + cmd, {
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

		var prefix = '/task/';

		app.get(prefix, /*app.oauth.authorise(), */expressCbk.bind(this, 'findAll'));
		app.get(prefix + ':id', /*app.oauth.authorise(), */expressCbk.bind(this, 'findById'));
		app.post(prefix, /*app.oauth.authorise(), */expressCbk.bind(this, 'create'));
		app.put(prefix + ':id', /*app.oauth.authorise(), */expressCbk.bind(this, 'update'));
		app.delete(prefix + ':id', /*app.oauth.authorise(), */expressCbk.bind(this, 'delete'));

		done();
	});

	return 'task';
}
