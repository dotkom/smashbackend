const mongoose = require('mongoose');
const crypto = require('crypto');

const { Schema } = mongoose;

const UserSchema = new Schema({
  name: String,
  nick: String,
  rating: {
    type: Number,
    default: 1200,
  },
  onlinewebId: String,
  email: String,
  isAdmin: Boolean,
  kValue: {
    type: Number,
    default: 100,
  },
});

mongoose.model('User', UserSchema);
