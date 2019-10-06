const mongoose = require('mongoose');
const passport = require('passport');
// const LocalStrategy = require('passport-local');
const User = mongoose.model('User');
const { Strategy } = require('openid-client');
const { Issuer } = require('openid-client');


async function getOIDCClient() {
  const provider = process.env.HOST_URL;
  const clientId = process.env.CLIENT_ID;

  const issuer = await Issuer.discover(provider);
  return new issuer.Client({ client_id: clientId, client_secret: process.env.CLIENT_SECRET });
}

async function createUser(userinfo) {
  const {
    name, nick, onlineId, email,
  } = userinfo;

  try {
    const existingUser = await User.findOne({ onlineId });
    if (!existingUser) {
      const newUser = new User({
        name,
        nick,
        onlineId,
        email,
      });
      const user = await newUser.save();
      return user;
    }
    const updatedUser = await User.findOne({ _id: existingUser._id });
    return Object.assign(updatedUser, {
      onlineId,
      name,
      email,
    }).save();
  } catch (err) {
    throw err;
  }
}

function parseOpenIDUserinfo(data) {
  return {
    name: data.name,
    nick: data.preferred_username,
    onlineId: data.sub,
    email: data.email,
  };
}


async function configureOIDCPassport(client) {
  const params = {
    client_id: process.env.CLIENT_ID,
    redirect_uri: process.env.REDIRECT_URI,
    scope: process.env.SCOPE,
    client_secret: process.env.CLIENT_SECRET,

  };
  const passReqToCallback = false;
  const usePKCE = false;

  passport.use('oidc', new Strategy({
    client,
    params,
    passReqToCallback,
    usePKCE,
  }, async (tokenset, userinfo, done) => {
    const user = await createUser(parseOpenIDUserinfo(userinfo));
    done(null, user);
  }));
}

async function setupOIDC() {
  try {
    const client = await getOIDCClient();
    client.CLOCK_TOLERANCE = 5;
    await configureOIDCPassport(client);
    return true;
  } catch (err) {
    return false;
  }
}


module.exports = {
  setupOIDC,
};
