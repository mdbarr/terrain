#!/usr/bin/env node

'use strict';

const barrkeep = require('barrkeep');
const perlin = require('perlin-noise');

////////////////////

let width = 80;
let height = 24;

if (process.stdout.isTTY) {
  width = process.stdout.columns;
  height = process.stdout.rows;
}

const noise = perlin.generatePerlinNoise(width, height, {
  octaveCount: 4
});

////////////////////

const colors = [
  'NavyBlue',
  'DarkBlue',
  'DarkBlue',
  'Blue3',
  'Blue3',
  'Blue1',
  'Blue1',
  'DodgerBlue1',
  'DodgerBlue1',
  'DeepSkyBlue1',
  'DarkKhaki',
  'DarkKhaki',
  'Green4',
  'Green4',
  'Green4',
  'Grey35',
  'Grey50',
  'Grey85',
  'Grey93',
  'White'
];

////////////////////

for (let y = 0; y < height; y++) {
  let line = '';
  for (let x = 0; x < width; x++) {
    const value = noise[(y * width) + x];
    const color = colors[Math.floor(value * colors.length)];

    line += barrkeep.style(' ', `background: ${ color }`);
  }
  console.log(line);
}
