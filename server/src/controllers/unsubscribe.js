const crypto = require('crypto');
const leadModel = require('../models/lead');
const tracker = require('../email/tracker');

module.exports = function () {
    let unsubscribe = async function (req, res) {
        let leadId = req.params.leadid;
        let sig = req.params.sig;

        let expectedSig = tracker.signUnsubscribe(leadId);
        let provided = Buffer.from(String(sig || ''));
        let expected = Buffer.from(expectedSig);

        if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
            return res.status(404).send('Not found');
        }

        let lead = await leadModel.findById(leadId);
        if (!lead) {
            return res.status(404).send('Not found');
        }

        lead.unsubscribed = true;
        await lead.save();

        res.set('Content-Type', 'text/plain');
        return res.status(200).send('You have been unsubscribed');
    }

    return { unsubscribe };
}
