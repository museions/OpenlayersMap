<script setup lang="ts">
import { onMounted } from "vue";
import Map from "ol/Map";
import View from "ol/View";
import * as olProj from "ol/proj";
import { v4 as uuidv4 } from "uuid";
import {
  AMAP_LAYER,
  VECTOR_LAYER,
} from "../../../../baseComponent/OpenlayersMap/layers";
import {
  CENTER,
  ZOOM,
} from "../../../../baseComponent/OpenlayersMap/const.map";
import { SPATIAL_ANALYSIS_TYPES } from "../../../../const";
import addCircleImg from "../../assets/画圆.svg";
import unionImg from "../../assets/交集.svg";
import intersectionImg from "../../assets/交集.svg";
import differenceImg from "../../assets/差集.svg";
import { DrawTool } from "../../MapTools";

let mapInstance: Map;
const initMap = () => {
  mapInstance = new Map({
    layers: [AMAP_LAYER("animationMap"), VECTOR_LAYER()],
    target: "animationMap",
    view: new View({
      center: olProj.fromLonLat(CENTER),
      zoom: ZOOM.INIT + 3,
    }),
  });
};

const DRAWCICRLE = "DRAWCICRLE";

const list = [
  {
    txt: "画圆",
    type: DRAWCICRLE,
    src: addCircleImg,
  },
  {
    ...SPATIAL_ANALYSIS_TYPES[0],
    src: unionImg,
  },
  {
    ...SPATIAL_ANALYSIS_TYPES[1],
    src: intersectionImg,
  },
  {
    ...SPATIAL_ANALYSIS_TYPES[2],
    src: differenceImg,
  },
];

onMounted(() => {
  initMap();
});

const callback = () => {};
const handleClick = (item: { type: string }) => {
  const { type } = item;
  if (type == DRAWCICRLE) {
    let uuid = uuidv4().replace(/-/g, "");
    const tools = new DrawTool({
      map: mapInstance,
      uuid,
      type: "Circle",
      cb: callback,
    });
    tools.init();
  }
};
</script>
<template>
  <div id="animationMap"></div>
  <div class="btn_container">
    <ul>
      <li
        v-for="item in list"
        @click="
          () => {
            handleClick(item);
          }
        "
      >
        <img :src="item.src" alt="" />
        <span>{{ item.txt }}</span>
      </li>
    </ul>
  </div>
</template>
<style scoped>
#animationMap {
  height: 100%;
  width: 100%;
}
.btn_container {
  position: absolute;
  z-index: 5;
  top: 10px;
  right: 20px;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}
ul {
  list-style: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: none;
}

li {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  cursor: pointer;
}

img {
  margin-right: 4px;
  width: 20px;
  height: 20px;
}
</style>
