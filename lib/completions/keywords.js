const { CompletionItem: Item, CompletionItemKind: Kind } = require('vscode')

module.exports = [
  "declare",
  "assert",
  "foreach",
  "break",
  "case",
  "continue",
  "log",
  "do",
  "else",
  "for",
  "yield",
  "if",
  "sleep",
  "wait",
  "return",
  "switch",
  "switchtype"
].map(label => new Item(label, Kind.Keyword))
