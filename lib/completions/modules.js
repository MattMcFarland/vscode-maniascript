const { CompletionItem: Item, CompletionItemKind: Kind } = require('vscode')

module.exports = [
    "#Command",
    "#Include",
    "#RequireContext",
    "#Setting",
    "#Const",
    "#Extends",
    "#Struct"
  ].map(label => {
    const modu = new Item(label, Kind.Module)
    modu.insertText = label.substring(1, label.length)
    return modu
  })