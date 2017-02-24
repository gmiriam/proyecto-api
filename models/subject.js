var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	schemaInstance = Schema({
		name: {
			type: String,
			unique: true,
			trim: true,
			required: true
		},
		description: {
			type: String,
			trim: true
		},
		temary: {
			type: String
		},
		teachers: {
			type: [String]
		}
	});

module.exports = mongoose.model('subject', schemaInstance);
