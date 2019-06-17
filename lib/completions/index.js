const assert = require('assert')
const { findInContext, classes, classMethods, classProps } = require('./classes')
const primitives = require('./primitives')
const keywords = require('./keywords')
const modules = require('./modules')
const arrayMethods = require('./arraymethods')
const { checkStructs, getStructElems, isStruct, getAllStructs } = require('./structs')
const { allVariables, getVarType, getArrayType } = require('./variables')
const { allNamespacesIncluded, isNamespace, getNamespace, namespacesElems } = require('./namespaces')
const { CompletionItem: Item, CompletionItemKind: Kind } = require('vscode')

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
  let requireContext = docText.match(/(^((\s|\t)+)?#RequireContext\s+\w+)|(\@context\s+\w+)/m);
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
    lastElem = lastElem.slice(0, lastElem.indexOf('.'));

    // require from context 
    let contextClasses = findInContext(lastElem, requireContext);

    var vartype = getVarType(lastElem);
    if (vartype !== null) {
      if (isStruct(vartype)) {
        return [...getStructElems(vartype), new Item("fromjson", Kind.Method), new Item("tojson", Kind.Method)];
      }
      return findFromDelimeter('.', vartype.replace(/\[(\w+)?\]/, ""));  // remove array notations      
    }

    // if is array access
    var arrMatch = lastElem.match(/\w+(?!\[\])?/g);
    if (arrMatch.length >= 1) {
      var arrayType = getArrayType(arrMatch[0], 0);

      // if variable not found, but context class found
      if (arrayType == null && requireContext !== "" && contextClasses.length > -1) {
        return contextClasses;
      }

      // if variable is array, and has no array accessor of []
      if (arrayType !== null && arrMatch.length == 1) {
        
        // if type is found and it's struct       
        if (isStruct(arrayType[0])) {
          return [new Item("fromjson", Kind.Method), new Item("tojson", Kind.Method)];
        }
        // othervice show array methods
        return [...arrayMethods];
      }
      
      // if array accessor level is equal to array type
      if (arrMatch.length - 1 == arrayType.length) {
        // and archtype is struct
        if (isStruct(arrayType[0])) {
          return [...getStructElems(arrayType[0]), new Item("fromjson", Kind.Method), new Item("tojson", Kind.Method)];
        }
        // or arrayType is found
        if (arrayType !== null) {
          return [...findFromDelimeter('.', arrayType[0])];
        }
      } else {
        // if accessor level is too great, show nothing
        if (arrMatch.length - 1 > arrayType.length) {
          return [];
        }
        // othervice needs to show the array methods
        if (arrMatch.length - 1 < arrayType.length) {
          return [...arrayMethods];
        }
    
      }
    
    }

  }

  // if is namespace or enum
  if (lastElem.indexOf('::') > -1) {
    console.log(lastElem);

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