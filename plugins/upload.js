var multer = require('multer'),
	unzip = require('unzip'),
	fs = require('fs'),
	uuid = require('uuid/v4'),
	childProcess = require('child_process'),
	exec = childProcess.exec;

module.exports = function upload(options) {

	var app = options.app;

	function fileManagement(res, file, fileTarget) {

		var filename = file.filename,
			path = file.destination,
			fileMimeType = file.mimetype;

		if (fileTarget === "attached") {
			moveFile(path, filename, "attachments");

		} else if(fileTarget === "tests") {
			moveFile(path, filename, "tests");

		} else if(fileTarget === "temaries") {
			moveFile(path, filename, "temaries");

		} else if (fileTarget === "deliveries") {

			if (fileMimeType === 'application/x-zip-compressed' ||
				fileMimeType === 'application/zip') {

				var filenameWithoutExtension = filename.split('.')[0];
				uncompressFile(path, filename, filenameWithoutExtension);
				res.json({
					error_code: 0,
					err_desc: null,
					filename: filenameWithoutExtension
				});
			} else {
				res.status(500).json({
					error_code: 1,
					err_desc: 'Invalid file format'
				});
			}

			return;
		}

		res.json({
			error_code: 0,
			err_desc: null,
			filename:filename
		});
	}

	function moveFile(path, filename, fileToDestination) {

		var cmd = "mv",
			args = path + filename + " " + path + fileToDestination + "/";

		exec(cmd + " " + args, childProcessCbk);
	}

	function childProcessCbk(err, stdout, stderr) {

		if (err) {
			console.log(err);
		}
	}

	function uncompressFile(path, filename, filenameWithoutExtension) {

		var deliveriesPath = path + "deliveries/",
			outputPath = deliveriesPath + filenameWithoutExtension;

		fs.createReadStream(path + filename)
			.pipe(unzip.Extract({
				path: outputPath
			}))
			.on('close', (function(path, filename, destination) {

				moveFile(path, filename, destination);
			}).bind(this, path, filename, "deliveries/" + filenameWithoutExtension));
	}

	this.add('init:upload', function(args, done) {

		var storage = multer.diskStorage({
			destination: function(req, file, cb) {

				cb(null, './data/');
			},
			filename: function(req, file, cb) {

				var fileName = uuid();
				cb(null, fileName + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
			}
		});

		var upload = multer({
			storage: storage
		}).single('file');

		app.post('/upload', app.oauth.authorise(), function(req, res) {

			upload(req, res, (function(args, err) {

				var req = args.req,
					res = args.res,
					file = req.file,
					body = req.body,
					fileTarget = body.fileTarget;

				if (err) {
					res.json({
						error_code: 1,
						err_desc: err
					});
				} else {
					fileManagement(res, file, fileTarget);
				}
			}).bind(this, { req, res }));
		});

		done();
	});

	return 'upload';
};
