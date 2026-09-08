module.exports = function (app) {
  let controller = require('../controllers/unsubscribe')();

  app.get('/leads/unsubscribe/:leadid/:sig', controller.unsubscribe);
}
