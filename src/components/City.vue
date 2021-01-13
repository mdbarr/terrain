<template>
  <div>
    <canvas
      ref="offscreen"
      style="display: none;"
    />
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

const SEEDS = 200;
const EVOLUTIONS = 10;
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
    id: 'undeveloped', color: [ 255, 255, 255 ],
  },
  {
    id: 'residential', color: [ 3, 169, 244 ],
  },
  {
    id: 'commercial', color: [ 244, 67, 55 ],
  },
  {
    id: 'industrial', color: [ 255, 152, 1 ],
  },
  {
    id: 'park', color: [ 139, 195, 74 ],
  },
  {
    id: 'road', color: [ 102, 102, 102 ],
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
      width: 125,
      height: 100,
      scale: 6,
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
      } else if (type === TYPES.UNDEVELOPED && neighbors.ROAD < 4 &&
        ((neighbors.NE === TYPES.ROAD && neighbors.SW === TYPES.ROAD) ||
          (neighbors.NW === TYPES.ROAD && neighbors.SE === TYPES.ROAD) ||
          neighbors.VERTICAL === TYPES.ROAD || neighbors.HORIZONTAL === TYPES.ROAD)) {
        this.city[i] = TYPES.ROAD;
      } else if (neighbors.RESIDENTIAL > 5 && (type === TYPES.RESIDENTIAL || type === TYPES.UNDEVELOPED)) {
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
      } else if ((neighbors.RESIDENTIAL > 0 || neighbors.COMMERCIAL > 0 ||
        neighbors.INDUSTRIAL > 0) && neighbors.ROAD === 0) {
        this.city[i] = TYPES.ROAD;
      } else if (neighbors.HORIZONTAL !== TYPES.UNDEVELOPED && neighbors.ROAD < 2 &&
        neighbors.HORIZONTAL === neighbors.VERTICAL) {
        this.city[i] = TYPES.ROAD;
      } else if (type === TYPES.UNDEVELOPED && neighbors.PARK > 0 && neighbors.COMMERCIAL === 0 &&
        neighbors.INDUSTRIAL === 0 && neighbors.RESIDENTIAL === 0 && neighbors.ROAD === 0) {
        this.city[i] = TYPES.PARK;
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
      const offscreen = this.$refs.offscreen;
      const context = offscreen.getContext('2d');

      offscreen.width = this.width;
      offscreen.height = this.height;
      offscreen.style.width = `${ this.width }px`;
      offscreen.style.height = `${ this.height }px`;

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

      console.log(this.neighborhood(initial));

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

      // Scale
      const canvas = this.$refs.canvas;
      canvas.width = this.width * this.scale;
      canvas.height = this.height * this.scale;
      canvas.style.width = `${ this.width * this.scale }px`;
      canvas.style.height = `${ this.height * this.scale }px`;

      const ctx = canvas.getContext('2d');
      const scaledData = this.scaleImageData(ctx, imageData, this.scale);
      ctx.putImageData(scaledData, 0, 0);
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
      const [ x, y ] = this.indexToXY(i);

      const directions = {
        N: [ x, y - 1 ],
        NE: [ x + 1, y - 1 ],
        E: [ x + 1, y ],
        SE: [ x + 1, y + 1 ],
        S: [ x, y + 1 ],
        SW: [ x - 1, y + 1 ],
        W: [ x - 1, y ],
        NW: [ x - 1, y - 1 ],
      };

      const neighbors = {};
      for (const type of TYPES) {
        neighbors[type.key] = 0;
      }

      for (const direction in directions) {
        const coord = directions[direction];

        if (this.isValid(...coord)) {
          const which = this.which(...coord);

          neighbors[which.key]++;
          neighbors[direction] = which;
        }
      }

      if (neighbors.N && neighbors.N === neighbors.S) {
        neighbors.VERTICAL = neighbors.N;
      }

      if (neighbors.E && neighbors.E === neighbors.W) {
        neighbors.HORIZONTAL = neighbors.E;
      }

      return neighbors;
    },
    preseed (x, y) {
      const pickables = [
        TYPES.RESIDENTIAL,
        TYPES.COMMERCIAL,
        TYPES.INDUSTRIAL,
        TYPES.PARK,
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
    scaleImageData (context, imageData, scale) {
      const scaled = context.createImageData(imageData.width * scale, imageData.height * scale);

      for (let row = 0; row < imageData.height; row++) {
        for (let col = 0; col < imageData.width; col++) {
          const sourcePixel = [
            imageData.data[(row * imageData.width + col) * 4 + 0],
            imageData.data[(row * imageData.width + col) * 4 + 1],
            imageData.data[(row * imageData.width + col) * 4 + 2],
            imageData.data[(row * imageData.width + col) * 4 + 3],
          ];
          for (let y = 0; y < scale; y++) {
            const destRow = row * scale + y;
            for (let x = 0; x < scale; x++) {
              const destCol = col * scale + x;
              for (let i = 0; i < 4; i++) {
                scaled.data[(destRow * scaled.width + destCol) * 4 + i] =
                  sourcePixel[i];
              }
            }
          }
        }
      }

      return scaled;
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
