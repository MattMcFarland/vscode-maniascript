const classes = require('./completions').classes
const { CompletionItem: Item, CompletionItemKind: Kind, SnippetString: Snippet } = require('vscode')

let allPropNames = [];

/**
 * get build-in class methods
 * @param {string} className 
 * @returns {Item[]} 
 */
function classMethods(className) {
  let allMethods = [];

  if (classes.hasOwnProperty(className)) {
    do {
      const groupMethods = classes[className].methods || {};
      allMethods = allMethods.concat(Object.keys(groupMethods).map(label => {
        const params = groupMethods[label].params;
        const name = groupMethods[label].name;
        let textDisplay = name + "(";
        let textCompletion = textDisplay;
        if (params.length > 0) {
          params.forEach((param, index) => {
            textDisplay += param.identifier + " " + param.argument + ", ";
            textCompletion += "${" + (index + 1) + ":" + param.argument + "}, ";
          })
          textDisplay = textDisplay.substring(0, textDisplay.length - 2);
          textCompletion = textCompletion.substring(0, textCompletion.length - 2);
        }
        textDisplay += ") : " + groupMethods[label].returns;
        textCompletion += ")";
        const newMeth = new Item(textDisplay, Kind.Method);
        newMeth.insertText = new Snippet(textCompletion);
        newMeth.filterText = name;
        return newMeth;
      }));

      const groupEnum = classes[className].enums || {}
      Object.keys(groupEnum).forEach(groupName => {
        groupEnum[groupName].forEach(enumValue => {
          allMethods.push(new Item(groupName + "::" + enumValue, Kind.Enum))
        })
      })
      className = classes[className].inherit
    } while (!(className === ""))
  }

  return allMethods;
}

/**
 * returns all class properties 
 * @param {string} className 
 * @returns {Object}
 */
function classProps(className) {
  let allProps = []
  if (classes.hasOwnProperty(className)) {
    do {
      const props = classes[className].props || {};
      Object.keys(props).forEach(groupName => {
        props[groupName].forEach(prop => {
          const itemProp = new Item(prop + " : " + groupName, Kind.Field)
          itemProp.insertText = prop
          itemProp.filterText = prop
          allProps.push(itemProp)
        })
      })
      className = classes[className].inherit
    } while (!(className === ""))
  }
  return allProps
}

/**
 * get property types
 * @param {string} elem
 * @returns {Object} 
 */
function getClassPropTypes(elem) {
  let allProps = {};
  className = elem;
  if (classes.hasOwnProperty(className)) {
    do {
      const props = classes[className].props || {};
      Object.keys(props).forEach(type => {
        props[type].forEach(name => {
          allProps[name] = type;
        })
      })
      className = classes[className].inherit
    } while (!(className === ""))
  }
  return allProps;
}

/**
 * finds all occurances in context class, return completeon items
 * @param {string} elem 
 * @param {string} context 
 * @returns {Item[]}
 */
function findInContext(elem, context) {
  let allProps = [];
  let className = context;
  if (classes.hasOwnProperty(context)) {
    do {
      const props = classes[className].props || {};
      Object.keys(props).forEach(groupName => {
        props[groupName].forEach(prop => {
          if (prop === elem) {
            allProps.push(...classMethods(groupName));
            allProps.push(...classProps(groupName));
          }
        })
      })
      className = classes[className].inherit;
    } while (className !== "");

    return allProps;
  }
}

/**
 * find all types in context class
 * @param {string} elem 
 * @param {string} context 
 * @returns {Object}
 */
function findTypesInContext(elem, context) {
  var out = null;
  let className = context;
  if (classes.hasOwnProperty(context)) {
    do {
      const props = classes[className].props || {};
      Object.keys(props).forEach(groupName => {
        props[groupName].forEach(prop => {
          if (prop === elem) {
            out = groupName;
          }
        })
      })
      className = classes[className].inherit;
    } while (className !== "");

    return out;
  }

}

module.exports = {
  classes: Object.keys(classes).map(label => new Item(label, Kind.Class)),
  classNames: Object.keys(classes),
  classProps,
  classMethods,
  findInContext,
  getClassPropTypes,
  findTypesInContext
}