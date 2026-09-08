async function send({ apiKey, from, to, subject, html, headers }) {
    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ from, to: [to], subject, html, headers })
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Resend send failed (${response.status}): ${text}`);
    }

    return response.json();
}

module.exports = send;
