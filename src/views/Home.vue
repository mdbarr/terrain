<template>
  <div>
    <terrain />
  </div>
</template>

<script>
import state from '@/state';
import Terrain from '@/components/Terrain';

export default {
  name: 'Home',
  components: { Terrain },
  data () {
    return { state };
  },
};
</script>
