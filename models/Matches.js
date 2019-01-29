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
  oldrank1: Integer,
  newrank1: Integer,
  player2: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  character2: {
    type: Schema.Types.ObjectId,
    ref: 'Character'
  },
  oldrank2: Integer,
  newrank2: Integer,
  winner: Number,


});

mongoose.model('Matches', MatchesSchema);
