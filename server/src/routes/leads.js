module.exports = function(app) {
  let controller = require('../controllers/leads')();

  app.get('/api/leads', controller.index);
  app.post('/api/leads', controller.add);
  app.get('/api/leads/:id', controller.view);
  app.put('/api/leads', controller.edit);
  app.delete('/api/leads:id', controller.delete);
}