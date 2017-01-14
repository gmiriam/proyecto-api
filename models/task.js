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
	validate: [endDateValidator, 'La fecha de cierre es anterior a la de inicio.']
  },
  maxScore: {
    type: Number,
    min: 0,
    max: 100
  },
  teacher: {
    type: String // ID
  },
  subject: {
	  type: String //ID
  },
  evaluationTest: {
    type: String
  },
  attached: {
    type: String
  }
});

module.exports = mongoose.model('task', taskSchema);

// Prueba
function endDateValidator(endDate) {
  return endDate > this.startDate;
}
