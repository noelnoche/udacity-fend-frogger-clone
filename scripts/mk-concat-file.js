#!/usr/bin/env node
'strict';

var fs = require('fs');
var process = require('process');
var srcJsDir = process.cwd() + '/src/js/';

function readBufferArray(bufferArray) {
  var outPath = srcJsDir + 'bundle.concat.js';

  if (fs.existsSync(outPath)) {
    fs.unlinkSync(outPath);
  }

  bufferArray.forEach(function(item) {
    try {
      fs.appendFileSync(outPath, item, 'utf-8');
    }
    catch (error) {
      console.error(error);
    }
  });
}

var buffer = [];
function readJsFile(filePath, filesArrLen) {
  
  var data = null;
  try {
    data = fs.readFileSync(filePath);
    buffer.push(data);

    if (buffer.length === filesArrLen) {
      console.log('Output concatenated file at ', srcJsDir)
      readBufferArray(buffer);
    }
  }
  catch (error) {
    console.error(error);
  }
}

function concatFiles(filesArray) {

  var filesArrLen = filesArray.length;

  filesArray.forEach(function(file) {
    var fullFilePath = srcJsDir + file;
    readJsFile(fullFilePath, filesArrLen);
  });
}

var files = ['hud.js', 'audio.js', 'lives.js', 'player.js', 'enemies.js', 'gem.js', 'tile.js', 'levels.js', 'engine.js'];
concatFiles(files);
