#!/usr/bin/env node

'use strict';

const fs = require('fs');
const PNG = require('pngjs').PNG;
const barrkeep = require('barrkeep');
const minimist = require('minimist');
const perlin = require('perlin-noise');
const extractor = require('./extractor');

////////////////////

let width = 80;
let height = 24;

let octaves = 4;
let amplitude = 0.1;
let persistence = 0.2;
let padStart = 0;
let padEnd = 0;

if (process.stdout.isTTY) {
  width = process.stdout.columns;
  height = process.stdout.rows;
}

const options = minimist(process.argv.slice(2));

if (options.w || options.width) {
  width = parseInt(options.w || options.width);
}

if (options.h || options.height) {
  height = parseInt(options.h || options.height);
}

if (options.s || options.size) {
  width = height = parseInt(options.s || options.size);
}

if (options.octaves) {
  octaves = parseInt(options.octaves);
}

if (options.amplitude) {
  amplitude = parseFloat(options.amplitude);
}

if (options.persistence) {
  persistence = parseFloat(options.persistence);
}

if (options.padding) {
  padStart = padEnd = parseInt(options.padding);
}

if (options.padStart || options['pad-start']) {
  padStart = parseInt(options.padStart || options['pad-start']);
}

if (options.padEnd || options['pad-end']) {
  padEnd = parseInt(options.padEnd || options['pad-end']);
}

////////////////////

const noise = perlin.generatePerlinNoise(width, height, {
  octaveCount: octaves,
  amplitude: amplitude,
  persistence: persistence
});

////////////////////

const defaultColors = [
  [ 56, 39, 201 ],
  [ 56, 40, 201 ],
  [ 56, 42, 201 ],
  [ 56, 44, 201 ],
  [ 55, 46, 201 ],
  [ 55, 47, 201 ],
  [ 55, 49, 201 ],
  [ 55, 51, 202 ],
  [ 55, 53, 202 ],
  [ 55, 55, 202 ],
  [ 55, 57, 202 ],
  [ 54, 59, 202 ],
  [ 54, 60, 202 ],
  [ 54, 62, 202 ],
  [ 54, 64, 202 ],
  [ 54, 66, 202 ],
  [ 54, 68, 202 ],
  [ 53, 70, 202 ],
  [ 53, 71, 203 ],
  [ 53, 74, 203 ],
  [ 53, 75, 203 ],
  [ 53, 77, 203 ],
  [ 53, 79, 203 ],
  [ 53, 81, 203 ],
  [ 52, 83, 203 ],
  [ 52, 85, 203 ],
  [ 52, 86, 203 ],
  [ 52, 89, 203 ],
  [ 52, 90, 203 ],
  [ 52, 92, 204 ],
  [ 52, 94, 204 ],
  [ 51, 96, 204 ],
  [ 51, 98, 204 ],
  [ 51, 100, 204 ],
  [ 52, 102, 204 ],
  [ 55, 105, 206 ],
  [ 58, 109, 208 ],
  [ 62, 113, 209 ],
  [ 65, 116, 211 ],
  [ 68, 119, 213 ],
  [ 72, 123, 215 ],
  [ 75, 126, 217 ],
  [ 79, 130, 218 ],
  [ 82, 133, 220 ],
  [ 85, 137, 221 ],
  [ 89, 140, 223 ],
  [ 92, 143, 225 ],
  [ 95, 147, 227 ],
  [ 98, 151, 228 ],
  [ 102, 154, 230 ],
  [ 105, 157, 232 ],
  [ 109, 161, 234 ],
  [ 112, 165, 235 ],
  [ 115, 168, 237 ],
  [ 118, 171, 239 ],
  [ 122, 175, 240 ],
  [ 125, 178, 242 ],
  [ 130, 183, 244 ],
  [ 125, 182, 247 ],
  [ 174, 212, 232 ],
  [ 198, 230, 179 ],
  [ 146, 201, 128 ],
  [ 99, 175, 76 ],
  [ 71, 159, 44 ],
  [ 71, 156, 45 ],
  [ 69, 152, 43 ],
  [ 67, 148, 42 ],
  [ 65, 145, 40 ],
  [ 64, 141, 39 ],
  [ 62, 138, 38 ],
  [ 60, 134, 37 ],
  [ 58, 131, 35 ],
  [ 56, 127, 35 ],
  [ 55, 124, 33 ],
  [ 53, 120, 32 ],
  [ 51, 117, 31 ],
  [ 49, 113, 29 ],
  [ 47, 109, 28 ],
  [ 46, 106, 27 ],
  [ 44, 102, 26 ],
  [ 42, 99, 24 ],
  [ 40, 95, 23 ],
  [ 40, 93, 23 ],
  [ 40, 93, 23 ],
  [ 40, 91, 22 ],
  [ 40, 91, 22 ],
  [ 40, 90, 22 ],
  [ 40, 89, 22 ],
  [ 40, 88, 21 ],
  [ 40, 87, 21 ],
  [ 40, 86, 21 ],
  [ 41, 85, 21 ],
  [ 41, 84, 20 ],
  [ 41, 83, 20 ],
  [ 41, 83, 20 ],
  [ 41, 82, 20 ],
  [ 41, 81, 20 ],
  [ 41, 80, 19 ],
  [ 41, 79, 19 ],
  [ 41, 79, 19 ]
];

const colors = (options.palette) ?
  extractor(options.palette, false) : defaultColors;

if (padStart) {
  const start = colors[0];
  for (let s = 0; s < padStart; s++) {
    colors.unshift(start);
  }
}

if (padEnd) {
  const end = colors[colors.length - 1];
  for (let e = 0; e < padEnd; e++) {
    colors.push(end);
  }
}

////////////////////

if (options.png) {
  const data = new Buffer(width * height * 4);

  for (let y = 0, index = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const value = noise[(y * width) + x];
      const color = colors[Math.floor(value * colors.length)];

      data[index] = color[0];
      data[index + 1] = color[1];
      data[index + 2] = color[2];
      data[index + 3] = 255;

      index += 4;
    }
  }

  const png = new PNG();
  png.width = width;
  png.height = height;
  png.data = data;

  const filename = (options.o || options.out) || 'terrain.png';
  const buffer = PNG.sync.write(png);

  fs.writeFileSync(filename, buffer);
  console.log(`${ filename }, ${ width } x ${ height } (${ octaves } / ${ amplitude } / ${ persistence })`);
} else {
  // ascii
  for (let y = 0; y < height; y++) {
    let line = '';
    for (let x = 0; x < width; x++) {
      const value = noise[(y * width) + x];
      const rgb = colors[Math.floor(value * colors.length)];

      const color = '#' + rgb.map(c => c.toString(16).padStart(2, '0')).join('');

      line += barrkeep.style(' ', `background: ${ color }`);
    }
    console.log(line);
  }
}
