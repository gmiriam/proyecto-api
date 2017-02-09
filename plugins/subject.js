module.exports = function subject(options) {

	var mongoose = require('mongoose'),
		Subject = mongoose.model('subject'),
		User = mongoose.model('user'),
		app = options.app;

	this.add('role:api, category:subject, cmd:findAll', function(args, done) {

		var query = args.query,
			subjectId = query.subjectid,
			userId = query.userid,
			queryObj;

		if (userId) {
			User.findById(userId, 'subjects', function(err, user) {

				var subjectIds = user.subjects;

				queryObj = Subject.where('_id').in(subjectIds)
					.where('subject', subjectId);

				Subject.find(queryObj, function(err, subjects) {

					done(err, subjects);
				});
			});
		} else {
			if (subjectId) {
				queryObj.subject = subjectId;
			}

			Subject.find(queryObj, function(err, subjects) {

				done(err, subjects);
			});
		}
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
			id = params.id;

		Subject.findById(id, function(err, subject) {

			if (err) {
				done(err);
			} else if (!subject) {
				done(new Error("Not found"));
			} else {
				subject.remove(function(err) {

					done(err);
				});
			}
		});
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

		done();
	});

	return 'subject';
}
