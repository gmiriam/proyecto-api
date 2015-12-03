var mongoose = require('mongoose');
var Score = mongoose.model('score');

//GET - Devuvelve todos los cursos en la DB
exports.findAll = function(req, res) {
    Score.find(function(err, score) {
        if(!err) {
            res.send(score);
        } else {
            console.log('ERROR: ' + err);
        }
    });
};

  //GET - Devuelve un curso con un ID específico.
  exports.findById = function(req, res) {
  Score.findById(req.params.id, function(err, score) {
    if(!err) {
      res.send({
        score: score,
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

  var score = new Score({
    student:    req.body.student,
    subject:     req.body.subject,
	finalScore: req.body.finalScore,
  });

  score.save(function(err) {
    if(!err) {
      res.send(score);
      console.log('Created');
    } else {
      console.log('ERROR: ' + err);
    }
  });

};

exports.update = function(req, res) {
  Score.findById(req.params.id, function(err, score) {
    score.student = req.body.student;
    score.subject = req.body.subject;
	score.finalScore = req.body.finalScore;

    score.save(function(err) {
      if(!err) {
      console.log('Updated');
      } else {
      console.log('ERROR: ' + err);
      }

      res.send(score);
    });
  });
};

exports.delete = function(req, res) {
  Score.findById(req.params.id, function(err1, score) {
    if (score) {
      score.remove(function(err2) {
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
