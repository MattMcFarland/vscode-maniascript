const { CompletionItem: Item, CompletionItemKind: Kind, SnippetString: Snippet } = require('vscode')

let variablesNames = [];
let variablesTypes = [];
let arrayNames = [];
let arrayTypes = [];
let variables = {};

/**
 * Add all variables to autocomplete
 * @param {string} docText
 */
function allVariables(docText) {
  const regMatch = /((^(\s+)?declare\s+(metadata\s+|netread\s+|netwrite\s+|persistent\s+){0,1}(.*?)\s)|(#Const\s))\w+/gm;
  const matchArray = [...new Set(docText.match(regMatch))];
  variables = {};

  matchArray.forEach(match => {
    try {
      parse(match);
    } catch (err) {
      console.log(err);
    }
  });
}

/**
 * parse variable string and add it to autocomplete
 * 
 * @param {string} variableString 
 */
function parse(variableString) {
  const mArray = variableString.replace(/^\s+/, "").split(" ");
  let name = mArray.pop();

  if (variablesNames.indexOf(name) == -1) {
    variablesNames.push(name);
  }

  let type = mArray.pop();

  let storageKeywords = ["declare", "#Const", "persistent", "metadata", "netwrite", "netread"];
  if (storageKeywords.includes(type) == false) {
    // if type matches [], it must be array
    if (type.match(/\[(.*)?\]/g)) {
      var types = type.match(/\w+(?!\[\])?/g);
      arrayTypes[variablesNames.indexOf(name)] = types;
      variablesTypes[variablesNames.indexOf(name)] = type;
    } else {
      variablesTypes[variablesNames.indexOf(name)] = type;
    }
    let newItem = new Item(name + " : " + type, Kind.Variable);
    newItem.insertText = new Snippet(name);
    newItem.filterText = name;
    variables[name] = newItem;
  } else {
    variablesTypes[variablesNames.indexOf(name)] = "-";
    variables[name] = new Item(name, Kind.Variable);
  }

}
/**
 * get autocomplete items
 * @returns {Item[]}
 */
function getAllVariableItems() {
  var outVars = [];
  for (const key in variables) {
    if (variables.hasOwnProperty(key)) {
      outVars.push(variables[key]);
    }
  }
  return outVars;
}

/**
 * get variable type from variable name
 * @param {string|null} varName 
 */
function getVarType(varName) {
  const varIndex = variablesNames.indexOf(varName);
  if (varIndex != -1) {
    return variablesTypes[variablesNames.indexOf(varName)];
  }
  return null;
}

/**
 * get arraytype from variablename
 * @param {string} varName 
 * @returns {string|null}
 */
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
  getArrayType,
  getAllVariableItems,
  parse,
}