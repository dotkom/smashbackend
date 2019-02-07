const mongoose = require('mongoose');
const crypto = require('crypto');

const { Schema } = mongoose;

const PreUserSchema = new Schema({
  name: String,
  nick: String,
  rating: Number,
  email: String,
  hash: String,
  salt: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

PreUserSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

PreUserSchema.methods.validatePassword = function(password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

mongoose.model('PreUser', PreUserSchema);
