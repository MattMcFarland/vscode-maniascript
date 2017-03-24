#!/usr/bin/env node

const tmLanguage = require('maniascript-tmlanguage');

require('fs').writeFileSync('lib/syntaxes/ManiaScript.tmLanguage', tmLanguage.plist);

