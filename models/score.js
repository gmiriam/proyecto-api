var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	schemaInstance = Schema({
		student: {
			type: String
		},
		subject: {
			type: String
		},
		finalScore: {
			type: Number,
			min: 0,
			max: 100
		}
	});

module.exports = mongoose.model('score', schemaInstance);
