const vscode = require('vscode')
const fuzz = require('fuzzaldrin')
const classes = require('./classes')
const functions = require('./functions')
const keywords = require('./keywords')
const modules = require('./modules')
const index = [...classes, ...functions, ...keywords, ...modules]

/**
 * find a candidate
 * @param {String} searchFor - query to find
 */
function find (searchFor) {
  console.log('searchFor ' + searchFor)
  return fuzz.filter(index, searchFor, { key: 'label' })
}

module.exports = {
  find
}