const model = require('../models/lead');
const GenericController = require('./generic');

module.exports = function (app) {
  const controller = new GenericController(model);
  return controller;
}