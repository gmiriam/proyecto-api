var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var teacherSchema = Schema({
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
  },
  subjects: [String] // IDs de subjects
});

module.exports = mongoose.model('teacher', teacherSchema);

