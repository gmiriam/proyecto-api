var mongoose = require('mongoose');
var Admin = mongoose.model('admin');

function admin_plugin () {
seneca.add('role:api,category:admin,cmd:findAll', function(args,done){
    Admin.find(function(err, admins) {
        if(!err) {
            done(null,admins);
        } else {
            console.log('ERROR: ' + err);
            done(err,'ERROR: ' + err);
        }
    });
})

seneca.add('role:api,category:admin,cmd:findById', function(args,done){
  Admin.findById(args._id, function(err, admin) {
      if(!err) {
        done(null, [admin]);
      } else {
        console.log('ERROR: ' + err);
        done(null,{});
      }
    });
})

seneca.add('role:api,category:admin,cmd:add', function(args,done){
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
      console.log('ERROR: ' + err);
      done(err,'ERROR: ' + err);
    }
  });
})

seneca.add('role:api,category:admin,cmd:update', function(args,done){
  Admin.findById(args._id, function(err, admin) {
    admin.firstName = args.firstName;
    admin.surname = args.surname;
    admin.email = args.email;
    admin.password = args.password;

    admin.save(function(err) {
      if(!err) {
		done(null,[admin]);
		console.log('Updated');
      } else {
		console.log('ERROR: ' + err);
	    done(err,'ERROR: ' + err);
      }
    });
  });
})

seneca.add('role:api,category:admin,cmd:delete', function(args,done){
   console.log(args._id); 
  Admin.findById(args._id, function(err1, admin) {
    if (admin) {
      admin.remove(function(err2) {
        if(!err2) {
        console.log('Removed');
        done(null,"Eliminado");
        } else {
        console.log('ERROR: ' + err2);
		done(err2,'ERROR: ' + err2);
        }
      })
    }
    else
      console.log(err1);
  });
})
}