
var mongoose = require('mongoose');
var Delivery = mongoose.model('delivery');

//GET - Devuvelve todos los cursos en la DB
exports.findAll = function(req, res) {
    Delivery.find(function(err, delivery) {
        if(!err) {
            res.send(delivery);
        } else {
            console.log('ERROR: ' + err);
        }
    });
};

  //GET - Devuelve un curso con un ID específico.
  exports.findById = function(req, res) {
  Delivery.findById(req.params.id, function(err, delivery) {
    if(!err) {
      res.send({
        delivery: delivery,
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

  var delivery = new Delivery({
    task:    req.body.task,
    student:     req.body.student,
	score: req.body.score,
	data: req.body.data
  });

  delivery.save(function(err) {
    if(!err) {
      res.send(delivery);
      console.log('Created');
    } else {
      console.log('ERROR: ' + err);
    }
  });

};

exports.update = function(req, res) {
  Delivery.findById(req.params.id, function(err, delivery) {
    delivery.task = req.body.task;
    delivery.student = req.body.student;
	delivery.score = req.body.score;
	delivery.data = req.body.data;

    delivery.save(function(err) {
      if(!err) {
      console.log('Updated');
      } else {
      console.log('ERROR: ' + err);
      }

      res.send(delivery);
    });
  });
};

exports.delete = function(req, res) {
  Delivery.findById(req.params.id, function(err1, delivery) {
    if (delivery) {
      delivery.remove(function(err2) {
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
