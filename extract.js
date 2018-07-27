#!/usr/bin/env node
// Extract colors from a PNG

'use strict';

const minimist = require('minimist');
const extractor = require('./extractor');
const options = minimist(process.argv.slice(2));

const filename = options._[0];
if (!filename) {
  console.log('Usage: ./extract.js palette.png');
  process.exit(1);
}

const colors = extractor(filename, options.hex);

console.log(colors);
