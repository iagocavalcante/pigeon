const CrudService = require('../services/crud');

function pick(body, allowedFields) {
  const data = {};
  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      data[field] = body[field];
    }
  });
  return data;
}

function GenericController(model, allowedFields = []) {
  this.service = new CrudService(model);

  this.index = (req, res) => {
    this.service.list(req.user._id)
      .then((result) => {
        return res.json(result);
      });
  }

  this.add = (req, res) => {
    this.service.insert(pick(req.body, allowedFields), req.user._id)
      .then((result) => {
        return res.json(result);
      })
      .catch((err) => {
        return res.status(422).json(err);
      });
  }

  this.view = (req, res) => {
    this.service.get(req.params.id, req.user._id)
      .then((result) => {
        if (!result.data) {
          return res.status(404).json(result);
        }
        return res.json(result);
      })
      .catch((err) => {
        return res.status(404).json(err);
      });
  }

  this.edit = (req, res) => {
    this.service.update(req.params.id, req.user._id, pick(req.body, allowedFields))
      .then((result) => {
        if (!result.data) {
          return res.status(404).json(result);
        }
        return res.json(result);
      })
      .catch((err) => {
        return res.status(404).json(err);
      });
  }

  this.delete = (req, res) => {
    this.service.delete(req.params.id, req.user._id)
      .then((result) => {
        if (!result.data) {
          return res.status(404).json(result);
        }
        return res.json(result);
      })
      .catch((err) => {
        return res.status(404).json(err);
      });
  }
}

module.exports = GenericController;
