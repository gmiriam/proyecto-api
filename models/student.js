var mongoose = require('mongoose'),
	userData = JSON.parse(JSON.stringify(require('./userData'))),
  	Schema = mongoose.Schema;

userData.subjects = [String];
userData.tasks = [String];

var studentSchema = Schema(userData);

module.exports = mongoose.model('student', studentSchema);
