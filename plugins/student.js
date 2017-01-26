var mongoose = require('mongoose');
var Student = mongoose.model('student');

module.exports = function student () {
  
this.add('role:api,category:student,cmd:findAll', function(args,done){
    Student.find(function(err, students) {
        if(!err) {
            done(null,
              generateResponse("success",students,null));
        } else {
            console.log('ERROR: ' + err);
            done(err,
              generateResponse("error", err,null));
        }
    });
})

this.add('role:api,category:student,cmd:findById', function(args,done){
  Student.findById(args._id, function(err, student) {
      if(!err) {
        done(null,
          generateResponse("success",[student],null));
      } else {
        console.log('ERROR: ' + err);
        done(err,
          generateResponse("error", err,null));
      }
    });
})

this.add('role:api,category:student,cmd:add', function(args,done){
  console.log('POST');

  var obj = {
    firstName:    args.firstName,
    surname:     args.surname,
    email:  args.email,
    password:   args.password,
	subjects: args.subjects,
	tasks: args.tasks
  };
  var student = new Student(obj);
  console.log(student);

  student.save(function(err) {
    if(!err) {
      done(null,
        generateResponse("success",[student],null));
      console.log('Created');
    } else {
      console.log('ERROR: ' + err);
      done(err,
        generateResponse("error", err,null));
    }
  });
})

this.add('role:api,category:student,cmd:update', function(args,done){
  Student.findById(args._id, function(err, student) {
    student.firstName = args.firstName;
    student.surname = args.surname;
    student.email = args.email;
    student.password = args.password;
	student.subjects = args.subjects;
	student.tasks = args.tasks;

    student.save(function(err) {
      if(!err) {
    done(null,
      generateResponse("success",[student],null));
    console.log('Updated');
      } else {
    console.log('ERROR: ' + err);
      done(err,
        generateResponse("error", err,null));
      }
    });
  });
})

this.add('role:api,category:student,cmd:delete', function(args,done){
   console.log(args._id); 
  Student.findById(args._id, function(err, student) {
    if (student) {
      student.remove(function(err) {
        if(!err) {
        console.log('Removed');
        done(null,
          generateResponse("success",null,null));
        } else {
        console.log('ERROR: ' + err);
        done(err, 
          generateResponse("error", err,null));
        }
      })
    }
    else {
      done(err, 
        generateResponse("error", err, "No se ha encontrado el elemento que buscaba"));
    }
  });
})

this.add('init:student', init)

function init(msg, respond) {
  this.act('role:web',{use:{
    // define some routes that start with /api
    prefix: '/student',

    // use action patterns where role has the value 'api' and cmd has some defined value
    pin: {role:'api', category: 'student', cmd:'*'},

    // for each value of cmd, match some HTTP method, and use the
    // query parameters as values for the action
    map:{
      findAll: {GET:true},          // explicitly accepting GETs
      findById: {GET: true, suffix: '/:_id'},
      add: {POST: true},
      update: {PUT: true, suffix: '/:_id'},
      delete: {DELETE: true, suffix: '/:_id'}
    }
  }})

  respond();
}

function generateResponse (status, content, message) {
  return {
    "status" : status,
    "content": content,
    "message": message
  }
}

  
  return 'student'
}