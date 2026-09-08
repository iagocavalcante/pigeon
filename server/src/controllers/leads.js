const { body, validationResult } = require('express-validator');
const model = require('../models/lead');
const listModel = require('../models/list');
const GenericController = require('./generic');

const allowedFields = ['email', 'name', 'lists'];

module.exports = function () {
    const controller = new GenericController(model, allowedFields)

    controller.subscribe = [
        body('email', 'Enter a valid email').isEmail(),
        body('list', 'List is required').isMongoId(),
        async function (req, res) {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json(errors.array());
        }

        let list = await listModel.findOne({ _id: req.body.list });

        if (!list) {
            return res.status(404).json({ error: 'Not found' });
        }

        let lead = await model.findOne({email: req.body.email, owner: list.owner});

        if (!lead) {
            lead = await model.create({
                email: req.body.email,
                lists: [list._id],
                owner: list.owner
            });
            list.quantity++;
        } else {
            if (!lead.lists.includes(list._id)) {
                lead.lists.push(list._id);
                await lead.save();
                list.quantity++;
            }
        }

        await list.save();

        return res.json({status: 'success'});
        }
    ];

    controller.leadsByList = async function (req, res) {
        let lists = req.params.id.split(',');
        let leads = await model.find({ lists: { $in: lists }, owner: req.user._id }).populate('lists');
        return res.json({data: leads});
    }

    controller.view = async function (req, res) {
        let result = await model.findOne({ _id: req.params.id, owner: req.user._id }).populate('lists actions.campaign');
        if (!result) {
            return res.status(404).json({error: 'Not found'});
        }
        return res.json({data: result});
    }

    return controller
}
