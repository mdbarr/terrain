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
  CITY: 1,
  ROAD: 2,
};

const COLORS = [
  [ 255, 255, 255 ],
  [ 255, 0, 0 ],
  [ 57, 57, 57 ],
];

export default {
  name: 'City',
  data () {
    return {
      state,
      width: 375,
      height: 300,
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

      const values = new Array(this.width * this.height).fill(STATES.FREE);

      const initial = this.xyToIndex(Math.floor(this.width / 2), Math.floor(this.height / 2));
      values[initial] = STATES.CITY;

      //////////

      const imageData = context.getImageData(0, 0, this.width, this.height);

      for (let i = 0, n = 0; i < values.length; i++, n += 4) {
        const color = COLORS[values[i]];
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
    xyToIndex (x, y) {
      return (this.width * y) + x;
    },
  },
};
</script>
