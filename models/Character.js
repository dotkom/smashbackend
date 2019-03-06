const mongoose = require('mongoose');

const { Schema } = mongoose;

const CharacterSchema = new Schema({
  name: String,
  id: Number,


});

mongoose.model('Character', CharacterSchema);
