var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var scoreSchema = Schema({
  student: {
    type: String // ID
  },
  subject: {
    type: String // ID
  },
  finalScore: {
    type: Number,
    min: 0,
    max: 100
  }
});

module.exports = mongoose.model('score', scoreSchema);

