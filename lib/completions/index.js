const assert = require('assert')
const { findTypesInContext, findInContext, classes, classMethods, classProps, getClassPropTypes } = require('./classes')
const primitives = require('./primitives')
const keywords = require('./keywords')
const modules = require('./modules')
const arrayMethods = require('./arraymethods')
const { checkStructs, getStructElems, isStruct, getAllStructs, getStructElemType } = require('./structs')
const { allVariables, getVarType } = require('./variables')
const { allNamespacesIncluded, isNamespace, getNamespace, namespacesElems } = require('./namespaces')
const { CompletionItem: Item, CompletionItemKind: Kind } = require('vscode')
let requireContext;

function findFromDelimeter(delimeter, searchFor) {
  try {
    assert(delimeter === '::' || delimeter === '.', 'Invalid delimeter');
    const searchIndex = delimeter === '::' ? classMethods(searchFor) : [...classProps(searchFor), ...classMethods(searchFor)];
    return searchIndex;
  } catch (e) {
    console.log('Handled Exception ocurred in findFromDelimeter function', { delimeter, searchFor, searchIndex, searchKey });
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
  try {
    checkStructs(docText);
  } catch (e) {
    console.log("error on struct");
  }

  if ((searchFor[0] === "#RequireContext")) {
    return [...classes];
  }

  const namespaces = allNamespacesIncluded(docText);
  const variables = allVariables(docText);

  //check delimiter use
  let lastElem = searchFor.pop();

  // if has . 
  if (lastElem.indexOf('.') > -1) {

    var variableChain = lastElem.split("."); 
    variableChain.pop(); // remove last entry, it's always ""   
    var firstElem = variableChain[0].match(/(\w+.*)/)[0];
    firstElem = firstElem.replace(/\[(\w+)?\]/, "");
    
    var resolvedVariable = findTypesInContext(firstElem, requireContext) || getStructElemType(firstElem) || getVarType(firstElem);
    var vari = resolvedVariable.replace(/\[(\w+)?\]/, "");
    
    for (var count = 0; count < variableChain.length -1; count++) {
      let next = variableChain[count + 1].replace(/\[(\w+)?\]/, "");
      vari = vari.replace(/\[(\w+)?\]/, "");
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

      var arrMatch = resolvedVariable.match(/\[(\w+)?\]/);      
      var arrLen = variableChain.pop();
      arrLen = arrLen.match(/\w+(?!\[\])?/g);
      resolvedVariable = resolvedVariable.replace(/\[(\w+)?\]/, "");

      if (arrMatch !== null && arrLen !== null) {
        // if array accessor level is equal to array type    
        if (arrLen.length == arrMatch.length) {

          if (isStruct(resolvedVariable)) {
            return [...getStructElems(resolvedVariable), new Item("fromjson", Kind.Method), new Item("tojson", Kind.Method)];
          }
          return findFromDelimeter('.', resolvedVariable); // remove array notations   
        } else if (arrMatch.length > 1) {
          return [...arrayMethods];
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
      lastElem = getNamespace(lastElem);
      return namespacesElems(lastElem);
    } else {
      return findFromDelimeter('::', lastElem);
    }

  }

  if (lastElem.indexOf('#') == 0) {
    return [...modules];
  }

  // rules for declares
  if ((searchFor[0] === "declare" || searchFor[0] === "#Struct" || searchFor[0] === "#Const")) {
    if (searchFor.length == 2) {
      return [...primitives, ...classes, ...getAllStructs(), new Item("persistent", Kind.Keyword)];
    } else {
      return [];
    }
  }

  // else throw everything  
  return [...findFromDelimeter('.', requireContext), ...getAllStructs(), ...namespaces, ...keywords, ...variables, ...classes];
}


module.exports = {
  find
}