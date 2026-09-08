const crypto = require('crypto');
const campaignModel = require('../models/campaign');
const leadModel = require('../models/lead');
const tracker = require('../email/tracker');

module.exports = function () {
    let open = async function (req, res) {
        let campaignId = req.params.id;
        let leadId = req.params.leadid;

        let campaign = await campaignModel.findById(campaignId);
        if (!campaign) {
            return res.status(404).send('Not found');
        }

        campaign.opens += 1;
        await campaign.save();

        let lead = await leadModel.findById(leadId);
        if (lead) {
            let actions = lead.actions;
            actions.push({
                campaign: campaignId,
                action: [{
                    typeAction: 'open',
                    link: '',
                    date: new Date()
                }]
            });

            lead.actions = actions;
            await lead.save();
        }

        let buf = Buffer.alloc(35);
        res.writeHead(200, { 'Content-Type': 'image/gif' });
        res.end(buf, 'binary');
    }

    let click = async function (req, res) {
        if (!req.query.link || !req.query.sig) {
            return res.status(404).send('Not found');
        }

        let campaignId = req.params.id;
        let leadId = req.params.leadid;

        let expectedSig = tracker.sign(campaignId, leadId, req.query.link);
        let providedSig = Buffer.from(String(req.query.sig));
        let expected = Buffer.from(expectedSig);

        if (providedSig.length !== expected.length || !crypto.timingSafeEqual(providedSig, expected)) {
            return res.status(404).send('Not found');
        }

        let campaign = await campaignModel.findById(campaignId);
        if (!campaign) {
            return res.status(404).send('Not found');
        }

        campaign.clicks += 1;
        await campaign.save();

        let lead = await leadModel.findById(leadId);
        if (lead) {
            let actions = lead.actions;
            actions.push({
                campaign: campaignId,
                action: [{
                    typeAction: 'click',
                    link: req.query.link,
                    date: new Date()
                }]
            });

            lead.actions = actions;
            await lead.save();
        }

        res.writeHead(302, {
            'Location': req.query.link
        });
        res.end();
    }

    let controller = {
        open: open,
        click: click
    }

    return controller;
}
