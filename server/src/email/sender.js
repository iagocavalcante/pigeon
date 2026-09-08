const mailgun = require('mailgun.js');

module.exports = function (to, subject, html) {
    if (!process.env.MAILGUN_API_KEY) {
        throw new Error('MAILGUN_API_KEY environment variable is not set');
    }

    const mg = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY });

    return mg.messages
        .create(process.env.MAILGUN_DOMAIN, {
            from: process.env.MAIL_FROM,
            to: [to],
            subject: subject,
            html: html
        })
        .then(msg => console.log(msg))
        .catch(err => console.log(err));
}
