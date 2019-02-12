const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Character = mongoose.model('Character')

router.get('/all', (req, res) => {
  Character.find({})
  .select("name id -_id")
  .then(characters => {
    return res.json(characters)
  })
  .catch(err => {
    return res.status(400).send('Woops, something went wrong')
  })

})

module.exports = router;
