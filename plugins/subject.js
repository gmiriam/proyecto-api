module.exports = function subject(options) {

	var mongoose = require('mongoose'),
		Subject = mongoose.model('subject'),
		User = mongoose.model('user'),
		app = options.app;

	this.add('role:api, category:subject, cmd:findAll', function(args, done) {

		var query = args.query;

		Subject.find(function(err, subjects) {

			done(err, subjects);
		});
	});

	this.add('role:api, category:subject, cmd:findById', function(args, done) {

		var params = args.params,
			id = params.id;

		Subject.findById(id, function(err, subject) {

			if (err) {
				done(err);
			} else if (!subject) {
				done(new Error("Not found"));
			} else {
				done(null, [subject]);
			}
		});
	});

	this.add('role:api, category:subject, cmd:create', function(args, done) {

		var body = args.body,
			data = body.data,
			subject = new Subject(data);

		subject.save(function(err) {

			done(err, [subject]);
		});
	});

	this.add('role:api, category:subject, cmd:update', function(args, done) {

		var params = args.params,
			body = args.body,
			id = params.id,
			data = body.data;

		Subject.findById(id, function(err, subject) {

			if (err) {
				done(err);
			} else if (!subject) {
				done(new Error("Not found"));
			} else {
				for (var key in data) {
					var newSubjectPropertyValue = data[key];
					subject[key] = newSubjectPropertyValue;
				}

				subject.save(function(err) {

					done(err, [subject]);
				});
			}
		});
	});

	this.add('role:api, category:subject, cmd:delete', function(args, done) {

		var params = args.params,
			id = params.id,
			seneca = this;

		Subject.findById(id, function(err, subject) {

			if (err) {
				done(err);
			} else if (!subject) {
				done(new Error("Not found"));
			} else {
				var subjectId = subject._id;

				seneca.act('role:api, category:task, cmd:delete', {
					params: {
						subjectid: subjectId
					}
				});

				seneca.act('role:api, category:score, cmd:delete', {
					params: {
						subjectid: subjectId
					}
				});

				seneca.act('role:api, category:subject, cmd:unenrollAllStudents', {
					params: {
						subjectid: subjectId
					}
				});

				subject.remove(function(err) {

					done(err);
				});
			}
		});
	});

	this.add('role:api, category:subject, cmd:enrollStudents', function(args, done) {

		var body = args.body,
			data = body.data,
			subjectId = data.subject,
			studentIds = data.students,
			seneca = this;

		User.find({
			_id: {
				$in: studentIds
			}
		}).cursor().on('data', function(student) {

			if (!student || !Array.isArray(student.enrolledSubjects)) {
				student.enrolledSubjects = [];
			}

			if (student.enrolledSubjects.indexOf(subjectId) === -1) {
				student.enrolledSubjects.push(subjectId);

				seneca.act('role:api, category:score, cmd:create', {
					body: {
						data: {
							subject: subjectId,
							student: student._id
						}
					}
				});
			}

			student.save();
		});

		done(null);
	});

	this.add('role:api, category:subject, cmd:unenrollStudents', function(args, done) {

		var body = args.body,
			data = body.data,
			subjectId = data.subject,
			studentIds = data.students,
			seneca = this;

		User.find({
			_id: {
				$in: studentIds
			}
		}).cursor().on('data', function(student) {

			if (!student || !Array.isArray(student.enrolledSubjects)) {
				return;
			}

			var index = student.enrolledSubjects.indexOf(subjectId);
			if (index !== -1) {
				student.enrolledSubjects.splice(index, 1);

				var studentId = student._id;

				seneca.act('role:api, category:task, cmd:unassignAllFromStudentBySubject', {
					params: {
						subjectid: subjectId,
						studentid: studentId
					}
				});

				seneca.act('role:api, category:delivery, cmd:delete', {
					params: {
						subjectid: subjectId,
						studentid: studentId
					}
				});

				seneca.act('role:api, category:score, cmd:delete', {
					params: {
						subjectid: subjectId,
						studentid: studentId
					}
				});
			}

			student.save();
		});

		done(null);
	});

	this.add('role:api, category:subject, cmd:unenrollAllStudents', function(args, done) {

		var params = args.params,
			subjectId = params.subjectid
			seneca = this;

		User.find({
			enrolledSubjects: subjectId
		}).cursor().on('data', function(student) {

			var index = student.enrolledSubjects.indexOf(subjectId);
			student.enrolledSubjects.splice(index, 1);

			student.save();
		});

		done(null);
	});

	this.add('init:subject', function(args, done) {

		function expressCbk(cmd, req, res) {

			this.act('role:api, category:subject, cmd:' + cmd, {
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

		var prefix = '/subject/';

		app.get(prefix, /*app.oauth.authorise(), */expressCbk.bind(this, 'findAll'));
		app.get(prefix + ':id', /*app.oauth.authorise(), */expressCbk.bind(this, 'findById'));
		app.post(prefix, /*app.oauth.authorise(), */expressCbk.bind(this, 'create'));
		app.put(prefix + ':id', /*app.oauth.authorise(), */expressCbk.bind(this, 'update'));
		app.delete(prefix + ':id', /*app.oauth.authorise(), */expressCbk.bind(this, 'delete'));
		app.post(prefix + 'enrollstudents', /*app.oauth.authorise(), */expressCbk.bind(this, 'enrollStudents'));
		app.post(prefix + 'unenrollstudents', /*app.oauth.authorise(), */expressCbk.bind(this, 'unenrollStudents'));

		done();
	});

	return 'subject';
}
