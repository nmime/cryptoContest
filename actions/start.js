const Markup = require('telegraf/markup')
const Product = require('../models/product')

module.exports = async (ctx) => {
  if(ctx.message?.text.split(' ')[1]?.split('-')[0] === 'pr'){
    const product = await Product.findOne({ key: ctx.message.text.split(' ')[1].split('-')[1] })
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.callbackButton(ctx.i18n.t('buy.purchase.key'), `buy_purchase_${product.key}`)
      ],
      [Markup.callbackButton(ctx.i18n.t('back'), `menu`)]
    ])
  
    const text = ctx.i18n.t('buy.text', {
      username: ctx.botInfo.username,
      product: product
    })
    if(product.image) return ctx.replyWithPhoto(product.image, keyboard.extra({ 
      parse_mode: "HTML",
      caption: text
    }))
    else return ctx.replyWithHTML(text, keyboard.extra())
  }
  const keyboard = Markup.inlineKeyboard([
    [
      Markup.callbackButton(ctx.i18n.t('start.keys.wallet'), `wallet`)
    ],
    [
      Markup.callbackButton(ctx.i18n.t('start.keys.buy'), `buy`),
      Markup.callbackButton(ctx.i18n.t('start.keys.sell'), `sell`)
    ]
  ])
  if(ctx.callbackQuery?.message?.photo) await ctx.deleteMessage()
  
  return ctx[ctx.message || ctx.callbackQuery?.message?.photo ? 'replyWithHTML' : 'editMessageText'](ctx.i18n.t('start.text'), keyboard.extra())
}