var mongoose = require('mongoose');
var Task = mongoose.model('task');

module.exports = function task () {
  
this.add('role:api,category:task,cmd:findAll', function(args,done){
    Task.find(function(err, courses) {
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

this.add('role:api,category:task,cmd:findById', function(args,done){
  Task.findById(args._id, function(err, task) {
      if(!err) {
        done(null,
          generateResponse("success",[task],null));
      } else {
        console.log('ERROR: ' + err);
        done(err,
          generateResponse("error", err,null));
      }
    });
})

this.add('role:api,category:task,cmd:add', function(args,done){
  console.log('POST');

  var obj = {
    name:    args['req$'].body.name,
    statement:     args.statement,
	startDate:	args.startDate,
	endDate: args.endDate,
	maxScore: args.maxScore,
	teacher: args.teacher,
	subject: args.subject,
  evaluationTest: args.evaluationTest
  };
  var task = new Task(obj);
  console.log(task);

  task.save(function(err) {
    if(!err) {
      done(null,
        generateResponse("success",[task],null));
      console.log('Created');
    } else {
      console.log('ERROR: ' + err);
      done(err,
        generateResponse("error", err,null));
    }
  });
})

this.add('role:api,category:task,cmd:update', function(args,done){
  Task.findById(args._id, function(err, task) {
    task.name = args['req$'].body.name;
    task.statement = args.statement;
	task.startDate = args.startDate;
	task.endDate = args.endDate;
	task.maxScore = args.maxScore;
	task.teacher = args.teacher;
	task.subject = args.subject;
  task.evaluationTest = args.evaluationTest;

    task.save(function(err) {
      if(!err) {
    done(null,
      generateResponse("success",[task],null));
    console.log('Updated');
      } else {
    console.log('ERROR: ' + err);
      done(err,
        generateResponse("error", err,null));
      }
    });
  });
})

this.add('role:api,category:task,cmd:delete', function(args,done){
   console.log(args._id); 
  Task.findById(args._id, function(err, task) {
    if (task) {
      task.remove(function(err) {
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

this.add('init:task', init)

function init(msg, respond) {
  this.act('role:web',{use:{
    // define some routes that start with /api
    prefix: '/task',

    // use action patterns where role has the value 'api' and cmd has some defined value
    pin: {role:'api', category: 'task', cmd:'*'},

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

  
  return 'task'
}