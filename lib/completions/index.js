const assert = require('assert')
const {classes, classMethods, classProps} = require('./classes')
const primitives = require('./primitives')
const keywords = require('./keywords')
const modules = require('./modules')
const {checkStructs, getStructElems, isStruct} = require('./structs')
const {allVariables, getVarType} = require('./variables')
const { CompletionItem: Item, CompletionItemKind: Kind} = require('vscode')

function findFromDelimeter(delimeter, searchFor) {
  try {
    assert(delimeter === '::' || delimeter === '.', 'Invalid delimeter');
    const searchIndex = delimeter === '::' ? classMethods(searchFor) : classProps(searchFor);
    return searchIndex;
  } catch (e) {
    console.log('Handled Exception ocurred in findFromDelimeter function', {delimeter, searchFor, searchIndex, searchKey});
    console.log(e)
  }
}

/**
 * find a candidate
 * @param {String} searchFor - query to find
 */
function find (searchFor, docText) {
  //collect data from document
  let requireContext = docText.match(/^(( |\t)+)?#RequireContext\s\w+/m);
  requireContext = requireContext === null ? "" : requireContext[0].split(" ").pop();

  checkStructs(docText);
  const variables = allVariables(docText);

  //check if it's a declaration of variable or struct
  if((searchFor[0] === "declare" || searchFor[0] === "#Struct" || searchFor[0] === "#Const") && searchFor.length < 3) {
    return [...classes, ...primitives, new Item("persistent",Kind.Keyword)];
  }

  //check delimiter use
  const lastElem = searchFor.pop();

  if (lastElem.indexOf('::') > -1) {
    if(lastElem == '::') {
      lastElem = requireContext;
    } else {
      lastElem = lastElem.slice(0,searchFor.indexOf('::'));
    }
    return findFromDelimeter('::', searchFor);
  }

  if (lastElem.indexOf('.') > -1) {
    lastElem = lastElem.slice(0,lastElem.indexOf('.'));
    lastElem = getVarType(lastElem);
    if(isStruct(lastElem)) {
      return getStructElems(lastElem);
    }
    return findFromDelimeter('.', lastElem);
  }

  if(lastElem.indexOf('#') == 0) {
    return [...modules];
  }

  return [...classes, ...keywords, ...variables, ...findFromDelimeter('.',requireContext)];
}

module.exports = {
  find
}