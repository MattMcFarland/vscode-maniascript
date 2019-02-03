const assert = require('assert')
const fuzz = require('fuzzaldrin')
const {classes, classMethods, classProps} = require('./classes')
const primitives = require('./primitives')
const keywords = require('./keywords')
const modules = require('./modules')
const { CompletionItem: Item, CompletionItemKind: Kind} = require('vscode')
const index = [...classes, ...primitives, ...keywords, ...modules]


function findFromDelimeter(delimeter, searchFor) {
  try {
    assert(delimeter === '::' || delimeter === '.', 'Invalid delimeter');
    const ind = searchFor.indexOf(delimeter);
    const searchFrom = searchFor.slice(0,ind);      
    const searchKey = searchFor.slice(ind+delimeter.length);
    const searchIndex = delimeter === '::' ? classMethods(searchFrom) : classProps(searchFrom);
    return fuzz.filter(searchIndex, searchKey, { key: 'label' });
  } catch (e) {
    console.log('Handled Exception ocurred in findFromDelimeter function', {delimeter, searchFor, searchIndex, searchKey});
    console.log(e)
  }
}


/**
 * find a candidate
 * @param {String} searchFor - query to find
 */
function find (searchFor, document) {
  let requireContext = document.getText().match(/#RequireContext\s\w+/);
  requireContext = requireContext === null ? "" : requireContext[0].split(" ").pop();

  if (searchFor.indexOf('::') > -1) {
    if(searchFor == "::") {
      searchFor = requireContext + "::";
    }
    return findFromDelimeter('::', searchFor);
  }
  if (searchFor.indexOf('.') > -1) {
    return findFromDelimeter('.', searchFor);
  }

  let variables = [];
  const regMatch = /(declare\s(\w+(\[\])?\s)?|#Const\s)\w+/g;
  const matchArray = [...new Set(document.getText().match(regMatch))];
  matchArray.forEach(match => {
    variables.push(new Item(match.split(" ").pop(), Kind.Variable));
  });
  variables = variables.concat(findFromDelimeter('.',requireContext + ".").map(item => new Item(item.insertText, item.kind)));

  return fuzz.filter(index.concat(variables), searchFor, { key: 'label' });
}

module.exports = {
  find
}