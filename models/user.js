const mongoose = require('mongoose')

let User = mongoose.Schema({
	id: {
    type: Number,
    index: true,
    unique: true,
    required: true
  },
	name: String,
	username: String,
	state: String,
	ban: Boolean,
	lang: String,
	langCode: String,
	alive: Boolean,
  from: String,
  lastMessage: Date,
  balances: {
    BTC: {
      default: 0,
      type: mongoose.Decimal128
    },
    TON: {
      default: 0,
      type: mongoose.Decimal128
    },
    BNB: {
      default: 0,
      type: mongoose.Decimal128
    },
    USDT: {
      default: 0,
      type: mongoose.Decimal128
    },
    USDC: {
      default: 0,
      type: mongoose.Decimal128
    },
    BUSD: {
      default: 0,
      type: mongoose.Decimal128
    }
  }
}, {
  timestamps: true
})
User = mongoose.model('User', User)

module.exports = User
