const { CompletionItem: Item, CompletionItemKind: Kind } = require('vscode')
let variablesNames = [];
let variablesTypes = [];
let arrayNames = [];
let arrayTypes = [];

function allVariables(docText) {
  let variables = [];
  const regMatch = /((^(\s+)?declare\s+(.*?)\s)|(#Const\s))\w+/gm;
  const matchArray = [...new Set(docText.match(regMatch))];

  matchArray.forEach(match => {
    const mArray = match.replace(/^\s+/, "").split(" ");
    let name = mArray.pop();
    variables.push(new Item(name, Kind.Variable));
    if (variablesNames.indexOf(name) == -1) {
      variablesNames.push(name);
    }

    const type = mArray.pop();
    if (type != "declare" && type != "persistent" && type != "#Const") {
      // if type matches [], it must be array
      if (type.match(/\[(.*)?\]/g)) {
        var types = type.match(/\w+(?!\[\])?/g);
        arrayTypes[variablesNames.indexOf(name)] = types;
        variablesTypes[variablesNames.indexOf(name)] = type;       
      } else {
        variablesTypes[variablesNames.indexOf(name)] = type;
      }

    } else {
      variablesTypes[variablesNames.indexOf(name)] = "-";
    }
  });

  return variables;
}

function getVarType(varName) {
  const varIndex = variablesNames.indexOf(varName);
  if (varIndex != -1) {
    return variablesTypes[variablesNames.indexOf(varName)];
  }
  return null;
}

function getArrayType(varName) {
  const varIndex = variablesNames.indexOf(varName);
  if (varIndex != -1) { 
    return arrayTypes[varIndex];
  }
  return null;
}

module.exports = {
  allVariables,
  getVarType,
  getArrayType
}