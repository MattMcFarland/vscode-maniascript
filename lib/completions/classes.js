const classes = require('./completions').classes
const { CompletionItem: Item, CompletionItemKind: Kind, SnippetString: Snippet } = require('vscode')


function classMethods(className) {
  const groupMethods = classes[className].methods || {}
  return Object.keys(groupMethods).map(label => {
    const params = groupMethods[label].params
    const name = groupMethods[label].name
    let textDisplay = name + "("
    let textCompletion = textDisplay
    if (params.length > 0) {
      params.forEach((param, index) => {
        textDisplay += param.identifier + " " + param.argument + ", "
        textCompletion += "${"+ (index+1) + ":" + param.argument + "}, "
      })
      textDisplay = textDisplay.substring(0, textDisplay.length-2);
      textCompletion = textCompletion.substring(0, textCompletion.length-2);
    }
    textDisplay += ") : "+groupMethods[label].returns
    textCompletion += ")"
    const newMeth = new Item(textDisplay, Kind.Method)
    newMeth.insertText = new Snippet(textCompletion)
    newMeth.filterText = name
    return newMeth
  })
}

function classProps(className) {
  const props = classes[className].props || {}
  const allProps = []
  Object.keys(props).forEach(groupName => {
    props[groupName].forEach(prop => {
      const itemProp = new Item(prop + " : " + groupName , Kind.Field)
      itemProp.insertText = prop
      itemProp.filterText = prop
      allProps.push(itemProp)
    })
  })
  return allProps
}

module.exports = {
  classes: Object.keys(classes).map(label => new Item(label, Kind.Class)),
  classProps,
  classMethods
}

