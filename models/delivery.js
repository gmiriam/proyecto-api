var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var deliverySchema = Schema({
  task: {
    type: String // ID
  },
  student: {
    type: String // ID
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  data: {
    type: String // URL
  }
});

module.exports = mongoose.model('delivery', deliverySchema);

