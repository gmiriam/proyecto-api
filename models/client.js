var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	schemaInstance = Schema({
		clientId: String,
		clientSecret: String
	});

module.exports = mongoose.model('client', schemaInstance);
