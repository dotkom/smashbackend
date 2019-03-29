const express = require('express');

const router = express.Router();
const mongoose = require('mongoose');

const User = mongoose.model('User');
const Match = mongoose.model('Match');
const { ObjectId } = require('mongoose').Types;

router.get('/all', (req, res) => {
  User.find({})
    .select('_id nick rating ')
    .then(users => res.json(users))
    .catch(() => res.status(400).send('Something went wrong'));
});
router.get('/current', (req, res) => {
  if (req.user) {
    req.user = {
      rating: req.user.rating,
      nick: req.user.nick,
      isAdmin: req.user.isAdmin,
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    };
    return res.json(req.user);
  }
  return res.json(null);
});

router.get('/id/:id', (req, res) => {
  const { id } = req.params;

  const objectid = new ObjectId(id);

  User.findOne({ _id: objectid })
    .then(async (user) => {
      if (!user) {
        return res.status(400).send('Invalid ID');
      }
      const matchcount = await Match
        .find({ $or: [{ player1: objectid }, { player2: objectid }] })
        .countDocuments();
      const wincount = await Match
        .find({ winner: objectid })
        .countDocuments();
      const rank = await User
        .find({ kValue: { $lt: 100 } })
        .countDocuments({ rating: { $gt: user.rating } });

      return res.send({
        _id: user._id,
        rank: rank + 1,
        matches: matchcount,
        wins: wincount,
        nick: user.nick,
        rating: user.rating,
      });
    })
    .catch(() => res.status(400).send('Could not fetch user information'));
});

router.post('/changenick', (req, res) => {
  const { nick } = req.body;

  if (nick.length > 10 || nick.length < 1) {
    return res.status(400).send('Nick must be between 1 and 10 chars');
  }

  if (!req.user) {
    return res.status(400).send('User not logged in');
  }

  User.findOne({ nick })
    .then((user) => {
      if (user) {
        return res.status(400).send('User have already taken that nickname');
      }
    });

  const updatedUser = req.user;
  updatedUser.nick = nick;
  updatedUser
    .save()
    .then((user) => {
      req.user = {
        nick: req.user.nick,
        isAdmin: req.user.isAdmin,
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      };
      return res.json(user);
    })
    .catch(() => res.status(400).send('Nick not updated. Something went wrong'));
});


module.exports = router;
