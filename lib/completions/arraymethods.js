const { CompletionItem: Item, CompletionItemKind: Kind, SnippetString: Snippet } = require('vscode');


const methodCompletions = [
  // filter value, display value, completion
  ["add", "add(value)", "add(${1:value})"],
  ["addfirst", "addfirst(value)", "add(${1:value})"],
  ["sort", "sort()", "sort()"],
  ["sortreverse", "sortreverse()", "sortreverse()"],
  ["sortkey", "sortkey()", "sortkey()"],
  ["sortkeyreverse", "sortkeyreverse()", "sortkeyreverse()"],
  ["removekey", "removekey(index)", "removekey(${1:index})"],
  ["remove", "remove()", "remove(${1:value})"],
  ["existskey", "existskey(key)", "existskey(${1:key})"],
  ["exists", "exists()", "exists(${1:value})"],
  ["keyof", "keyof(value)", "keyof(${1:value})"],
  ["containsonly", "containsonly(value)", "containsonly(${1:value})"],
  ["containsoneof", "containsoneof(value)", "containsoneof(${1:value})"],
  ["slice", "slice(start,count)", "slice(${1:start},${2:count}"],
  ["tojson", "tojson() : Text", "tojson()"],
  ["fromjson", "fromjson(value) : Text", "fromjson(${1:value})"]
];

function getMethods() {
  let methods = [];

  methodCompletions.forEach(method => {
    let CompletionItem = new Item(method[1], Kind.Function);
    CompletionItem.insertText = new Snippet(method[2])
    CompletionItem.filterText = method[0];
    methods.push(CompletionItem);
  });
  return methods;
}


module.exports = [new Item("count", Kind.Field), ...getMethods()];
