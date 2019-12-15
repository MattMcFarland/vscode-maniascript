
const { CompletionItem: Item, CompletionItemKind: Kind, SnippetString: Snippet } = require('vscode');
const { getExternalStructs, getNamespace } = require('./namespaces.js');

/** array of struct names */
let allStructNames = [];

/** Autocomplete items */
let allStruct = [];
let structsElems = [];
let structElemTypes = {};

function parseStructs(docText) {
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

function parseExternalStructs(docText) {
  const re = /(#\bStruct\b)\s+(\w+)::(\w+)\s+as\s+\b(\w+)\b/gm
  const structLines = docText.match(re);
  let output = {};
  if (structLines != null) {
    let externalStructs = getExternalStructs();
    structLines.forEach(struct => {
      re.lastIndex = 0;
      let elems = re.exec(struct);
      if (elems.length == 5) {
        let file = getNamespace(elems[2]);
        if (externalStructs.hasOwnProperty(file)) {
          for (let struct of externalStructs[file]) {
            if (struct.name == elems[3]) {
              output[elems[4]] = struct;
            }
          }
        }
      }
    });
  }
  return output;
}

function checkStructs(docText) {
  allStructNames = [];
  structsElems = [];
  structElemTypes = {};
  allStruct = [];

  const structs = parseStructs(docText);
  for (let struct of structs) {
    allStruct.push(new Item(struct.name, Kind.Struct));
    structsElems.push(struct.varItems);
    structElemTypes[struct.name] = struct.elemTypes;
    allStructNames.push(struct.name);
  }

  const external = parseExternalStructs(docText);
  for (let name in external) {
    const struct = external[name];
    allStruct.push(new Item(name, Kind.Struct));
    structsElems.push(struct.varItems);
    structElemTypes[name] = struct.elemTypes;
    allStructNames.push(name);    
  }

}

function getStructElems(structName) {
  return structsElems[allStructNames.indexOf(structName)];
}

function getAllStructs() {
  return allStruct;
}

function isStruct(structName) {
  return allStructNames.includes(structName);
}

function getStructElemType(structName) {
  if (allStructNames.includes(structName)) {
    return structElemTypes[structName];
  }
  return null;
}

module.exports = {
  checkStructs,
  getStructElems,
  isStruct,
  getAllStructs,
  getStructElemType
}
