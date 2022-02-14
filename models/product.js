const mongoose = require('mongoose')

let Product = mongoose.Schema({
  price: mongoose.Decimal128,
  currency: String,
  image: String,
  description: String,
  name: String,
  secret: String,
  ownerId: Number,
  status: String,
  key: {
    type: String,
    index: true,
    unique: true
  },
  buyerId: Number
})
Product = mongoose.model('Product', Product)

module.exports = Product
