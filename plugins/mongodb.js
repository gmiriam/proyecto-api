module.exports = function mongodb(options) {

	var mongoose = require('mongoose');

	this.add('init:mongodb', function(args, done) {

		mongoose.connect('mongodb://localhost/proyecto-api', (function(args, err, res) {

			var done = args.done;

			if (err) {
				console.log('Error connecting to mongodb', err);
			} else {
				console.log('Connected to mongodb');
			}

			done(err);
		}).bind(this, { done }));

		require('../models/client');
		require('../models/token');

		require('../models/user');

		require('../models/subject');
		require('../models/task');
		require('../models/delivery');
		require('../models/score');
	});

	return 'mongodb';
};
