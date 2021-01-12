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

const SEEDS = 250;
const EVOLUTIONS = 500;
const WINDOW_SIZE = 25;

function random (min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function pick (array) {
  const index = random(0, array.length);
  return array[index];
}

function shuffle (array) {
  for (let i = 0; i < array.length; i++) {
    const j = random(0, array.length);

    const value = array[i];
    array[i] = array[j];
    array[j] = value;
  }
}

//////////

const TYPES = [
  {
    id: 'water', color: [ 53, 90, 203 ],
  },
  {
    id: 'shore', color: [ 198, 203, 178 ],
  },
  {
    id: 'mountain', color: [ 42, 42, 42 ],
  },
  {
    id: 'undeveloped', color: [ 71, 156, 45 ],
  },
  {
    id: 'residential', color: [ 0, 63, 255 ],
  },
  {
    id: 'commercial', color: [ 255, 0, 0 ],
  },
  {
    id: 'industrial', color: [ 63, 0, 204 ],
  },
  {
    id: 'park', color: [ 204, 255, 204 ],
  },
  {
    id: 'road', color: [ 16, 16, 16 ],
  },
];

TYPES.forEach((item, index) => {
  item.value = index;
  item.key = item.id.toUpperCase();

  TYPES[item.key] = item;

  return item;
});

//////////

export default {
  name: 'City',
  data () {
    return {
      state,
      width: 250,
      height: 200,
      scale: 3,
      city: null,
      window: [],
    };
  },
  mounted () {
    this.generate();
  },
  methods: {
    evolve (i) {
      const type = this.city[i];
      const neighbors = this.neighborhood(i);

      if (type === TYPES.WATER || type === TYPES.SHORE || type === TYPES.MOUNTAIN) {
        this.city[i] = type;
      } else if (neighbors.RESIDENTIAL > 4) {
        this.city[i] = TYPES.PARK;
      } if (neighbors.UNDEVELOPED > 6 && (neighbors.RESIDENTIAL !== 0 ||
        neighbors.COMMERCIAL !== 0 || neighbors.INDUSTRIAL !== 0)) {
        const which = Math.max(neighbors.RESIDENTIAL, neighbors.COMMERCIAL, neighbors.INDUSTRIAL);
        if (which === neighbors.RESIDENTIAL) {
          this.city[i] = TYPES.RESIDENTIAL;
        } else if (which === neighbors.COMMERCIAL) {
          this.city[i] = TYPES.COMMERCIAL;
        } else {
          this.city[i] = TYPES.INDUSTRIAL;
        }
      } else if (neighbors.RESIDENTIAL > 3) {
        this.city[i] = TYPES.RESIDENTIAL;
      } else if ((neighbors.RESIDENTIAL > 0 || neighbors.COMMERCIAL > 0 ||
        neighbors.INDUSTRIAL > 0) && neighbors.ROAD === 0) {
        this.city[i] = TYPES.ROAD;
      }
    },
    flipFlopEvolve (x, y) {
      console.log('determining...');
      const candidatesYX = [];
      for (let y0 = y - WINDOW_SIZE; y0 < y + WINDOW_SIZE; y0++) {
        for (let x0 = x - WINDOW_SIZE; x0 < x + WINDOW_SIZE; x0++) {
          if (this.isValid(x0, y0)) {
            candidatesYX.push(this.xyToIndex(x0, y0));
          }
        }
      }
      const candidatesXY = [];
      for (let x0 = x - WINDOW_SIZE; x0 < x + WINDOW_SIZE; x0++) {
        for (let y0 = y - WINDOW_SIZE; y0 < y + WINDOW_SIZE; y0++) {
          if (this.isValid(x0, y0)) {
            candidatesXY.push(this.xyToIndex(x0, y0));
          }
        }
      }

      console.log('evolving...');
      for (let e = 0; e < EVOLUTIONS; e++) {
        if (e % 4 === 0) {
          for (let i = 0; i < candidatesYX.length; i++) {
            this.evolve(candidatesYX[i]);
          }
        } else if (e % 4 === 3) {
          for (let j = candidatesYX.length - 1; j >= 0; j--) {
            this.evolve(candidatesYX[j]);
          }
        } else if (e % 4 === 1) {
          for (let i = 0; i < candidatesXY.length; i++) {
            this.evolve(candidatesXY[i]);
          }
        } else if (e % 4 === 2) {
          for (let j = candidatesXY.length - 1; j >= 0; j--) {
            this.evolve(candidatesXY[j]);
          }
        }
      }
    },
    generate () {
      const canvas = this.$refs.canvas;
      const context = canvas.getContext('2d');

      canvas.width = this.width;
      canvas.height = this.height;
      // Lazy scaling
      canvas.style.width = `${ this.width * this.scale }px`;
      canvas.style.height = `${ this.height * this.scale }px`;

      context.fillStyle = 'white';
      context.fillRect(0, 0, this.width, this.height);

      //////////

      this.city = new Array(this.width * this.height).fill(TYPES.UNDEVELOPED);

      const x = Math.floor(this.width / 2);
      const y = Math.floor(this.height / 2);
      const initial = this.xyToIndex(x, y);
      this.city[initial] = TYPES.UNDEVELOPED;

      const start = Date.now();

      console.log('preseeding...');
      this.preseed(x, y);

      // this.flipFlopEvolve(x, y);
      this.shuffleEvolve(x, y);

      console.log('done -', this.$utils.duration(Date.now() - start));

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
    preseed (x, y) {
      const pickables = [
        TYPES.RESIDENTIAL,
        TYPES.COMMERCIAL,
        TYPES.INDUSTRIAL,
        TYPES.PARK,
        TYPES.ROAD,
      ];

      for (let s = 0; s < SEEDS; s++) {
        const x1 = random(x - WINDOW_SIZE, x + WINDOW_SIZE);
        const y1 = random(y - WINDOW_SIZE, y + WINDOW_SIZE);

        if (this.isValid(x1, y1)) {
          const index = this.xyToIndex(x1, y1);
          this.city[index] = pick(pickables);
        }
      }
    },
    shuffleEvolve (x, y) {
      console.log('determining...');
      const candidates = [];

      for (let y0 = y - WINDOW_SIZE; y0 < y + WINDOW_SIZE; y0++) {
        for (let x0 = x - WINDOW_SIZE; x0 < x + WINDOW_SIZE; x0++) {
          if (this.isValid(x0, y0)) {
            candidates.push(this.xyToIndex(x0, y0));
          }
        }
      }

      console.log('evolving...');
      for (let e = 0; e < EVOLUTIONS; e++) {
        shuffle(candidates);
        for (let i = 0; i < candidates.length; i++) {
          this.evolve(candidates[i]);
        }
      }
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
