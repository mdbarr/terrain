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

export default {
  name: 'City',
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

      context.fillStyle = 'white';
      context.fillRect(0, 0, this.width, this.height);

      const imageData = context.getImageData(0, 0, this.width, this.height);

      for (let i = 0; i < 5000; i += 11) {
        imageData.data[200000 + i] = 127;
      }

      context.putImageData(imageData, 0, 0);
    },
  },
};
</script>
