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

		app.get(prefix, app.oauth.authorise(), (function(req, res) {

			this.act('role:api, category:download, cmd:getFile', {
				params: req.params,
				query: req.query,
				headers: req.headers,
				body: req.body
			}, (function(res, err, reply) {

				var name = reply[0],
					path = reply[1];

				res.download(path, name);
			}).bind(this, res));
		}).bind(this));

		done();
	});

	return 'download';
};
