const Markup = require('telegraf/markup')
const Product = require('../../models/product')
const crypto = require('crypto')

module.exports = async (ctx) => {
  if(ctx.updateType === 'callback_query') {
    const findQuery = { ownerId: ctx.from.id, status: 'preparation' }
    let product = await Product.findOne(findQuery) || 
    await Product.create(findQuery)

    await ctx.answerCbQuery()
    if(ctx.state[1]) {
      if(['price', 'name', 'description', 'secret'].includes(ctx.state[1])){
        ctx.user.state = `sellAdd_${ctx.state[1]}`

        return ctx.editMessageText(ctx.i18n.t(`sell.add.${ctx.state[1]}.text`), Markup.inlineKeyboard([[
          Markup.callbackButton(ctx.i18n.t('back'), `sell_add`)
        ]]).extra({
          parse_mode: "HTML"
        }))
      }else if(ctx.state[1] === 'currency'){
        if(!ctx.state[2]) {
          return ctx.editMessageText(ctx.i18n.t(`sell.add.${ctx.state[1]}.text`), Markup.inlineKeyboard([
            [
              Markup.callbackButton(`BTC`, `sell_add_currency_BTC`),
              Markup.callbackButton(`TON`, `sell_add_currency_TON`),
              Markup.callbackButton(`BNB`, `sell_add_currency_BNB`)
            ],
            [
              Markup.callbackButton(`BUSD`, `sell_add_currency_BUSD`),
              Markup.callbackButton(`USDC`, `sell_add_currency_USDC`),
              Markup.callbackButton(`USDT`, `sell_add_currency_USDT`)
            ],
            [
              Markup.callbackButton(ctx.i18n.t('back'), `sell_add`)
            ]
          ]).extra({
            parse_mode: "HTML"
          }))
        }else product = await Product.findOneAndUpdate(findQuery, { currency: ctx.state[2] }, { new: true })
      }else if(ctx.state[1] === 'publish'){
        if(product.price && product.name && product.description && product.currency && product.secret) {
          await Product.updateOne(findQuery, { status: 'onSale', key: crypto.randomBytes(4).toString('hex') })

          return ctx.editMessageText(ctx.i18n.t('sell.add.success'), Markup.inlineKeyboard([[
          Markup.callbackButton(ctx.i18n.t('back'), `sell`)
        ]]).extra({
          parse_mode: "HTML"
        }))
        }else return ctx.editMessageText(ctx.i18n.t('sell.add.error'), Markup.inlineKeyboard([[
          Markup.callbackButton(ctx.i18n.t('back'), `sell_add`)
        ]]).extra({
          parse_mode: "HTML"
        }))
      }
    } 

    const keyboard = Markup.inlineKeyboard([
      [
        Markup.callbackButton(`${ctx.i18n.t('sell.add.keys.price')} ${product.price && '✔️' || ''}`, `sell_add_price`),
        Markup.callbackButton(`${ctx.i18n.t('sell.add.keys.currency')} ${product.currency && '✔️' || ''}`, `sell_add_currency`)
      ],
      [
        Markup.callbackButton(`${ctx.i18n.t('sell.add.keys.name')} ${product.name && '✔️' || ''}`, `sell_add_name`),
        Markup.callbackButton(`${ctx.i18n.t('sell.add.keys.description')} ${product.description && '✔️' || ''}`, `sell_add_description`)
      ],
      [Markup.callbackButton(`${ctx.i18n.t('sell.add.keys.secret')} ${product.secret && '✔️' || ''}`, `sell_add_secret`)],
      [Markup.callbackButton(ctx.i18n.t('sell.add.keys.publish'), `sell_add_publish`)],
      [Markup.callbackButton(ctx.i18n.t('back'), `sell`)]
    ])
    return ctx.editMessageText(ctx.i18n.t('sell.add.text'), keyboard.extra({
      parse_mode: "HTML"
    }))
  }else{
    const update = {}
    if(ctx.state[1] === 'description'){
      update.description = ctx.message.text || ctx.message.caption
      if(!update.description) return ctx.reply(ctx.i18n.t('sell.add.description.error'))

      if(ctx.message.photo) update.image = ctx.message.photo[ctx.message.photo.length-1].file_id
    }else if(ctx.state[1] === 'price'){
      const price = Number(ctx.message.text)
      if(isNaN(price) || price <= 0) return ctx.replyWithHTML(ctx.i18n.t('sell.add.price.error'))
      update.price = price
    }else update[ctx.state[1]] = ctx.message.text
    await Product.updateOne({ ownerId: ctx.from.id, status: 'preparation' }, update)
    ctx.user.state = null

    return ctx.replyWithHTML(ctx.i18n.t(`sell.add.${ctx.state[1]}.success`), Markup.inlineKeyboard([
      Markup.callbackButton(ctx.i18n.t('back'), `sell_add`)
    ]).extra())
  }
}