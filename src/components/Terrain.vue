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

function interpolate (x0, x1, alpha) {
  return x0 * (1 - alpha) + alpha * x1;
}

function generateWhiteNoise (width, height) {
  const noise = new Array(width * height);
  for (let i = 0; i < noise.length; ++i) {
    noise[i] = Math.random();
  }
  return noise;
}

function generatePerlinNoise (width, height, options) {
  options = options || {};

  const octaveCount = options.octaveCount || 4;
  const persistence = options.persistence || 0.2;
  const whiteNoise = generateWhiteNoise(width, height);

  let amplitude = options.amplitude || 0.1;

  function generateSmoothNoise (octave) {
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
        const top = interpolate(whiteNoise[sampleY0 * width + sampleX0],
          whiteNoise[sampleY1 * width + sampleX0], vertBlend);
        // blend bottom two corners
        const bottom = interpolate(whiteNoise[sampleY0 * width + sampleX1],
          whiteNoise[sampleY1 * width + sampleX1], vertBlend);
        // final blend
        noise[noiseIndex] = interpolate(top, bottom, horizBlend);
        noiseIndex += 1;
      }
    }
    return noise;
  }

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
}

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

export default {
  name: 'Terrain',
  data () {
    return {
      state,
      width: 750,
      height: 600,
    };
  },
  mounted () {
    this.generate();
  },
  methods: {
    generate () {
      const canvas = this.$refs.canvas;
      const context = canvas.getContext('2d');

      const dpr = window.devicePixelRatio || 1;
      canvas.width = this.width * dpr;
      canvas.height = this.height * dpr;
      canvas.style.width = `${ this.width }px`;
      canvas.style.height = `${ this.height }px`;
      context.scale(dpr, dpr);

      const imageData = context.getImageData(0, 0, this.width, this.height);
      const noise = generatePerlinNoise(this.width, this.height, {
        octaveCount: 8, persistence: 0.5,
      });

      for (let n = 0, i = 0; n < noise.length; n++, i += 4) {
        const color = colors[Math.floor(noise[n] * colors.length)];
        imageData.data[i] = color[0];
        imageData.data[i + 1] = color[1];
        imageData.data[i + 2] = color[2];
        imageData.data[i + 3] = 255;
      }
      context.putImageData(imageData, 0, 0);
    },
  },
};
</script>
