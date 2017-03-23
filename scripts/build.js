#!/usr/bin/env node

require('events').EventEmitter.prototype._maxListeners = 100;

const fs = require('fs')
const YAML = require('yamljs')
const chalk = require('chalk')
const plist = require('plist')
const yamlLoader = require('./yaml-import-loader')

yamlLoader('src/syntaxes/_index.yaml', (err, res) => {
  if (err) throw new Error(err)

  const yamlString = res.buffer;
  const pojo = YAML.parse(yamlString)
  const jsonString = JSON.stringify(pojo, null, 4)
  const plistString = plist.build(pojo)
  const builds = [
    ['lib/syntaxes/ManiaScript.YAML-tmLanguage', yamlString],
    ['lib/syntaxes/ManiaScript.JSON-tmLanguage', jsonString],
    ['lib/syntaxes/ManiaScript.tmLanguage', plistString]
  ]

  builds.forEach(([path, buffer]) => 
    fs.writeFile(path, buffer, 'utf8', 
      console.log(chalk.yellow('write'), chalk.green(`${path}... done!`))))
})
