<template>
  <div>
    <terrain />
    <city />
    <terrain3d />
  </div>
</template>

<script>
import state from '@/state';
import City from '@/components/City';
import Terrain from '@/components/Terrain';
import Terrain3d from '@/components/Terrain3d';

export default {
  name: 'Home',
  components: {
    Terrain, City, Terrain3d,
  },
  data () {
    return { state };
  },
};
</script>
