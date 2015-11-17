var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var courseSchema = Schema({
  name: {
    type: String
  },
  subjects: [String] // IDs
});

module.exports = mongoose.model('course', courseSchema);
