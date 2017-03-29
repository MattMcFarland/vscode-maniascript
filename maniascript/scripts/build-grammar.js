const rimraf = require('rimraf');
const mkdirp = require('mkdirp');
const tmLanguage = require('maniascript-tmlanguage')
rimraf('./grammar', () => {
  mkdirp('./grammar', () => {
    require('fs').writeFileSync('grammar/ManiaScript.tmLanguage', tmLanguage.plist);
    process.exit(0);
  });
});
