#!/usr/bin/env node
// Extract colors from a PNG

'use strict';

require('barrkeep');
const fs = require('fs');
const PNG = require('pngjs').PNG;
const minimist = require('minimist');

const options = minimist(process.argv.slice(2));

const filename = options._;
const data = fs.readFileSync(filename);
const png = PNG.sync.read(data);

function rgbToHex(rgb) {
  return '#' + rgb.map(x => x.toString(16).padStart(2, '0')).join('');
}

const colors = [];

for (let x = 0; x < png.width * 4; x += 4) {
  const color = [
    png.data[x],
    png.data[x + 1],
    png.data[x + 2]
  ];

  if (png.data[x + 3] !== 255) {
    console.log('fail');
  }

  const hex = rgbToHex(color);

  if (options.hex) {
    colors.push(hex);
  } else {
    colors.push(color);
  }
}

console.log(colors);
