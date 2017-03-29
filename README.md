# vscode-maniascript

## Development setup

Development closely resembles the development guide suggested in the documentation around [language server development](https://code.visualstudio.com/docs/extensions/example-language-server)

* run `npm install` inside the `maniascript` and `maniascript-server` folders
* open VS Code on `maniascript` and `maniascript-server`

```bash
#For example
cd maniascript
npm install
code .
cd ../maniascript-server
npm install
code .
```
## Developing the server

* open VS Code on `maniascript-server`
* run `npm run compile` or `npm run watch` to build the server and copy it into the `maniascript` folder
* to debug press F5 which attaches a debugger to the server
* to trace the server communication you can enable the setting: `"maniascript.trace.server": "verbose"`

## Developing the extension/client

* open VS Code on `maniascript`
* run F5 to build and debug the extension

**If you want to debug server and extension at the same time; 1st debug extension and then start server debugging**

