var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	schemaInstance = Schema({
		userId: String,
		subjects: [String],
		tasks: [String]
	});

module.exports = mongoose.model('student', schemaInstance);
