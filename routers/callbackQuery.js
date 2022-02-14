const { Router } = require('telegraf')

const router = new Router(async (ctx) => {
  const split =  ctx.callbackQuery.data.split('_')

  ctx.state = split
  return { route: split[0] }
})

router.on('translateBot', require('../actions/translateBot'))

router.on('menu', require('../actions/start'))

router.on('wallet', require('../actions/wallet'))
router.on('deposit', require('../actions/wallet/action'))
router.on('withdraw', require('../actions/wallet/action'))

const sellRouter = new Router(async (ctx) => {
  const split =  ctx.callbackQuery.data.split('_')

  ctx.state = split.slice(1, split.length)
  if(!split[1]) split[1] = 'nothing'
  return { route: split[1] }
})

sellRouter.on('nothing', require('../actions/sell'))
sellRouter.on('add', require('../actions/sell/add'))

router.on('sell', sellRouter)

const buyRouter = new Router(async (ctx) => {
  const split =  ctx.callbackQuery.data.split('_')

  ctx.state = split.slice(1, split.length)
  if(!split[1]) split[1] = 'nothing'
  return { route: split[1] }
})

buyRouter.on('nothing', require('../actions/buy'))
buyRouter.on('shift', require('../actions/buy'))
buyRouter.on('purchase', require('../actions/buy/purchase'))

router.on('buy', buyRouter)

module.exports = router