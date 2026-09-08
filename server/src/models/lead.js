const mongoose = require('mongoose');
let ObjectId = mongoose.Schema.ObjectId;

const Lead = mongoose.Schema({
  email: { type: String, required: true },
  unsubscribed: { type: Boolean, default: false },
  data: [
    {
      label: String,
      value: String
    }
  ],
  lists: [
    { title: String, type: ObjectId, ref: 'List' }
  ],
  actions: [
    {
      campaign: { type: ObjectId, ref: 'Campaign' },
      action: [
        {
          typeAction: String,
          link: String,
          date: Date
        }
      ]
    }
  ],
  owner: { type: ObjectId, ref: 'User', required: true, index: true }
});

Lead.index({ email: 1, owner: 1 }, { unique: true });

module.exports = mongoose.model('Lead', Lead);