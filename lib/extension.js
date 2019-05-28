const vscode = require('vscode');
const completions = require('./completions');

exports.activate = function (context) {

  const subscriptions = [];
  console.log('started', {context})

  const callback = function (event) {
    var activeEditor = vscode.window.activeTextEditor;
     if (activeEditor) {
        var activeDocument = activeEditor.document;
        var activeDocumentLanguage = activeDocument.languageId;
        console.log('Active file language: ' + activeDocumentLanguage);
     }
  }

  const disposable = vscode.languages.registerCompletionItemProvider('maniascript', {
    provideCompletionItems(document, position, token) {

      const start = new vscode.Position(position.line, 0);
      const range = new vscode.Range(start, position);
      const text = document.getText(range).split(/[ |(]/);
      const completionItems = completions.find(text,document.getText());

      return completionItems;
    }
  }, '.', ':', '#')

  const listener = vscode.window.onDidChangeActiveTextEditor(callback, this, subscriptions);
  const listenerDisposable = vscode.Disposable.from.apply(vscode.Disposable, subscriptions);

  callback(null);
}
exports.deactivate = () => {}
