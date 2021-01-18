const Three = require('three');

Three.Line2 = require('three/examples/jsm/lines/Line2').Line2;
Three.LineGeometry = require('three/examples/jsm/lines/LineGeometry').LineGeometry;
Three.LineMaterial = require('three/examples/jsm/lines/LineMaterial').LineMaterial;
Three.OrbitControls = require('three/examples/jsm/controls/OrbitControls').OrbitControls;
Three.STLLoader = require('three/examples/jsm/loaders/STLLoader.js').STLLoader;

// TextGeometry
function TextShapeGeometry (text, parameters) {
  Three.Geometry.call(this);

  this.type = 'TextShapeGeometry';

  this.parameters = {
    text,
    parameters,
  };

  this.fromBufferGeometry(new TextShapeBufferGeometry(text, parameters));
  this.mergeVertices();
}

TextShapeGeometry.prototype = Object.create(Three.Geometry.prototype);
TextShapeGeometry.prototype.constructor = TextShapeGeometry;

// TextShapeBufferGeometry
function TextShapeBufferGeometry (text, parameters) {
  parameters = parameters || {};

  const font = parameters.font;

  if (!(font && font.isFont)) {
    console.error('THREE.TextShapeGeometry: font parameter is not an instance of THREE.Font.');
    return new Three.Geometry();
  }

  const shapes = font.generateShapes(text, parameters.size);

  Three.ShapeBufferGeometry.call(this, shapes);

  this.type = 'TextShapeBufferGeometry';
}

TextShapeBufferGeometry.prototype = Object.create(Three.ShapeBufferGeometry.prototype);
TextShapeBufferGeometry.prototype.constructor = TextShapeBufferGeometry;

Three.TextShapeGeometry = TextShapeGeometry;
Three.TextShapeBufferGeometry = TextShapeBufferGeometry;

module.exports = Three;
