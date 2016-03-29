var mongoose = require('mongoose');
var courseModel = require('../models/score');
var Score = mongoose.model('score');

module.exports = function score () {
  
this.add('role:api,category:score,cmd:findAll', function(args,done){
    Score.find(function(err, courses) {
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

this.add('role:api,category:score,cmd:findById', function(args,done){
  Score.findById(args._id, function(err, score) {
      if(!err) {
        done(null,
          generateResponse("success",[score],null));
      } else {
        console.log('ERROR: ' + err);
        done(err,
          generateResponse("error", err,null));
      }
    });
})

this.add('role:api,category:score,cmd:add', function(args,done){
  console.log('POST');

  var obj = {
    student:     args.student,
	subject:	args.subject,
	finalScore: args.finalScore
  };
  var score = new Score(obj);
  console.log(score);

  score.save(function(err) {
    if(!err) {
      done(null,
        generateResponse("success",[score],null));
      console.log('Created');
    } else {
      console.log('ERROR: ' + err);
      done(err,
        generateResponse("error", err,null));
    }
  });
})

this.add('role:api,category:score,cmd:update', function(args,done){
  Score.findById(args._id, function(err, score) {
    score.student = args.student;
	score.subject = args.subject;
	score.finalScore = args.finalScore;

    score.save(function(err) {
      if(!err) {
    done(null,
      generateResponse("success",[score],null));
    console.log('Updated');
      } else {
    console.log('ERROR: ' + err);
      done(err,
        generateResponse("error", err,null));
      }
    });
  });
})

this.add('role:api,category:score,cmd:delete', function(args,done){
   console.log(args._id); 
  Score.findById(args._id, function(err, score) {
    if (score) {
      score.remove(function(err) {
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

this.add('init:score', init)

function init(msg, respond) {
  this.act('role:web',{use:{
    // define some routes that start with /api
    prefix: '/score',

    // use action patterns where role has the value 'api' and cmd has some defined value
    pin: {role:'api', category: 'score', cmd:'*'},

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

  
  return 'score'
}