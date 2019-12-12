const namespacesInfo = require('./completions').namespaces
const { CompletionItem: Item, CompletionItemKind: Kind, SnippetString: Snippet, Uri: uri, workspace, window } = require('vscode')
let namespacesNames = []
let namespacesRef = []
let fs = require('fs');
let externalLibs = {};

const { getFunctionSignatures } = require('./functions');

/**
 * return namespace elements from namespace, including external libraries
 * 
 * @param {string} namespace 
 * @return {Item[]} array of completionitems
 */
function namespacesElems(namespace) {
  let allElems = [];

  if (externalLibs.hasOwnProperty(namespace)) {
    return externalLibs[namespace];
  }

  const groupEnum = namespacesInfo[namespace].enums || {};
  Object.keys(groupEnum).forEach(groupName => {
    groupEnum[groupName].forEach(enumValue => {
      allElems.push(new Item(groupName + "::" + enumValue, Kind.Enum));
    })
  });

  const groupMethods = namespacesInfo[namespace].methods || {}
  groupMethods.forEach(method => {
    const name = method.name;
    const returns = method.returns;
    const params = method.params;
    let textDisplay = name + "("
    let textCompletion = textDisplay
    if (params.length > 0) {
      params.forEach((param, index) => {
        textDisplay += param.identifier + " " + param.argument + ", ";
        textCompletion += "${" + (index + 1) + ":" + param.argument + "}, ";
      })
      textDisplay = textDisplay.substring(0, textDisplay.length - 2);
      textCompletion = textCompletion.substring(0, textCompletion.length - 2);
    }
    textDisplay += ") : " + returns
    textCompletion += ")"
    let newMeth = new Item(textDisplay, Kind.Method)
    newMeth.insertText = new Snippet(textCompletion)
    newMeth.filterText = name
    allElems.push(newMeth)
  })
  return allElems;
}

/**
 * parse  all namespaces from #Include clauses
 * @param {string} docText 
 * @return {string[]} all namespaces names as array
 */
function allNamespacesIncluded(docText) {
  const regexRule = /^\s*#Include "(\S+)" as (\w+)/gm
  const namespacesMatch = docText.match(regexRule);
  const uniq = [...new Set(namespacesMatch)];
  let allNamespaces = [];
  namespacesNames = [];
  namespacesRef = [];
  uniq.forEach(namespaceDef => {
    let ref = namespaceDef.split("\"")[1];
    let name = namespaceDef.split(" ").pop().replace("\s*", "");
    namespacesRef.push(ref);
    namespacesNames.push(name);
    if (!externalLibs.hasOwnProperty(ref)) {
      parseExternal(ref);
    }
    let newItem = new Item(name + " | " + ref, Kind.Interface)
    newItem.insertText = name;
    newItem.filterText = name;
    allNamespaces.push(newItem);
  });
  return allNamespaces;
}
/**
 * returns if namespace is found
 * @param {string} namespaceName
 * @return {true|false}  
 */
function isNamespace(namespaceName) {
  return namespacesNames.includes(namespaceName);
}

function resetExternals() {
  externalLibs = {};
}

/**
 * get refenence name from namespacename
 * @param {string} namespaceName 
 * @returns {string|null}
 */
function getNamespace(namespaceName) {
  return namespacesRef[namespacesNames.indexOf(namespaceName)];
}
/**
 * Parses external library by filelocaton and adds its contents to autocomplete
 * 
 * @param {string} fileLocation is internally namespacename for example: "Libs/Mylib/Http.Script.txt"
 */
function parseExternal(fileLocation) {
  if (fileLocation.match(/\.script\.txt/i) == null) return;
  for (let path of workspace.workspaceFolders) {
    let file = path.uri.fsPath + "/" + fileLocation;
    if (fs.existsSync(file)) {
      try {
        console.log("adding external library: " + fileLocation);
        let docText = fs.readFileSync(path.uri.fsPath + "/" + fileLocation).toString();
        var signatures = getFunctionSignatures(docText);
        externalLibs[fileLocation] = signatures;
      } catch (e) {
        console.log(e);
      }
    }
  }
}

module.exports = {
  allNamespacesIncluded,
  isNamespace,
  getNamespace,
  namespacesElems,
  resetExternals
}