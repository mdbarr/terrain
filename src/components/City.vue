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

const STATES = {
  FREE: 0,
  COMMERCIAL: 1,
  FARM: 2,
  FOREST: 3,
  HIGHWAY: 4,
  INDUSTRY: 5,
  PASTURE: 6,
  RESIDENTIAL: 7,
  ROAD: 7,
  SEA: 9,
  URBAN: 10,
};

const COLORS = [
  [ 255, 255, 255 ], // Free
  [ 63, 63, 63 ], // Commercial
  [ 0, 127, 0 ], // Farm
  [ 0, 255, 0 ], // Forest
  [ 0, 0, 0 ], // Highway
  [ 255, 255, 0 ], // Industry
  [ 63, 255, 63 ], // Pasture
  [ 21, 63, 255 ], // Residential
  [ 21, 21, 21 ], // Road
  [ 63, 204, 255 ], // Sea
  [ 63, 0, 204 ], // Urban
];

export default {
  name: 'City',
  data () {
    return {
      state,
      width: 375,
      height: 300,
      city: null,
    };
  },
  mounted () {
    this.generate();
  },
  methods: {
    generate () {
      const canvas = this.$refs.canvas;
      const context = canvas.getContext('2d');

      canvas.width = this.width;
      canvas.height = this.height;
      // Lazy scaling
      canvas.style.width = `${ this.width * 2 }px`;
      canvas.style.height = `${ this.height * 2 }px`;

      context.fillStyle = 'white';
      context.fillRect(0, 0, this.width, this.height);

      //////////

      this.city = new Array(this.width * this.height).fill(STATES.FREE);

      const initial = this.xyToIndex(Math.floor(this.width / 2), Math.floor(this.height / 2));
      this.city[initial] = STATES.RESIDENTIAL;

      //////////

      const imageData = context.getImageData(0, 0, this.width, this.height);

      for (let i = 0, n = 0; i < this.city.length; i++, n += 4) {
        const color = COLORS[this.city[i]];
        imageData.data[n] = color[0];
        imageData.data[n + 1] = color[1];
        imageData.data[n + 2] = color[2];
        imageData.data[n + 3] = 255;
      }

      context.putImageData(imageData, 0, 0);
    },
    indexToXY (i) {
      const x = i % this.width;
      const y = (i - x) / this.width;

      return [ x, y ];
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
    neighborhood (i) {
      return i;
    },
    xyToIndex (x, y) {
      return (this.width * y) + x;
    },
  },
};
</script>
