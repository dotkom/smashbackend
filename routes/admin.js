const express = require('express');

const router = express.Router();
const mongoose = require('mongoose');


const User = mongoose.model('User');
const Match = mongoose.model('Match');


router.get('/users', (req, res) => {
  User.find({})
    .select('_id name email isAdmin nick isBanned onlineId')
    .then(users => res.json(users))
    .catch(() => res.status(400).send('Something went wrong'));
});

router.post('/user/changenick', async (req, res) => {
  const { _id, nick } = req.body;

  if (nick.length > 10 || nick.length < 1) {
    return res.status(400).send('Nick must be between 1 and 10 chars');
  }

  await User.findOne({ nick })
    .then((user) => {
      if (user) {
        return res.status(400).send('User have already taken that nickname');
      }
    });

  await User.findOne({ _id })
    .then((user) => {
      if (!user) {
        return res.status(400).send('User does not exist');
      }
      const newuser = new User(user);
      newuser.nick = nick;

      newuser.save()
        .then(saveduser => res.status(200).send(saveduser))
        .catch(() => res.status(400).send('User was not saved. Something went wrong'));
    });
});

router.post('/user/ban', (req, res) => {
  const { _id } = req.body;

  if (req.user._id.equals(_id)) {
    return res.status(400).send('You cant ban yourself');
  }

  User.findOne({ _id })
    .then((user) => {
      if (!user) {
        return res.status(400).send('User does not exist');
      }
      const newuser = new User(user);
      newuser.isBanned = true;
      newuser.isAdmin = false;

      newuser.save()
        .then(saveduser => res.status(200).send(saveduser))
        .catch(() => res.status(400).send('User was not saved. Something went wrong'));
    });
});

router.post('/user/unban', (req, res) => {
  const { _id } = req.body;

  User.findOne({ _id })
    .then((user) => {
      if (!user) {
        return res.status(400).send('User does not exist');
      }
      const newuser = new User(user);
      newuser.isBanned = false;

      newuser.save()
        .then(saveduser => res.status(200).send(saveduser))
        .catch(() => res.status(400).send('User was not saved. Something went wrong'));
    });
});

router.post('/user/makeadmin', (req, res) => {
  const { _id } = req.body;

  User.findOne({ _id })
    .then((user) => {
      if (!user) {
        return res.status(400).send('User does not exist');
      }
      const newuser = new User(user);
      newuser.isAdmin = true;
      newuser.isBanned = false;

      newuser.save()
        .then(saveduser => res.status(200).send(saveduser))
        .catch(() => res.status(400).send('User was not saved. Something went wrong'));
    });
});

router.post('/user/removeadmin', (req, res) => {
  const { _id } = req.body;

  if (req.user._id.equals(_id)) {
    return res.status(400).send('You cant remove admin from yourself');
  }

  User.findOne({ _id })
    .then((user) => {
      if (!user) {
        return res.status(400).send('User does not exist');
      }
      const newuser = new User(user);
      newuser.isAdmin = false;

      newuser.save()
        .then(saveduser => res.status(200).send(saveduser))
        .catch(() => res.status(400).send('User was not saved. Something went wrong'));
    });
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
        .catch(() => res.status(400).send('User 1 was not saved, nothing is changed'));

      user2.save()
        .catch(() => {
          user1.rating += rankchange1;
          user1.save()
            .catch(() => res.status(400).send('Error. User1 was changed, but not user2'));
          return res.status(400).send('User 2 was not saved, user 1 reverted');
        });

      match.remove()
        .then(removedmatch => res.status(200).send(removedmatch))
        .catch(() => {
          user1.rating += rankchange1;
          user1.save()
            .catch(() => res.status(400).send('Users was changed, but match was not deleted'));
          user2.rating += rankchange2;
          user2.save()
            .catch(() => res.status(400).send('User2 was changed, but match was not deleted'));
          return res.status(400).send('Nothing changed');
        });
    })
    .catch(() => res.status(400).send('Something went wrong. Did you send a 24 character id?'));
});


module.exports = router;
