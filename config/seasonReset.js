const databaseUrl = process.env.DATABASE_URL || 'mongodb://localhost/rankingsystemdb';
const mongoose = require('mongoose');
require('./../models/User');
require('./../models/Character');
require('./../models/Match');

mongoose.Promise = global.Promise;
mongoose.connect(databaseUrl, { useNewUrlParser: true });
const User = mongoose.model('User');


User.updateMany({}, { kValue: 100, rating: 1200 }, () => {process.exit()});