var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	userSchema = require('./schemas/user');

userSchema.email.unique = true;

var schemaInstance = Schema(userSchema);

module.exports = mongoose.model('user', schemaInstance);
