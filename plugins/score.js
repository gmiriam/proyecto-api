module.exports = function score(options) {

	var mongoose = require('mongoose'),
		Score = mongoose.model('score'),
		User = mongoose.model('user'),
		app = options.app,
		commons = options.commons;

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

	this.add('role:api, category:score, cmd:calculateAndUpdateScore', function(args, done) {

		var subjectId = args.subjectid,
			studentId = args.studentid;

		if (!subjectId || !studentId) {
			done(null);
			return;
		}

		this.act('role:api, category:score, cmd:findAll', {
			query: {
				subjectid: subjectId,
				studentid: studentId
			}
		}, (function(subjectId, studentId, err, reply) {

			var score = reply[0];

			this.act('role:api, category:task, cmd:findAll', {
				query: {
					subjectid: subjectId,
					userid: studentId
				}
			}, (function(studentId, score, err, reply) {

				var tasks = reply,
					promises = [];

				for (var i = 0; i < tasks.length; i++) {
					var task = tasks[i],
						taskId = task._id,
						maxScore = task.maxScore,

						promiseHandler = {},
						promise = new Promise((function(resolve, reject) {

							this.resolve = resolve;
							this.reject = reject;
						}).bind(promiseHandler));

					promises.push(promise);

					this.act('role:api, category:delivery, cmd:findAll', {
						query: {
							taskid: taskId,
							studentid: studentId
						}
					}, (function(maxScore, promiseHandler, err, reply) {

						var delivery = reply[0];

						if (!delivery) {
							promiseHandler.resolve(null);
							return;
						}

						promiseHandler.resolve({
							maxScore: maxScore,
							score: delivery.score
						});
					}).bind(this, maxScore, promiseHandler));
				}

				Promise.all(promises).then((function(score, results) {

					this.act('role:api, category:score, cmd:calculateScore', {
						scoreData: results
					}, (function(score, err, reply) {

						var finalScore = reply.finalScore;

						score.finalScore = finalScore;
						score.save(function(err) {

							done(err, [score]);
						});
					}).bind(this, score));
				}).bind(this, score));
			}).bind(this, studentId, score));
		}).bind(this, subjectId, studentId));
	});

	this.add('role:api, category:score, cmd:calculateScore', function(args, done) {

		var scoreData = args.scoreData,
			n = scoreData.length,
			maxFinalScore = 10,
			finalScore = 0;

		for (var i = 0; i < n; i++) {

			var scoreItem = scoreData[i];
			if (scoreItem) {
				finalScore += (scoreItem.score * maxFinalScore) / scoreItem.maxScore;
			}
		}

		finalScore = finalScore / n;

		done(null, {
			finalScore: finalScore
		});
	});

	this.add('init:score', function(args, done) {

		var prefix = '/score/';

		app.get(prefix, app.oauth.authorise(),
			commons.checkUserHasOwnToken.bind(this),
			commons.checkUserIsAdminOrRequestHasUserQueryFilter.bind(this),
			commons.expressCbk.bind(this, 'score', 'findAll'));

		app.get(prefix + ':id', app.oauth.authorise(),
			commons.checkUserHasOwnToken.bind(this),
			commons.expressCbk.bind(this, 'score', 'findById'));

		app.put(prefix + ':id', app.oauth.authorise(),
			commons.checkUserHasOwnToken.bind(this),
			commons.checkUserIsAdminOrTeacherInSubject.bind(this),
			commons.expressCbk.bind(this, 'score', 'update'));

		done();
	});

	return 'score';
}
