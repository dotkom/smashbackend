const passport = require('passport');
const { setupOIDC } = require('./passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');


module.exports = async (app) => {
  await setupOIDC();
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
  app.get('/login', passport.authenticate('oidc'));
  app.get('/logout', (req, res) => {
    req.logout();
    return res.status(200).send('logged out')
  });
  app.get('/auth', passport.authenticate('oidc', { successRedirect: 'localhost:3000', failureRedirect: 'localhost:3000' }));
  return app;
};
