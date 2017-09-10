import * as LocalStrategy from 'passport-local'
LocalStrategy.Strategy
import User from '../app/models/User'

export function configure(passport) {
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user)
    })
  })

  passport.use('register', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, (req, email, password, done) => {
    if (email) email = email.toLowerCase()

    User.findOne({
      'email': email
    }).then((user) => {
      if (user) return done(null, false, req.flash('signupMessage', 'That email is already taken.'))

      let newUser = new User()
      newUser.email    = email
      newUser.password = password
      newUser.save().then((newUser) => {
        return done(null, newUser)
      }).catch((error) => {
        return done(error)
      })
    }).catch((error) => {
       if (error) return done(error)
    })
  }))

  passport.use('login', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
  }, function(req, email, password, done) {
    if (email) email = email.toLowerCase()
    // asynchronous
    process.nextTick(function() {
      User.findOne({
        'email': email
      }).then((user) => {
        // if no user is found, return the message
        if (!user) return done(null, false, req.flash('loginMessage', 'No user found.'))
        if (!user.verifyPassword(password)) return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'))
        return done(null, user)
      }).catch((error) => {
        if (error) return done(error)
      })
    })
  }))
}
