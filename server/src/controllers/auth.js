const jwt = require('jwt-simple');;
const User = require('../models/user');
const cfg = require('../../config');

module.exports = function (app) {
    return {
        token: async (req, res) => {
            let user = req.body;

            if (!user.username || !user.password) {
                return res.status(401).send('Unauthorized');
            }

            try {
                let foundUser = await User.findOne({email: user.username, password: user.password});
                
                if (!foundUser) {
                    return res.status(401).send('Unauthorized');
                }

                let payload = {id: foundUser.id};
                let token = jwt.encode(payload, cfg.jwrSecret);
                return res.json({token: token});
            } catch (err) {
                return res.status(500).json({err: err});
            }
        },
        me: (req, res) => {
            res.status(200).json({
                user: req.user
            });
        },
        register: async (req, res) => {
            let data = {
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                accounts: [{
                    name: req.body.account_name || 'default',
                    role: 'owner',
                    enabled: true
                }]
            }

            try {
                let user = await User.create(data);
                return res.status(200).json({user: user});
            } catch (err) {
                return res.status(422).json({err: err});
            }
        },
        edit: (req, res) => {
            return res.json({page: 'auth@edit'});
        }
    }
}
