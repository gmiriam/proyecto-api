var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var subjectSchema = Schema({
  name: {
    type: String
  },
  course: {
    type: String,
    validate: [courseValidator, 'Error: Curso no permitido.']
  },
  description: {
    type: String 
  }
  temary: {
    type: String /*TODO: validar que es una expresion regular que calce con una url que tenga el pdf*/
  }
  /*TODO: campo para guardar el cálculo de la nota final */
});

module.exports = mongoose.model('subject', subjectSchema);

function courseValidator(course) {
  return course.length === 9;
}

