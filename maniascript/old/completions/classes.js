const classes = require('./completions').classes
const { CompletionItem: Item, CompletionItemKind: Kind } = require('vscode')

module.exports = {
  classes: Object.keys(classes).map(label => new Item(label, Kind.Class)),
  classMethods: (className) => {
    const methods = classes[className].methods || {}
    return Object.keys(methods).map(label => new Item(label, Kind.Method))
  },
  classProps: (className) => {    
    const props = classes[className].props || {}
    const allProps = []
    const groupNames = Object.keys(props)
    groupNames.forEach(groupName => {
      allProps.push(...props[groupName])
    })
    return allProps.map(label => new Item(label, Kind.Field))
  }
}

