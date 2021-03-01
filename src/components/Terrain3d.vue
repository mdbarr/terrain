<template>
  <div>
    <canvas
      ref="canvas"
      class="ma-3"
    />
    <v-card
      width="400"
      class="ma-3"
    >
      <v-card-text>
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="width"
              dense
              label="width"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="height"
              dense
              label="height"
            />
          </v-col>
        </v-row>
        <v-btn
          @click="generate"
        >
          Generate
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import state from '@/state';
import * as Three from '@/three';

const colors = [
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
  [ 41, 79, 19 ],
];

function rgbToInt (color) {
  return color[0] * 65536 + color[1] * 256 + color[2];
}

export default {
  name: 'Terrain3d',
  data () {
    return {
      state,
      canvasWidth: 750,
      canvasHeight: 600,
      width: 100,
      height: 100,
      terrain: null,
      aspect: 0,
      renderer: null,
      scene: null,
      camera: null,
      controls: null,
      needsRender: true,
      plane: null,
    };
  },
  mounted () {
    for (let i = 0; i < colors.length; i++) {
      colors[i] = rgbToInt(colors[i]);
    }

    const canvas = this.$refs.canvas;
    canvas.width = this.canvasWidth;
    canvas.height = this.canvasHeight;
    canvas.style.width = `${ this.canvasWidth }px`;
    canvas.style.height = `${ this.canvasHeight }px`;

    Three.Object3D.DefaultUp = new Three.Vector3(0, 0, 1);

    this.renderer = new Three.WebGLRenderer({
      antialias: true, canvas: this.$refs.canvas,
    });
    this.renderer.setSize(this.canvasWidth, this.canvasHeight);
    this.renderer.setClearColor(0xffffff, 1);
    this.renderer.clear(true, true, true);

    this.scene = new Three.Scene();
    // this.scene.add(new Three.HemisphereLight(0xffffff, 0xbbbbbb, 1));
    this.scene.add(new Three.AmbientLight(0xffffff));

    this.camera = new Three.PerspectiveCamera(60, this.canvasWidth / this.canvasHeight, 0.001, 10000);
    this.camera.position.set(0, 20, 100);

    this.controls = new Three.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.addEventListener('change', () => {
      this.needsRender = true;
    });
    this.controls.update();

    this.generate();

    this.animate();
  },
  methods: {
    generate () {
      if (this.plane) {
        this.scene.remove(this.plane);
        this.plane.geometry.dispose();
        this.plane.material.dispose();
      }

      this.terrain = this.generatePerlinNoise(this.width, this.height, {
        octaveCount: 9, persistence: 0.5, ammplitude: 0.2,
      });

      const geometry = new Three.PlaneGeometry(60, 60, this.width - 1, this.height - 1);
      for (let i = 0; i < geometry.vertices.length; i++) {
        geometry.vertices[i].z = Math.floor(50 - (this.terrain[i] * 50)) - 5;
      }

      for (let j = 0; j < geometry.faces.length; j++) {
        const face = geometry.faces[j];

        const a = geometry.vertices[face.a];
        const b = geometry.vertices[face.b];
        const c = geometry.vertices[face.c];

        const index = Math.min(a.z, b.z, c.z) + 50;

        face.color.set(colors[index]);
      }
      geometry.colorsNeedUpdate = true;

      const material = new Three.MeshBasicMaterial({
        side: Three.DoubleSide,
        vertexColors: Three.VertexColors,
        wireframe: false,
      });

      this.plane = new Three.Mesh(geometry, material);
      this.scene.add(this.plane);

      this.needsRender = true;
    },
    generatePerlinNoise (width, height, options) {
      options = options || {};

      const octaveCount = options.octaveCount || 4;
      const persistence = options.persistence || 0.2;
      const whiteNoise = this.generateWhiteNoise(width, height);

      let amplitude = options.amplitude || 0.1;

      const generateSmoothNoise = (octave) => {
        const noise = new Array(width * height);
        const samplePeriod = Math.pow(2, octave);
        const sampleFrequency = 1 / samplePeriod;
        let noiseIndex = 0;
        for (let y = 0; y < height; ++y) {
          const sampleY0 = Math.floor(y / samplePeriod) * samplePeriod;
          const sampleY1 = (sampleY0 + samplePeriod) % height;
          const vertBlend = (y - sampleY0) * sampleFrequency;
          for (let x = 0; x < width; ++x) {
            const sampleX0 = Math.floor(x / samplePeriod) * samplePeriod;
            const sampleX1 = (sampleX0 + samplePeriod) % width;
            const horizBlend = (x - sampleX0) * sampleFrequency;

            // blend top two corners
            const top = this.interpolate(whiteNoise[sampleY0 * width + sampleX0],
              whiteNoise[sampleY1 * width + sampleX0], vertBlend);
            // blend bottom two corners
            const bottom = this.interpolate(whiteNoise[sampleY0 * width + sampleX1],
              whiteNoise[sampleY1 * width + sampleX1], vertBlend);
            // final blend
            noise[noiseIndex] = this.interpolate(top, bottom, horizBlend);
            noiseIndex += 1;
          }
        }
        return noise;
      };

      const smoothNoiseList = new Array(octaveCount);
      for (let i = 0; i < octaveCount; ++i) {
        smoothNoiseList[i] = generateSmoothNoise(i);
      }
      const perlinNoise = new Array(width * height);
      let totalAmplitude = 0;

      for (let i = octaveCount - 1; i >= 0; --i) {
        amplitude *= persistence;
        totalAmplitude += amplitude;

        for (let j = 0; j < perlinNoise.length; ++j) {
          perlinNoise[j] = perlinNoise[j] || 0;
          perlinNoise[j] += smoothNoiseList[i][j] * amplitude;
        }
      }

      for (let i = 0; i < perlinNoise.length; ++i) {
        perlinNoise[i] /= totalAmplitude;
      }

      return perlinNoise;
    },
    generateWhiteNoise (width, height) {
      const noise = new Array(width * height);
      for (let i = 0; i < noise.length; ++i) {
        noise[i] = Math.random();
      }
      return noise;
    },
    interpolate (x0, x1, alpha) {
      return x0 * (1 - alpha) + alpha * x1;
    },

    isLower (noise, n, x, y) {
      const n2 = this.xyToN(x, y);
      return noise[n2] < noise[n];
    },
    isValid (x, y) {
      if (x < 0 || x > this.width) {
        return false;
      }

      if (y < 0 || y > this.height) {
        return false;
      }

      return true;
    },
    nToXY (n) {
      const x = n % this.width;
      const y = (n - x) / this.width;

      return [ x, y ];
    },
    animate () {
      this.controls.update();

      if (this.needsRender) {
        this.renderer.render(this.scene, this.camera);
        this.needsRender = false;
      }

      requestAnimationFrame(this.animate);
    },
    xyToN (x, y) {
      return (this.width * y) + x;
    },
  },
};
</script>
