const mongoose = require('mongoose');

const { Schema } = mongoose;

const MatchesSchema = new Schema({
  player1: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  character1: Number,
  oldrank1: Number,
  newrank1: Number,
  player2: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  character2: Number,
  oldrank2: Number,
  newrank2: Number,
  winner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },


});

mongoose.model('Matches', MatchesSchema);
