const passport = require('../auth/auth');

let admin = require('./admin');
let auth = require('./auth');
let campaigns = require('./campaigns');
let leads = require('./leads');
let lists = require('./lists');
let tracking = require('./tracking');
let unsubscribe = require('./unsubscribe');

module.exports = (app) => {
    app.get('/', function(req, res) {
        res.render('index', { title: 'Express' });
    });

    app.use('/api', passport.authenticate('jwt', {session: false}));

    admin(app);
    auth(app);
    campaigns(app);
    leads(app);
    lists(app);
    tracking(app);
    unsubscribe(app);
}
