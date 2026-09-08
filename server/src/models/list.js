const mongoose = require('mongoose');
let ObjectId = mongoose.Schema.ObjectId;

const List = mongoose.Schema({
  title: { type: String, required: true },
  quantity: Number,
  owner: { type: ObjectId, ref: 'User', required: true, index: true }
});

module.exports = mongoose.model('List', List);
