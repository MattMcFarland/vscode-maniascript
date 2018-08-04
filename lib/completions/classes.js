const classes = require('./completions').classes
const { CompletionItem: Item, CompletionItemKind: Kind } = require('vscode')

module.exports = {
  classes: Object.keys(classes).map(label => new Item(label, Kind.Class)),
  classMethods: (className) => {
    const groupMethods = classes[className].methods || {}
    var textCompletions = []
    var objs = Object.keys(groupMethods).map(label => {
      var textDisplay = groupMethods[label].name+"("
      var textCompletion = groupMethods[label].name+"("
      const params = groupMethods[label].params
      if (params.length > 0) {
        params.forEach(param => {
          textDisplay += param.identifier + " " + param.argument + ", "
          textCompletion += param.argument + ", "
        })
        textDisplay = textDisplay.substring(0, textDisplay.length-2);
        textCompletion = textCompletion.substring(0, textCompletion.length-2);
      }
      textDisplay += ") : "+groupMethods[label].returns
      textCompletion += ")"
      textCompletions.push(textCompletion)
      return new Item(textDisplay, Kind.Method)
    })
    for(var i = 0; i < textCompletions.length; i++){
      objs[i].insertText = textCompletions[i]
    }
    return objs
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

