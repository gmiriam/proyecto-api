module.exports = function generic(options) {

	this.add('role:api, category:generic, cmd:sendResponse', function(args, done) {

		var error = args.error,
			responseData = args.responseData,
			responseHandler = args.responseHandler;

		if (!error) {
			responseHandler.send({
				status : "success",
				content: responseData
			});
		} else {
			responseHandler.status(500).send({
				status : "error",
				content: error
			});
		}

		done();
	});

	this.add('init:generic', function(args, done) {

		done();
	});

	return 'generic';
}
