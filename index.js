const express = require('express')
require('dotenv').config()
const app = express()
var cors = require('cors')
const port = process.env.PORT || 8080
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const session = require('express-session');
const passport = require('passport')
const auth = require('./config/auth')

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/rankingsystemdb', {useNewUrlParser: true})

require('./models/User');
require('./models/Character');
require('./models/Match');
require('./config/passport');

const setup = require('./config/setup')
if ( app.get('env') === 'development' ) {
  app.use(cors({credentials : true, origin : ['http://localhost:3000']}))
}
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(session({ secret: 'temp-secret', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));
app.use(passport.initialize())
app.use(passport.session())

app.use('/user/', require("./routes/user.js"))
app.use('/admin/', auth.isAdmin, require("./routes/admin.js"))
app.use('/match/', require("./routes/match.js"))
app.use('/character/', require("./routes/character.js"))
app.use('/leaderboard/', require("./routes/leaderboard.js"))



app.listen(port)

// setup.fillDatabase() // used to fill character database upon changes

console.log('Started on port: ' + port)
