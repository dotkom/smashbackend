const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');

const User = mongoose.model('User');

router.post('/register', (req, res) => { // denne har ingenting med passport å gjøre
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send('Please enter all fields')
  }

  if (password.length < 6) {
    return res.status(400).send('Password must be at least 6 characters')
  } else {
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
  }
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
      res.status(200).send('Password changed. You can now log in')
    })
    .catch(err => {
      res.status(400).send('Something went wrong')
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
  console.log("kommer hit")
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
