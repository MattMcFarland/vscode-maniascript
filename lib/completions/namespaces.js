const namespacesInfo = require('./completions').namespaces
const { CompletionItem: Item, CompletionItemKind: Kind, SnippetString: Snippet } = require('vscode')
let namespacesNames = []
let namespacesRef = []

function namespacesElems(namespace) {
  let allElems = [];
  const groupEnum = namespacesInfo[namespace].enums || {};
  Object.keys(groupEnum).forEach(groupName => {
    groupEnum[groupName].forEach(enumValue => {
      allElems.push(new Item(groupName+"::"+enumValue, Kind.Enum));
    })
  });
  
  const groupMethods = namespacesInfo[namespace].methods || {}
  groupMethods.forEach(method => {
    const name = method.name;
    const returns = method.returns;
    const params = method.params;
    let textDisplay = name + "("
    let textCompletion = textDisplay
    if(params.length > 0) {
      params.forEach((param, index) => {
        textDisplay += param.identifier + " " + param.argument + ", ";
        textCompletion += "${"+ (index+1) + ":" + param.argument + "}, ";
      })
      textDisplay = textDisplay.substring(0, textDisplay.length-2);
      textCompletion = textCompletion.substring(0, textCompletion.length-2);
    }
    textDisplay += ") : " + returns
    textCompletion += ")"
    let newMeth = new Item(textDisplay, Kind.Method)
    newMeth.insertText = new Snippet(textCompletion)
    newMeth.filterText = name
    allElems.push(newMeth)
  })
  return allElems;
}

function allNamespacesIncluded(docText) {
  const regexRule = /^(( |\t)+)?#Include "\w+" as \w+/gm
  const namespacesMatch = docText.match(regexRule);
  const uniq = [...new Set(namespacesMatch)];
  let allNamespaces = [];
  uniq.forEach(namespaceDef => {
    const ref = namespaceDef.split("\"")[1];
    const name = namespaceDef.split(" ").pop();
    namespacesRef.push(ref)
    namespacesNames.push(name)
    const newItem = new Item(name + " | " + ref, Kind.Interface)
    newItem.insertText = name;
    newItem.filterText = name;
    allNamespaces.push(newItem);
  });
  return allNamespaces;
}

function isNamespace(namespaceName) {
  return namespacesNames.includes(namespaceName);
}

function getNamespace(namespaceName) {
  return namespacesRef[namespacesNames.indexOf(namespaceName)];
}

module.exports = {
  allNamespacesIncluded,
  isNamespace,
  getNamespace,
  namespacesElems
}