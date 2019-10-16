'use strict';

const fs = require('fs');
const PNG = require('pngjs').PNG;

function rgbToHex (rgb) {
  return `#${ rgb.map(x => { return x.toString(16).padStart(2, '0'); }).join('') }`;
}

module.exports = function(filename, hexMode) {
  const data = fs.readFileSync(filename);
  const png = PNG.sync.read(data);

  const colors = [];

  for (let x = 0; x < png.width * 4; x += 4) {
    const color = [
      png.data[x],
      png.data[x + 1],
      png.data[x + 2]
    ];

    if (png.data[x + 3] !== 255) {
      console.log('Unhandled alpha channel');
    }

    if (hexMode) {
      const hex = rgbToHex(color);
      colors.push(hex);
    } else {
      colors.push(color);
    }
  }

  return colors;
};
