var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var studentSchema = Schema({
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
  subjects: [String], // IDs de subjects
  tasks: [String] // IDs de tasks
});

module.exports = mongoose.model('student', studentSchema);

