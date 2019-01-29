const mongoose = require('mongoose');

const { Schema } = mongoose;

const CharactersSchema = new Schema({
  name: String,


});

mongoose.model('Characters', CharactersSchema);
