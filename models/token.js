var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	userSchema = require('./schema/userSchema'),
	schemaInstance = Schema({
		accessToken: String,
		expires: Date,
		clientId: String,
		user: userSchema
	});

schemaInstance.index({ "expires": 1 }, { expireAfterSeconds: 0 });
module.exports = mongoose.model('token', schemaInstance);
