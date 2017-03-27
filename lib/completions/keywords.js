const { CompletionItem: Item, CompletionItemKind: Kind } = require('vscode')

module.exports = [
  "define",
  "declare",
  "assert",
  "foreach",
  "break",
  "case",
  "continue",
  "log",
  "do",
  "else",
  "finally",
  "for",
  "yield",
  "if",
  "include",
  "sleep",
  "wait",
  "return",
  "switch",
  "while"
].map(label => new Item(label, Kind.Keyword))
