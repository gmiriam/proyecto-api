var mongoose = require('mongoose');
var courseModel = require('../models/teacher');
var Teacher = mongoose.model('teacher');

module.exports = function teacher () {
  
this.add('role:api,category:teacher,cmd:findAll', function(args,done){
    Teacher.find(function(err, courses) {
        if(!err) {
            done(null,
              generateResponse("success",courses,null));
        } else {
            console.log('ERROR: ' + err);
            done(err,
              generateResponse("error", err,null));
        }
    });
})

this.add('role:api,category:teacher,cmd:findById', function(args,done){
  Teacher.findById(args._id, function(err, teacher) {
      if(!err) {
        done(null,
          generateResponse("success",[teacher],null));
      } else {
        console.log('ERROR: ' + err);
        done(err,
          generateResponse("error", err,null));
      }
    });
})

this.add('role:api,category:teacher,cmd:add', function(args,done){
  console.log('POST');

  var obj = {
    firstName:    args.firstName,
    surname:     args.surname,
    email:  args.email,
    password:   args.password,
	subjects: args.subjects
  };
  var teacher = new Teacher(obj);
  console.log(teacher);

  teacher.save(function(err) {
    if(!err) {
      done(null,
        generateResponse("success",[teacher],null));
      console.log('Created');
    } else {
      console.log('ERROR: ' + err);
      done(err,
        generateResponse("error", err,null));
    }
  });
})

this.add('role:api,category:teacher,cmd:update', function(args,done){
  Teacher.findById(args._id, function(err, teacher) {
    teacher.firstName = args.firstName;
    teacher.surname = args.surname;
    teacher.email = args.email;
    teacher.password = args.password;
	teacher.subjects = args.subjects;

    teacher.save(function(err) {
      if(!err) {
    done(null,
      generateResponse("success",[teacher],null));
    console.log('Updated');
      } else {
    console.log('ERROR: ' + err);
      done(err,
        generateResponse("error", err,null));
      }
    });
  });
})

this.add('role:api,category:teacher,cmd:delete', function(args,done){
   console.log(args._id); 
  Teacher.findById(args._id, function(err, teacher) {
    if (teacher) {
      teacher.remove(function(err) {
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

this.add('init:teacher', init)

function init(msg, respond) {
  this.act('role:web',{use:{
    // define some routes that start with /api
    prefix: '/teacher',

    // use action patterns where role has the value 'api' and cmd has some defined value
    pin: {role:'api', category: 'teacher', cmd:'*'},

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

  
  return 'teacher'
}