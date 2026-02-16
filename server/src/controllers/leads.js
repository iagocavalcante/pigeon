const model = require('../models/lead');
const listModel = require('../models/list');
const GenericController = require('./generic');

module.exports = function () {
    const controller = new GenericController(model)

    controller.subscribe = async function (req, res) {
        req.checkBody('email', 'Enter a valid email').isEmail();
        req.checkBody('list', 'List is required').exists();

        let errors = req.validationErrors();
        if (errors) {
            return res.status(422).json(errors);
        }

        let list = await listModel.findOne({ title: req.body.list });
        
        if (!list) {
            list = await listModel.create({title: req.body.list, quantity: 0});
        }

        let lead = await model.findOne({email: req.body.email});

        if (!lead) {
            lead = await model.create({
                email: req.body.email,
                lists: [list._id]
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

    controller.leadsByList = async function (req, res) {
        let lists = req.params.id.split(',');
        let leads = await model.find({ lists: { $in: lists }}).populate('lists');
        return res.json({data: leads});
    }

    controller.view = async function (req, res) {
        let result = await model.findById(req.params.id).populate('lists actions.campaign');
        if (!result) {
            return res.status(404).json({error: 'Not found'});
        }
        return res.json({data: result});
    }

    return controller
}
