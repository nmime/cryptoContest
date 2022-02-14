const Markup = require('telegraf/markup')
const Product = require('../../models/product')

module.exports = async (ctx) => {
  const shift = Number(ctx.state[1]) || 0
  const quantity = await Product.countDocuments({ status: 'onSale' })

  const backKeyboard = Markup.inlineKeyboard([
    Markup.callbackButton(ctx.i18n.t('back'), `menu`),
  ]).extra({ 
    parse_mode: "HTML"
  })
  if(quantity === 0) return ctx[ctx.message ? 'replyWithHTML' : 'answerCbQuery'](ctx.i18n.t('buy.missing'), backKeyboard)
  if(shift < 0 || shift >= quantity) return ctx[ctx.message ? 'replyWithHTML' : 'answerCbQuery'](ctx.i18n.t('buy.impossible'), backKeyboard)
  else if(ctx.callbackQuery) await ctx.answerCbQuery()

  const product = await Product.findOne({ status: 'onSale' }).skip(shift)
  const keyboard = Markup.inlineKeyboard([
    [
      Markup.callbackButton('◀️', `buy_shift_${shift-1}`),
      Markup.callbackButton(ctx.i18n.t('buy.purchase.key'), `buy_purchase_${product.key}`), 
      Markup.callbackButton('▶️', `buy_shift_${shift+1}`)
    ],
    [Markup.callbackButton(ctx.i18n.t('back'), `menu`)]
  ])

  if(ctx.callbackQuery) await ctx.deleteMessage()
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