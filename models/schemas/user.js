module.exports = {
	firstName: {
		type: String,
		trim: true,
		required: true
	},
	surname: {
		type: String,
		trim: true
	},
	email: {
		type: String,
		trim: true,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	role: {
		type: String,
		enum: ['admin', 'teacher', 'student'],
		required: true
	},
	enrolledSubjects: {
		type: [String]
	},
	assignedTasks: {
		type: [String]
	}
};
