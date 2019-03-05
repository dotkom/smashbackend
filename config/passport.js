const mongoose = require('mongoose');
const passport = require('passport');
//const LocalStrategy = require('passport-local');
const User = mongoose.model('User');
const { Strategy, Issuer } = require('openid-client')

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

async function createUser(user) {
  const { name, nick, onlinewebId, email } = user

  try {
    const existingUser = await User.findOne({onlinewebId: onlinewebId})
    if (!existingUser) {
      const newUser = new User({
        name,
        nick,
        onlinewebId,
        email
      })
      newUser.save()
      .then(user => {
        return user;
      })
    }
    const user = await User.findOne({ where: { _id: existingUser._id } });
    return Object.assign(user, {
      onlinewebId: onlinewebId,
      name: name,
      email: email,
    }).save();
  } catch (err) {
    throw err
  }
}

function parseOpenIDUserinfo(data) {
  return {
    name: data.name,
    nick: data.preferred_username,
    onlinewebId: data.preferred_username,
    email: data.email,
  };
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
    await configureOIDCPassport(client)
    return true
  } catch (err) {
    return false
  }
}





passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
