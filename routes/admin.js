const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');

const ObjectId = require('mongoose').Types.ObjectId;
const User = mongoose.model('User');
const PreUser = mongoose.model('PreUser');

router.post('/user/activate', function(req, res) {
  const { _id } = req.body

  PreUser.findOne({
    _id: new ObjectId(_id)
  })
  .then(user => {
    if (!user) {
      return res.status(400).send('Wrong userid')
    }
    const activatedUser = new User({
      name: user.name,
      email: user.email,
      nick: user.nick,
      hash: user.hash,
      salt: user.salt,
    })
    activatedUser
    .save()
    .then(newUser => {
      user.remove()
      .then( oldUser => {
        return res.status(200).send('Old user removed, new user saved')
      })
      .catch(err => {
        return res.status(400).send('Old user was not removed. You should do so manually')
      })
    })
    .catch(err => {
      return res.status(400).send('User was not activated')
    })
  })
})

router.get('/users', function(req, res) {
  User.find({})
  .select('_id name email isAdmin')
  .then(users => {
    return res.json(users)
  })
  .catch(err => {
    return res.status(400).send('Something went wrong')
  })
})

router.get('/tempusers', function(req, res) {
  User.find({})
  .select('_id name email isAdmin')
  .then(users => {
    return res.json(users)
  })
  .catch(err => {
    return res.status(400).send('Something went wrong')
  })
})



module.exports = router;
