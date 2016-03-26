var mongoose = require('mongoose');
var courseModel = require('../models/course');
var Course = mongoose.model('course');

module.exports = function course () {
  
this.add('role:api,category:course,cmd:findAll', function(args,done){
    Course.find(function(err, courses) {
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

this.add('role:api,category:course,cmd:findById', function(args,done){
  Course.findById(args._id, function(err, course) {
      if(!err) {
        done(null,
          generateResponse("success",[course],null));
      } else {
        console.log('ERROR: ' + err);
        done(err,
          generateResponse("error", err,null));
      }
    });
})

this.add('role:api,category:course,cmd:add', function(args,done){
  console.log('POST');

  var obj = {
    name:    args['req$'].body.name,
    subjects:     args.subjects
  };
  var course = new Course(obj);
  console.log(course);

  course.save(function(err) {
    if(!err) {
      done(null,
        generateResponse("success",[course],null));
      console.log('Created');
    } else {
      console.log('ERROR: ' + err);
      done(err,
        generateResponse("error", err,null));
    }
  });
})

this.add('role:api,category:course,cmd:update', function(args,done){
  Course.findById(args._id, function(err, course) {
    course.name = args.name;
    course.subjects = args.subjects;

    course.save(function(err) {
      if(!err) {
    done(null,
      generateResponse("success",[course],null));
    console.log('Updated');
      } else {
    console.log('ERROR: ' + err);
      done(err,
        generateResponse("error", err,null));
      }
    });
  });
})

this.add('role:api,category:course,cmd:delete', function(args,done){
   console.log(args._id); 
  Course.findById(args._id, function(err, course) {
    if (course) {
      course.remove(function(err) {
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

this.add('init:course', init)

function init(msg, respond) {
  this.act('role:web',{use:{
    // define some routes that start with /api
    prefix: '/course',

    // use action patterns where role has the value 'api' and cmd has some defined value
    pin: {role:'api', category: 'course', cmd:'*'},

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

  
  return 'course'
}