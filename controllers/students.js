
var mongoose = require('mongoose');
var Student = mongoose.model('student');

//GET - Devuvelve todos los students en la DB
exports.findAll = function(req, res) {
    Student.find(function(err, students) {
        if(!err) {
            res.send(students);
        } else {
            console.log('ERROR: ' + err);
        }
    });
};

  //GET - Devuelve un student con un ID específico.
  exports.findById = function(req, res) {
  Student.findById(req.params.id, function(err, student) {
    if(!err) {
      res.send({
        student: student, //Mirar. Antes: show: TVShow
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

  var student = new Student({
    firstName:    req.body.firstName,
    surname:     req.body.surname,
    email:  req.body.email,
    password:   req.body.password,
    subjects: req.body.subjects,
    tasks: req.body.tasks
  });

  student.save(function(err) {
    if(!err) {
      res.send(student);
      console.log('Created');
    } else {
      console.log('ERROR: ' + err);
    }
  });

};

exports.update = function(req, res) {
  Student.findById(req.params.id, function(err, student) {
    student.firstName = req.body.firstName;
    student.surname = req.body.surname;
    student.email = req.body.email;
    student.password = req.body.password;
    student.subjects = req.body.subjects;
    student.tasks = req.body.tasks;

    student.save(function(err) {
      if(!err) {
      console.log('Updated');
      } else {
      console.log('ERROR: ' + err);
      }

      res.send(student);
    });
  });
};

exports.delete = function(req, res) {
  Student.findById(req.params.id, function(err1, student) {
    if (student) {
      student.remove(function(err2) {
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
