const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');

const ObjectId = require('mongoose').Types.ObjectId;
const User = mongoose.model('User');
const PreUser = mongoose.model('PreUser');
const Match = mongoose.model('Match')


router.post('/tempuser/activate', function(req, res) {
  const { _id } = req.body

  PreUser.findOne({
    _id: new ObjectId(_id)
  })
  .then(user => {
    if (!user) {
      return res.status(400).send('Wrong userid')
    }
    const activatedUser = new User({
      name: user.name,
      email: user.email,
      nick: user.nick,
      hash: user.hash,
      salt: user.salt,
    })
    activatedUser
    .save()
    .then(newUser => {
      user.remove()
      .then( oldUser => {
        return res.status(200).send(oldUser)
      })
      .catch(err => {
        return res.status(400).send('Old user was not removed. You should do so manually')
      })
    })
    .catch(err => {
      return res.status(400).send('User was not activated')
    })
  })
})

router.post('/tempuser/delete', function(req, res) {
  const { _id } = req.body

  PreUser.findOne({
    _id: new ObjectId(_id)
  })
  .then(user => {
    if (!user) {
      return res.status(400).send('Wrong userid')
    }
    user.remove()
    .then( user => {
      return res.status(200).send(user)
    })

  })
  .catch(err => {
    return res.status(400).send('Something went wrong')
  })
})

router.get('/users', function(req, res) {
  User.find({})
  .select('_id name email isAdmin')
  .then(users => {
    return res.json(users)
  })
  .catch(err => {
    return res.status(400).send('Something went wrong')
  })
})

router.get('/tempusers', function(req, res) {
  PreUser.find({})
  .select('_id name email nick')
  .then(users => {
    return res.json(users)
  })
  .catch(err => {
    return res.status(400).send('Something went wrong')
  })
})

router.post('/match/delete', function(req, res){
  const { _id } = req.body

  Match.findOne({_id: _id})
  .then(async match => {
    if(!match) {
      return res.status(400).send('No match found')
    }
    let user1 = await User.findOne({_id: match.player1})
    let user2 = await User.findOne({_id: match.player2})

    const rankchange1 = match.newrank1 - match.oldrank1
    const rankchange2 = match.newrank2 - match.oldrank2

    user1.rating = user1.rating - rankchange1
    user2.rating = user2.rating - rankchange2

    user1.save()
    .catch(err => {
      return res.status(400).send('User 1 was not saved, nothing is changed')
    })

    user2.save()
    .catch(err => {
      user1.rating = user1.rating + rankchange1
      user1.save()
      .catch(err => {
        return res.status(400).send('Error. User1 was changed, but not user2')
      })
      return res.status(400).send('User 2 was not saved, user 1 reverted')
    })

    match.remove()
    .then((match) => {
      return res.status(200).send(match)
    })
    .catch(function(){
      user1.rating = user1.rating + rankchange1
      user1.save()
      .catch(err => {
        return res.status(400).send('Users was changed, but match was not deleted')
      })
      user2.rating = user2.rating + rankchange2
      user2.save()
      .catch(err => {
        return res.status(400).send('User2 was changed, but match was not deleted')
      })
      return res.status(400).send('Nothing changed')

    })



  })
  .catch(err => {
    return res.status(400).send('Something went wrong. Did you send a 24 character id?')
  })
})



module.exports = router;
