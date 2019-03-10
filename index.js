const express = require('express');
require('dotenv').config();
const passport = require('passport');

const app = express();
const cors = require('cors');

const port = process.env.PORT || 8080;
const mongoose = require('mongoose');
require('./models/User');
require('./models/Character');
require('./models/Match');
const bodyParser = require('body-parser');
const session = require('express-session');
const userstatus = require('./config/userstatus');
const auth = require('./config/auth');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/rankingsystemdb', { useNewUrlParser: true });


if (app.get('env') === 'development') {
  app.use(cors({ credentials: true, origin: ['http://localhost:3000'] }));
}
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: process.env.COOKIE_SECRET,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
  resave: true,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
auth(app);
app.use('/user/', require('./routes/user.js'));
app.use('/admin/', userstatus.isAdmin, require('./routes/admin.js'));
app.use('/match/', require('./routes/match.js'));
app.use('/character/', require('./routes/character.js'));
app.use('/leaderboard/', require('./routes/leaderboard.js'));


app.listen(port);
const setup = require('./config/setup');

setup.fillDatabase(); // used to fill character database upon changes
setup.setupAdmin();

/* eslint no-console: "off" */
console.log('Listening on port', port);
