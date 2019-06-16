const { CompletionItem: Item, CompletionItemKind: Kind, SnippetString: Snippet } = require('vscode')
let allStructNames = [];
let structsElems = [];
let allStruct = [];

function checkStructs(docText) {
  allStructNames = [];
  structsElems = [];
  const regexRule = /^(( |\t)+)?#Struct \w+( )+?\{/gm
  const structNames = docText.match(regexRule);

  if (structNames != null) {
    structNames.forEach(struct => {
      const name = struct.split(" ")[1];

      allStruct.push(new Item(name, Kind.Struct));
      const start = docText.indexOf(struct);
      let end = start;
      for (end; end < docText.length && docText.charAt(end) != "}"; end++);
      if (docText.charAt(end) == "}") {
        const structInfo = docText.slice(start, end);
        const structVar = structInfo.replace(/\s+/, "").match(/\w+( )+\w+(?=;)/gm);
        let varItems = [];
        structVar.forEach(vari => {
          const avari = vari.split(" ");
          var itemName = avari[1] + " : " + avari[0];
          let newMeth = new Item(itemName, Kind.Field);
          newMeth.insertText = new Snippet(avari[1]);
          newMeth.filterText = name;
          varItems.push(newMeth);
        });

        structsElems.push(varItems);
        allStructNames.push(name);
      }
    });
  }
}

function getStructElems(structName) {
  return structsElems[allStructNames.indexOf(structName)];
}

function isStruct(structName) {
  return allStructNames.includes(structName);
}

module.exports = {
  checkStructs,
  getStructElems,
  isStruct
}
