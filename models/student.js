var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var studentSchema = Schema({
  user: {
    type: String
  }, // ID del user
  subjects: [String], // IDs de subjects
  tasks: [String] // IDs de tasks
});

module.exports = mongoose.model('student', studentSchema);

