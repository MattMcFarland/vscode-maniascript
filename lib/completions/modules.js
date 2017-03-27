const { CompletionItem: Item, CompletionItemKind: Kind } = require('vscode')

module.exports = [
  "#Command",
  "#Include",
  "#RequireContext",
  "#Setting",
  "#Const",
  "#Extends"
].map(label => new Item(label, Kind.Text))
