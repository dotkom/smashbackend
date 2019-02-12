const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = mongoose.model('User')

router.get('/all', (req, res) => {
  User.find({})
  .select('nick rating')
  .sort('-rating')
  .then(users => {
    return res.json(users)
  })
  .catch(err => {
    return res.status(400).send('Woops, something went wrong')
  })

})

router.get('/top/:page', (req, res) => {
  const { page } = req.params

  if (!parseInt(page) || parseInt(page) < 1) {
    return res.status(400).send('page must be a positive integer')
  }
  const perpage = 10
  User.find({})
  .select('nick rating')
  .sort('-rating')
  .skip((page-1)*perpage)
  .limit(perpage)
  .then(users => {
    return res.json(users)

  })
  .catch(err => {
    return res.status(400).send('Could not fetch leaderboard')
  })
})

module.exports = router;
