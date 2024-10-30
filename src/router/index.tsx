import { createRouter, createWebHashHistory } from "vue-router";
import Openlayers from "../view/home.vue";

const routes = [
  {
    path: "/",
    redirect: "/openlayers",
  },
  {
    path: "/openlayers",
    component: Openlayers,
  },
];
const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
