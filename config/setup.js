const mongoose = require('mongoose');
const characters = require('./characters.json');

const Character = mongoose.model('Character');

exports.fillDatabase = () => {
  characters.forEach((element) => {
    Character.updateOne(
      { name: element.name },
      { id: element.id, name: element.name },
      { upsert: true },
    );
  });
};
