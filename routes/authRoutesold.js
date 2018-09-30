const express = require('express');
const router = express.Router();
const Users = require('../db/models/Users.js');
const bcrypt = require('bcrypt')
const passport = require('passport');
const LocalStrategy = require('passport-local');



passport.serializeUser( (user, done) => {
  console.log('serializing user', user)
  done(null, {
    id: user.user_id,
    email: user.email
  })
})

passport.deserializeUser( (user, done) => {
  console.log('deserializing user', user)
  Users
    .where({user_id: user.id})
    .fetch()
    .then( user => {
      done(null, {
        id: user.attributes.user_id,
        email: user.attributes.email
      })
    })
    .catch( err => {
      console.log('error', err)
    })
})


passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
  Users
    .where({email})
    .fetch()
    .then( user => {
      bcrypt.compare(password, user.attributes.password)
        .then( result => {
          if (result) {
            done(null, user.attributes)
          } else {
            done(null, false)
          }
        }) 
    })
}))

// register for creating new users
router.post('/register', (req, res) => {
  const { email, password } = req.body;
  bcrypt.hash(password, 12)
    .then( hash => {
      return Users
              .forge({email, password: hash})
              .save()
    })
    .then( newUser => {
      console.log("result from creating new user", newUser)
      res.send('new user made!');
    })
    .catch( err => {
      console.log('error', err)
    })
})


// login
router.post('/login', passport.authenticate('local', {failureRedirect: '/'}), (req, res) => {
  res.send('zomg AUTHED WITH PASSPORT')
})

// logout
router.post('/logout', (req, res) => {
  req.logout()
  res.redirect("/")
})


// protected route
router.get('/protected', (req, res) => {
  console.log('req.user in /protected', req.user)
  if (req.isAuthenticated()) {
    res.send("JOO CAN PASS")
  } else {
    res.redirect('/')
  }
})


module.exports = router