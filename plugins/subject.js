var mongoose = require('mongoose');
var Subject = mongoose.model('subject');

module.exports = function subject () {
  
this.add('role:api,category:subject,cmd:findAll', function(args,done){
    Subject.find(function(err, courses) {
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

this.add('role:api,category:subject,cmd:findById', function(args,done){
  Subject.findById(args._id, function(err, subject) {
      if(!err) {
        done(null,
          generateResponse("success",[subject],null));
      } else {
        console.log('ERROR: ' + err);
        done(err,
          generateResponse("error", err,null));
      }
    });
})

this.add('role:api,category:subject,cmd:add', function(args,done){
  console.log('POST');

  var obj = {
    name:    args['req$'].body.name,
	description:	args.description,
	temary: args.temary
  };
  var subject = new Subject(obj);
  console.log(subject);

  subject.save(function(err) {
    if(!err) {
      done(null,
        generateResponse("success",[subject],null));
      console.log('Created');
    } else {
      console.log('ERROR: ' + err);
      done(err,
        generateResponse("error", err,null));
    }
  });
})

this.add('role:api,category:subject,cmd:update', function(args,done){
  Subject.findById(args._id, function(err, subject) {
    subject.name = args['req$'].body.name;
    subject.course = args.course;
	subject.description = args.description;
	subject.temary = args.temary;

    subject.save(function(err) {
      if(!err) {
    done(null,
      generateResponse("success",[subject],null));
    console.log('Updated');
      } else {
    console.log('ERROR: ' + err);
      done(err,
        generateResponse("error", err,null));
      }
    });
  });
})

this.add('role:api,category:subject,cmd:delete', function(args,done){
   console.log(args._id); 
  Subject.findById(args._id, function(err, subject) {
    if (subject) {
      subject.remove(function(err) {
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

this.add('init:subject', init)

function init(msg, respond) {
  this.act('role:web',{use:{
    // define some routes that start with /api
    prefix: '/subject',

    // use action patterns where role has the value 'api' and cmd has some defined value
    pin: {role:'api', category: 'subject', cmd:'*'},

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

  
  return 'subject'
}