var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	userSchema = require('./schemas/user'),
	schemaInstance = Schema(userSchema);

module.exports = mongoose.model('user', schemaInstance);
