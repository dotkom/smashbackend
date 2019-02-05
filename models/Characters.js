const mongoose = require('mongoose');

const { Schema } = mongoose;

const CharactersSchema = new Schema({
  name: String,
  id: Number


});

mongoose.model('Characters', CharactersSchema);
