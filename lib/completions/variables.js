const { CompletionItem: Item, CompletionItemKind: Kind} = require('vscode')
let variablesNames = [];
let variablesTypes = [];

function allVariables(docText) {
  let variables = [];
  const regMatch = /^(( |\t)+)?(declare\s(\w+(\[\])?\s)?|#Const\s)\w+/gm;
  const matchArray = [...new Set(docText.match(regMatch))];
  matchArray.forEach(match => {
    const mArray = match.split(" ");
    const name = mArray.pop();
    variables.push(new Item(name, Kind.Variable));
    if(variablesNames.indexOf(name) == -1)
      variablesNames.push(name)
    const type = mArray.pop();
    if(type != "declare" && type != "persistent" && type != "#Const")
      variablesTypes[variablesNames.indexOf(name)] = type;
    else
      variablesTypes[variablesNames.indexOf(name)] = name;
  });
  return variables;
}

function getVarType(varName) {
  const varIndex = variablesNames.indexOf(varName);
  if(varIndex != -1) {
    return variablesTypes[variablesNames.indexOf(varName)];
  }
  return varName;
}

module.exports = {
  allVariables,
  getVarType
}