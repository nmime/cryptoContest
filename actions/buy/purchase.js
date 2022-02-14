const Markup = require('telegraf/markup')
const Product = require('../../models/product')
const User = require('../../models/user')

module.exports = async (ctx) => {
  const product = await Product.findOne({ key: ctx.state[1] })

  if(product.price > ctx.user.balances[product.currency]) return ctx.answerCbQuery(ctx.i18n.t('buy.purchase.notEnough'))

  ctx.user.balances[product.currency] -= product.price
  await Product.updateOne({ key: product.key }, { status: 'sold', buyerId: ctx.from.id })
  await User.updateOne({ id: product.ownerId }, { $inc: { [`balances.${product.currency}`]: product.price } })

  if(ctx.callbackQuery.message?.photo) await ctx.deleteMessage()
  return ctx[ctx.callbackQuery.message?.photo ? 'replyWithHTML' : 'editMessageText'](ctx.i18n.t('buy.purchase.success', {
    text: product.secret
  }))
}