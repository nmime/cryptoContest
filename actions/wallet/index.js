const Markup = require('telegraf/markup')

module.exports = async (ctx) => {
  if(ctx.callbackQuery) await ctx.answerCbQuery()

  const keyboard = Markup.inlineKeyboard([
    [
      Markup.callbackButton(ctx.i18n.t('wallet.keys.deposit'), `deposit`),
      Markup.callbackButton(ctx.i18n.t('wallet.keys.withdraw'), `withdraw`)
    ],
    [
      Markup.callbackButton(ctx.i18n.t('back'), `menu`)
    ]
  ])

  return ctx[ctx.message ? 'replyWithHTML' : 'editMessageText'](ctx.i18n.t('wallet.text', {
    balance: ctx.user.balances
  }), keyboard.extra({
    parse_mode: "HTML",
    disable_web_page_preview: true
  }))
}