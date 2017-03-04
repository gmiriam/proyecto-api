module.exports = function user(options) {

	var mongoose = require('mongoose'),
		User = mongoose.model('user'),
		Token = mongoose.model('token'),
		app = options.app,
		commons = options.commons;

	this.add('role:api, category:user, cmd:findAll', function(args, done) {

		var query = args.query,
			role = query.role,
			email = query.email,
			enrolledSubjectId = query.enrolledsubjectid,
			assignedTaskId = query.assignedtaskid,
			subjectId = query.subjectid,
			queryObj;

		if (subjectId) {
			this.act('role:api, category:subject, cmd:findById', {
				params: {
					id: subjectId
				}
			}, (function(done, err, reply) {

				var subject = reply[0],
					teachers = subject.teachers,
					queryObj = {
						_id: {
							$in: teachers
						}
					};

				User.find(queryObj, (function(done, err, users) {

					done(err, users);
				}).bind(this, done));
			}).bind(this, done));
			return;
		}

		if (role) {
			if (role === 'student') {
				queryObj = {
					'$or': [{
						'role': 'student'
					},{
						'enrolledSubjects.0': {
							'$exists': true
						}
					}]
				};
			} else {
				queryObj = { 'role': role };
			}
		}

		if (email) {
			queryObj = { 'email': email };
		}

		if (enrolledSubjectId) {
			queryObj = { 'enrolledSubjects': enrolledSubjectId };
		}

		if (assignedTaskId) {
			queryObj = { 'assignedTasks': assignedTaskId };
		}

		User.find(queryObj, function(err, users) {

			done(err, users);
		});
	});

	this.add('role:api, category:user, cmd:findById', function(args, done) {

		var params = args.params,
			id = params.id;

		User.findById(id, function(err, user) {

			if (err) {
				done(err);
			} else if (!user) {
				done(new Error("Not found"));
			} else {
				done(null, [user]);
			}
		});
	});

	this.add('role:api, category:user, cmd:create', function(args, done) {

		var body = args.body,
			data = body.data;

		delete data.enrolledSubjects;
		delete data.assignedTasks;

		var user = new User(data);

		user.save(function(err) {

			done(err, [user]);
		});
	});

	this.add('role:api, category:user, cmd:update', function(args, done) {

		var params = args.params,
			body = args.body,
			id = params.id,
			data = body.data;

		User.findById(id, function(err, user) {

			if (err) {
				done(err);
			} else if (!user) {
				done(new Error("Not found"));
			} else {
				for (var key in data) {
					if (key !== "enrolledSubjects" && key !== "assignedTasks") {
						var newUserPropertyValue = data[key];
						user[key] = newUserPropertyValue;
					}
				}

				user.save(function(err) {

					done(err, [user]);
				});
			}
		});
	});

	this.add('role:api, category:user, cmd:delete', function(args, done) {

		var params = args.params,
			id = params.id,
			seneca = this;

		User.findById(id, function(err, user) {

			if (err) {
				done(err);
			} else if (!user) {
				done(new Error("Not found"));
			} else {
				var userId = user._id,
					enrolledSubjects = user.enrolledSubjects,
					assignedTasks = user.assignedTasks;

				if (enrolledSubjects && enrolledSubjects.length) {
					seneca.act('role:api, category:score, cmd:delete', {
						params: {
							studentid: userId
						}
					});
				}

				if (assignedTasks && assignedTasks.length) {
					seneca.act('role:api, category:delivery, cmd:delete', {
						params: {
							studentid: userId
						}
					});
				}

				user.remove(function(err) {

					done(err);
				});
			}
		});
	});

	this.add('role:api, category:user, cmd:checkUserHasOwnToken', function(args, done) {

		var userToken = args.userToken,
			userId = args.userId;

		if (!userToken) {
			done(null, { hasOwnToken: false });
			return;
		}

		Token.findOne({
			accessToken: userToken
		}, (function(userId, err, token) {

			if (err) {
				done(err);
			} else if (!token) {
				done(new Error("Not found"));
			} else {
				var user = token.user;

				this.act('role:api, category:user, cmd:findAll', {
					query: {
						email: user.email
					}
				}, (function(userId, args, reply) {

					var user = reply[0],
						hasOwnToken = userId === user._id.toString();

					done(null, { hasOwnToken: hasOwnToken });
				}).bind(this, userId));
			}
		}).bind(this, userId));
	});

	this.add('init:user', function(args, done) {

		var prefix = '/user/';

		app.get(prefix, app.oauth.authorise(),
			commons.expressCbk.bind(this, 'user', 'findAll'));

		app.get(prefix + ':id', app.oauth.authorise(),
			commons.checkUserHasOwnToken.bind(this),
			commons.expressCbk.bind(this, 'user', 'findById'));

		app.post(prefix, app.oauth.authorise(),
			commons.checkUserHasOwnToken.bind(this),
			commons.checkUserIsAdmin.bind(this),
			commons.expressCbk.bind(this, 'user', 'create'));

		app.put(prefix + ':id', app.oauth.authorise(),
			commons.checkUserHasOwnToken.bind(this),
			commons.checkUserIsAdmin.bind(this),
			commons.expressCbk.bind(this, 'user', 'update'));

		app.delete(prefix + ':id', app.oauth.authorise(),
			commons.checkUserHasOwnToken.bind(this),
			commons.checkUserIsAdmin.bind(this),
			commons.expressCbk.bind(this, 'user', 'delete'));

		done();
	});

	return 'user';
}
