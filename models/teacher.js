var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var teacherSchema = Schema({
  user: {
    type: String
  }, // ID del user
  subjects: [String] // IDs de subjects
});

module.exports = mongoose.model('teacher', teacherSchema);

