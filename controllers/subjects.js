
var mongoose = require('mongoose');
var Subject = mongoose.model('subject');

//GET - Devuvelve todos los subjects en la DB
exports.findAll = function(req, res) {
    Subject.find(function(err, subjects) {
        if(!err) {
            res.send(subjects);
        } else {
            console.log('ERROR: ' + err);
        }
    });
};

  //GET - Devuelve un subject con un ID específico.
  exports.findById = function(req, res) {
  Subject.findById(req.params.id, function(err, subject) {
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
exports.add = function(req, res) {
  console.log('POST');
  console.log(req.body);

  var subject = new Subject({
    name:    req.body.name,
    description:  req.body.description,
    temary:   req.body.temary
  });

  subject.save(function(err) {
    if(!err) {
      res.send(subject);
      console.log('Created');
    } else {
      console.log('ERROR: ' + err);
    }
  });

};

exports.update = function(req, res) {
  Subject.findById(req.params.id, function(err, subject) {
    subject.name = req.body.name;
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

exports.delete = function(req, res) {
  Subject.findById(req.params.id, function(err1, subject) {
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
