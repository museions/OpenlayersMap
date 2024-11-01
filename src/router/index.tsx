import { createRouter, createWebHashHistory } from "vue-router";
import Openlayers from "../view/openlayer_platform.vue";
import cesium_platform from "../view/cesium_platform.vue";
import three_platform from "../view/three_platform.vue";
import mapbox_platform from "../view/mapbox_platform.vue";

export const routes = [
  {
    path: "/",
    redirect: "/openlayers",
    name: "主页",
  },
  {
    path: "/openlayers",
    component: Openlayers,
    name: "Openlayers",
    type: "map",
  },
  {
    path: "/cesium",
    component: cesium_platform,
    name: "Cesium",
    type: "map",
  },
  {
    path: "/threejs",
    component: three_platform,
    name: "Three.js",
  },
  {
    path: "/mapbox",
    component: mapbox_platform,
    name: "Mapbox",
  },
];

export const navRoutes = [
  ...routes,
  {
    path: "https://jinuss.github.io/blog/",
    name: "Blog",
    type: "link",
  },
  {
    path: "https://blog.csdn.net/m0_46281382?type=blog",
    name: "CSDN",
    type: "link",
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
