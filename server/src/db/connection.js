let Mongoose = require('mongoose');

Mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true}, (err) => {
  if (!err) {
    console.log('Mongoose Conectado!')
  }
  console.log('Mongoose Error! => ', err)
})

module.exports = Mongoose