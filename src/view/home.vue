<script setup>
import { ref, reactive, watch } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import GithubIcon from "../baseComponent/GithubIcon.vue";
import ModeChange from "../components/common/ModeChange.vue";
import { navRoutes } from "../router";
import { useMapStore } from "../store";
import ThemeSwitch from "../baseComponent/ThemeSwitch.vue";

const mapStore = useMapStore();

const router = useRouter();
const handleNav = ({ path, type }) => {
  if (type == "link") {
    window.open(path, "_blank");
    return;
  }
  router.push(path);
};

const activeRoute = ref({ path: "/" });

watch(router.currentRoute, ({ fullPath }) => {
  if (fullPath != activeRoute.value.path) {
    activeRoute.value = navRoutes.filter(({ path }) => path == fullPath)[0];
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
          :class="{ active: activeRoute.path == route.path }"
          v-for="route in navRoutes"
          @click="() => handleNav(route)"
        >
          {{ route.name }}
          <span v-if="route.type == 'link'"
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
              x="0px"
              y="0px"
              viewBox="0 0 100 100"
              width="15"
              height="15"
              class="icon outbound"
            >
              <path
                fill="currentColor"
                d="M18.8,85.1h56l0,0c2.2,0,4-1.8,4-4v-32h-8v28h-48v-48h28v-8h-32l0,0c-2.2,0-4,1.8-4,4v56C14.8,83.3,16.6,85.1,18.8,85.1z"
              ></path>
              <polygon
                fill="currentColor"
                points="45.7,48.7 51.3,54.3 77.2,28.5 77.2,37.2 85.2,37.2 85.2,14.9 62.8,14.9 62.8,22.9 71.5,22.9"
              ></polygon>
            </svg>
          </span>
        </li>
        <li>
          <ThemeSwitch />
        </li>
      </ul>
      <GithubIcon />
    </div>
    <div class="main">
      <router-view />
    </div>
    <ModeChange v-if="activeRoute.type == 'map'" />
  </div>
</template>
<style scoped>
.main {
  height: calc(100% - 60px);
}
.home {
  height: 100%;
  width: 100%;
  background: var(--primary-color);
}

.header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: end;
  padding: 0 50px 0 20px;
  background-color: #fff;
  box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.08);
}

ul {
  display: flex;
  list-style: none;
}

li {
  cursor: pointer;
  font-size: 16px;
  margin: 0 10px;
  color: #333;
  opacity: 0.6;
  margin-right: 40px;
  font-weight: 700;
  display: flex;
  align-items: center;
}

li:hover,
li.active {
  opacity: 1;
}
</style>
