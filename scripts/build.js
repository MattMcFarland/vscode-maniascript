#!/usr/bin/env node
require('events').EventEmitter.prototype._maxListeners = 100;
const inspect = require('util').inspect
const { resolve: resolvePath } = require('path')
const { createWriteStream, writeFile } = require('fs')
const { Readable } = require('stream')
const { parse: parseYAML } = require('yamljs')
const chalk = require('chalk')

const plist = require('plist')
const yamlLoader = require('./yaml-import-loader')

yamlLoader('src/syntaxes/_index.yaml', (err, res) => {
  if (err) {
    throw new Error(err)
  } else {
    const yamlString = res.buffer;
    const pojo = parseYAML(yamlString)
    const jsonString = JSON.stringify(pojo, null, 4)
    const plistString = plist.build(pojo)

    const builds = {
      'lib/syntaxes/ManiaScript.YAML-tmLanguage': yamlString,
      'lib/syntaxes/ManiaScript.JSON-tmLanguage': jsonString,
      'lib/syntaxes/ManiaScript.tmLanguage': plistString
    }

    Object.keys(builds).map((path) => {
      const buffer = builds[path];
      writeFile(path, buffer, 'utf8', () => {
        console.log(chalk.green(`${path}... done!`))
      });      
    })
  }
})
