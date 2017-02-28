module.exports = function download(options) {

	var app = options.app,
		commons = options.commons;

	this.add('role:api, category:download, cmd:getFile', function(args, done) {

		var query = args.query,
			path = query.path,
			name = query.name;

		done(null, [name, 'data/' + path + '/' + name]);
	});

	this.add('init:download', function(args, done) {

		var prefix = '/download';

		app.get(prefix, app.oauth.authorise(),
			commons.expressCbk.bind(this, 'download', 'getFile'));

		done();
	});

	return 'download';
}
