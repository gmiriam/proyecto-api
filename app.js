var express = require('express'),
    seneca = require('seneca')(),
    session = require('express-session'),
    CASAuthentication = require('cas-authentication'),
    app = express(),
    bodyParser  = require("body-parser"),
    methodOverride = require("method-override");
    mongoose = require('mongoose');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use( session({
    secret            : 'this app key',
    resave            : false,
    saveUninitialized : true
}));

var cas = new CASAuthentication({
    cas_url     : 'http://localhost:8080/cas', 
    service_url : 'http://localhost:3000/api'
});

mongoose.connect('mongodb://localhost/users', function(err, res) {
    if (err)
        console.log('Error:' + err);
    else
        console.log('Conectado a la base de datos');
});

//*******************************************************


seneca.use("plugins/admin", {})
seneca.use("plugins/course", {})
seneca.use("plugins/delivery", {})
seneca.use("plugins/score", {})
seneca.use("plugins/course", {})
seneca.use("plugins/student", {})
seneca.use("plugins/subject", {})
seneca.use("plugins/task", {})
seneca.use("plugins/teacher", {})

app.use( seneca.export('web'))


//*************************************************************

app.listen(3000, function() {
  console.log("Node server running on http://localhost:3000");
});