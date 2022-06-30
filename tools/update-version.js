const fs = require('fs');
const pkg = require('../package.json');

const readme = fs.readFileSync('README.md', { encoding: 'utf-8' });
const replaced = readme.replace(/(https:\/\/unpkg.com\/dom-controller@)([0-9]*\.[0-9]*\.[0-9]*)/g, `$1${pkg.version}`)
fs.writeFileSync('README.md', replaced);