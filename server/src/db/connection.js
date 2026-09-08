const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pigeon')
  .then(() => console.log('Mongoose Conectado!'))
  .catch(err => console.log('Mongoose Error! => ', err))

module.exports = mongoose
