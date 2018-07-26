#!/usr/bin/env node

'use strict';

const fs = require('fs');
const PNG = require('pngjs').PNG;
const barrkeep = require('barrkeep');
const minimist = require('minimist');
const perlin = require('perlin-noise');

////////////////////

let width = 80;
let height = 24;

let octaves = 4;
let amplitude = 0.1;
let persistence = 0.2;

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

if (options.octaves) {
  octaves = parseInt(options.octaves);
}

if (options.amplitude) {
  amplitude = parseFloat(options.amplitude);
}

if (options.persistence) {
  persistence = parseFloat(options.persistence);
}

////////////////////

const noise = perlin.generatePerlinNoise(width, height, {
  octaveCount: octaves,
  amplitude: amplitude,
  persistence: persistence
});

////////////////////

const terminalColors = [
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

const pngColors = [
  // ocean
  [ 22, 87, 153 ],
  [ 25, 90, 154 ],
  [ 29, 95, 159 ],
  [ 34, 98, 164 ],
  [ 40, 103, 168 ],
  [ 45, 108, 172 ],
  [ 52, 115, 178 ],
  [ 60, 121, 183 ],
  [ 67, 128, 189 ],
  [ 75, 134, 196 ],
  [ 82, 141, 202 ],
  [ 90, 149, 208 ],
  [ 97, 154, 213 ],
  [ 104, 160, 219 ],
  [ 111, 167, 224 ],
  [ 117, 173, 230 ],
  [ 122, 177, 233 ],
  [ 128, 182, 237 ],
  [ 133, 186, 241 ],
  [ 136, 190, 245 ],
  // land
  [ 43, 96, 3 ],
  [ 42, 95, 2 ],
  [ 49, 104, 10 ],
  [ 55, 113, 17 ],
  [ 62, 124, 25 ],
  [ 67, 131, 32 ],
  [ 74, 139, 40 ],
  [ 80, 143, 49 ],
  [ 89, 145, 65 ],
  [ 104, 147, 88 ],
  [ 122, 149, 114 ],
  [ 142, 152, 139 ],
  [ 186, 182, 188 ],
  [ 255, 255, 255 ]
];

////////////////////

if (options.png) {
  const data = new Buffer(width * height * 4);

  for (let y = 0, index = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const value = noise[(y * width) + x];
      const color = pngColors[Math.floor(value * pngColors.length)];

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
      const color = terminalColors[Math.floor(value * terminalColors.length)];

      line += barrkeep.style(' ', `background: ${ color }`);
    }
    console.log(line);
  }
}
