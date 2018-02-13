const model = require('../models/campaign');
const GenericController = require('./generic');

module.exports = function (app) {
  const controller = new GenericController(model);
  return controller;
}