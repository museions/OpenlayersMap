<script setup>
import { ref, reactive, watch } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import GithubIcon from "../baseComponent/GithubIcon.vue";
import ModeChange from "../components/common/ModeChange.vue";
import { useMapStore } from "../store";
import ThemeSwitch from "../baseComponent/ThemeSwitch.vue";
import Map from "../components/map/index.vue";
</script>

<template>
    <div class="main">
      <ThemeSwitch />
      <Map />
    </div>
</template>
<style scoped>
.main {
  height: calc(100% - 60px);
}
</style>
