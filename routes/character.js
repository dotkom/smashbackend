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


  return res.status(200).send(array);
});

module.exports = router;
