const { CompletionItem: Item, CompletionItemKind: Kind } = require('vscode')
let variablesNames = [];
let variablesTypes = [];
let arrayNames = [];
let arrayTypes = [];
let variables = [];

/**
 * Add all variables to autocomplete
 * @param {string} docText
 */
function allVariables(docText) {
  const regMatch = /((^(\s+)?declare\s+(.*?)\s)|(#Const\s))\w+/gm;
  const matchArray = [...new Set(docText.match(regMatch))];

  matchArray.forEach(match => {
    parse(match);
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
    variables.push(new Item(name, Kind.Variable));
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

}
/**
 * get autocomplete items
 * @returns {Item[]}
 */
function getAllVariableItems() {
  return variables;
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