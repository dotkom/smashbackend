const express = require('express')
require('dotenv').config()
const app = express()
var cors = require('cors')
const port = process.env.PORT || 8080
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const session = require('express-session');
require('./models/User');
require('./models/Character');
require('./models/Match');
const userstatus = require('./config/userstatus')
const { setupOIDC } = require('./config/passport')
const auth = require('./config/auth')

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/rankingsystemdb', {useNewUrlParser: true})

const setup = require('./config/setup')
if ( app.get('env') === 'development' ) {
  app.use(cors({credentials : true, origin : ['http://localhost:3000']}))
}
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(session({ secret: 'temp-secret', resave: false, saveUninitialized: false }));

app.use('/user/', require("./routes/user.js"))
app.use('/admin/', userstatus.isAdmin, require("./routes/admin.js"))
app.use('/match/', require("./routes/match.js"))
app.use('/character/', require("./routes/character.js"))
app.use('/leaderboard/', require("./routes/leaderboard.js"))

auth(app)

app.listen(port)

// setup.fillDatabase() // used to fill character database upon changes

console.log('Started on port: ' + port)
