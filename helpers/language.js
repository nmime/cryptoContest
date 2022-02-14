const yaml = require('js-yaml')
const fs = require('fs')
const Markup = require('telegraf/markup')

const locales = localesFiles()
const keyboard = []
locales.forEach((locale, index) => {
  const localeCode = locale.split('.')[0]
  const localeName = yaml.load(
    fs.readFileSync(`${__dirname}/../locales/${locale}`, 'utf8')
  ).name
  keyboard.push(Markup.callbackButton(localeName, `translateBot_${localeCode}`))
})
const languageKeyboard =  Markup.inlineKeyboard(keyboard, { columns: 2 })

function localesFiles() {
  return fs.readdirSync(`${__dirname}/../locales`)
}

module.exports = languageKeyboard