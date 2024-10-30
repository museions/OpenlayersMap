<script setup>
import { ref, reactive, watch } from "vue";
import { useRouter } from "vue-router";
import GithubIcon from "../baseComponent/GithubIcon.vue";
import ModeChange from "../components/common/ModeChange.vue";
import { navRoutes } from "../router";
import { useMapStore } from "../store";
import { storeToRefs } from "pinia";

const mapStore = useMapStore();

const router = useRouter();
const handleNav = ({ path, type }) => {
  if (type == "link") {
    window.open(path, "_blank");
    return;
  }
  router.push(path);
};

const activeIndex = ref("/");

watch(router.currentRoute, ({ fullPath }) => {
  console.log("🚀 ~ watch ~ fullPath:", fullPath);
  if (fullPath != activeIndex.value) {
    activeIndex.value = fullPath;
    if (fullPath == navRoutes[1].path) {
      mapStore.setMapMode("2D");
    } else if (fullPath == navRoutes[2].path) {
      mapStore.setMapMode("3D");
    } else {
      router.push(fullPath);
    }
  }
});

mapStore.$onAction(({ name, after }) => {
  if (name == "setMapMode") {
    after(({ mode }) => {
      router.push(mode == "2D" ? navRoutes[1].path : navRoutes[2].path);
    });
  }
});
</script>

<template>
  <div class="home">
    <div class="header">
      <ul>
        <li
          :class="{ active: activeIndex == route.path }"
          v-for="route in navRoutes"
          @click="() => handleNav(route)"
        >
          {{ route.name }}
        </li>
      </ul>
      <GithubIcon />
    </div>
    <router-view />
    <ModeChange />
  </div>
</template>
<style scoped>
.home {
  height: 100%;
  width: 100%;
  background: #fff;
}

.header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: end;
  padding: 0 50px 0 20px;
}

ul {
  display: flex;
  list-style: none;
}

li {
  cursor: pointer;
  font-size: 16px;
  margin: 0 10px;
}

li:hover,
li.active {
  color: #17b8ce;
}
</style>
