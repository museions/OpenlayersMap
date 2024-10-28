<script setup>
import { ref, onMounted } from "vue";
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
import { useMapStore, useCardStore, usePanelStore } from "../../store";
import { PANEL_TYPES } from "../../const/const.panel.tsx";
import bigPanel from "./component/bigPanel.vue";
import OpenlayersMap from "../../baseComponent/OpenlayersMap/map.vue";

const cardStore = useCardStore();
const MapStore = useMapStore();
const PanelStore = usePanelStore();

const { type } = storeToRefs(PanelStore);

const getMap = (map) => {
  MapStore.setMap(map);
};
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
</template>
<style scoped></style>
