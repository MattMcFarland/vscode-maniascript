#!/usr/bin/env node

const tmLanguage = require('maniascript-tmlanguage');

require('fs').writeFileSync('syntaxes/ManiaScript.tmLanguage', tmLanguage.plist);

