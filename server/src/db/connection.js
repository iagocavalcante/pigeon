let Mongoose = require('mongoose');

Mongoose.connect('mongodb://mongo:27017/emailmarketing', { useMongoClient: true}, (err) => {
  if (!err) {
    console.log('Mongoose Conectado!')
  }
  console.log('Mongoose Error! => ', err)
})

module.exports = Mongoose