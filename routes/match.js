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
    .then(matches => res.status(200).send(matches))
    .catch(() => res.status(400).send('Could not fetch matches'));
});

router.get('/count', (req, res) => {
  Match.countDocuments({})
    .then(count => res.status(200).json(count))
    .catch(() => res.status(400).send('Could not return match count'));
});

router.get('/page/:page', (req, res) => {
  const { page } = req.params;
  const perpage = 10;
  if (!parseInt(page, 10) || parseInt(page, 10) < 1) {
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
    .catch(() => res.status(400).send('Could not fetch matches'));
});

router.get('/user/:userid/page/:page', (req, res) => {
  const { userid, page } = req.params;
  const perpage = 10;

  if (!parseInt(page, 10) || parseInt(page, 10) < 1) {
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
    .catch(() => res.status(400).send('Could not fetch matches'));
});

router.post('/delete', (req, res) => {
  const { _id } = req.body;
  const userid = req.user._id;

  if (!req.user) {
    return res.status(400).send('You must be logged in');
  }

  if (req.user.isBanned) {
    return res.status(400).send('You are banned. Contact admin');
  }

  Match.findOne({ _id })
    .then(async (match) => {
      if (!match) {
        return res.status(400).send('No match found');
      }
      if (!userid.equals(match.registeredby)
          && !userid.equals(match.player1)
          && !userid.equals(match.player2)) {
        return res.status(400).send('You are not a part of this match');
      }
      if (((new Date()) - new Date(match.date)) > (60 * 60 * 1000)) {
        return res.status(400).send('Too long ago. Contact admin');
      }

      const user1 = await User.findOne({ _id: match.player1 });
      const user2 = await User.findOne({ _id: match.player2 });

      const rankchange1 = match.newrank1 - match.oldrank1;
      const rankchange2 = match.newrank2 - match.oldrank2;

      user1.rating -= rankchange1;
      user2.rating -= rankchange2;

      user1.save()
        .catch(() => res.status(400).send('User 1 was not saved, nothing is changed'));

      user2.save()
        .catch(() => res.status(400).send('User 2 was not saved, user 1 reverted'));

      match.remove()
        .then(removedmatch => res.status(200).send(removedmatch))
        .catch(() => res.status(400).send('Nothing changed'));
    })
    .catch(() => res.status(400).send('Something went wrong'));
});

router.post('/new', async (req, res) => {
  const {
    player1id, character1id, player2id, character2id, winnerid,
  } = req.body;
  const registeredby = req.user;

  if (player1id.length !== 24 || player2id.length !== 24 || winnerid.length !== 24) {
    return res.status(400).send('Player ids must be 24 characters long. Choose valid character');
  }
  const winner = new ObjectId(winnerid);

  if (!registeredby) {
    return res.status(400).send('You must be logged in to post a match');
  }

  if (req.user.isBanned) {
    return res.status(400).send('You are banned. Contact admin');
  }

  if (player1id === player2id) {
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

  const expected1 = 1 / (1 + (10 ** ((player2.rating - player1.rating) / 400)));
  const expected2 = 1 / (1 + (10 ** ((player1.rating - player2.rating) / 400)));
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
      player1.kValue -= 5;
      if (player1.kValue < 25) {
        player1.kValue = 25;
      }
      player1.save();
      player2.rating = new2;
      player2.kValue -= 5;
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
    .catch(() => res.status(400).send('Match not registered'));
});

module.exports = router;
