const { CompletionItem: Item, CompletionItemKind: Kind} = require('vscode')
let allStructNames = [];
let structsElems = [];

function structs(docText) {
  let allStruct = [];
  allStructNames = [];
  structsElems = [];
  const regexRule = /^(( |\t)+)?#Struct \w+( )+?\{/gm
  const structNames = docText.match(regexRule);
  structNames.forEach(struct => {
    const name = struct.split(" ")[1];
    allStruct.push(new Item(name, Kind.Struct));
    const start = docText.indexOf(struct);
    let end = start;
    for(end; end < docText.length && docText.charAt(end) != "}"; end++);
    if(docText.charAt(end) == "}") {
      const structInfo = docText.slice(start, end);
      const structVar = structInfo.match(/^(( |\t)+)?\w+( )+\w+(?=;)/gm);
      let varItems = [];
      structVar.forEach(vari => {
        const avari = vari.split(" ");
        varItems.push(new Item(avari[1], Kind.Variable));
      });
      structsElems.push(varItems);
      allStructNames.push(name);
    }
  });
  return allStruct;
}

function getStructElems(structName) {
  return structsElems[allStructNames.indexOf(structName)];
}

function isStruct(structName) {
  return allStructNames.includes(structName);
}

module.exports = {
  structs,
  getStructElems,
  isStruct
}
