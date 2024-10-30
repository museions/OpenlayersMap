<script setup>
import home from "./view/home.vue";
import IndexModal from "./components/Modals/index.vue";
import live from "./components/live2D/Live2D.vue";
</script>

<template>
  <home />
  <index-modal />
  <live :size="350" :width="350" :height="500"></live>
</template>

<style scoped></style>
