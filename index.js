const express = require('express')
const app = express()
const port = process.env.PORT || 8080
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const session = require('express-session');
const passport = require('passport')

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/rankingsystemdb', {useNewUrlParser: true})

require('./models/User');
require('./models/Characters');
require('./models/Matches');
require('./config/passport');

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(session({ secret: 'temp-secret', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));
app.use(passport.initialize())
app.use(passport.session())

app.use('/user/', require("./routes/user.js"))

app.listen(port)

console.log('Started on port: ' + port)
