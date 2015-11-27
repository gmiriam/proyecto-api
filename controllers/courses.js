
var mongoose = require('mongoose');
var Course = mongoose.model('course');

//GET - Devuvelve todos los cursos en la DB
exports.findAll = function(req, res) {
    Course.find(function(err, course) {
        if(!err) {
            res.send(course);
        } else {
            console.log('ERROR: ' + err);
        }
    });
};

  //GET - Devuelve un curso con un ID específico.
  exports.findById = function(req, res) {
  Course.findById(req.params.id, function(err, course) {
    if(!err) {
      res.send({
        course: course,
      });
    } else {
      console.log('ERROR: ' + err);
    }
  });
};

//Insertar un nuevo curso en db
exports.add = function(req, res) {
  console.log('POST');
  console.log(req.body);

  var course = new Course({
    name:    req.body.name,
    subjects:     req.body.subjects
  });

  course.save(function(err) {
    if(!err) {
      res.send(course);
      console.log('Created');
    } else {
      console.log('ERROR: ' + err);
    }
  });

};

exports.update = function(req, res) {
  Course.findById(req.params.id, function(err, course) {
    course.name = req.body.name;
    course.subjects = req.body.subjects; //HELP!! Aunque sea [] es igual??

    course.save(function(err) {
      if(!err) {
      console.log('Updated');
      } else {
      console.log('ERROR: ' + err);
      }

      res.send(course);
    });
  });
};

exports.delete = function(req, res) {
  Course.findById(req.params.id, function(err1, course) {
    if (course) {
      course.remove(function(err2) {
        if(!err2) {
        console.log('Removed');
        res.send("Eliminado");
        } else {
        console.log('ERROR: ' + err2);
        }
      })
    }
    else
      console.log(err1);
  });
}
