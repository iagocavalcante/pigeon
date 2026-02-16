const model = require('../models/campaign');
const GenericController = require('./generic');
const tracker = require('../email/tracker');

const CrudService = require('../services/crud');
const service = new CrudService(model);


module.exports = function () {
    const controller = new GenericController(model)

    controller.totals = async (req, res) => {
        const query = [{
            $group: {
                _id: null,
                clicks: { $sum: '$clicks' },
                opens: { $sum: '$opens' },
            }
        }]

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

        try {
            let result = await service.update(req.params.id, data);
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
