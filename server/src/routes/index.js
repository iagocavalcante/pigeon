
const passport = require('../auth/auth');
let auth = require('./auth');
let lists = require('./lists');
let campaigns = require('./campaigns');
let leads = require('./leads');

module.exports = (app) => {
    app.get('/', function (req, res, next) {
      res.render('index', { title: 'Express' });
    });

    app.use('/api', passport.authenticate('jwt', { session: false }));
    
    auth(app);
    lists(app);
    campaigns(app);
    leads(app);
}