const { CompletionItem: Item, CompletionItemKind: Kind } = require('vscode')

module.exports = [
  "define",
  "declare",
  "assert",
  "break",
  "case",
  "continue",
  "log",
  "do",
  "else",
  "finally",
  "yield",
  "include",
  "sleep",
  "wait",
  "return"
].map(label => new Item(label, Kind.Keyword))
