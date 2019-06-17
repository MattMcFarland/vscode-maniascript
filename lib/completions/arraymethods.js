const { CompletionItem: Item, CompletionItemKind: Kind } = require('vscode')


const methods = [
  "sort",
  "sortreverse",
  "sortkey",
  "sortkeyreverse",
  "add",
  "addfirst",
  "removekey",
  "remove",
  "existskey",
  "exists",
  "keyof",
  "containsonly",
  "containsoneof",
  "slice",
  "tojson",
  "fromjson"
].map(label => new Item(label, Kind.Function));


module.exports = [new Item("count", Kind.Field), ...methods]
