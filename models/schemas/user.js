module.exports = {
	firstName: {
		type: String
	},
	surname: {
		type: String
	},
	email: {
		type: String
	},
	password: {
		type: String
	},
	role: {
		type: String
	},
	enrolledSubjects: {
		type: [String],
	},
	assignedTasks: {
		type: [String],
	}
};
