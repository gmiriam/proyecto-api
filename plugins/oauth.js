module.exports = function oauth(options) {

	var oauthServer = require('oauth2-server'),
		app = options.app;

	this.add('init:oauth', function(args, done) {

		app.oauth = oauthServer({
			model: require('../oauthModel.js'),
			grants: ['password'],
			accessTokenLifetime: 10800
		});

		app.use(app.oauth.errorHandler());

		app.all('/oauth/token', app.oauth.grant());

		done();
	});

	return 'oauth';
};
