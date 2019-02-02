const mongoose = require('mongoose');

const { Schema } = mongoose;

const MatchesSchema = new Schema({
  player1: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  character1: {
    type: Schema.Types.ObjectId,
    ref: 'Character'
  },
  oldrank1: Number,
  newrank1: Number,
  player2: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  character2: {
    type: Schema.Types.ObjectId,
    ref: 'Character'
  },
  oldrank2: Number,
  newrank2: Number,
  winner: Number,


});

mongoose.model('Matches', MatchesSchema);
