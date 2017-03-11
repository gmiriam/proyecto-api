module.exports = function score(options) {

	var mongoose = require('mongoose'),
		Score = mongoose.model('score'),
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

		Score.find(queryObj, (function(args, err, scores) {

			var done = args.done;
			done(err, scores);
		}).bind(this, { done }));
	});

	this.add('role:api, category:score, cmd:findById', function(args, done) {

		var params = args.params,
			id = params.id;

		Score.findById(id, (function(args, err, score) {

			var done = args.done;
			if (err) {
				done(err);
			} else if (!score) {
				done(new Error("Not found"));
			} else {
				done(null, [score]);
			}
		}).bind(this, { done }));
	});

	this.add('role:api, category:score, cmd:create', function(args, done) {

		var body = args.body,
			data = body.data;

		Score.findOne({
			subject: data.subject,
			student: data.student
		}, (function(args, err, score) {

			var done = args.done,
				data = args.data;

			if (err || score) {
				done(err);
			} else {
				var newScore = new Score(data);

				newScore.save((function(args, err) {

					var done = args.done,
						newScore = args.newScore;

					done(err, [newScore]);
				}).bind(this, { done, newScore }));
			}
		}).bind(this, { done, data }));
	});

	this.add('role:api, category:score, cmd:update', function(args, done) {

		var params = args.params,
			body = args.body,
			id = params.id,
			data = body.data,
			finalScore = data.finalScore;

		Score.findById(id, (function(args, err, score) {

			var done = args.done,
				finalScore = args.finalScore;

			if (err) {
				done(err);
			} else if (!score) {
				done(new Error("Not found"));
			} else {
				score.finalScore = finalScore;
				score.save((function(args, err) {

					var done = args.done,
						score = args.score;

					done(err, [score]);
				}).bind(this, { done, score }));
			}
		}).bind(this, { done, finalScore }));
	});

	this.add('role:api, category:score, cmd:delete', function(args, done) {

		var params = args.params,
			subjectId = params.subjectid,
			studentId = params.studentid,
			id = params.id;

		function removeScoreFound(args, err, score) {

			var done = args.done;
			if (err) {
				done(err);
			} else if (!score) {
				done(new Error("Not found"));
			} else {
				score.remove((function(args, err) {

					var done = args.done;
					done(err);
				}).bind(this, { done }));
			}
		}

		function removeScoresFound(args, err, scores) {

			var done = args.done;
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
			}, removeScoreFound.bind(this, { done }));
		} else if (studentId) {
			Score.find({
				student: studentId
			}, removeScoresFound.bind(this, { done }));
		} else if (subjectId) {
			Score.find({
				subject: subjectId
			}, removeScoresFound.bind(this, { done }));
		} else {
			Score.findById(id, removeScoreFound.bind(this, { done }));
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
		}, (function(args, err, reply) {

			var done = args.done,
				subjectId = args.subjectId,
				studentId = args.studentId,
				score = reply[0];

			this.act('role:api, category:task, cmd:findAll', {
				query: {
					subjectid: subjectId,
					userid: studentId
				}
			}, (function(args, err, reply) {

				var done = args.done,
					studentId = args.studentId,
					score = args.score,
					tasks = reply,
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
					}, (function(args, err, reply) {

						var maxScore = args.maxScore,
							promiseHandler = args.promiseHandler,
							delivery = reply[0];

						if (!delivery) {
							promiseHandler.resolve(null);
						} else {
							promiseHandler.resolve({
								maxScore: maxScore,
								score: delivery.score
							});
						}
					}).bind(this, { maxScore, promiseHandler }));
				}

				Promise.all(promises).then((function(args, results) {

					var done = args.done,
						score = args.score;

					this.act('role:api, category:score, cmd:calculateScore', {
						scoreData: results
					}, (function(args, err, reply) {

						var done = args.done,
							score = args.score,
							finalScore = reply.finalScore;

						score.finalScore = finalScore;
						score.save((function(args, err) {

							var done = args.done,
								score = args.score;

							done(err, [score]);
						}).bind(this, { done, score }));
					}).bind(this, { done, score }));
				}).bind(this, { done, score }));
			}).bind(this, { done, studentId, score }));
		}).bind(this, { done, subjectId, studentId }));
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
			commons.checkUserIsAdminOrRequestHasUserQueryFilterOrTeacherInSubject.bind(this),
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
};
