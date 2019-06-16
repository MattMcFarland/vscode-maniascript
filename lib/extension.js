const vscode = require('vscode');
const completions = require('./completions');

exports.activate = function (context) {

  console.log('started');
  var subscriptions = [];

  const callback = function (event) {
    var activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
      var activeDocument = activeEditor.document;
      var activeDocumentLanguage = activeDocument.languageId;
      console.log('Active file language: ' + activeDocumentLanguage);
    }
  }

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider({ scheme: 'file', language: 'maniascript' }, {
      provideCompletionItems(document, position, token) {


        const start = new vscode.Position(position.line, 0);
        const range = new vscode.Range(start, position);
        const text = document.getText(range).replace(/\s+/, "").split(/([ |(])/);

        const completionItems = completions.find(text, document.getText());

        return completionItems;
      }
    }, '.', ':', '#')
  );

  const listener = vscode.window.onDidChangeActiveTextEditor(callback, this, subscriptions);
  const listenerDisposable = vscode.Disposable.from.apply(vscode.Disposable, subscriptions);

}

exports.deactivate = () => { }
