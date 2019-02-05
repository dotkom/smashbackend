const mongoose = require('mongoose');
const crypto = require('crypto');

const { Schema } = mongoose;

const UserSchema = new Schema({
  name: String,
  nick: String,
  main_characters: [Number],
  rating: Number,
  email: String,
  hash: String,
  salt: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isAdmin: Boolean
});

UserSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UserSchema.methods.validatePassword = function(password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

mongoose.model('User', UserSchema);
