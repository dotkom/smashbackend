const express = require('express');

const router = express.Router();
const mongoose = require('mongoose');

const { ObjectId } = require('mongoose').Types;

const User = mongoose.model('User');
const Character = mongoose.model('Character');
const Match = mongoose.model('Match');

router.get('/all', (req, res) => {
  Match.find({})
    .populate('player1', 'nick _id rank')
    .populate('player2', 'nick _id rank')
    .populate('character1', 'name id _id')
    .populate('character2', 'name id _id')
    .then(matches => res.send(matches))
    .catch(err => res.status(400).send('Could not fetch matches'));
});

router.get('/page/:page', (req, res) => {
  const { page } = req.params;
  const perpage = 10;
  if (!parseInt(page) || parseInt(page) < 1) {
    return res.status(400).send('Page must be a positive integer');
  }
  Match.find({})
    .sort({ date: 'desc' })
    .skip((page - 1) * perpage)
    .limit(perpage)
    .populate('player1', 'nick _id rank')
    .populate('player2', 'nick _id rank')
    .populate('character1', 'name id _id')
    .populate('character2', 'name id _id')
    .then(matches => res.json(matches))
    .catch(err => res.status(400).send('Could not fetch matches'));
});

router.get('/user/:userid/page/:page', (req, res) => {
  const { userid, page } = req.params;
  const perpage = 10;

  if (!parseInt(page) || parseInt(page) < 1) {
    return res.status(400).send('Page must be a positive integer');
  }

  const userobj = new ObjectId(userid);
  Match.find({ $or: [{ player1: userobj }, { player2: userobj }] })
    .sort({ date: 'desc' })
    .skip((page - 1) * perpage)
    .limit(perpage)
    .populate('player1', 'nick _id rank')
    .populate('player2', 'nick _id rank')
    .populate('character1', 'name id _id')
    .populate('character2', 'name id _id')
    .then((matches) => {
      if (!matches) {
        return res.status(400).send('No matches found. Invalid userid?');
      }
      return res.json(matches);
    })
    .catch(err => res.status(400).send('Could not fetch matches'));
});

router.post('/new', async (req, res) => {
  const {
    player1id, character1id, player2id, character2id, winnerid,
  } = req.body;
  const registeredby = req.user;
  winner = new ObjectId(winnerid);

  if (!registeredby) {
    return res.status(400).send('You must be logged in to post a match');
  }

  if (player1id == player2id) {
    return res.status(400).send('Player ids cant be identical');
  }

  const player1 = await User.findOne({
    _id: new ObjectId(player1id),
  });

  const player2 = await User.findOne({
    _id: new ObjectId(player2id),
  });
  if (!player2) {
    return res.status(400).send('Player2 does not exist');
  }

  const char1 = await Character.findOne({
    _id: new ObjectId(character1id),
  });
  if (!char1) {
    return res.status(400).send('Character1 does not exist');
  }

  const char2 = await Character.findOne({
    _id: new ObjectId(character2id),
  });
  if (!char2) {
    return res.status(400).send('Character2 does not exist');
  }

  if (!winner.equals(player2._id) && !winner.equals(player1._id)) {
    return res.status(400).send('Winner must be one of the players');
  }

  const expected1 = 1 / (1 + 10 ** ((player2.rating - player1.rating) / 400));
  const expected2 = 1 / (1 + 10 ** ((player1.rating - player2.rating) / 400));
  const didwin1 = (winner.equals(player1._id)) ? 1 : 0;
  const didwin2 = (winner.equals(player2._id)) ? 1 : 0;
  const new1 = player1.rating + player1.kValue * (didwin1 - expected1);
  const new2 = player2.rating + player2.kValue * (didwin2 - expected2);

  const newMatch = new Match({
    player1: player1._id,
    character1: char1._id,
    oldrank1: player1.rating,
    newrank1: new1,
    player2: player2._id,
    character2: char2._id,
    oldrank2: player2.rating,
    newrank2: new2,
    winner,
    registeredby: registeredby._id,
  });
  newMatch.save()
    .then((newmatch) => {
      player1.rating = new1;
      player1.kValue -= 3;
      if (player1.kValue < 25) {
        player1.kValue = 25;
      }
      player1.save();
      player2.rating = new2;
      player2.kValue -= 3;
      if (player2.kValue < 25) {
        player2.kValue = 25;
      }
      player2.save();
      return newmatch;
    })
    .then((newmatch) => {
      Match.findOne({ _id: newmatch._id })
        .populate('player1', 'nick _id rank')
        .populate('player2', 'nick _id rank')
        .populate('character1', 'name id _id')
        .populate('character2', 'name id _id')
        .then(match => res.status(200).send(match));
    })
    .catch(err => res.status(400).send('Match not registered'));
});

module.exports = router;
