var mongoose = require('mongoose');

/**
 * Configuration.
 */

var clientModel = mongoose.model('client'),
	tokenModel = mongoose.model('token'),
	userModel = mongoose.model('user');

/**
 * Add example client and user to the database (for debug).
 */

var loadExampleData = function() {

	var client = new clientModel({
		clientId: 'proyecto-client',
		clientSecret: 'thisisasecretpassword'
	});

	client.save(function(err, client) {

		if (err) {
			return console.error(err);
		}
		console.log('Created client', client);
	});

	var user = new userModel({
		email: 'admin',
		password: 'admin',
		role: 'admin'
	});

	user.save(function(err, user) {

		if (err) {
			return console.error(err);
		}
		console.log('Created user', user);
	});
};

/**
 * Dump the database content (for debug).
 */

var dump = function() {

	clientModel.find(function(err, clients) {

		if (err) {
			return console.error(err);
		}
		console.log('clients', clients);
	});

	tokenModel.find(function(err, tokens) {

		if (err) {
			return console.error(err);
		}
		console.log('tokens', tokens);
	});

	userModel.find(function(err, users) {

		if (err) {
			return console.error(err);
		}
		console.log('users', users);
	});
};

/*
 * Get access token.
 */

var getAccessToken = function(bearerToken, callback) {

	tokenModel.findOne({
		accessToken: bearerToken
	}, callback);
};

/**
 * Get client.
 */

var getClient = function(clientId, clientSecret, callback) {

	clientModel.findOne({
		clientId: clientId,
		clientSecret: clientSecret
	}, callback);
};

/**
 * Grant type allowed.
 */

var grantTypeAllowed = function(clientId, grantType, callback) {

	callback(false, grantType === "password");
};

/**
 * Save token.
 */

var saveAccessToken = function(accessToken, clientId, expires, user, callback) {

	var token = new tokenModel({
		accessToken: accessToken,
		expires: expires,
		clientId: clientId,
		user: user
	});

	token.save(callback);
};

/*
 * Get user.
 */

var getUser = function(username, password, callback) {

	userModel.findOne({
		email: username,
		password: password
	}, callback);
};

/**
 * Export model definition object.
 */

module.exports = {
	getAccessToken: getAccessToken,
	getClient: getClient,
	grantTypeAllowed: grantTypeAllowed,
	saveAccessToken: saveAccessToken,
	getUser: getUser
};
