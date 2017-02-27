var checkUserHasOwnToken = function(req, res, next) {

	var headers = req.headers,
		userToken = headers.authorization.split(' ').pop(),
		userId = headers.userid;

	if (!userId) {
		res.status(500).send('Missing data');
		return;
	}

	this.act('role:api, category:user, cmd:checkUserHasOwnToken', {
		userToken: userToken,
		userId: userId
	}, (function(next, err, reply) {

		var hasOwnToken = reply.hasOwnToken;
		if (hasOwnToken) {
			next();
		} else {
			res.status(500).send('Your token is not original');
		}
	}).bind(this, next));
};

var checkUserIsAdmin = function(req, res, next) {

	var headers = req.headers,
		userId = headers.userid;

	if (!userId) {
		res.status(500).send('Missing data');
		return;
	}

	this.act('role:api, category:user, cmd:findById', {
		params: {
			id: userId
		}
	}, (function(next, err, reply) {

		var user = reply[0];
		if (user.role === "admin") {
			next();
		} else {
			res.status(500).send('You are not admin');
		}
	}).bind(this, next));
};

var checkUserIsTeacher = function(req, res, next) {

	var headers = req.headers,
		userId = headers.userid;

	if (!userId) {
		res.status(500).send('Missing data');
		return;
	}

	this.act('role:api, category:user, cmd:findById', {
		params: {
			id: userId
		}
	}, (function(next, err, reply) {

		var user = reply[0];
		if (user.role === "teacher") {
			next();
		} else {
			res.status(500).send('You are not teacher');
		}
	}).bind(this, next));
};

var checkUserIsTeacherInSubject = function(req, res, next) {

	var headers = req.headers,
		userId = headers.userid,
		subjectId = headers.subjectid;

	if (!userId || !subjectId) {
		res.status(500).send('Missing data');
		return;
	}

	this.act('role:api, category:subject, cmd:findById', {
		params: {
			id: subjectId
		}
	}, (function(userId, next, err, reply) {

		var subject = reply[0];
		if (subject.teachers && subject.teachers.indexOf(userId) !== -1) {
			next();
		} else {
			res.status(500).send('You are not teacher in this subject');
		}
	}).bind(this, userId, next));
};

var checkUserIsAdminOrTeacherInSubject = function(req, res, next) {

	var headers = req.headers,
		userId = headers.userid,
		subjectId = headers.subjectid;

	if (!userId || !subjectId) {
		res.status(500).send('Missing data');
		return;
	}

	this.act('role:api, category:user, cmd:findById', {
		params: {
			id: userId
		}
	}, (function(userId, subjectId, next, err, reply) {

		var user = reply[0];
		if (user.role === "admin") {
			next();
		} else if (user.role === "teacher") {
			this.act('role:api, category:subject, cmd:findById', {
				params: {
					id: subjectId
				}
			}, (function(userId, next, err, reply) {

				var subject = reply[0];
				if (subject.teachers && subject.teachers.indexOf(userId) !== -1) {
					next();
				} else {
					res.status(500).send('You are not teacher in this subject');
				}
			}).bind(this, userId, next));
		} else {
			res.status(500).send('You are not admin or teacher');
		}
	}).bind(this, userId, subjectId, next));

};

var checkUserIsEnrolledInSubject = function(req, res, next) {

	var headers = req.headers,
		userId = headers.userid,
		subjectId = headers.subjectid;

	if (!userId || !subjectId) {
		res.status(500).send('Missing data');
		return;
	}

	this.act('role:api, category:user, cmd:findById', {
		params: {
			id: userId
		}
	}, (function(subjectId, next, err, reply) {

		var user = reply[0];
		if (user.enrolledSubjects && user.enrolledSubjects.indexOf(subjectId) !== -1) {
			next();
		} else {
			res.status(500).send('You are not student in this subject');
		}
	}).bind(this, subjectId, next));
};

var checkUserHasAssignedTask = function(req, res, next) {

	var headers = req.headers,
		userId = headers.userid,
		taskId = headers.taskid;

	if (!userId || !taskId) {
		res.status(500).send('Missing data');
		return;
	}

	this.act('role:api, category:user, cmd:findById', {
		params: {
			id: userId
		}
	}, (function(taskId, next, err, reply) {

		var user = reply[0];
		if (user.assignedTasks && user.assignedTasks.indexOf(taskId) !== -1) {
			next();
		} else {
			res.status(500).send('You do not have this task assigned');
		}
	}).bind(this, taskId, next));
};

module.exports = {
	checkUserHasOwnToken: checkUserHasOwnToken,
	checkUserIsAdmin: checkUserIsAdmin,
	checkUserIsTeacher: checkUserIsTeacher,
	checkUserIsTeacherInSubject: checkUserIsTeacherInSubject,
	checkUserIsAdminOrTeacherInSubject: checkUserIsAdminOrTeacherInSubject,
	checkUserIsEnrolledInSubject: checkUserIsEnrolledInSubject,
	checkUserHasAssignedTask: checkUserHasAssignedTask
};
