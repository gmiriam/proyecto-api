var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	schemaInstance = Schema({
		userId: String
	});

module.exports = mongoose.model('admin', schemaInstance);
