const { CompletionItem: Item, CompletionItemKind: Kind, SnippetString: Snippet } = require('vscode')
const { findTypesInContext, getClassPropTypes } = require("./classes");
const { getStructElemType } = require("./structs");

let variablesNames = [];
let variablesTypes = [];
let arrayNames = [];
let arrayTypes = [];
let variables = {};

const matchForeach = /foreach\s*\(\s*(?:(\w+)\s*=>\s*)?(\w+)\s+in\s+(.*)\s*\)/gm;
const regMatch = /((^(\s+)?declare\s+(metadata\s+|netread\s+|netwrite\s+|persistent\s+){0,1}(.*?)\s)|(#Const\s))\w+/gm;

/**
 * Add all variables to autocomplete
 * @param {string} docText
 */
function allVariables(docText, context) {
  const matchArray = [...new Set(docText.match(regMatch))];
  variables = {};

  matchArray.forEach(match => {
    try {
      parse(match);
    } catch (err) {
      console.log(err);
    }
  });


  let matchArray2 = docText.match(matchForeach);
  delete (match);
  if (matchArray2 !== null) {
    matchArray2.forEach(match => {
      if (match !== undefined) {
        try {
          parseforeach(match, context);
        } catch (err) {
          console.log(err);
        }
      }
    });
  }
}

function resolveVarible(text, requireContext) {
  var variableChain = text.split(".");

  if (variableChain == undefined) return;
  var firstElem = variableChain[0];
  firstElem = firstElem.replace(/\[(.*?)\]/g, "");
  var resolvedVariable = findTypesInContext(firstElem, requireContext) || getStructElemType(firstElem) || getVarType(firstElem) || "";
  var vari = resolvedVariable.replace(/\[(.*?)\]/g, "");

  for (var count = 0; count < variableChain.length - 1; count++) {
    let next = variableChain[count + 1].replace(/\[(.*?)\]/g, "");
    vari = vari.replace(/\[(.*?)\]/g, "");
    if (vari !== null) {
      let contextClassTypes = getClassPropTypes(vari);
      let structureTypes = getStructElemType(vari);

      if (structureTypes !== null && structureTypes.hasOwnProperty(next)) {
        vari = structureTypes[next];
        resolvedVariable = structureTypes[next];
        continue;
      }

      if (contextClassTypes !== null && contextClassTypes.hasOwnProperty(next)) {
        vari = contextClassTypes[next];
        resolvedVariable = contextClassTypes[next];
        continue;
      }
    }
  }

  return resolvedVariable.replace(/\[(.*?)\]/g, "");
}

/**
 * parse variable string and add it to autocomplete
 * 
 * @param {string} matchText
 */
function parseforeach(matchText, context) {
  matchForeach.lastIndex = -1;
  let mArray = matchForeach.exec(matchText);

  if (Array.isArray(mArray) && mArray.length === 4) {
    var name = mArray[2];
    var type = mArray[3];

    if (variablesNames.indexOf(name) == -1) {
      variablesNames.push(name);
    }

    variablesTypes[variablesNames.indexOf(name)] = resolveVarible(type, context) || type;

    let newItem = new Item(name + " : " + type, Kind.Variable);
    newItem.insertText = new Snippet(name);
    newItem.filterText = name;
    variables[name] = newItem;
  }
}


/**
 * parse variable string and add it to autocomplete
 * 
 * @param {string} variableString 
 */
function parse(variableString) {
  const mArray = variableString.replace(/^\s+/, "").split(/\s/);
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
    let type = variablesTypes[variablesNames.indexOf(varName)];
    return type;
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