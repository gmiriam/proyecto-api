var mongoose = require('mongoose'),
	userData = JSON.parse(JSON.stringify(require('./userData'))),
    Schema = mongoose.Schema;

userData.subjects = [String];

var teacherSchema = Schema(userData);

module.exports = mongoose.model('teacher', teacherSchema);
