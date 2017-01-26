var mongoose = require('mongoose');
var User = mongoose.model('user');

module.exports = function user () {
  
this.add('role:api,category:user,cmd:findAll', function(args,done){
    User.find(function(err, users) {
        if(!err) {
            done(null,
              generateResponse("success",users,null));
        } else {
            console.log('ERROR: ' + err);
            done(err,
              generateResponse("error", err,null));
        }
    });
})

this.add('role:api,category:user,cmd:findById', function(args,done){
  User.findById(args._id, function(err, user) {
      if(!err) {
        done(null,
          generateResponse("success",[user],null));
      } else {
        console.log('ERROR: ' + err);
        done(err,
          generateResponse("error", err,null));
      }
    });
})

this.add('role:api,category:user,cmd:add', function(args,done){
  console.log('POST');

  var obj = {
    task:    args.task,
    student:     args.student,
	score:	args.score,
	data: args.data
  };
  var user = new User(obj);
  console.log(user);

  user.save(function(err) {
    if(!err) {
      done(null,
        generateResponse("success",[user],null));
      console.log('Created');
    } else {
      console.log('ERROR: ' + err);
      done(err,
        generateResponse("error", err,null));
    }
  });
})

this.add('role:api,category:user,cmd:update', function(args,done){
  User.findById(args._id, function(err, user) {
    user.task = args.task;
    user.student = args.student;
	user.score = args.score;
	user.data = args.data;

    user.save(function(err) {
      if(!err) {
    done(null,
      generateResponse("success",[user],null));
    console.log('Updated');
      } else {
    console.log('ERROR: ' + err);
      done(err,
        generateResponse("error", err,null));
      }
    });
  });
})

this.add('role:api,category:user,cmd:delete', function(args,done){
   console.log(args._id); 
  User.findById(args._id, function(err, user) {
    if (user) {
      user.remove(function(err) {
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

this.add('init:user', init)

function init(msg, respond) {
  this.act('role:web',{use:{
    // define some routes that start with /api
    prefix: '/user',

    // use action patterns where role has the value 'api' and cmd has some defined value
    pin: {role:'api', category: 'user', cmd:'*'},

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

  
  return 'user'
}