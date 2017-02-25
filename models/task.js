var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	schemaInstance = Schema({
		name: {
			type: String,
			trim: true,
			required: true
		},
		statement: {
			type: String,
			trim: true
		},
		startDate: {
			type: Date
		},
		endDate: {
			type: Date,
			validate: [endDateValidator, 'End date is earlier than start date']
		},
		maxScore: {
			type: Number,
			required: true,
			min: 1
		},
		teacher: {
			type: String
		},
		subject: {
			type: String,
			required: true
		},
		evaluationTest: {
			type: String
		},
		attached: {
			type: String
		}
	});

schemaInstance.index({
	subject: 1,
	name: 1
}, { unique: true });

function endDateValidator(endDate) {

	if (!endDate || !this.startDate) {
		return true;
	}

	return endDate >= this.startDate;
}

module.exports = mongoose.model('task', schemaInstance);
