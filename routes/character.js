const express = require('express');

const router = express.Router();
const mongoose = require('mongoose');

const Character = mongoose.model('Character');
const Match = mongoose.model('Match');
const { ObjectId } = require('mongoose').Types;

router.get('/all', (req, res) => {
  Character.find({})
    .sort('id')
    .select('name id _id')
    .then(characters => res.json(characters))
    .catch(() => res.status(400).send('Could not fetch characters'));
});

router.get('/winrates/id/:id', async (req, res) => {
  const { id } = req.params;

  const objectid = new ObjectId(id);

  const matches = await Match.find({ $or: [{ character1: objectid }, { character2: objectid }] })
    .populate('character1', 'name id _id')
    .populate('character2', 'name id _id');

  const array = {};

  matches.forEach((match) => {
    if (!objectid.equals(match.character1._id)) {
      if (array[match.character1.id]) {
        array[match.character1.id].matches += 1;
      } else {
        array[match.character1.id] = { name: match.character1.name, matches: 1, wins: 0 };
      }
      if (match.winner.equals(match.player2)) {
        array[match.character1.id].wins += 1;
      }
    } else if (!objectid.equals(match.character2._id)) {
      if (array[match.character2.id]) {
        array[match.character2.id].matches += 1;
      } else {
        array[match.character2.id] = { name: match.character2.name, matches: 1, wins: 0 };
      }

      if (match.winner.equals(match.player1)) {
        array[match.character2.id].wins += 1;
      }
    }
  });
  const list = [];

  Object.keys(array).forEach((key) => {
    list.push({
      id: key, name: array[key].name, count: array[key].matches, wins: array[key].wins,
    });
  });
  return res.status(200).send(list);
});

router.get('/stats', async (req, res) => {
  const matchlist = await Match.find()
    .populate('character1', 'name id _id')
    .populate('character2', 'name id _id');

  const array = {};

  matchlist.forEach((match) => {
    if (array[match.character1.id]) {
      array[match.character1.id].matches += 1;
    } else {
      array[match.character1.id] = { matches: 1, wins: 0 };
    }

    if (array[match.character2.id]) {
      array[match.character2.id].matches += 1;
    } else {
      array[match.character2.id] = { matches: 1, wins: 0 };
    }

    if (match.winner.equals(match.player1)) {
      array[match.character1.id].wins += 1;
    } else {
      array[match.character2.id].wins += 1;
    }
  });


  const list = [];

  Object.keys(array).forEach((key) => {
    list.push({ id: key, count: array[key].matches, wins: array[key].wins });
  });


  /* const sortedlist = list.sort((a, b) => {
    if (a.count < b.count) {
      return 1;
    }
    if (a.count > b.count) {
      return -1;
    }
    return 0;
  }); */


  return res.status(200).send(list);
});

module.exports = router;
