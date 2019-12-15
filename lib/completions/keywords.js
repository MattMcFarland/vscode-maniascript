const { CompletionItem: Item, CompletionItemKind: Kind } = require('vscode');

module.exports = [
  // "declare", // will be autocompleted from code snipplets
  // "assert",  // will be autocompleted from code snipplets
  // "foreach", // will be autocompleted from code snipplets
  "break",
  "case",
  "continue",
  "log",
  "do",
  "else",
  // "for", // will be autocompleted from code snipplets
  "yield",
  //"if", // will be autocompleted from code snipplets
  "sleep",
  "wait",
  "return",
  // "switch", // will be autocompleted from code snipplets
  // "switchtype", // will be autocompleted from code snipplets
  "in",
  "metadata",
  "meanwhile",
  "dump"
].map(label => new Item(label, Kind.Keyword));
