const { CompletionItem: Item, CompletionItemKind: Kind } = require('vscode')

module.exports = {
  modules: () => {
    var groupModules = [
      "#Command",
      "#Include",
      "#RequireContext",
      "#Setting",
      "#Const",
      "#Extends"
    ].map(label => new Item(label, Kind.Module))
    for(var i = 0; i<groupModules.length; i++){
      groupModules[i].insertText = groupModules[i].label.substring(1, groupModules[i].label.length)
    }
    return groupModules
  }
}