var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var taskSchema = Schema({
  name: {
    type: String
  },
  statement: {
    type: String 
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  maxScore: {
    type: Number,
    min: 0,
    max: 100
  },
  //Parent
  subject: {
    type: String
  }
});

module.exports = mongoose.model('task', taskSchema);

