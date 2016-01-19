var mongoose = require('mongoose'),
	userData = JSON.parse(JSON.stringify(require('./userData'))),
  	Schema = mongoose.Schema;

var adminSchema = Schema(userData);

module.exports = mongoose.model('admin', adminSchema);