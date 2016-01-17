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

var courseModel = require('./models/course');
var courseCtrl = require('./controllers/courses');

var deliveryModel = require('./models/delivery');
var deliveryCtrl = require('./controllers/deliveries');

var scoreModel = require('./models/score');
var scoreCtrl = require('./controllers/scores');

var studentModel = require('./models/student');
var studentCtrl = require('./controllers/students');

var subjectModel = require('./models/subject');
var subjectCtrl = require('./controllers/subjects');

var taskModel = require('./models/task');
var taskCtrl = require('./controllers/tasks');

var teacherModel = require('./models/teacher');
var teacherCtrl = require('./controllers/teachers');

/*var userModel = require('./models/user');
var userCtrl = require('./controllers/users');*/




// API routes

var courses = express.Router();
var deliveries = express.Router();
var scores = express.Router();
var students = express.Router();
var subjects = express.Router();
var tasks = express.Router();
var teachers = express.Router();
var users = express.Router();

courses.route('/courses')
	.get(courseCtrl.findAll)
	.post(courseCtrl.add);

courses.route('/courses/:id')
	.get(courseCtrl.findById)
	.put(courseCtrl.update)
	.delete(courseCtrl.delete);
	
deliveries.route('/deliveries')
	.get(deliveryCtrl.findAll)
	.post(deliveryCtrl.add);

deliveries.route('/deliveries/:id')
	.get(deliveryCtrl.findById)
	.put(deliveryCtrl.update)
	.delete(deliveryCtrl.delete);
	
scores.route('/scores')
	.get(scoreCtrl.findAll)
	.post(scoreCtrl.add);

scores.route('/scores/:id')
	.get(scoreCtrl.findById)
	.put(scoreCtrl.update)
	.delete(scoreCtrl.delete);
	
students.route('/students')
  .get(studentCtrl.findAll)
  .post(studentCtrl.add);

students.route('/students/:id')
  .get(studentCtrl.findById)
  .put(studentCtrl.update)
  .delete(studentCtrl.delete);
  
subjects.route('/subjects')
  .get(subjectCtrl.findAll)
  .post(subjectCtrl.add);

subjects.route('/subjects/:id')
  .get(subjectCtrl.findById)
  .put(subjectCtrl.update)
  .delete(subjectCtrl.delete);
  
tasks.route('/tasks')
  .get(taskCtrl.findAll)
  .post(taskCtrl.add);

tasks.route('/tasks/:id')
  .get(taskCtrl.findById)
  .put(taskCtrl.update)
  .delete(taskCtrl.delete);
  
teachers.route('/teachers')
  .get(teacherCtrl.findAll)
  .post(teacherCtrl.add);

teachers.route('/teachers/:id')
  .get(teacherCtrl.findById)
  .put(teacherCtrl.update)
  .delete(teacherCtrl.delete);

	
app.use('/api', courses);
app.use('/api', deliveries);
app.use('/api', scores);
app.use('/api', students);
app.use('/api', subjects);
app.use('/api', tasks);
app.use('/api', teachers);




app.listen(3000, function() {
  console.log("Node server running on http://localhost:3000");
});