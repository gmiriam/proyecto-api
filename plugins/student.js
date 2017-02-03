module.exports = function student(options) {

	var mongoose = require('mongoose'),
		Student = mongoose.model('student'),
		User = mongoose.model('user'),
		app = options.app;

	function getUserByStudent(student) {

		var resolvePromise,
			rejectPromise,
			promise = new Promise(function(resolve, reject) {
				resolvePromise = resolve;
				rejectPromise = reject;
			});

		User.findById(student.userId, onUserFound.bind(undefined, {
			student: student,
			resolvePromise: resolvePromise,
			rejectPromise: rejectPromise
		}));

		return promise;
	}

	function onUserFound(args, err, user) {

		var student = args.student,
			resolvePromise = args.resolvePromise,
			rejectPromise = args.rejectPromise;

		if (err) {
			rejectPromise();
			done(err);
			return;
		}

		resolvePromise({
			user: user,
			student: student
		});
	};

	this.add('role:api, category:student, cmd:findAll', function(args, done) {

		Student.find(function(err, students) {

			if (err) {
				done(err);
				return;
			}

			if (students && students.length) {
				var promises = [];

				for (var i = 0; i < students.length; i++) {
					var studentFound = students[i],
						userPromise = getUserByStudent(studentFound);

					promises.push(userPromise);
				}

				Promise.all(promises).then(function(values) {
					done(err, values);
				}).catch(function(reason) {
					done(reason);
				});
			} else {
				done(err, students);
			}
		});
	});

	this.add('role:api, category:student, cmd:findById', function(args, done) {

		var params = args.params,
			id = params.id;

		Student.findById(id, function(err, student) {

			if (err) {
				done(err);
			} else if (!student) {
				done(new Error("Not found"));
			} else {
				var userPromise = getUserByStudent(student);
				userPromise.then(function(value) {
					done(err, value);
				}).catch(function(reason) {
					done(reason);
				});
			}
		});
	});

	this.add('role:api, category:student, cmd:create', function(args, done) {

		var body = args.body,
			data = body.data,
			user = new User(data),
			student = new Student(data);

		user.save(function(err) {

			if (err) {
				done(err);
				return;
			}

			var userId = user._id;
			student.userId = userId;

			student.save(function(err) {

				done(err, [student]);
			});
		});
	});

	this.add('role:api, category:student, cmd:update', function(args, done) {

		var params = args.params,
			body = args.body,
			id = params.id,
			data = body.data;

		Student.findById(id, function(err, student) {

			if (err) {
				done(err);
			} else if (!student) {
				done(new Error("Not found"));
			} else {
				for (var key in data) {
					var newStudentPropertyValue = data[key];
					student[key] = newStudentPropertyValue;
				}

				student.save(function(err) {

					done(err, [student]);
				});
			}
		});
	});

	this.add('role:api, category:student, cmd:delete', function(args, done) {

		var params = args.params,
			id = params.id;

		Student.findById(id, function(err, student) {

			if (err) {
				done(err);
			} else if (!student) {
				done(new Error("Not found"));
			} else {
				student.remove(function(err) {

					done(err);
				});
			}
		});
	});

	this.add('init:student', function(args, done) {

		function expressCbk(cmd, req, res) {

			this.act('role:api, category:student, cmd:' + cmd, {
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

		var prefix = '/student/';

		app.get(prefix, /*app.oauth.authorise(), */expressCbk.bind(this, 'findAll'));
		app.get(prefix + ':id', /*app.oauth.authorise(), */expressCbk.bind(this, 'findById'));
		app.post(prefix, /*app.oauth.authorise(), */expressCbk.bind(this, 'create'));
		app.put(prefix + ':id', /*app.oauth.authorise(), */expressCbk.bind(this, 'update'));
		app.delete(prefix + ':id', /*app.oauth.authorise(), */expressCbk.bind(this, 'delete'));

		done();
	});

	return 'student';
}
