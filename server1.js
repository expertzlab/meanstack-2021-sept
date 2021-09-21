var path = require('path')
//import * as express from 'express'
var express = require('express')
var bodyParser = require('body-parser')
//import { welcomeController, registrationController } from './controllers'
//import { RegistrationDao } from './controllers/registrationdao';
var cookieParser = require('cookie-parser')
var session = require('express-session')
const app = express();

app.use(bodyParser.urlencoded({ extended: true }))
const passport = require('passport');

const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({usernameField: 'user'},
  function(username, password, done) {
      console.log('local-authentication:started')
      /*
      new RegistrationDao().findOne({
        username: username
      }, function(err, user) {
        if (err) {
          return done(err);
        }
        */
       var user = {user:'admin', password:'abc123'}

        if (!user) {
          return done(null, false);
        }

        if (user.password != password) {
          return done(null, false);
        }
        return done(null, user);
      }
));


passport.serializeUser(function(user, cb) {
    console.log('serialize')
    cb(null, 'user1');
  });
 
  passport.deserializeUser(function(id, cb) {
      console.log('de-serialize')
      var user = {user:'admin', password:'abc123'}
    //new RegistrationDao().findById(id, function(err, user) {
      cb(null, user);
   // });
  });

 

  app.listen(8080, ()=>{
    console.log('listening on:'+8080)
  })

  app.use(cookieParser())
  var sessionCookie = {
      secret: 'test cat',
      resave: true,
      saveUninitialized: true
  }
  app.use(session(sessionCookie))
app.use(passport.initialize());
app.use(passport.session());

app.get('/success', (req, res) => res.send("Welcome "+req.query.username+"!!"));
app.get('/error', (req, res) => res.send("error logging in"));


app.use('/',express.static(path.join(__dirname,'/client')))
//app.use('/welcome',welcomeController)
//importapp.use('/register', registrationController)

app.use('/login',function(req, res,next){
    console.log('username: req.body:', req.params)
    next()
})
app.post('/login',
passport.authenticate('local', { failureRedirect: '/error' }),
function(req, res) {
  res.redirect('/success?username='+req.body.user);

})

app.get('/welcome', (req, res) => {
    console.log(req.sessionID)
  if(req.isAuthenticated()){
    console.log('Execute as authenticated', req.session.passport.user)
    res.redirect('/success?username=');
  } else {
    res.redirect('/');
  }

})