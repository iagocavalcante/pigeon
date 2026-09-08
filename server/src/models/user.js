const mongoose = require('mongoose')

let User = mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    enabled: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    accounts: [{
        name: String,
        role: String,
        enabled: Boolean
    }],
    sending: {
        resendApiKeyEnc: String,
        fromAddress: String
    }
})

module.exports = mongoose.model('User', User)