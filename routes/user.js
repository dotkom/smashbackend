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
  req.user = {name: req.user['name'], email: req.user['email']}
  res.send(req.user);
})


module.exports = router;
