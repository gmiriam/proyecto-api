
var mongoose = require('mongoose');
var Admin = mongoose.model('admin');

//GET - Devuvelve todos los admins en la DB
exports.findAll = function(req, res) {
    Admin.find(function(err, admins) {
        if(!err) {
            res.send(admins);
        } else {
            console.log('ERROR: ' + err);
        }
    });
};

  //GET - Devuelve un admin con un ID específico.
  exports.findById = function(req, res) {
    console.log("entra", req.params.id)
  Admin.findById(req.params.id, function(err, admin) {
    if(!err) {
      res.send({
        admin: admin, 
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

  var admin = new Admin({
    firstName:    req.body.firstName,
    surname:     req.body.surname,
    email:  req.body.email,
    password:   req.body.password
	});

  admin.save(function(err) {
    if(!err) {
      res.send(admin);
      console.log('Created');
    } else {
      console.log('ERROR: ' + err);
    }
  });

};

exports.update = function(req, res) {
  Admin.findById(req.params.id, function(err, admin) {
    admin.firstName = req.body.firstName;
    admin.surname = req.body.surname;
    admin.email = req.body.email;
    admin.password = req.body.password;

    admin.save(function(err) {
      if(!err) {
      console.log('Updated');
      } else {
      console.log('ERROR: ' + err);
      }

      res.send(admin);
    });
  });
};

exports.delete = function(req, res) {
  Admin.findById(req.params.id, function(err1, admin) {
    if (admin) {
      admin.remove(function(err2) {
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
