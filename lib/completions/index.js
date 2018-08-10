const assert = require('assert')
const fuzz = require('fuzzaldrin')
const {classes, classMethods, classProps} = require('./classes')
const primitives = require('./primitives')
const keywords = require('./keywords')
const modules = require('./modules')
const index = [...classes, ...primitives, ...keywords, ...modules]


function findFromDelimeter(delimeter, searchFor) {   
  try {
    assert(delimeter === '::' || delimeter === '.', 'Invalid delimeter');
    const searchKeys = searchFor.split(delimeter);
    let searchFrom = searchKeys[searchKeys.length - 2];       
    let searchKey = searchKeys[searchKeys.length - 1];   
    let searchIndex = delimeter === '::' ? classMethods(searchFrom) : classProps(searchFrom);
    //console.log({delimeter, searchFor, searchIndex, searchFrom, searchKey})
    return fuzz.filter(searchIndex, searchKey)
  } catch (e) {
    console.log('Handled Exception ocurred in findFromDelimeter function', {delimeter, searchFor, searchIndex, searchKey})
    console.log(e)
  }
}


/**
 * find a candidate
 * @param {String} searchFor - query to find
 */
function find (searchFor) {
  if (searchFor.indexOf('::') > -1) {
    return findFromDelimeter('::', searchFor);
  }
  if (searchFor.indexOf('.') > -1) {
    return findFromDelimeter('.', searchFor);
  }  
  return fuzz.filter(index, searchFor, { key: 'label' })
}

module.exports = {
  find
}