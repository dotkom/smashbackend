const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const sgTransport = require('nodemailer-sendgrid-transport');

const User = mongoose.model('User');

router.post('/register', (req, res) => {
  const { name, nick, email, password } = req.body;

  if (!name || !email || !password || !nick) {
    return res.status(400).send('Please enter all fields')
  }

  if (password.length < 6) {
    return res.status(400).send('Password must be at least 6 characters')
  }

  const expression = [a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?

  if (!email.match(expression)) {
    return res.status(400).send('Email is not valid')
  }

  User.findOne({nick: nick})
  .then(user => {
    if (user) {
      return res.status(400).send('Nickname already exists. Contact admin for help')
    }
  })

  User.findOne({ email: email })
  .then(user => {

    if (user) {
      return res.status(400).send('Email already exists')
    }

    else {
      const newUser = new User({
        name,
        email
      });
      newUser.setPassword(password)
      newUser
      .save()
      .then(user =>
        res.status(200).send('User registered'))
      .catch(err => console.log(err));
    }
  });
});

router.post('/login',
  passport.authenticate('local'),
  function(req, res) {
    req.user = {name: req.user['name'], email: req.user['email']}
    res.send(req.user);
  }
);

router.get('/logout', function(req,res) {
  req.logout();
  res.status(200).send("Logged out")
  }
)

router.get('/current', function(req, res){
  if (req.user) {
    req.user = {name: req.user['name'], email: req.user['email']}
    return res.json(req.user);
  }
  return res.json(null)
})

router.post('/forgot', function(req,res) {
  var token = crypto.randomBytes(20).toString('hex')
  const { email } = req.body
  User.findOne({
    email: email
  })
  .then(user => {
    if (!user) {
      return res.status(400).send('Email does not exist')
    }
    user.resetPasswordToken = token
    user.resetPasswordExpires = Date.now() + 600000

    user.save()
    .catch(err => {
      return res.status(400).send('Something went wrong')
    })

    var mailauth = {
      auth: {
        api_user: process.env.EMAIL_USER,
        api_key: process.env.EMAIL_PASSWORD
      }
    };

    var client = nodemailer.createTransport(sgTransport(mailauth))

    var email = {
       to: user.email,
       from: 'exburn0@gmail.com',
       subject: 'Online Smash password reset',
       text: 'Du har bedt om tilbakestille passordet.\n\n' +
         'Trykk på følgende link for å lage et nytt passord:\n\n' +
         'http://' + req.headers.host + '/user/reset/' + token + '\n\n' +
         'Passordet forblir uendret om du ikke gjør noe.\n'
    };
    client.sendMail(email, function(err) {
      if (err) {
        console.log(err)
        return res.status(400).send('Email was not sent')
      }
      return res.status(200).send('An e-mail has been sent to ' + user.email + 'with further instructions. Check spam.')
    });
  })
  .catch(err => {
    return res.status(400).send('Something went wrong2')
  })


})

router.get('/reset/:token', function(req, res) {

    User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    })
    .then(user => {
      if (!user) {
        return res.status(400).send('Password reset token is invalid or has expired.');
      }
        return res.status(200).send('You are eligible to change password')
    })
    .catch(err => {
      return res.status(400).send('Something went wrong, try again')
    })
});

router.post('/reset/:token', function(req, res) {
  const { password } = req.body

  if (password.length < 6) {
    return res.status(400).send('Password must be at least 6 characters')
  }

  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  })
  .then(user => {
    if (!user) {
      return res.status(400).send('Password reset token is invalid or has expired.')
    }
    user.setPassword(req.body.password)
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined

    user.save()
    .then(user => {
      return res.status(200).send('Password changed. You can now log in')
    })
    .catch(err => {
      return res.status(400).send('Something went wrong')
    })
  })
});

router.post('/changepassword', function(req,res){
  const { oldpassword, newpassword } = req.body;
  user = req.user
  if (!user) {
    return res.status(400).send('You must be logged in')
  }
  if (!oldpassword || !newpassword) {
    return res.status(400).send('Please enter all fields')
  }

  if(newpassword.length < 6) {
    return res.status(400).send('Password must be 6 characters or more')
  }



  if (!user.validatePassword(oldpassword)) {
    return res.status(400).send('Invalid original password')
  }
  user.setPassword(newpassword)

  user.save(function(err) {
      if (err) {
        return res.status(400).send('Something went wrong 2')
      };
      req.logout()
      return res.status(200).send('Password changed. Relog');
  });


})


module.exports = router;
