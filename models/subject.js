var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var subjectSchema = Schema({
  name: {
    type: String
  },
  description: {
    type: String 
  },
  temary: {
    type: String /*TODO: validar que es una expresion regular que calce con una url que tenga el pdf*/
  }
});

module.exports = mongoose.model('subject', subjectSchema);


