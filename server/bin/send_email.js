const connection = require('../src/db/connection');
const sender = require('../src/email/sender');
const secretbox = require('../src/services/secretbox');
const campaignModel = require('../src/models/campaign');
const leadModel = require('../src/models/lead');
const userModel = require('../src/models/user');
const tracker = require('../src/email/tracker');

const SEND_GAP_MS = 100;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function send() {
    const now = new Date();
    const campaigns = await campaignModel.find({
        start: { $lte: now },
        status: { $in: [null, 'scheduled'] }
    });

    for (let i = 0; i < campaigns.length; i++) {
        const campaign = campaigns[i];

        const owner = await userModel.findById(campaign.owner);
        if (!owner || !owner.sending || !owner.sending.resendApiKeyEnc || !owner.sending.fromAddress) {
            console.log(`skip campaign ${campaign._id}: owner missing Resend API key or from address`);
            continue;
        }

        const apiKey = secretbox.decrypt(owner.sending.resendApiKeyEnc);
        const fromAddress = owner.sending.fromAddress;

        const leads = await leadModel.find({ lists: { $in: campaign.lists }, unsubscribed: false });

        let sentCount = 0;
        let failedCount = 0;

        for (let j = 0; j < leads.length; j++) {
            const lead = leads[j];

            try {
                const mailBody = tracker(campaign.body, campaign._id, lead._id);
                const usig = tracker.signUnsubscribe(lead._id);
                const base = process.env.PUBLIC_URL || '';
                const unsubscribeUrl = `${base}/leads/unsubscribe/${lead._id}/${usig}`;

                await sender({
                    apiKey,
                    from: fromAddress,
                    to: lead.email,
                    subject: campaign.title,
                    html: mailBody,
                    headers: { 'List-Unsubscribe': `<${unsubscribeUrl}>` }
                });

                sentCount++;
            } catch (err) {
                failedCount++;
                console.log(`failed to send campaign ${campaign._id} to lead ${lead._id}: ${err.message}`);
            }

            if (j < leads.length - 1) {
                await sleep(SEND_GAP_MS);
            }
        }

        campaign.status = sentCount > 0 ? 'sent' : 'failed';
        campaign.sentCount = sentCount;
        campaign.failedCount = failedCount;
        await campaign.save();
    }
}

module.exports = send;
