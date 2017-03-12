var expressCbk = function(args, req, res) {

	var category = args.cat,
		command = args.cmd;

	this.act('role:api, category:' + category + ', cmd:' + command, {
		params: req.params,
		query: req.query,
		headers: req.headers,
		body: req.body
	}, (function(args, err, reply) {

		var res = args.res;
		this.act('role:api, category:generic, cmd:sendResponse', {
			error: err,
			responseData: reply,
			responseHandler: res
		});
	}).bind(this, { res }));
};

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
	}, (function(args, err, reply) {

		var next = args.next,
			hasOwnToken = reply.hasOwnToken;

		if (hasOwnToken) {
			next();
		} else {
			res.status(500).send('Your token is not original');
		}
	}).bind(this, { next }));
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
	}, (function(args, err, reply) {

		var next = args.next,
			user = reply[0];

		if (user.role === "admin") {
			next();
		} else {
			res.status(500).send('You are not admin');
		}
	}).bind(this, { next }));
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
	}, (function(args, err, reply) {

		var next = args.next,
			subjectId = args.subjectId,
			userId = args.userId,
			user = reply[0];

		if (user.role === "admin") {
			next();
		} else if (user.role === "teacher") {
			this.act('role:api, category:subject, cmd:findById', {
				params: {
					id: subjectId
				}
			}, (function(args, err, reply) {

				var next = args.next,
					userId = args.userId,
					subject = reply[0];

				if (subject.teachers && subject.teachers.indexOf(userId) !== -1) {
					next();
				} else {
					res.status(500).send('You are not teacher in this subject');
				}
			}).bind(this, { userId, next }));
		} else {
			res.status(500).send('You are not admin or teacher');
		}
	}).bind(this, { userId, subjectId, next }));
};

var checkUserIsAdminOrStudentInSubject = function(req, res, next) {

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
	}, (function(args, err, reply) {

		var next = args.next,
			subjectId = args.subjectId,
			user = reply[0];

		if (user.role === "admin" || (user.enrolledSubjects && user.enrolledSubjects.indexOf(subjectId) !== -1)) {
			next();
		} else {
			res.status(500).send('You are not admin or student in this subject');
		}
	}).bind(this, { subjectId, next }));
};

var checkUserIsAdminOrStudentWithTask = function(req, res, next) {

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
	}, (function(args, err, reply) {

		var next = args.next,
			taskId = args.taskId,
			user = reply[0];

		if (user.role === "admin" || (user.assignedTasks && user.assignedTasks.indexOf(taskId) !== -1)) {
			next();
		} else {
			res.status(500).send('You are not admin or student with this task assigned');
		}
	}).bind(this, { taskId, next }));
};

var checkUserIsAdminOrRequestHasUserQueryFilter = function(req, res, next) {

	var headers = req.headers,
		query = req.query,
		userId = headers.userid,
		userQuery = query.userid || query.teacherid || query.studentid;

	if (!userId) {
		res.status(500).send('Missing data');
		return;
	}

	this.act('role:api, category:user, cmd:findById', {
		params: {
			id: userId
		}
	}, (function(args, err, reply) {

		var next = args.next,
			userQuery = args.userQuery,
			user = reply[0],
			userId = user._id.toString();

		if (user.role === 'admin' || (!!userQuery && userId === userQuery)) {
			next();
		} else {
			res.status(500).send('You are trying to get contents forbidden for you');
		}
	}).bind(this, { userQuery, next }));
};

var checkUserIsAdminOrRequestHasUserQueryFilterOrTeacherInSubject = function(req, res, next) {

	var headers = req.headers,
		query = req.query,
		userId = headers.userid,
		subjectId = headers.subjectid,
		userQuery = query.userid || query.teacherid || query.studentid;

	if (!userId) {
		res.status(500).send('Missing data');
		return;
	}

	this.act('role:api, category:user, cmd:findById', {
		params: {
			id: userId
		}
	}, (function(args, err, reply) {

		var next = args.next,
			userQuery = args.userQuery,
			subjectId = args.subjectId,
			user = reply[0],
			userId = user._id.toString();

		if (user.role === 'admin' || (!!userQuery && userId === userQuery)) {
			next();
		} else if (user.role === "teacher") {
			this.act('role:api, category:subject, cmd:findById', {
				params: {
					id: subjectId
				}
			}, (function(args, err, reply) {

				var next = args.next,
					userId = args.userId,
					subject = reply[0];

				if (subject.teachers && subject.teachers.indexOf(userId) !== -1) {
					next();
				} else {
					res.status(500).send('You are not teacher in this subject');
				}
			}).bind(this, { userId, next }));
		} else {
			res.status(500).send('You are trying to get contents forbidden for you');
		}
	}).bind(this, { subjectId, userQuery, next }));
};

module.exports = {
	expressCbk
	, checkUserHasOwnToken
	, checkUserIsAdmin
	, checkUserIsAdminOrTeacherInSubject
	, checkUserIsAdminOrStudentInSubject
	, checkUserIsAdminOrStudentWithTask
	, checkUserIsAdminOrRequestHasUserQueryFilter
	, checkUserIsAdminOrRequestHasUserQueryFilterOrTeacherInSubject
};
