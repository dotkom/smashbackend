const passport = require('passport');
const mongoose = require('mongoose');
const { setupOIDC } = require('./passport');

const redirect = process.env.LOGIN_REDIRECT || 'http://localhost:3000';
const User = mongoose.model('User');


module.exports = async (app) => {
  await setupOIDC();
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
  app.get('/login', passport.authenticate('oidc'));
  app.get('/logout', (req, res) => {
    req.logout();
    return res.status(200).send('logged out');
  });
  app.get('/auth', passport.authenticate('oidc', { successRedirect: redirect, failureRedirect: redirect }));
  return app;
};
