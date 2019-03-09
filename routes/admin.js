const express = require('express');

const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');

const { ObjectId } = require('mongoose').Types;

const User = mongoose.model('User');
const Match = mongoose.model('Match');


router.get('/users', (req, res) => {
  User.find({})
    .select('_id name email isAdmin nick')
    .then(users => res.json(users))
    .catch(err => res.status(400).send('Something went wrong'));
});

router.post('/match/delete', (req, res) => {
  const { _id } = req.body;

  Match.findOne({ _id })
    .then(async (match) => {
      if (!match) {
        return res.status(400).send('No match found');
      }
      const user1 = await User.findOne({ _id: match.player1 });
      const user2 = await User.findOne({ _id: match.player2 });

      const rankchange1 = match.newrank1 - match.oldrank1;
      const rankchange2 = match.newrank2 - match.oldrank2;

      user1.rating -= rankchange1;
      user2.rating -= rankchange2;

      user1.save()
        .catch(err => res.status(400).send('User 1 was not saved, nothing is changed'));

      user2.save()
        .catch((err) => {
          user1.rating += rankchange1;
          user1.save()
            .catch(err => res.status(400).send('Error. User1 was changed, but not user2'));
          return res.status(400).send('User 2 was not saved, user 1 reverted');
        });

      match.remove()
        .then(match => res.status(200).send(match))
        .catch(() => {
          user1.rating += rankchange1;
          user1.save()
            .catch(err => res.status(400).send('Users was changed, but match was not deleted'));
          user2.rating += rankchange2;
          user2.save()
            .catch(err => res.status(400).send('User2 was changed, but match was not deleted'));
          return res.status(400).send('Nothing changed');
        });
    })
    .catch(err => res.status(400).send('Something went wrong. Did you send a 24 character id?'));
});


module.exports = router;
