const { CompletionItem: Item, CompletionItemKind: Kind} = require('vscode')

function structs(docText) {
  let allStruct = []
  const regexRule = /#Struct \w+( )+?\{/g
  const structNames = docText.match(regexRule);
  structNames.forEach(struct => {
    allStruct.push(new Item(struct.split(" ")[1], Kind.Struct))
  });
  return allStruct;
}

module.exports = {
  structs
}


