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
			max: 10
		}
	});

schemaInstance.index({
	subject: 1,
	student: 1
}, { unique: true });

module.exports = mongoose.model('score', schemaInstance);
