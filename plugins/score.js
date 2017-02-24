module.exports = function score(options) {

	var mongoose = require('mongoose'),
		Score = mongoose.model('score'),
		User = mongoose.model('user'),
		app = options.app;

	this.add('role:api, category:score, cmd:findAll', function(args, done) {

		var query = args.query,
			subjectId = query.subjectid,
			studentId = query.studentid,
			queryObj = {};

		if (subjectId) {
			queryObj.subject = subjectId;
		}

		if (studentId) {
			queryObj.student = studentId;
		}

		Score.find(queryObj, function(err, scores) {

			done(err, scores);
		});
	});

	this.add('role:api, category:score, cmd:findById', function(args, done) {

		var params = args.params,
			id = params.id;

		Score.findById(id, function(err, score) {

			if (err) {
				done(err);
			} else if (!score) {
				done(new Error("Not found"));
			} else {
				done(null, [score]);
			}
		});
	});

	this.add('role:api, category:score, cmd:create', function(args, done) {

		var body = args.body,
			data = body.data;

		Score.findOne({
			subject: data.subject,
			student: data.student
		}, function(err, score) {

			if (err || score) {
				done(err);
			} else {
				var newScore = new Score(data);

				newScore.save(function(err) {

					done(err, [newScore]);
				});
			}
		});
	});

	this.add('role:api, category:score, cmd:update', function(args, done) {

		var params = args.params,
			body = args.body,
			id = params.id,
			data = body.data,
			finalScore = data.finalScore;

		Score.findById(id, function(err, score) {

			if (err) {
				done(err);
			} else if (!score) {
				done(new Error("Not found"));
			} else {
				score.finalScore = finalScore;
				score.save(function(err) {

					done(err, [score]);
				});
			}
		});
	});

	this.add('role:api, category:score, cmd:delete', function(args, done) {

		var params = args.params,
			subjectId = params.subjectid,
			studentId = params.studentid,
			id = params.id;

		function removeScoreFound(err, score) {

			if (err) {
				done(err);
			} else if (!score) {
				done(new Error("Not found"));
			} else {
				score.remove(function(err) {

					done(err);
				});
			}
		}

		function removeScoresFound(err, scores) {

			if (!err) {
				for (var i = 0; i < scores.length; i++) {
					scores[i].remove();
				}
			}

			done(err);
		}

		if (subjectId && studentId) {
			Score.findOne({
				subject: subjectId,
				student: studentId
			}, removeScoreFound);
		} else if (studentId) {
			Score.find({
				student: studentId
			}, removeScoresFound);
		} else if (subjectId) {
			Score.find({
				subject: subjectId
			}, removeScoresFound);
		} else {
			Score.findById(id, removeScoreFound);
		}
	});

	this.add('init:score', function(args, done) {

		function expressCbk(cmd, req, res) {

			this.act('role:api, category:score, cmd:' + cmd, {
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

		var prefix = '/score/';

		app.get(prefix, /*app.oauth.authorise(), */expressCbk.bind(this, 'findAll'));
		app.get(prefix + ':id', /*app.oauth.authorise(), */expressCbk.bind(this, 'findById'));
		app.put(prefix + ':id', /*app.oauth.authorise(), */expressCbk.bind(this, 'update'));

		done();
	});

	return 'score';
}
