var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
var userSchema = Schema({
  user: {
    type: String
  } // ID del user
});
module.exports = mongoose.model('admin', adminSchema);