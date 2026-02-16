const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Mongoose Conectado!'))
  .catch(err => console.log('Mongoose Error! => ', err))

module.exports = mongoose
