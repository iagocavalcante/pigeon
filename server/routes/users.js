const express = require('express')
let router = express.Router()
const User = require('../src/models/user')
const passport = require('../src/auth/auth')
const jwt = require('jwt-simple')
const config = require('../config')
router.post('/token', (req, res, next) => {
  let user = req.body
  if (!user) {
    return res.status(401).send('Unauthorized')
  }

  const query = {
    email: user.username,
    password: user.password
  }

  const callback = (err, user) => {
    if (err) {
      return res.status(500).json({ err: err })
    }

    if (!user) {
      return res.status(401).send('Unauthorized')
    }
    const payload = {
      id: user.id
    }

    const token = jwt.encode(payload, config.jwtSecret)

    return res.json({ token: token })
  }

  user = User.findOne(query, callback)

})
/* GET users listing. */
router.get('/me', passport.authenticate('jwt', { session: false }), function(req, res, next) {
  res.status(200).json({
    user: req.user
  })
});

router.post('/register', function(req, res, next) {
  let data = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    accounts: [{
      name: req.body.account_name,
      role: 'owner',
      enabled: true
    }]
  }

  let callback = (err, user) => {
    if(err) {
      return res.status(422).json({err: err})
    }
    return res.status(200).json({user: user})
  }

  
  User.create(data, callback)
});

module.exports = router;
