const express = require('express');

const router = express.Router();
const mongoose = require('mongoose');

const Character = mongoose.model('Character');
const Match = mongoose.model('Match');

router.get('/all', (req, res) => {
  Character.find({})
    .sort('id')
    .select('name id _id')
    .then(characters => res.json(characters))
    .catch(() => res.status(400).send('Could not fetch characters'));
});

router.get('/stats', async (req, res) => {
  const matchlist = await Match.find()
    .populate('character1', 'name id _id')
    .populate('character2', 'name id _id');

  const array = {};

  matchlist.forEach((match) => {
    array[match.character1.id] = (array[match.character1.id] || 0) + 1;
    array[match.character2.id] = (array[match.character2.id] || 0) + 1;
  });

  const list = [];

  Object.keys(array).forEach((key) => {
    list.push({ id: key, count: array[key] });
  });


  const sortedlist = list.sort((a, b) => {
    if (a.count < b.count) {
      return 1;
    }
    if (a.count > b.count) {
      return -1;
    }
    return 0;
  }).slice(0, 5);


  return res.status(200).send(sortedlist);
});

module.exports = router;
