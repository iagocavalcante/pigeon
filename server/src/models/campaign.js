const mongoose = require('mongoose');
let ObjectId = mongoose.Schema.ObjectId;

const Campaign = mongoose.Schema({
  title: { type: String, required: true },
  subject: String,
  body: String,
  status: String,
  start: { type: Date, required: true },
  opens: {type: Number, default: 0 },
  clicks: {type: Number, default: 0 },
  unsubscribe: {type: Number, default: 0 },
  bounces: {type: Number, default: 0 },
  sentCount: {type: Number, default: 0 },
  failedCount: {type: Number, default: 0 },
  lists: [
    {title: String, type: ObjectId, ref: 'List'}
  ],
  owner: { type: ObjectId, ref: 'User', required: true, index: true }
});

module.exports = mongoose.model('Campaign', Campaign);