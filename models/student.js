var mongoose = require('mongoose'),
  subjectSchema = mongoose.model('subject'),
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
  //Parent
  subject: {
    type: [subjectSchema]
  }
});

module.exports = mongoose.model('student', studentSchema);

