
var mongoose = require('mongoose');
var Teacher = mongoose.model('teacher');

//GET - Devuvelve todos los teachers en la DB
exports.findAll = function(req, res) {
    Teacher.find(function(err, teachers) {
        if(!err) {
            res.send(teachers);
        } else {
            console.log('ERROR: ' + err);
        }
    });
};

  //GET - Devuelve un teacher con un ID específico.
  exports.findById = function(req, res) {
  Teacher.findById(req.params.id, function(err, teacher) {
    if(!err) {
      res.send({
        teacher: teacher, //Mirar. Antes: show: TVShow
      });
    } else {
      console.log('ERROR: ' + err);
    }
  });
};

//Insertar un nuevo usuario en db
exports.add = function(req, res) {
  console.log('POST');
  console.log(req.body);

  var teacher = new Teacher({
    firstName:    req.body.firstName,
    surname:     req.body.surname,
    email:  req.body.email,
    password:   req.body.password,
    subjects: req.body.subjects
  });

  teacher.save(function(err) {
    if(!err) {
      res.send(teacher);
      console.log('Created');
    } else {
      console.log('ERROR: ' + err);
    }
  });

};

exports.update = function(req, res) {
  Teacher.findById(req.params.id, function(err, teacher) {
    teacher.firstName = req.body.firstName;
    teacher.surname = req.body.surname;
    teacher.email = req.body.email;
    teacher.password = req.body.password;
    teacher.subjects = req.body.subjects;

    teacher.save(function(err) {
      if(!err) {
      console.log('Updated');
      } else {
      console.log('ERROR: ' + err);
      }

      res.send(teacher);
    });
  });
};

exports.delete = function(req, res) {
  Teacher.findById(req.params.id, function(err1, teacher) {
    if (teacher) {
      teacher.remove(function(err2) {
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
