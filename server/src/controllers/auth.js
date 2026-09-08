const jwt = require('jwt-simple');;
const bcrypt = require('bcryptjs');
const { isEmail } = require('validator');
const User = require('../models/user');
const cfg = require('../../config');
const secretbox = require('../services/secretbox');

const NAME_ADDR_RE = /<[^>]+@[^>]+>$/;

function isValidFromAddress(value) {
    return NAME_ADDR_RE.test(value) || isEmail(value);
}

function sendingResponse(user) {
    const enc = user.sending && user.sending.resendApiKeyEnc;
    return {
        fromAddress: (user.sending && user.sending.fromAddress) || null,
        hasApiKey: !!enc,
        apiKeyHint: enc ? secretbox.decrypt(enc).slice(-4) : null
    };
}

module.exports = function (app) {
    return {
        token: async (req, res) => {
            let user = req.body;

            if (!user.username || !user.password) {
                return res.status(401).send('Unauthorized');
            }

            try {
                let foundUser = await User.findOne({email: user.username});

                if (!foundUser || !(await bcrypt.compare(user.password, foundUser.password))) {
                    return res.status(401).send('Unauthorized');
                }

                let payload = {id: foundUser.id, exp: Math.floor(Date.now()/1000) + 60*60*24*7};
                let token = jwt.encode(payload, cfg.jwrSecret);
                return res.json({token: token});
            } catch (err) {
                return res.status(500).json({err: err});
            }
        },
        me: (req, res) => {
            const {password, ...safe} = req.user.toObject();
            if (safe.sending) {
                const {resendApiKeyEnc, ...safeSending} = safe.sending;
                safe.sending = safeSending;
            }
            res.status(200).json({
                user: safe
            });
        },
        register: async (req, res) => {
            if (process.env.ALLOW_REGISTRATION === 'false') {
                return res.status(403).json({error: 'Registration is disabled'});
            }

            try {
                let hashedPassword = await bcrypt.hash(req.body.password, 10);
                let data = {
                    name: req.body.name,
                    email: req.body.email,
                    password: hashedPassword,
                    accounts: [{
                        name: req.body.account_name || 'default',
                        role: 'owner',
                        enabled: true
                    }]
                }

                let user = await User.create(data);
                const {password, ...safe} = user.toObject();
                return res.status(200).json({user: safe});
            } catch (err) {
                return res.status(422).json({err: err});
            }
        },
        edit: (req, res) => {
            return res.json({page: 'auth@edit'});
        },
        getSending: (req, res) => {
            return res.status(200).json(sendingResponse(req.user));
        },
        updateSending: async (req, res) => {
            const { resendApiKey, fromAddress } = req.body;

            if (fromAddress !== undefined && !isValidFromAddress(fromAddress)) {
                return res.status(422).json({error: 'Enter a valid from address'});
            }

            const user = req.user;
            user.sending = user.sending || {};

            if (resendApiKey) {
                user.sending.resendApiKeyEnc = secretbox.encrypt(resendApiKey);
            }
            if (fromAddress !== undefined) {
                user.sending.fromAddress = fromAddress;
            }

            await user.save();

            return res.status(200).json(sendingResponse(user));
        }
    }
}
