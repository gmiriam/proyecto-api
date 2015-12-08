
var mongoose = require('mongoose');
var Task = mongoose.model('task');

//GET - Devuvelve todos los cursos en la DB
exports.findAll = function(req, res) {
    Task.find(function(err, task) {
        if(!err) {
            res.send(task);
        } else {
            console.log('ERROR: ' + err);
        }
    });
};

  //GET - Devuelve un curso con un ID específico.
  exports.findById = function(req, res) {
  Task.findById(req.params.id, function(err, task) {
    if(!err) {
      res.send({
        task: task,
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

  var task = new Task({
    name:    req.body.name,
    statement:     req.body.statement,
	startDate: req.body.startDate,
	endDate:    req.body.endDate,
    maxScore:     req.body.maxScore,
	teacher: req.body.teacher
  });

  task.save(function(err) {
    if(!err) {
      res.send(task);
      console.log('Created');
    } else {
      res.status(400).send(err);
      console.log(err);
    }
  });

};

exports.update = function(req, res) {
  Task.findById(req.params.id, function(err, task) {
    task.name = req.body.name;
    task.statement = req.body.statement;
	task.startDate = req.body.startDate;
	task.endDate = req.body.endDate;
    task.maxScore = req.body.maxScore;
	task.teacher = req.body.teacher;

    task.save(function(err) {
      if(!err) {
      console.log('Updated');
      } else {
      console.log('ERROR: ' + err);
      }

      res.send(task);
    });
  });
};

exports.delete = function(req, res) {
  Task.findById(req.params.id, function(err1, task) {
    if (task) {
      task.remove(function(err2) {
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
