let passport = require('passport');
let passportJwtStrategy = require('passport-jwt').Strategy;
let passportExtractJwt = require('passport-jwt').ExtractJwt;

let User = require('../../models/user');
let cfg = require('../../../config');

let params = {
    secretOrKey: cfg.jwrSecret,
    jwtFromRequest: passportExtractJwt.fromAuthHeaderAsBearerToken()
}

let strategy = new passportJwtStrategy(params, async function(jwt_payload, done) {
    try {
        let user = await User.findById(jwt_payload.id);
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (err) {
        return done(err);
    }
});

passport.use(strategy);

module.exports = passport;
