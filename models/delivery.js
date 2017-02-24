var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	schemaInstance = Schema({
		task: {
			type: String,
			required: true
		},
		student: {
			type: String,
			required: true
		},
		score: {
			type: Number,
			min: 0,
			max: 100
		},
		data: {
			type: String,
			required: true
		},
		results: {
			type: Object
		}
	});

module.exports = mongoose.model('delivery', schemaInstance);
