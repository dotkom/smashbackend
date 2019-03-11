const mongoose = require('mongoose');
const characters = require('./characters.json');

const Character = mongoose.model('Character');
const User = mongoose.model('User');

exports.fillDatabase = () => {
  characters.forEach((element) => {
    Character.updateOne(
      { name: element.name },
      { id: element.id, name: element.name },
      { upsert: true },
    );
  });
};

exports.setupAdmin = () => {
  User.updateOne({ onlineId: '600' }, { isAdmin: true }, () => {});
};
