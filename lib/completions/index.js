const assert = require('assert')
const fuzz = require('fuzzaldrin')
const {classes, classMethods, classProps} = require('./classes')
const primitives = require('./primitives')
const keywords = require('./keywords')
const modules = require('./modules')
const {structs} = require('./structs')
const { CompletionItem: Item, CompletionItemKind: Kind} = require('vscode')
const index = [...classes, ...primitives, ...keywords, ...modules]


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
  let requireContext = docText.match(/#RequireContext\s\w+/);
  requireContext = requireContext === null ? "" : requireContext[0].split(" ").pop();

  if (searchFor.indexOf('::') > -1) {
    if(searchFor == '::') {
      searchFor = requireContext;
    } else {
      searchFor = searchFor.slice(0,searchFor.length-2)
    }
    return findFromDelimeter('::', searchFor);
  }
  if (searchFor.indexOf('.') > -1) {
    return findFromDelimeter('.', searchFor.slice(0,searchFor.length-1));
  }

  let variables = [];
  const regMatch = /(declare\s(\w+(\[\])?\s)?|#Const\s)\w+/g;
  const matchArray = [...new Set(docText.match(regMatch))];
  matchArray.forEach(match => {
    variables.push(new Item(match.split(" ").pop(), Kind.Variable));
  });
  variables = variables.concat(findFromDelimeter('.',requireContext).map(item => new Item(item.insertText, item.kind)));

  return fuzz.filter(index.concat(variables).concat(structs(docText)), searchFor, { key: 'label' });
}

module.exports = {
  find
}