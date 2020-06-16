#!/usr/bin/env node
'strict';

var fs = require('fs');
var process = require('process');
var outPath = process.cwd() + '/src/app/bundle.concat.js'

try {
  if (fs.existsSync(outPath)) {
    fs.unlinkSync(outPath);
  }
}
catch (error) {
  console.error(error);
}