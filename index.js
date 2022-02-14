require("dotenv").config({ path: `${__dirname}/.env` })

const mongoose = require("./models")

const { Telegraf } = require('telegraf')
const allowedUpdates = ['message','inline_query','callback_query','my_chat_member']

const bot = new Telegraf(process.env.BOT_TOKEN, { handlerTimeout: 1 })

bot.catch((err, ctx) => {
  if(err.code === 400){
    if(err.description === 'Bad Request: message is not modified: specified new message content and reply markup are exactly the same as a current content and reply markup of the message') return
  }
  return console.error(`Ooops, encountered an error for ${ctx.updateType}`, err)
})

const I18n = require('telegraf-i18n')
const i18n = new I18n({
  directory: 'locales',
  defaultLanguage: 'ru',
  defaultLanguageOnMissing: true
})
bot.use(i18n.middleware())

const rateLimit = require('telegraf-ratelimit')
const limitConfig = {
  window: 3000,
  limit: 3
}
bot.use(rateLimit(limitConfig))

bot.use(require('./middlewares/attachUser'))

bot.use(async (ctx, next) => {
  if(ctx.user && ctx.from) {
    ctx.user.username = ctx.from.username
    ctx.user.lastMessage = Date.now()
    ctx.user.name = ctx.from.first_name
    ctx.i18n.locale(ctx.user.lang)
  }
  await next()
})

bot.on('text', require('./actions/translateBot'))

bot.on('message', require('./routers/message'))

bot.on('callback_query', require('./routers/callbackQuery'))

bot.on('my_chat_member', require('./actions/myChatMmber'))

bot.launch(
  (process.env.USE_WEBHOOK==='true') ? {
    webhook: {
      domain: `https://${process.env.WEBHOOK_DOMAIN}`,
      hookPath: `/${process.env.WEBHOOK_PATH}/${process.env.BOT_TOKEN}`,
      port: process.env.WEBHOOK_PORT,
      extra: {
        max_connections: 100,
        allowed_updates: allowedUpdates
      }
    }
  } : {
    polling: { 
      allowedUpdates: allowedUpdates
    }
  }
)

bot.telegram.getWebhookInfo().then( (webhookInfo) => { console.log(`✅ Bot is up and running\n${JSON.stringify(webhookInfo, null, ' ')}`) })

const User = require('./models/user')
const { CryptoPay } = require('@foile/crypto-pay-api')
const cryptoPay = new CryptoPay(process.env.API_TOKEN, {
  hostname: 'testnet-pay.crypt.bot',
  webhook: {
    serverHostname: 'localhost',
    serverPort: 4411,
    path: '/cryptoBotContest'
  },
})

cryptoPay.invoicePaid(async update => {
  const userId = update.payload.payload
  const user = await User.findOne({ id: userId })
  if(!user) return

  await bot.telegram.sendMessage(userId, i18n.t(user.lang, 'deposit.success', {
    amount: update.payload.amount,
    currency: update.payload.asset
  }), {
    parse_mode: "HTML"
  })

  return User.updateOne({ id: userId }, { $inc: { [`balances.${update.payload.asset}`]: update.payload.amount } })
})