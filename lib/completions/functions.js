
const { CompletionItem: Item, CompletionItemKind: Kind, SnippetString: Snippet } = require('vscode')
const variables2 = require('./variables');

let allMethodItems = [];

function parse(docText) {
    let allMethodsParams = {};
  
    var line2 = docText.match(/^\s*\b(.*?)\b \b([a-zA-Z][a-zA-Z0-9_]*)\((.*)\)\s*\{/gm);
    if (line2 == null || line2 == undefined) return;
    for (var element of line2) {
        if (element == null || element == undefined) continue;
        var method = element.match(/\b([^()]+)\((.*)\)/);
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
/* 
let textDisplay = funcName + "("
            let textCompletion = textDisplay
            if (params.length > 0) {
                params.forEach((param, index) => {
                    var vari = param.replace(/^\s+/, "").split(" ");
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

*/
function parseFunctions(docText) {
    allMethodItems = [];
    try {
        var signatures = parse(docText);
        for (var funcName in signatures) {
            let textDisplay = funcName + "(";
            let textCompletion = textDisplay;
            let index = 0;
            for (var params of signatures[funcName]['params']) {
                if (params == null || params == undefined) continue;
                variables2.parse("declare " + params);
                var vari = params.replace(/^\s+/, "").split(" ");
                textDisplay += params + ", ";
                textCompletion += "${" + (index + 1) + ":" + vari.pop() + "}, ";
                index += 1;
            }
            textDisplay = textDisplay.substring(0, textDisplay.length - 2);
            textCompletion = textCompletion.substring(0, textCompletion.length - 2);
            textDisplay += ") : " + signatures[funcName]['returnType'];
            textCompletion += ")";
            let newMeth = new Item(textDisplay, Kind.Method);
            newMeth.insertText = new Snippet(textCompletion);

            newMeth.filterText = funcName;
            allMethodItems.push(newMeth);
        }
    } catch (e) {
        console.log(e);
    }
}

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
                    var vari = param.replace(/^\s+/, "").split(" ");
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

function getAllFunctions() {
    return allMethodItems;
}


module.exports = {
    parseFunctions,
    getAllFunctions,
    getFunctionSignatures
}
