var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	schemaInstance = Schema({
		name: {
			type: String
		},
		statement: {
			type: String
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
			min: 0,
			max: 100
		},
		teacher: {
			type: String
		},
		subject: {
			type: String
		},
		evaluationTest: {
			type: String
		},
		attached: {
			type: String
		}
	});

function endDateValidator(endDate) {

	return endDate > this.startDate;
}

module.exports = mongoose.model('task', schemaInstance);
