var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	schemaInstance = Schema({
		student: {
			type: String,
			required: true
		},
		subject: {
			type: String,
			required: true
		},
		finalScore: {
			type: Number,
			min: 0,
			max: 100
		}
	});

module.exports = mongoose.model('score', schemaInstance);
