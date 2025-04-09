<script setup lang="ts">
import { onMounted, ref } from "vue";
import Map from "ol/Map";
import View from "ol/View";
import * as olProj from "ol/proj";
import { v4 as uuidv4 } from "uuid";
import {
  AMAP_LAYER,
  VECTOR_LAYER,
} from "../../../../baseComponent/OpenlayersMap/layers.ts";
import {
  CENTER,
  ZOOM,
} from "../../../../baseComponent/OpenlayersMap/const.map.ts";
import { SPATIAL_ANALYSIS_TYPES } from "../../../../const/index.ts";
import addCircleImg from "../../assets/画圆.svg";
import unionImg from "../../assets/并集.svg";
import intersectionImg from "../../assets/交集.svg";
import differenceImg from "../../assets/差集.svg";
import { DrawTool } from "../../MapTools";
import { Feature } from "ol";
import * as turf from "@turf/turf";
import { Style, Stroke, Fill } from "ol/style";
import { Polygon } from "ol/geom";

let mapInstance: Map;
const vectoryLayer = VECTOR_LAYER();
const initMap = () => {
  mapInstance = new Map({
    layers: [AMAP_LAYER("animationMap"), vectoryLayer],
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

let drawTool: DrawTool;

let completedFeatures = ref<Feature[]>([]);

const callback = ({ feature }: { feature: Feature }) => {
  completedFeatures.value.push(feature);
};

const drawCircle = () => {
  let uuid = uuidv4().replace(/-/g, "");
  drawTool = new DrawTool({
    map: mapInstance,
    uuid,
    type: "Circle",
    cb: callback,
  });
  drawTool.init();
};
const getPolygonCollection = () => {
  const polygonCollection = turf.featureCollection(
    completedFeatures.value.map((feature) => {
      const coordinates = (feature.getGeometry() as Polygon)?.getCoordinates();
      return turf.polygon(coordinates);
    })
  );
  return polygonCollection;
};
const getPolygons = () => {
  const p1 = turf.polygon(
    (completedFeatures.value[0]
      .getGeometry() as Polygon)
      ?.getCoordinates()
  );

  const p2 = turf.polygon(
    (completedFeatures.value[1]
      .getGeometry() as Polygon)
      ?.getCoordinates()
  );

  return { p1, p2 };
};

const colors = [
'#82d89f', '#00e6e7', '#f6970a', '#f3352b', '#bd56ec', '#ff523f', '#0281fe', '#f19cdf'
]
const afterStyle = new Style({
  stroke: new Stroke({
    color: colors[2],
    width: 2,
  }),
  // fill: new Fill({
  //   color: "rgba(255, 255, 255, 0.8)",
  // }),
});

let feature: Feature;

const resetFeature = () => {
  if (feature) {
    vectoryLayer.getSource()?.removeFeature(feature);
  }
};
const handleUnionClick = () => {
  const polygonCollection = getPolygonCollection()
  const union = turf.union(polygonCollection);
  if (union) {
    resetFeature();
    feature = new Feature({
      geometry: new Polygon(union?.geometry?.coordinates),
      zIndex: 9,
    });
    feature.setStyle(afterStyle);
    const features = completedFeatures.value;
    // vectoryLayer.getSource()?.clear()
    vectoryLayer.getSource()?.addFeature(feature);
    vectoryLayer.getSource()?.removeFeatures(<Feature []>features);
  }
};

const handleInsertClick = () => {
  const { p1, p2 } = getPolygons();
  const intersection = turf.intersect(turf.featureCollection([p1, p2]));
  if (intersection) {
    resetFeature();
    feature = new Feature({
      geometry: new Polygon(intersection?.geometry?.coordinates),
      zIndex: 9,
    });

    feature.setStyle(afterStyle);

    vectoryLayer.getSource()?.addFeature(feature);
  }
};

const handleDifferenceClick = () => {
  const { p1, p2 } = getPolygons();
  const difference = turf.difference(turf.featureCollection([p1, p2]));
  if (difference) {
    resetFeature();
   feature = new Feature({
      geometry: new Polygon(difference?.geometry?.coordinates),
      zIndex: 9,
    });

    feature.setStyle(afterStyle);

    vectoryLayer.getSource()?.addFeature(feature);
  }
};
const handleClick = (item: { type: string }) => {
  console.log('item', item);
  
  const { type } = item;
  switch (type) {
    case list[0].type:
      drawCircle();
      break;
    case list[1].type:
      handleUnionClick();
      break;
    case list[2].type:
      handleInsertClick();
      break;
    case list[3].type:
      handleDifferenceClick();
      break;
  }
};
</script>
<template>
  <div id="animationMap"></div>
  <div class="btn_container">
    <ul>
      <li v-for="item in list">
        <div
          v-if="
            (completedFeatures.length == 2 && item.type != list[0].type) ||
            (completedFeatures.length < 3 && item.type == list[0].type)
          "
          class="pointer"
          @click="
            () => {
              handleClick(item);
            }
          "
        >
          <img :src="item.src" alt="" />
          <span>{{ item.txt }}</span>
        </div>
        <div v-else>
          <img :src="item.src" alt="" />
          <span>{{ item.txt }}</span>
        </div>
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
  margin-bottom: 10px;
}

li div {
  width: 100%;
  display: flex;
  align-items: center;
  cursor: not-allowed;
}
li div.pointer {
  cursor: pointer;
}

img {
  margin-right: 4px;
  width: 20px;
  height: 20px;
}
</style>
