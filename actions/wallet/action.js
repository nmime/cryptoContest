const Markup = require('telegraf/markup')
const { CryptoPay, Assets, PaidButtonNames } = require('@foile/crypto-pay-api')
const cryptoPay = new CryptoPay(process.env.API_TOKEN, { 
  hostname: 'testnet-pay.crypt.bot'
})
const crypto = require('crypto')

module.exports = async (ctx) => {
  if(ctx.updateType === 'callback_query') {
    if(!ctx.state[1]) return ctx.editMessageText(ctx.i18n.t(`${ctx.state[0]}.text`), Markup.inlineKeyboard([
      [
        Markup.callbackButton(`BTC`, `${ctx.state[0]}_BTC`),
        Markup.callbackButton(`TON`, `${ctx.state[0]}_TON`),
        Markup.callbackButton(`BNB`, `${ctx.state[0]}_BNB`)
      ],
      [
        Markup.callbackButton(`BUSD`, `${ctx.state[0]}_BUSD`),
        Markup.callbackButton(`USDC`, `${ctx.state[0]}_USDC`),
        Markup.callbackButton(`USDT`, `${ctx.state[0]}_USDT`)
      ],
      [
        Markup.callbackButton(ctx.i18n.t('back'), `wallet`)
      ]
    ]).extra({
      parse_mode: "HTML"
    }))
    else {
      ctx.user.state = `${ctx.state[0]}_${ctx.state[1]}`

      return ctx.editMessageText(ctx.i18n.t(`${ctx.state[0]}.enter`), Markup.inlineKeyboard([[
          Markup.callbackButton(ctx.i18n.t('back'), ctx.state[0])
        ]
      ]).extra({
        parse_mode: "HTML"
      }))
    }
  }else{
    if(ctx.state[0] === 'deposit'){
      const amount = Number(ctx.message.text)
      if(isNaN(amount) || amount <= 0 ) return ctx.replyWithHTML(ctx.i18n.t('deposit.error'))

      const invoice = await cryptoPay.createInvoice(Assets[ctx.state[1]], amount, {
        description: `deposit to @${ctx.botInfo.username}`,
        paid_btn_name: PaidButtonNames.OPEN_BOT,
        paid_btn_url: `https://t.me/${ctx.botInfo.username}`,
        payload: `${ctx.from.id}`
      })

      ctx.user.state = null

      return ctx.replyWithHTML(ctx.i18n.t('deposit.pay'), Markup.inlineKeyboard([[
        Markup.urlButton(ctx.i18n.t('deposit.buttonPay'), invoice.pay_url)
      ]]).extra())
    }else if(ctx.state[0] === 'withdraw'){
      const amount = Number(ctx.message.text)
      if(isNaN(amount) || amount <= 0  || ctx.user.balances[ctx.state[1]] < amount) return ctx.replyWithHTML(ctx.i18n.t('withdraw.error'))

      const transfer = await cryptoPay.transfer(ctx.from.id, Assets[ctx.state[1]], amount, crypto.randomBytes(10).toString('hex'), { comment: `withdraw from @${ctx.botInfo.username}` })
      ctx.user.balances[ctx.state[1]] -= amount
      ctx.user.state = null

      return ctx.replyWithHTML(ctx.i18n.t('withdraw.success', {
        amount: amount,
        currency: ctx.state[1]
      }))
    }
  }
}