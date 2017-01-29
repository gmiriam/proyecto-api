var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	schemaInstance = Schema({
		name: {
			type: String
		},
		description: {
			type: String 
		},
		temary: {
			type: String
		}
	});

module.exports = mongoose.model('subject', schemaInstance);
