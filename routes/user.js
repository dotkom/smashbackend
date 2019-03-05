const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const sgTransport = require('nodemailer-sendgrid-transport');

const User = mongoose.model('User');
const Match = mongoose.model('Match')
const ObjectId = require('mongoose').Types.ObjectId;

router.get('/all', function(req, res) {
  User.find({})
  .select('_id nick ')
  .then(users => {
    return res.json(users)
  })
  .catch(err => {
    return res.status(400).send('Something went wrong')
  })
})


router.post('/login',
  passport.authenticate('local'),
  function(req, res) {
    req.user = {nick: req.user['nick'], isAdmin: req.user['isAdmin'], _id: req.user['_id'], name: req.user['name'], email: req.user['email']}
    return res.json(req.user);
    //res.status(200).send(req.user)
  }
);

router.get('/logout', function(req,res) {
  req.logout();
  res.status(200).send("Logged out")
  }
)

router.get('/current', function(req, res){
  if (req.user) {
    req.user = {nick: req.user['nick'], isAdmin: req.user['isAdmin'], _id: req.user['_id'], name: req.user['name'], email: req.user['email']}
    return res.json(req.user);
  }
  return res.json(null)
})

router.get('/id/:id', (req, res) => {
  const { id } = req.params

  const objectid = new ObjectId(id)

  User.findOne({_id: objectid})
  .then(async user => {
    if (!user) {
      return res.status(400).send('Invalid ID')
    }
    const matchcount = await Match
      .find({$or:[{player1: objectid}, {player2: objectid}]})
      .countDocuments()
    const wincount = await Match
      .find({winner: objectid})
      .countDocuments()

    return res.send({matches: matchcount, wins: wincount, nick: user.nick, rating: user.rating})


  })
  .catch(err => {
    return res.status(400).send('Could not fetch user information')
  })
})

router.post('/changenick', (req, res) => {
  const { nick } = req.body

  if (!req.user) {
    return res.status(400).send('User not logged in')
  }

  User.findOne({nick: nick})
  .then(user => {
    if(user){
      return res.status(400).send('User have already taken that nickname')
    }


  })
  let updatedUser = req.user
  updatedUser.nick = nick
  updatedUser.save()
  .then(user => {
    req.user = {nick: req.user['nick'], isAdmin: req.user['isAdmin'], _id: req.user['_id'], name: req.user['name'], email: req.user['email']}
    return res.json(req.user);
  })
  .catch(err => {
    return res.status(400).send('Nick not updated. Something went wrong')
  })
  .catch(err => {
    return res.status(400).send('Something went wrong')
  })
})


module.exports = router;
