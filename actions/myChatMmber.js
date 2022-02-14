const User = require('../models/user')

module.exports = async (ctx) => {
  return User.updateOne({ id: ctx.from.id }, { alive: ctx.myChatMember.new_chat_member.status === 'kicked' ? false : true })
}