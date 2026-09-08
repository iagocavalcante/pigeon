const crypto = require('crypto');

function key() {
    if (!process.env.SECRETS_KEY) {
        throw new Error('SECRETS_KEY environment variable is not set');
    }
    return crypto.createHash('sha256').update(process.env.SECRETS_KEY).digest();
}

function encrypt(plain) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
    const ciphertext = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return [iv.toString('base64'), tag.toString('base64'), ciphertext.toString('base64')].join(':');
}

function decrypt(enc) {
    const [ivB64, tagB64, ciphertextB64] = String(enc).split(':');
    if (!ivB64 || !tagB64 || !ciphertextB64) {
        throw new Error('Invalid ciphertext format');
    }
    const iv = Buffer.from(ivB64, 'base64');
    const tag = Buffer.from(tagB64, 'base64');
    const ciphertext = Buffer.from(ciphertextB64, 'base64');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key(), iv);
    decipher.setAuthTag(tag);
    const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return plain.toString('utf8');
}

module.exports = { encrypt, decrypt };
