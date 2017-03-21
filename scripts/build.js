#!/usr/bin/env node
require('events').EventEmitter.prototype._maxListeners = 100;

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
    const obj = parseYAML(res.buffer)
    writeFile('syntaxes/ManiaScript.tmLanguage', plist.build(obj), 'utf8', () => {
      console.log(chalk.green('...done!'))
    });
  }
})
