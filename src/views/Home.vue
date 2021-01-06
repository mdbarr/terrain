<template>
  <div>
    <terrain />
    <city />
  </div>
</template>

<script>
import state from '@/state';
import City from '@/components/City';
import Terrain from '@/components/Terrain';

export default {
  name: 'Home',
  components: {
    Terrain, City,
  },
  data () {
    return { state };
  },
};
</script>
