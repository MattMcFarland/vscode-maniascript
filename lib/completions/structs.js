const { CompletionItem: Item, CompletionItemKind: Kind, SnippetString: Snippet } = require('vscode')
let allStructNames = [];
let allStruct = [];
let structsElems = [];
let structElemTypes = {};


function checkStructs(docText) {
  allStructNames = [];
  structsElems = [];
  structElemTypes = {};
  allStruct = [];


  const regexRule = /#Struct\s*(\w+)\s*\{/gm
  const structNames = docText.match(regexRule);

  if (structNames != null) {
    structNames.forEach(struct => { 
      const name = struct.split(/\s/)[1];
      allStruct.push(new Item(name, Kind.Struct));
      const start = docText.indexOf(struct);
      let end = start;
      for (end; end < docText.length && docText.charAt(end) != "}"; end++);
      if (docText.charAt(end) == "}") {
        const structInfo = docText.slice(start+struct.length, end);
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
          structsElems.push(varItems);
          structElemTypes[name] = elemTypes;
          allStructNames.push(name);
        }
      }
    });
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
  if (isStruct(structName)) {
    return structElemTypes[structName];
  }
  return null;
}

module.exports = {
  checkStructs,
  getStructElems,
  isStruct,
  getAllStructs,
  getStructElemType,
}
