const model = require('../models/list');
const GenericController = require('./generic');

const allowedFields = ['title', 'quantity'];

module.exports = function () {
    const controller = new GenericController(model, allowedFields)
    return controller
}
