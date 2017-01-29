var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	userSchema = require('./schema/userSchema'),
	schemaInstance = Schema(userSchema);

module.exports = mongoose.model('user', schemaInstance);
