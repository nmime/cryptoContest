const { Router } = require('telegraf')

const router = new Router(async (ctx) => {
  if(ctx.chat.type !== 'private') return

  const route = (ctx.message?.text?.startsWith('/')) ? 'command' :
  (ctx.user.state) ? 'state' : 
  'else'

  return { route: route }
})

const commandRouter = new Router(async (ctx) => {
  const cmd = ctx.message.text.replace('/', '').split(' ')

  ctx.state = cmd.slice(1, cmd.length) 
  return { route: cmd[0] }
})

commandRouter.on('start', require('../actions/start'))
commandRouter.on('lang', require('../actions/translateBot'))

commandRouter.on('buy', require('../actions/buy'))
commandRouter.on('sell', require('../actions/sell'))
commandRouter.on('wallet', require('../actions/wallet'))

router.on('command', commandRouter)

const stateRouter = new Router(async (ctx) => {
  const cmd = ctx.user.state.split('_')

  ctx.state = cmd.slice(0, cmd.length)
  return { route: cmd[0] }
})

stateRouter.on('deposit', require('../actions/wallet/action'))
stateRouter.on('withdraw', require('../actions/wallet/action'))
stateRouter.on('sellAdd', require('../actions/sell/add'))

router.on('state', stateRouter)

router.on('else', (ctx) => ctx.reply('🌯'))

module.exports = router