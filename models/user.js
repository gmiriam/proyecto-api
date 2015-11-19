var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var userSchema = Schema({
  firstName: {
    type: String
  },
  surname: {
    type: String
  },
  email: {
    type: String 
  },
  password: {
    type: String
  }
});

module.exports = mongoose.model('user', userSchema);