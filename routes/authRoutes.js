const express = require('express');
const router = express.Router(); 
const Users = require('../db/models/Users.js')
const passport = require('passport');
const LocalStrategy = require('passport-local')
const bcrypt = require('bcrypt')


// // upon successful login, get user from database, save
// // user data into session, which is in Redis.
passport.serializeUser( (user, done) => {
  console.log('serializing user', user)
  done(null, {
    id: user.attributes.user_id,
    eat: 'bubblegum',
    email: user.attributes.email
  })
})


// // upon successful authorized request, we will take some information
// // from the session, for example userId, to retrieve
// // the user record from db, and put it into req.user
passport.deserializeUser( (user, done) => {
  console.log('deserializing user', user) 
  Users
    .where({ user_id: user.id})
    .fetch()
    .then( user => {
      done(null, user.attributes)
    })
    .catch( err => {
      done(err)
    })
})

passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
  Users
    .where({ email })
    .fetch()
    .then( user => {
      console.log('user in localstrategy db', user)
      myHackyGlobalStorage = user
      bcrypt.compare(password, user.attributes.password)
        .then( result => {
          if (result) {
            done(null, user)
          } else {
            done(null, false)
          }
         })
        .catch( err => {
          done(err)
        })
    })
    .catch( err => {
      console.log('err', err)
    })
    
}))




router.post('/register', (req, res) => {
  const {email, password} = req.body;
  bcrypt.hash(password, 10)
    .then( hashedPassword => {
      return Users
              .forge({email, password: hashedPassword})
              .save()
    })
    .then( result => {
      if (result) {
        res.send('NEW USAR MADE!!!!!')
      } else {
        res.send('SOME ERRAR MAKING USAR!!!')
      }
    })
    .catch( err=> {
      console.log('error', err)
      res.send(err)
    })
})

router.post('/login',passport.authenticate('local', {failureRedirect: '/'}), (req, res) => {
  res.send('YAY AUTHENTICATED!!!!')
})

router.post('/logout', (req, res) => {
  req.logout()
  res.send('loggedout')
})

router.get('/protected',isAuthenticated, (req, res) => {
  res.render('myAwesomeDashboard', {user: req.user} )
})

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    next()
  } else {
    res.redirect('/')
  }
}

module.exports = router