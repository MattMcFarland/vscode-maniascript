const assert = require('assert')
const { findInContext, classes, classMethods, classProps } = require('./classes')
const primitives = require('./primitives')
const keywords = require('./keywords')
const modules = require('./modules')
const arrayMethods = require('./arraymethods')
const { checkStructs, getStructElems, isStruct } = require('./structs')
const { allVariables, getVarType, getArrayType } = require('./variables')
const { allNamespacesIncluded, isNamespace, getNamespace, namespacesElems } = require('./namespaces')
const { CompletionItem: Item, CompletionItemKind: Kind } = require('vscode')

function findFromDelimeter(delimeter, searchFor) {
  try {
    assert(delimeter === '::' || delimeter === '.', 'Invalid delimeter');
    const searchIndex = delimeter === '::' ? classMethods(searchFor) : classProps(searchFor);
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
  let requireContext = docText.match(/(^((\s|\t)+)?#RequireContext\s\w+)|(\@context\s\w+)/m);
  requireContext = requireContext === null ? "" : requireContext[0].split(" ").pop();
  try {
    checkStructs(docText);
  } catch (e) {
    console.log("error on struct");
  }
  const namespaces = allNamespacesIncluded(docText);
  const variables = allVariables(docText);

  if ((searchFor[0] === "#RequireContext")) {
    return [...classes];
  }

  //check delimiter use
  let lastElem = searchFor.pop();

  if (lastElem.indexOf('.') > -1) {
    lastElem = lastElem.slice(0, lastElem.indexOf('.'));

    var vartype = getVarType(lastElem);

    if (vartype !== null) {
      if (isStruct(vartype)) {
        return [...getStructElems(vartype), new Item("fromjson", Kind.Method), new Item("tojson", Kind.Method)];
      }
      return findFromDelimeter('.', vartype.replace(/\[(\w+)?\]/, ""));  // remove array notations
    }

    var arrMatch = lastElem.match(/\w+(?!\[\])?/g);
    if (arrMatch.length == 1) {
      return [...arrayMethods];
    }

    if (arrMatch.length > 1) {
      var arrayType = getArrayType(arrMatch[0], 0);
      if (isStruct(arrayType)) {
        return [...getStructElems(arrayType), new Item("fromjson", Kind.Method), new Item("tojson", Kind.Method)];
      }

      if (arrayType !== null) {
        return [...findFromDelimeter('.', arrayType)];
      }

      let contextClasses = findInContext(lastElem, requireContext);
      if (requireContext !== "" && contextClasses.length > -1) {
        return contextClasses;
      }
    }

  }

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

  if ((searchFor[0] === "declare" || searchFor[0] === "#Struct" || searchFor[0] === "#Const")) {
    if (searchFor.length < 4) {
      return [...primitives, ...classes, new Item("persistent", Kind.Keyword)];
    } else {
      return [];
    }
  }

  return [...findFromDelimeter('.', requireContext), ...namespaces, ...keywords, ...variables, ...classes];
}

module.exports = {
  find
}