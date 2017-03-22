const { resolve: resolvePath } = require('path')
const { createReadStream } = require('fs')
const assert = require('assert')
const chalk = require('chalk')
const split = require('split')
const PadStream = require('pad-stream');
const ConcatStream = require('concat-stream')

const projectPath = (path) => resolvePath(process.cwd(), path)

function loader (fileName, callback) {
  assert(fileName, 'fileName must exist')
  assert(callback && typeof callback === 'function', 'callback(err, res) must be provided')
  const filePath = projectPath(fileName);  
  const relPath = filePath.split('/').slice(0, -1).join('/')
  const lineStream = createReadStream(filePath).pipe(split());
  const concatStream = ConcatStream((result) => {
    callback(null, { stream: concatStream, buffer: result})
  })
  concatStream.on('error', callback)
  lineStream.on('data', (data) => {
    const regex = /^\s*#import\('(.*)'\)/g
    const match = regex.exec(data);
    if (match) {
      const srcPath = resolvePath(relPath, match[1]) + '.YAML-tmLanguage'
      const srcDir = srcPath.split('/').slice(0, -1).join('/')
      const importFile = '/' + srcPath.split('/').pop()
      console.log(chalk.cyan('#import'), chalk.grey(srcDir) + chalk.magenta(importFile))

      const importStream = createReadStream(srcPath)
      const padding = data.match(/^\s*/)[0]
      const padStream = PadStream(4, padding[0])
      importStream.setMaxListeners(11)
      padStream.setMaxListeners(11)
      padStream.on('error', callback)
      importStream.pipe(padStream).pipe(concatStream)

    } else {
      concatStream.write(data + '\n')
    }
  }).on('error', callback)
}

function YAML () {}
YAML.Import = { loader }

module.exports = YAML.Import.loader;
