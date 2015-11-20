var express = require("express"),
    app = express(),
    bodyParser  = require("body-parser"),
    methodOverride = require("method-override");
    mongoose = require('mongoose');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());

mongoose.connect('mongodb://localhost/users', function(err, res) {
    if (err)
        console.log('Error:' + err);
    else
        console.log('Conectado a la base de datos');
});

var model = require('./models/user')//app, mongoose);

var userCtrl = require('./controllers/users');

// API routes
var users = express.Router();

users.route('/users')
  .get(userCtrl.findAllUsers)
  .post(userCtrl.addUser);

users.route('/users/:id')
  .get(userCtrl.findUserById)
  .put(userCtrl.updateUser)
  .delete(userCtrl.deleteUser);

app.use('/api', users);




app.listen(3000, function() {
  console.log("Node server running on http://localhost:3000");
});