var express = require('express')
var bodyparser = require('body-parser')
var app = express()
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var session = require('express-session')
var cookieParser = require('cookie-parser')
var jwt = require('jsonwebtoken')
var key = require('./key')

app.use(cookieParser())
var sessionCookie = {
    secret: 'test cat',
    resave: true,
    saveUninitialized: true
}
app.use(session(sessionCookie))
app.use(passport.initialize())
app.use(passport.session())

const isjwtVerified = (req) => {
    const token = req.headers.authorization.split(" ")[1]

    var result = jwt.verify(token, key.keyname)
    if(result){
        return true;
    } else {
        return false;
    }
}

app.use((req, res, next) => {
    console.log('req url:', req.url)
    if(req.url == '/' || req.url == '/style.css' || req.url == '/login' ){
        next();
    }
    else if (isjwtVerified(req)){
        console.log('isverified true')
        next()
    } else {
        console.log('isverified false')
        res.write('Authentication error')
        res.end()
    }
})

app.get('/success', (req, resp) => resp.send('welcome to '+ req.query.user))
app.get('/error', (req, res) => res.send("Authentication failed") )

passport.use(new LocalStrategy({usernameField: 'user'}, (user, pass, done) => {
    console.log('local : authentication started')
    var u = 'admin'
    var p ='abc123'

    if(user !== u){
        done('Error: User name is not matching', false)
    }
    if(pass !== p){
        done('Error: wrong credentials', false)
    }

    done(null, true)
}))

passport.serializeUser((user, cb) => {
    console.log('serilize called')
    cb(null, 'user1')
})
passport.deserializeUser( (id, cb) => {
    console.log('desirialze called')
    cb(null, {user:'admin', pass:'abc123'})
})

app.use('/', express.static( __dirname+'/client'))
app.use(bodyparser.urlencoded({extended:true}))

app.post('/login', passport.authenticate('local', {failureRedirect: '/error'}) , (req, res) => {
    console.log('req body received',req.body)
    var token = jwt.sign({'user':'user1'}, key.keyname, )
    res.status(200).json({'token':token})
    //res.send('authentication success with token:'+ token)
    //res.redirect('/success?user='+req.body.user)
})

app.get('/welcome', (req, res) => {
        //res.write("<h1> Welcome "+ req.session.passport.user+ '</h1>')
        //res.end('Session id:' + req.sessionID)
        res.end("WElcome executed")
})

app.get('/hello', (req, res) => {
    res.send("Hello Executed..")
})

var server = app.listen(8080, (err) => {
    if(err)
      consolog.log(err)
    else
      console.log('application listening on http://localhost:8080')
})