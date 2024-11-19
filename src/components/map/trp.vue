<script setup lang="ts">
import { toRaw } from "vue";
import { storeToRefs } from "pinia";
import {
  useMapStore,
  useCardStore,
  useTopicLayerStore,
  usePanelStore,
} from "../../store";
import { TYPES, PANEL_TYPES, DRAW_TYPES } from "../../const";

const { map } = storeToRefs(useMapStore());

const cardStore = useCardStore();

const { active } = storeToRefs(cardStore);

const panelStore = usePanelStore();

const topicLayerStore = useTopicLayerStore();

const handleClickOpIcon = (type: string) => {
  active.value = type;
  //路径规划
  if (type == TYPES.PATHPLAN) {
    panelStore.setPanelType(PANEL_TYPES.ROUTE_PLAN);
    return;
  }

  //专题图
  if (type == TYPES.TOPICTYPES) {
    topicLayerStore.setVisible(true);
    return;
  }

  //画图
  if (Object.values(DRAW_TYPES).includes(type)) {
    cardStore.setMapDrawTool({ drawType: type, map: toRaw(map.value) });
  }
};

const List = [
  { text: "标点", icon: "#icon-point", type: TYPES.POINT },
  { text: "标线", icon: "#icon-line", type: TYPES.LINESTRING },
  { text: "标面", icon: "#icon-polygon", type: TYPES.POLYGON },
  { text: "画圆", icon: "#icon-circle", type: TYPES.CIRCLE },
  { text: "画矩形", icon: "#icon-rect", type: TYPES.RECT },
  {
    text: "测距",
    icon: "#icon-measure-distance",
    type: TYPES.MEASUREDISTANCE,
  },
  {
    text: "量角",
    icon: "#icon-protractor",
    type: TYPES.MEASUREANGLE,
  },
  {
    text: "方位角",
    icon: "#icon-azimuth",
    type: TYPES.AZIMUTH,
  },
  { text: "测面", icon: "#icon-measure-polygon", type: TYPES.MEASUREPOLYGON },
  { text: "路径规划", icon: "#icon-route", type: TYPES.PATHPLAN },
  { text: "专题图", icon: "#icon-topic-layers", type: TYPES.TOPICTYPES },
];
</script>
<template>
  <ul class="Draw_draw__UPVhb">
    <li
      :class="{ active: active == item.type }"
      v-for="item in List"
      @click="() => handleClickOpIcon(item.type)"
    >
      <el-tooltip
        class="box-item"
        effect="dark"
        :content="item.text"
        placement="left"
        :offset="20"
      >
        <span role="img" class="anticon">
          <svg
            width="1em"
            height="1em"
            aria-hidden="true"
            focusable="false"
            class=""
          >
            <use :xlink:href="item.icon"></use>
          </svg>
        </span>
      </el-tooltip>
    </li>
  </ul>
</template>
<style scoped>
ul {
  border-radius: 2px;
  box-shadow: 0 0 4px 2px #b1b1b180;
  position: absolute;
  right: 10px;
  top: 100px;
  z-index: 5;
}

li {
  background-color: var(--primary-color);
  font-size: 22px;
  height: 35px;
  transition: all 0.3s;
  width: 35px;
  align-items: center;
  display: flex;
  justify-content: center;
}

li svg {
  fill: var(--primary-svg-color);
}
ul > li:not(:last-child) {
  border-bottom: 1px solid var(--primary-li-bottom-color);
}

.Draw_draw__UPVhb > li:first-child,
.Draw_draw__UPVhb > li:last-child {
  font-size: 26px;
}

.anticon {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  align-items: center;
  color: inherit;
  display: inline-flex;
  font-style: normal;
  line-height: 0;
  text-align: center;
  text-rendering: optimizelegibility;
  text-transform: none;
  vertical-align: -0.125em;
  font-size: 22px;
}

.anticon > * {
  line-height: 1;
}

.anticon svg {
  display: inline-block;
}

li:hover {
  background-color: var(--primary-svg-hover-color);
  cursor: pointer;
}

ul > li.active {
  color: #3385ff;
}

ul > li.active svg {
  fill: #3385ff !important;
}
</style>
