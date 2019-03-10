const assert = require('assert')
const fuzz = require('fuzzaldrin')
const {classes, classMethods, classProps} = require('./classes')
const primitives = require('./primitives')
const keywords = require('./keywords')
const modules = require('./modules')
const {checkStructs, getStructElems, isStruct} = require('./structs')
const {allVariables, getVarType} = require('./variables')
const { CompletionItem: Item, CompletionItemKind: Kind} = require('vscode')
const index = [...classes, ...primitives, ...keywords, ...modules]


function findFromDelimeter(delimeter, searchFor) {
  console.log(searchFor);
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
  let requireContext = docText.match(/^(( |\t)+)?#RequireContext\s\w+/m);
  requireContext = requireContext === null ? "" : requireContext[0].split(" ").pop();

  if (searchFor.indexOf('::') > -1) {
    if(searchFor == '::') {
      searchFor = requireContext;
    } else {
      searchFor = searchFor.slice(0,searchFor.indexOf('::'));
    }
    return findFromDelimeter('::', searchFor);
  }

  checkStructs(docText);
  if (searchFor.indexOf('.') > -1) {
    searchFor = searchFor.slice(0,searchFor.indexOf('.'));
    searchFor = getVarType(searchFor);
    if(isStruct(searchFor)) {
      return getStructElems(searchFor);
    }
    return findFromDelimeter('.', searchFor);
  }

  const variables = allVariables(docText);
  const contextVar = findFromDelimeter('.',requireContext);
  let completion = index;
  if(variables.length > 0)
   completion = completion.concat(variables);
  if(contextVar.length > 0)
   completion = completion.concat(contextVar.map(item => new Item(item.insertText, item.kind)));

  return fuzz.filter(completion, searchFor, { key: 'label' });
}

module.exports = {
  find
}