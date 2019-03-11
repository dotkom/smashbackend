const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema({
  name: String,
  nick: String,
  rating: {
    type: Number,
    default: 1200,
  },
  onlineId: String,
  email: String,
  isAdmin: {
    type: Boolean,
    default: false,
  },
  kValue: {
    type: Number,
    default: 100,
  },
});

mongoose.model('User', UserSchema);
