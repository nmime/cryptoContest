const Markup = require('telegraf/markup')
const Product = require('../../models/product')

module.exports = async (ctx) => {
  const count = await Product.countDocuments({ ownerId: ctx.from.id, status: 'onSale' })

  const keyboard = Markup.inlineKeyboard([
    [
      Markup.callbackButton(ctx.i18n.t('sell.keys.add'), `sell_add`)
    ],
    [
      Markup.callbackButton(ctx.i18n.t('back'), `menu`)
    ]
  ])
  if(count === 0) return ctx[ctx.message ? 'replyWithHTML' : 'editMessageText'](ctx.i18n.t('sell.missing'), keyboard.extra({
    parse_mode: "HTML"
  }))

  const products = await Product.find({ ownerId: ctx.from.id, status: 'onSale' })

  const text = products.map(product => `<a href='https://t.me/${ctx.botInfo.username}?start=pr-${product.key}'><b>${product.name}</b></a>\n${product.price} ${product.currency}`)

  return ctx[ctx.message ? 'replyWithHTML' : 'editMessageText'](ctx.i18n.t('sell.text', {
    text: text.join('\n\n')
  }), keyboard.extra({
    parse_mode: "HTML"
  }))
}