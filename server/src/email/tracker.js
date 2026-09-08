const crypto = require('crypto');
const cfg = require('../../config');

function sign(campaignId, leadId, link) {
  return crypto
    .createHmac('sha256', cfg.jwrSecret)
    .update(`${campaignId}.${leadId}.${link}`)
    .digest('hex');
}

function signUnsubscribe(leadId) {
  return crypto
    .createHmac('sha256', cfg.jwrSecret)
    .update(`${leadId}.unsub`)
    .digest('hex');
}

module.exports = function (body, campaignId, leadId) {
  const base = process.env.PUBLIC_URL || '';

  let img = '<img src="' + base + '/campaigns/tracking/open/' + campaignId + '/' + leadId + '">';
  let regex = /<a href="(.*?)"/g;

  let tracked = body.replace(regex, (match, link) => {
    let sig = sign(campaignId, leadId, link);
    let url = base + '/campaigns/tracking/click/' + campaignId + '/' + leadId +
      '?link=' + encodeURIComponent(link) + '&sig=' + sig;
    return '<a href="' + url + '"';
  });

  let usig = signUnsubscribe(leadId);
  let unsubscribeLink = '<p><a href="' + base + '/leads/unsubscribe/' + leadId + '/' + usig + '">Unsubscribe</a></p>';

  return tracked + img + unsubscribeLink;
}

module.exports.sign = sign;
module.exports.signUnsubscribe = signUnsubscribe;
