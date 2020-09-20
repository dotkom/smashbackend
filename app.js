const express = require('express');
require('dotenv').config();
const passport = require('passport');

const app = express();
const cors = require('cors');

const databaseUrl = process.env.DATABASE_URL || 'mongodb://localhost/rankingsystemdb';
const mongoose = require('mongoose');
require('./models/User');
require('./models/Character');
require('./models/Match');
const bodyParser = require('body-parser');
const session = require('express-session');
const userstatus = require('./config/userstatus');
const auth = require('./config/auth');
const setup = require('./config/setup');


mongoose.Promise = global.Promise;
mongoose.connect(databaseUrl, { useNewUrlParser: true });

app.use(cors({ credentials: true, origin: true }));

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


setup.fillDatabase(); // used to fill character database upon changes
setup.setupAdmin();

module.exports = app;
