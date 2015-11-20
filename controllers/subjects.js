
var mongoose = require('mongoose');
var subject = mongoose.model('subject');

//GET - Devuvelve todos los subjects en la DB
exports.findAllSubjects = function(req, res) {
    subject.find(function(err, users) {
        if(!err) {
            res.send(subjects);
        } else {
            console.log('ERROR: ' + err);
        }
    });
};

  //GET - Devuelve un subject con un ID específico.
  exports.findSubjectById = function(req, res) {
  subject.findById(req.params.id, function(err, user) {
    if(!err) {
      res.send({
        subject: subject, 
      });
    } else {
      console.log('ERROR: ' + err);
    }
  });
};

//Insertar un nuevo usuario en db
exports.addSubject = function(req, res) {
  console.log('POST');
  console.log(req.body);

  var subject = new subject({
    name:    req.body.name,
    course:     req.body.course,
    description:  req.body.description,
    temary:   req.body.temary
  });

  subject.save(function(err) {
    if(!err) {
      res.send(user);
      console.log('Created');
    } else {
      console.log('ERROR: ' + err);
    }
  });

};

exports.updateSubject = function(req, res) {
  subject.findById(req.params.id, function(err, user) {
    subject.name = req.body.name;
    subject.course = req.body.course;
    subject.description = req.body.description;
    subject.temary = req.body.temary;

    subject.save(function(err) {
      if(!err) {
      console.log('Updated');
      } else {
      console.log('ERROR: ' + err);
      }

      res.send(subject);
    });
  });
};

exports.deleteSubject = function(req, res) {
  subject.findById(req.params.id, function(err1, user) {
    if (subject) {
      subject.remove(function(err2) {
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
