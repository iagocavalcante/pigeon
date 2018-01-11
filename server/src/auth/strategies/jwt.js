const passport = require('passport')

const PassportJwtStrategy = require('passport-jwt').Strategy
const passportExtractJwt = require('passport-jwt').ExtractJwt

const User = require('../../models/user')
const config = require('../../../config')

const params = {
    secretOrKey: config.jwtSecret,
    jwtFromRequest: passportExtractJwt.fromAuthHeaderAsBearerToken()
}

const strategy = new PassportJwtStrategy(params, (jwtPayload, done) => {
    const id = jwtPayload.id
    const callback = (err, user) => {
        if (err) {
            return done(err)
        }

        return done(null, user)
    }

    User.findById(id, callback)
})

passport.use(strategy)

module.exports = passport