const vscode = require('vscode');
const completions = require('./completions');
const { checkStructs, getAllStructs, getStructElemType } = require('./completions/structs.js');
const { resetExternals, allNamespacesIncluded } = require('./completions/namespaces.js');

const templatestringColor = vscode.window.createTextEditorDecorationType({
  isWholeLine: false,
  backgroundColor: { id: "textCodeBlock.background" }
});

const templatestringColor2 = vscode.window.createTextEditorDecorationType({
  overviewRulerColor: { id: "textBlockQuote.border" },
  overviewRulerLane: vscode.OverviewRulerLane.Right,
  isWholeLine: true,
  backgroundColor: { id: "textCodeBlock.background" }
});

const structColor = vscode.window.createTextEditorDecorationType({
  color: { id: "symbolIcon.classForeground" }
});

exports.activate = function (context) {
  var activeEditor = vscode.window.activeTextEditor;
  console.log('started');
  var subscriptions = [];
  let timeout = null;
  allNamespacesIncluded(activeEditor.document.getText());
  updateDecorations();

  function updateDecorations() {
    if (!activeEditor) {
      return;
    }

    const regEx = /"{3}([\s\S]*?"{3})/g;
    const text = activeEditor.document.getText();
    const templates = [];
    const templates2 = [];
    const structs = [];
    let match;
    while (match = regEx.exec(text)) {
      const startPos = activeEditor.document.positionAt(match.index);
      const endPos = activeEditor.document.positionAt(match.index + match[0].length);
      const decoration = { range: new vscode.Range(startPos, endPos) };
      if (startPos.line != endPos.line) {
        templates2.push(decoration);
      } else {
        templates.push(decoration);
      }

    }

    checkStructs(text);
    for (let struct of getAllStructs()) {
      var re = new RegExp("\\b" + struct.label + "\\b", "g");
      let line;
      while (line = re.exec(text)) {
        const startPos = activeEditor.document.positionAt(line.index);
        const endPos = activeEditor.document.positionAt(line.index + line[0].length);
        const decoration = { range: new vscode.Range(startPos, endPos) };
        structs.push(decoration);
      }
    }
    activeEditor.setDecorations(structColor, structs);
    activeEditor.setDecorations(templatestringColor, templates);
    activeEditor.setDecorations(templatestringColor2, templates2);
  }

  function triggerUpdateDecorations() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = undefined;
    }
    timeout = setTimeout(updateDecorations, 500);
  }


  const onActiveEditorChange = function (editor) {
    if (editor) {
      activeEditor = editor;
      var activeDocument = editor.document;
      var activeDocumentLanguage = activeDocument.languageId;
      console.log('Active file language: ' + activeDocumentLanguage);
      resetExternals();
      allNamespacesIncluded(editor.document.getText());
      triggerUpdateDecorations(editor);
    }
  }

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider({ language: 'maniascript', scheme: 'file' }, {
      provideCompletionItems(document, position, token) {
        const start = new vscode.Position(position.line, 0);
        const range = new vscode.Range(start, position);
        let startToCurrent = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(position.line, 0));

        const text = document.getText(range).replace(/^\s*/, "").split(/([ |(])/);
        const text2 = document.getText(startToCurrent);  //limit reading file from start to current line, so variables gets parsed right

        const completionItems = completions.find(text, text2);

        return completionItems;
      }
    }, '.', ':', '#')
  );

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider({ language: 'xml', scheme: 'file' }, {
      provideCompletionItems(document, position, token) {

        const start = new vscode.Position(position.line, 0);
        const range = new vscode.Range(start, position);

        let startToCurrent = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(position.line, 0));
        let index = document.getText(startToCurrent).indexOf("<script>");
        if (index === -1) return [];
        startToCurrent = new vscode.Range(new vscode.Position(index, 0), new vscode.Position(position.line, 0));
        const text = document.getText(range).replace(/^\s*/, "").split(/([ |(])/);
        const text2 = document.getText(startToCurrent);  //limit reading file from start to current line, so variables gets parsed right

        const completionItems = completions.find(text, text2);

        return completionItems;
      }
    }, '.', ':', '#')
  );
  
  const listener = vscode.window.onDidChangeActiveTextEditor(onActiveEditorChange, this, subscriptions);

  const listenerDisposable = vscode.Disposable.from.apply(vscode.Disposable, subscriptions);
  vscode.workspace.onDidChangeTextDocument(event => {
    if (activeEditor && event.document === activeEditor.document) {
      triggerUpdateDecorations();
    }
  }, null, context.subscriptions);

}

exports.deactivate = () => { }
