var mongoose = require('mongoose'),
  subjectSchema = mongoose.model('subject'),
  Schema = mongoose.Schema;

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
    type: Date,
	validate: [endDateValidator, 'Error: La fecha de cierre es anterior a la de inicio.']
  },
  maxScore: {
    type: Number,
    min: 0,
    max: 100
  },
  teacher: {
    type: String // ID
  }
});

module.exports = mongoose.model('task', taskSchema);

// Prueba
function endDateValidator(startDate, endDate) {
  return endDate > startDate;
}
