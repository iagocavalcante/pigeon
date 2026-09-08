const mongoose = require('mongoose');
let ObjectId = mongoose.Schema.ObjectId;

const Lead = mongoose.Schema({
  email: { type: String, required: true, unique: true },
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

module.exports = mongoose.model('Lead', Lead);