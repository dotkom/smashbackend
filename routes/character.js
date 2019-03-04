const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Character = mongoose.model('Character')

router.get('/all', (req, res) => {
  Character.find({})
  .sort('id')
  .select("name id -_id")
  .then(characters => {
    return res.json(characters)
  })
  .catch(err => {
    return res.status(400).send('Could not fetch characters')
  })

})

module.exports = router;
