const mongoose = require('mongoose');
const passport = require('passport');
//const LocalStrategy = require('passport-local');
const User = mongoose.model('User');
const { Stategy, Issuer } = require('openid-client')

const params = {
  client_id: process.env.CLIENT_ID,
  redirect_uri: process.env.REDIRECT_URI,
  scope: process.env.SCOPE,
  client_secret: process.env.CLIENT_SECRET,

}
const passReqToCallback = false;
const usePKCE = false;

async function getOIDCClient() {
  const provider = process.env.HOST_URL
  const clientId = process.env.CLIENT_ID

  const { Client } = await Issuer.discover(provider)

  return new Client({client_id: clientId})
}

async function configureOIDCPassport(){
  passport.use('oidc', new Strategy({
    client,
    params,
    passReqToCallback,
    usePKCE
  }, async (tokenset, userinfo, done) => {
    done(null, await createUser(parseOpenIDUserinfo(userinfo)))
  }))
}

async function setupOIDC(){
  try {
    const client = await getOIDCClient();
    await
  }
}

passport.use('oidc', new Strategy({

}))



passport.use(new LocalStrategy({
    usernameField: 'email',
  },
  function(email, password, done) {
    User.findOne({ email }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }
      if (!user.validatePassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
