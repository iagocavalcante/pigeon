const requireAdmin = require('../auth/requireAdmin');

module.exports = function (app) {
  const controller = require('../controllers/admin')();

  app.get('/api/admin/users', requireAdmin, controller.listUsers);
  app.patch('/api/admin/users/:id', requireAdmin, controller.updateUser);
  app.get('/api/admin/stats', requireAdmin, controller.stats);
  app.get('/api/admin/settings', requireAdmin, controller.getSettings);
  app.put('/api/admin/settings', requireAdmin, controller.updateSettings);
}
