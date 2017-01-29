var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	schemaInstance = Schema({
		task: {
			type: String
		},
		student: {
			type: String
		},
		score: {
			type: Number,
			min: 0,
			max: 100
		},
		data: {
			type: String
		}
	});

module.exports = mongoose.model('delivery', schemaInstance);
