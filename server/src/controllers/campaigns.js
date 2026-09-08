const model = require('../models/campaign');
const GenericController = require('./generic');
const tracker = require('../email/tracker');

const CrudService = require('../services/crud');
const service = new CrudService(model);

const allowedFields = ['title', 'subject', 'body', 'start', 'lists'];

module.exports = function () {
    const controller = new GenericController(model, allowedFields)

    controller.totals = async (req, res) => {
        const query = [
            { $match: { owner: req.user._id } },
            {
                $group: {
                    _id: null,
                    clicks: { $sum: '$clicks' },
                    opens: { $sum: '$opens' },
                }
            }
        ]

        let result = await model.aggregate(query);
        return res.json(result);
    }

    controller.edit = async (req, res) => {
        let data = {};
        data.lists = [];

        Object.keys(req.body).forEach(function(element, index) {
            if (element.startsWith('lists[')) {
                data.lists.push(req.body[element]);
            } else {
                data[element] = req.body[element];
            }
        });

        data = allowedFields.reduce((acc, field) => {
            if (Object.prototype.hasOwnProperty.call(data, field)) {
                acc[field] = data[field];
            }
            return acc;
        }, {});

        try {
            let result = await service.update(req.params.id, req.user._id, data);
            if (!result.data) {
                return res.status(404).json(result);
            }
            return res.json(result);
        } catch (err) {
            return res.status(422).json(err);
        }
    }

    controller.apiRenderEmail = async (req, res) => {
        let result = await model.findById(req.params.id);
        if (!result) {
            return res.status(404).send('not found');
        }
        return res.render('mail_render', { body: result.body })
    }

    controller.renderEmail = async (req, res) => {
        let result = await model.findById(req.params.id);
        if (!result) {
            return res.status(404).send('not found');
        }
        let body = tracker(result.body, req.params.id, req.params.leadid);
        return res.render('mail_render', { body: body })
    }

    return controller
}
