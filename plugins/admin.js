var mongoose = require('mongoose');
var adminModel = require('../models/admin');
var Admin = mongoose.model('admin');

module.exports = function admin () {
  
this.add('role:api,category:admin,cmd:findAll', function(args,done){
    Admin.find(function(err, admins) {
        if(!err) {
            done(null,admins);
        } else {
            done(err,
			getResponse("error", err, null));
        }
    });
})

this.add('role:api,category:admin,cmd:findById', function(args,done){
  Admin.findById(args._id, function(err, admin) {
      if(!err) {
        done(null, [admin]);
      } else {
        done(err,
		getResponse("error",err,null));
      }
    });
})

this.add('role:api,category:admin,cmd:add', function(args,done){
  console.log('POST');

  var obj = {
    firstName:    args.firstName,
    surname:     args.surname,
    email:  args.email,
    password:   args.password
  };
  var admin = new Admin(obj);
  console.log(admin);

  admin.save(function(err) {
    if(!err) {
      done(null,[admin]);
      console.log('Created');
    } else {
      done(err,
		getResponse("error",err,null));
    }
  });
})

this.add('role:api,category:admin,cmd:update', function(args,done){
  Admin.findById(args._id, function(err, admin) {
    admin.firstName = args.firstName;
    admin.surname = args.surname;
    admin.email = args.email;
    admin.password = args.password;

    admin.save(function(err) {
      if(!err) {
		done(null,[admin]);
      } else {
	    done(err,
		getResponse('error',err,null));
      }
    });
  });
})

this.add('role:api,category:admin,cmd:delete', function(args,done){
   console.log(args._id); 
  Admin.findById(args._id, function(err, admin) {
    if (admin) {
      admin.remove(function(err) {
        if(!err) {
          var status = {"status" : "success"};
        done(null, getResponse("success", null,null));
        } else {
        console.log('ERROR: ' + err);
		    done(err, getResponse("error", err,null));
        }
      })
    }
    else {
      done(err, 
	  getResponse("error", err, "No se ha encontrado el elemento que buscaba"));
    }
  });
})

this.add('init:admin', init)

function init(msg, respond) {
  this.act('role:web',{use:{
    // define some routes that start with /api
    prefix: '/admin',

    // use action patterns where role has the value 'api' and cmd has some defined value
    pin: {role:'api', category: 'admin', cmd:'*'},

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

function getResponse (status, content, message) {
  return {
    "status" : status,
    "content": content,
    "message": message
  }
}

  
  return 'admin'
}