const assert = require('assert')
const { findTypesInContext, findInContext, classes, classMethods, classNames, classProps, classEnums, getClassPropTypes } = require('./classes')
const primitives = require('./primitives')
const keywords = require('./keywords')
const modules = require('./modules')
const arrayMethods = require('./arraymethods')
const { checkStructs, getStructElems, isStruct, getAllStructs, getStructElemType } = require('./structs')
const { allVariables, getVarType, getAllVariableItems } = require('./variables')
const { allNamespacesIncluded, isNamespace, getNamespace, namespacesElems } = require('./namespaces')
const { parseFunctions, getAllFunctions } = require('./functions');
const { CompletionItem: Item, CompletionItemKind: Kind } = require('vscode')
let requireContext;

/**
 * returns autocompletion items from context or class 
 * @param {string} delimeter 
 * @param {string} searchFor 
 * @returns {Item[]}
 */
function findFromDelimeter(delimeter, searchFor) {
  try {
    assert(delimeter === '::' || delimeter === '.', 'Invalid delimeter');
    const searchIndex = delimeter === '::' ? [...classEnums(searchFor)] : [...classProps(searchFor), ...classMethods(searchFor)];
    return searchIndex;
  } catch (e) {
    console.log('Handled Exception ocurred in findFromDelimeter function', { delimeter, searchFor });
    console.log(e)
  }
}

/**
 * find a candidate
 * @param {String} searchFor - query to find
 * @param {String} docText - full document text
 */
function find(searchFor, docText) {
  //collect data from document

  // allow also to cast context type from comments by adding: "@context {type}" 
  requireContext = docText.match(/(^((\s|\t)+)?#RequireContext\s+\w+)|(\@context\s+\w+)/m);
  requireContext = requireContext === null ? "" : requireContext[0].split(" ").pop();
  const namespaces = allNamespacesIncluded(docText);

  try {
    parseFunctions(docText);    
    checkStructs(docText);
    allVariables(docText, requireContext);
  } catch (e) {
    console.log(e);
  }

  const variables = getAllVariableItems();

  if ((searchFor[0] === "#RequireContext" || searchFor[0] === "@context")) {
    return [...classes];
  }

  //check delimiter use
  let lastElem = searchFor.pop();

  // if has . 
  if (lastElem.indexOf('.') > -1) {
    var variableChain = lastElem.split(".");
    variableChain.pop(); // remove last entry, it's always ""

    var firstElem = variableChain[0].match(/(\w+.*)/)[0];
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
    
    if (resolvedVariable !== null) {

      if (isStruct(resolvedVariable)) {
        return [...getStructElems(resolvedVariable), new Item("fromjson", Kind.Method), new Item("tojson", Kind.Method)];
      }

      var arrMatch = resolvedVariable.match(/\[(.*?)\]/g);
      var arrLen = variableChain.pop();
      arrLen = arrLen.match(/\w+(?!\[\])?/g);
      resolvedVariable = resolvedVariable.replace(/\[(.*?)\]/g, "");

      if (arrMatch !== null && arrLen !== null) {
        // if array accessor level is equal to array type

        if (arrLen.length - 1 == arrMatch.length) {
          if (isStruct(resolvedVariable)) {
            return [...getStructElems(resolvedVariable), new Item("fromjson", Kind.Method), new Item("tojson", Kind.Method)];
          }

          return findFromDelimeter('.', resolvedVariable); // remove array notations   

        } else {
          if (arrLen.length >= 1) {
            return [...arrayMethods];
          }
        }
      }

      return findFromDelimeter('.', resolvedVariable); // remove array notations   

    }
    return findFromDelimeter('.', requireContext);
  }

  // if is namespace or enum
  if (lastElem.indexOf('::') > -1) {

    if (lastElem == '::') {
      lastElem = requireContext;
    } else {
      lastElem = lastElem.slice(0, lastElem.indexOf('::'));
    }

    if (isNamespace(lastElem)) {
      var namespace = getNamespace(lastElem);
      return namespacesElems(namespace);
    } else {
      return findFromDelimeter('::', lastElem);
    }

  }

  // rules for declares
  if ((searchFor[0] === "declare" || searchFor[0] === "#Struct" || searchFor[0] === "#Const")) {
    if (searchFor.length == 2) {
      return [...primitives, ...classes, ...getAllStructs(), new Item("persistent", Kind.Keyword)];
    } else {
      return [];
    }
  }

  if (lastElem.indexOf('#') == 0) {
    return [...modules];
  }

  // else throw everything  
  return [...findFromDelimeter('.', requireContext), ...classes, ...getAllStructs(), ...namespaces, ...keywords, ...variables, ...getAllFunctions(), ...primitives];
}

module.exports = {
  find
}