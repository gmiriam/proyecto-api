module.exports = function user(options) {

	var mongoose = require('mongoose'),
		User = mongoose.model('user'),
		app = options.app;

	this.add('role:api, category:user, cmd:findAll', function(args, done) {

		var query = args.query,
			role = query.role,
			enrolledSubjectId = query.enrolledsubjectid,
			queryObj;

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

		if (enrolledSubjectId) {
			queryObj = { 'enrolledSubjects': enrolledSubjectId };
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
			data = body.data,
			user = new User(data);

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
					var newUserPropertyValue = data[key];
					user[key] = newUserPropertyValue;
				}

				user.save(function(err) {

					done(err, [user]);
				});
			}
		});
	});

	this.add('role:api, category:user, cmd:delete', function(args, done) {

		var params = args.params,
			id = params.id;

		User.findById(id, function(err, user) {

			if (err) {
				done(err);
			} else if (!user) {
				done(new Error("Not found"));
			} else {
				user.remove(function(err) {

					done(err);
				});
			}
		});
	});

	this.add('init:user', function(args, done) {

		function expressCbk(cmd, req, res) {

			this.act('role:api, category:user, cmd:' + cmd, {
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

		var prefix = '/user/';

		app.get(prefix, /*app.oauth.authorise(), */expressCbk.bind(this, 'findAll'));
		app.get(prefix + ':id', /*app.oauth.authorise(), */expressCbk.bind(this, 'findById'));
		app.post(prefix, /*app.oauth.authorise(), */expressCbk.bind(this, 'create'));
		app.put(prefix + ':id', /*app.oauth.authorise(), */expressCbk.bind(this, 'update'));
		app.delete(prefix + ':id', /*app.oauth.authorise(), */expressCbk.bind(this, 'delete'));

		done();
	});

	return 'user';
}
