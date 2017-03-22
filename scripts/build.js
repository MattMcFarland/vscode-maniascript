#!/usr/bin/env node
require('events').EventEmitter.prototype._maxListeners = 100;
const inspect = require('util').inspect
const { resolve: resolvePath } = require('path')
const { createWriteStream, writeFile } = require('fs')
const { Readable } = require('stream')
const { parse: parseYAML } = require('node-yaml')
const chalk = require('chalk')

const plist = require('plist')
const yamlLoader = require('./yaml-import-loader')

yamlLoader('src/syntaxes/_index.yaml', (err, res) => {
  if (err) {
    throw new Error(err)
  } else {
    const yamlString = escapeXml(res.buffer)    
    try {
      const obj = parseYAML(yamlString)
      const output = plist.build(obj).replace(/<include>([\s\S]*?)<\/include>/g, '#$1')

      writeFile('syntaxes/ManiaScript.experimental.tmLanguage', plist.build(obj), 'utf8', () => {
        console.log(chalk.green('...done!'))
      });       
    } catch (e) {
      console.log(yamlString.match(new RegExp('^(?:[^\n]*\n){' + e.mark.line + '}([^\n]*)', 'g'))[0])
      console.log(e.message)      
    } 
  }
})

function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"](?!.*:)/g, function (c) {      
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case "\'": return '&apos;';
            case '"': return '&quot;';
        }
    });
}