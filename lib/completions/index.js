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
    const ind = searchFor.indexOf(delimeter); 
    const searchFrom = searchFor.slice(0,ind);      
    //const searchKey = searchFor.slice(ind+delimeter.length);
    const searchIndex = delimeter === '::' ? classMethods(searchFrom) : classProps(searchFrom);
    return fuzz.filter(searchIndex, "");
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