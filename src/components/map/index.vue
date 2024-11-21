<script setup lang="ts">
import { toRaw } from "vue";
import { storeToRefs } from "pinia";
import tlp from "./compass.vue";
import trp from "./trp.vue";
import card from "./card.vue";
import clear from "./clear.vue";
import brp from "./brp.vue";
import topicLayerCard from "./component/topicLayerCard.vue";
import dragPanel from "./dragPanel/index.vue";
import routePlan from "./component/routePlan.vue";
import "./style.css";
import {
  useMapStore,
  usePanelStore,
  useCommonStore,
} from "../../store/index.ts";
import { PANEL_TYPES } from "../../const/const.panel.ts";
import bigPanel from "./component/bigPanel.vue";
import OpenlayersMap from "../../baseComponent/OpenlayersMap/map.vue";
import {
  AMAP_LAYER,
  LAYER_NAMES,
} from "../../baseComponent/OpenlayersMap/layers.ts";
import { THEME_COLOR } from "../../const/const.common.ts";
import { tileLoadFunction } from "../../util/mapTool.ts";

const MapStore = useMapStore();
const PanelStore = usePanelStore();
const commonStore = useCommonStore();

const { type } = storeToRefs(PanelStore);

const { map } = storeToRefs(MapStore);

const getMap = (map) => {
  MapStore.setMap(map);
};

commonStore.$onAction(({ name, after }) => {
  if (name == "setThemeColor") {
    after(({ color }) => {
      console.log(map.value);
      const mapInstance = toRaw(map.value);
      const baseLayer = mapInstance
        .getLayers()
        .getArray()
        .find((i) => i.getClassName() == LAYER_NAMES.AMAP_LAYER);

      if (baseLayer) {
        let source = AMAP_LAYER().getSource();
        if (color == THEME_COLOR.NIGHT) {
          source.setTileLoadFunction(tileLoadFunction);
        }
        baseLayer.setSource(source);
      }
    });
  }
});
</script>
<template>
  <!-- 地图及其控件-->
  <OpenlayersMap @setMap="getMap" />

  <!-- 指南针 -->
  <tlp />

  <!-- 鼠标hover经纬度 -->
  <brp />

  <!-- 顶部panel -->
  <dragPanel />

  <!-- 右侧操作栏 -->
  <trp />

  <!-- 路径规划 -->
  <routePlan v-if="type == PANEL_TYPES.ROUTE_PLAN" />

  <!-- 专题图 -->
  <topicLayerCard />

  <!-- 清除 -->
  <clear />

  <!-- 卡片内容 -->
  <card />

  <!-- 大卡片 -->
  <bigPanel />
</template>
<style scoped></style>
