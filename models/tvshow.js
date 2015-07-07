var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var tvshowSchema = Schema({
  title:    { type: String },
  year:     { type: Number },
  country:  { type: String },
  poster:   { type: String },
  seasons:  { type: Number },
  genre:    { type: String, enum:
  ['Drama', 'Fantasy', 'Sci-Fi', 'Thriller', 'Comedy']
        },
  summary:  { type: String }
});
 tvshowSchema.methods.recommended = function(){
      return 'sí';
    }
module.exports = mongoose.model('TVShow', tvshowSchema);