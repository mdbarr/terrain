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

const KEYS = {};

const TYPES = [
  {
    id: 'free', color: [ 255, 255, 255 ],
  },
  {
    id: 'commercial', color: [ 63, 63, 63 ],
  },
  {
    id: 'grass', color: [ 0, 200, 0 ],
  },
  {
    id: 'forest', color: [ 0, 127, 0 ],
  },
  {
    id: 'highway', color: [ 0, 0, 0 ],
  },
  {
    id: 'industry', color: [ 255, 255, 0 ],
  },
  {
    id: 'pasture', color: [ 63, 255, 63 ],
  },
  {
    id: 'residential', color: [ 21, 63, 255 ],
  },
  {
    id: 'road', color: [ 21, 21, 21 ],
  },
  {
    id: 'sea', color: [ 63, 204, 255 ],
  },
  {
    id: 'urban', color: [ 63, 0, 204 ],
  },
].map((item, index) => {
  item.value = index;
  item.key = item.id.toUpperCase();

  KEYS[item.key] = item;

  return item;
});

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
    evolve (i) {
      const type = this.city[i];
      const neighbors = this.neighborhood(i);

      if (neighbors.RESIDENTIAL >= 3 && neighbors.SEA === 0 &&
        neighbors.FOREST === 0 && neighbors.INDUSTRY === 0) {
        this.city[i] = KEYS.RESIDENTIAL;
      } else if (neighbors.COMMERCIAL >= 3 && neighbors.SEA === 0 &&
        neighbors.FOREST === 0 && neighbors.INDUSTRY === 0) {
        this.city[i] = KEYS.COMMERCIAL;
      } else if (neighbors.ROAD > 0 && neighbors.RESIDENTIAL > 0) {
        this.city[i] = KEYS.RESIDENTIAL;
      } else if ((neighbors.ROAD > 0 || neighbors.highway > 0) && neighbors.COMMERCIAL > 0) {
        this.city[i] = KEYS.COMMERCIAL;
      } else if (type === KEYS.URBAN || type === KEYS.RESIDENTIAL || type === KEYS.COMMERCIAL) {
        this.city[i] = type; // retain
      } else if ((type === KEYS.FOREST || type === KEYS.PASTURE || type === KEYS.GRASS) &&
        neighbors.COMMERCIAL > 3 && neighbors.HIGHWAY > 0) {
        this.city[i] = KEYS.COMMERCIAL;
      } else if ((type === KEYS.FOREST || type === KEYS.PASTURE || type === KEYS.GRASS) &&
        neighbors.RESIDENTIAL > 4) {
        this.city[i] = KEYS.RESIDENTIAL;
      } else if (neighbors.COMMERCIAL > neighbors.RESIDENTIAL) {
        this.city[i] = KEYS.COMMERCIAL;
      } else if (neighbors.COMMERCIAL < neighbors.RESIDENTIAL) {
        this.city[i] = KEYS.RESIDENTIAL;
      }

      console.log(type.id, this.city[i].id, neighbors);
    },
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

      this.city = new Array(this.width * this.height).fill(KEYS.FOREST);

      const initial = this.xyToIndex(Math.floor(this.width / 2), Math.floor(this.height / 2));
      this.city[initial] = KEYS.RESIDENTIAL;

      this.evolve(initial - 1);

      //////////

      const imageData = context.getImageData(0, 0, this.width, this.height);

      for (let i = 0, n = 0; i < this.city.length; i++, n += 4) {
        const type = this.city[i];
        const color = type.color;
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
      const neighbors = {};
      for (const type of TYPES) {
        neighbors[type.key] = 0;
      }

      for (const neighbor of this.neighbors(i)) {
        const which = this.which(...neighbor);
        neighbors[which.key]++;
      }

      return neighbors;
    },
    neighbors (i) {
      const [ x, y ] = this.indexToXY(i);
      const neighbors = [];

      if (this.isValid(x - 1, y - 1)) {
        neighbors.push([ x - 1, y - 1 ]);
      }
      if (this.isValid(x, y - 1)) {
        neighbors.push([ x, y - 1 ]);
      }
      if (this.isValid(x + 1, y - 1)) {
        neighbors.push([ x + 1, y - 1 ]);
      }

      if (this.isValid(x - 1, y)) {
        neighbors.push([ x - 1, y ]);
      }
      if (this.isValid(x + 1, y)) {
        neighbors.push([ x + 1, y ]);
      }

      if (this.isValid(x - 1, y + 1)) {
        neighbors.push([ x - 1, y + 1 ]);
      }
      if (this.isValid(x, y + 1)) {
        neighbors.push([ x, y + 1 ]);
      }
      if (this.isValid(x + 1, y + 1)) {
        neighbors.push([ x + 1, y + 1 ]);
      }

      return neighbors;
    },
    which (x, y) {
      const index = this.xyToIndex(x, y);
      return this.city[index];
    },
    xyToIndex (x, y) {
      return (this.width * y) + x;
    },
  },
};
</script>
