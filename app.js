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

var userModel = require('./models/user');//app, mongoose);
var userCtrl = require('./controllers/users');

var subjectModel = require('./models/subject');
var subjectCtrl = require('./controllers/subjects');

// API routes
var users = express.Router();
var subjects = express.Router();

users.route('/users')
  .get(userCtrl.findAll)
  .post(userCtrl.add);

users.route('/users/:id')
  .get(userCtrl.findById)
  .put(userCtrl.update)
  .delete(userCtrl.delete);
  
subjects.route('/subjects')
	.get(subjectCtrl.findAll)
	.post(subjectCtrl.add);

subjects.route('/subjects/:id')
	.get(subjectCtrl.findAll)
	.post(subjectCtrl.update)
	.delete(subjectCtrl.delete);
	
app.use('/api', users);
app.use('/api', subjects);



app.listen(3000, function() {
  console.log("Node server running on http://localhost:3000");
});