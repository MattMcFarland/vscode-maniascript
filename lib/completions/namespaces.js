const { CompletionItem: Item, CompletionItemKind: Kind, SnippetString: Snippet, Uri: uri, workspace, window } = require('vscode')
const fs = require('fs');
const namespacesInfo = require('./completions').namespaces;
// const { getFunctionSignatures } = require('./functions.js');

let namespacesNames = []
let namespacesRef = []

let externalLibs = {};
let externalStructs = {};

/**
 * get function signatures from document 
 * doesn't add anything by it self to autocomplete.
 * 
 * @param {string} docText 
 * @return {Item[]} array of autocomplete items
 */
function getFunctionSignatures(docText) {
  let Items = [];
  let allMethods = parse(docText);

  for (var funcName in allMethods) {
      if (allMethods.hasOwnProperty(funcName)) {
          var params = allMethods[funcName]['params'];

          let textDisplay = funcName + "("
          let textCompletion = textDisplay
          if (params.length > 0) {
              params.forEach((param, index) => {
                  var vari = param.replace(/^\s*/, "").split(" ");
                  textDisplay += param + ", ";
                  textCompletion += "${" + (index + 1) + ":" + vari.pop() + "}, ";
              });
              textDisplay = textDisplay.substring(0, textDisplay.length - 2);
              textCompletion = textCompletion.substring(0, textCompletion.length - 2);
          }
          textDisplay += ") : " + allMethods[funcName]['returnType'];
          textCompletion += ")";
          let newMeth = new Item(textDisplay, Kind.Method);
          newMeth.insertText = new Snippet(textCompletion);
          newMeth.filterText = funcName;
          Items.push(newMeth);
      }
  }
  return Items;
}

/**
 * parses document, returns object with structure:
 * {
 *  funcName: {returntype: "Text[]", params: ["Text paramname1", ...]},
 *  funcName2: {returntype: "CMlQuad", params: ["Text paramname2", ... ]}
 *  ...
 * }
 * @param {string} docText 
 */
function parse(docText) {
  let allMethodsParams = {};

  var line2 = docText.match(/^\s*\b(.*?)\b \b([a-zA-Z][a-zA-Z0-9_]*)\((.*)\)\s*\{/gm);

  if (line2 == null || line2 == undefined) return;

  for (var element of line2) {
      if (element == null || element == undefined) continue;
      var method = element.replace(/^s*/, "").match(/\b([^()]+)\((.*)\)/);
      if (method == null || method == undefined) continue;

      if (method.length == 3) {
          let returnType = method[1].split(" ")[0];
          let funcName = method[1].split(" ")[1]
          allMethodsParams[funcName] = {
              returnType: returnType,
              params: []
          };
          if (method[2].replace(/^\s*/, "") == "") continue;

          const params = method[2].match(/([^,]+\(.+?\))|([^,]+)/g);
          if (params !== undefined) {
              for (var vari of params) {
                  if (vari == null || vari == undefined) continue;
                  allMethodsParams[funcName].params.push(vari);
              }
          }
      }
  }
  return allMethodsParams;
}

function parseStructs2(docText) {
  let output = [];

  const regexRule = /#Struct\s*(\w+)\s*\{/gm
  const structLines = docText.match(regexRule);

  if (structLines != null) {
    structLines.forEach(struct => {
      const name = struct.split(/\s/)[1];

      const start = docText.indexOf(struct);
      let end = start;
      for (end; end < docText.length && docText.charAt(end) != "}"; end++);
      if (docText.charAt(end) == "}") {
        const structInfo = docText.slice(start + struct.length, end);
        const re = /(\w+(?:\[(?:\w+?)?\]){0,4})\s*(\w+)\s*;/gm;
        re.lastIndex = 0;
        const structVar = structInfo.match(re);
        let varItems = [];
        let elemTypes = {};

        if (structVar !== null) {
          structVar.forEach(vari => {
            re.lastIndex = 0;
            var avari = re.exec(vari);
            let newMeth = new Item(avari[2] + " : " + avari[1], Kind.Field);
            newMeth.insertText = new Snippet(avari[2]);
            newMeth.filterText = name;
            varItems.push(newMeth);
            elemTypes[avari[2]] = avari[1]; // resolve stuct types by name          
          });
        }
        output.push({ name: name, elemTypes: elemTypes, varItems: varItems })
      }
    });
  }

  return output;
}

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
  externalStructs = {};
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
        let docText = fs.readFileSync(path.uri.fsPath + "/" + fileLocation).toString();
        var signatures = getFunctionSignatures(docText);
        externalStructs[fileLocation] = parseStructs2(docText);
        let outStructs = [];
        for (let struct of externalStructs[fileLocation]) {
          outStructs.push(new Item(struct.name, Kind.Struct));
        }

        externalLibs[fileLocation] = [...signatures, ...outStructs];
      } catch (e) {
        console.log(e);
      }
    }
  }
}

function getExternalStructs() {
  return externalStructs;
}

module.exports = {
  allNamespacesIncluded,
  isNamespace,
  getNamespace,
  namespacesElems,
  resetExternals,
  getExternalStructs,  
}