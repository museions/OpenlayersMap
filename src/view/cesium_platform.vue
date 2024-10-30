<script setup>
import CesiumMap from "../components/cesium/CesiumMap.vue";
</script>

<template>
  <div class="map-container">
    <CesiumMap />
  </div>
</template>
<style scoped>
.map-container {
  height: calc(100% - 60px);
  width: 100%;
}
</style>