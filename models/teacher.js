var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	schemaInstance = Schema({
		userId: String,
		subjects: [String]
	});

module.exports = mongoose.model('teacher', schemaInstance);
