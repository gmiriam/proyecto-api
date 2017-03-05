module.exports = function loadInitialDataExample(options) {

	var mongoose = require('mongoose'),
		childProcess = require('child_process'),
		exec = childProcess.exec;

	this.add('role:api, category:loadInitialDataExample, cmd:loadCollection', function(args, done) {

		var model = args.model,
			data = args.data;

		model.remove({}, (function(model, data, err) {

			for (var i = 0; i < data.length; i++) {
				var modelInstance = new model(data[i]);
				modelInstance.save();
			}
		}).bind(this, model, data));

		done();
	});

	this.add('role:api, category:loadInitialDataExample, cmd:loadCollections', function(args, done) {

		var collectionsPath = '../initialDataExample/collections/',
			collectionObjs = [{
				model: mongoose.model('client'),
				data: require(collectionsPath + 'clients')
			},{
				model: mongoose.model('delivery'),
				data: require(collectionsPath + 'deliveries')
			},{
				model: mongoose.model('score'),
				data: require(collectionsPath + 'scores')
			},{
				model: mongoose.model('subject'),
				data: require(collectionsPath + 'subjects')
			},{
				model: mongoose.model('task'),
				data: require(collectionsPath + 'tasks')
			},{
				model: mongoose.model('user'),
				data: require(collectionsPath + 'users')
			}];

		for (var i = 0; i < collectionObjs.length; i++) {
			this.act('role:api, category:loadInitialDataExample, cmd:loadCollection', collectionObjs[i]);
		}

		done();
	});

	this.add('role:api, category:loadInitialDataExample, cmd:deleteOldFiles', function(args, done) {

		var path = './data';

			cmd = "rm",
			args = "-R " + path + "/*";

		exec(cmd + " " + args, (function(done) {

			done();
		}).bind(this, done));
	});

	this.add('role:api, category:loadInitialDataExample, cmd:loadFiles', function(args, done) {

		this.act('role:api, category:loadInitialDataExample, cmd:deleteOldFiles', (function(done, err, reply) {

			var filesPath = './initialDataExample/files/*',
				dstPath = './data';

				cmd = "cp",
				args = "-r " + filesPath + " " + dstPath + "/";

			exec(cmd + " " + args, (function(done) {

				done();
			}).bind(this, done));
		}).bind(this, done));
	});

	this.add('init:loadInitialDataExample', function(args, done) {

		this.act('role:api, category:loadInitialDataExample, cmd:loadCollections');
		this.act('role:api, category:loadInitialDataExample, cmd:loadFiles');

		done();
	});

	return 'loadInitialDataExample';
}
