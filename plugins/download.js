module.exports = function download(options) {

	var app = options.app;

	this.add('role:api, category:download, cmd:getFile', function(args, done) {

		var query = args.query,
			path = query.path,
			name = query.name;

		done(null, [name, 'data/' + path + '/' + name]);
	});

	this.add('init:download', function(args, done) {

		function expressCbk(cmd, req, res) {

			this.act('role:api, category:download, cmd:' + cmd, {
				params: req.params,
				query: req.query,
				headers: req.headers,
				body: req.body
			}, function(err, reply) {

				var name = reply[0],
					path = reply[1];

				res.download(path, name);
			});
		}

		var prefix = '/download';

		app.get(prefix, app.oauth.authorise(), expressCbk.bind(this, 'getFile'));

		done();
	});

	return 'download';
}
