import { defineStore } from "pinia";
import Map from "ol/Map";
import { v4 as uuidv4 } from "uuid";
import {
  TYPES,
  INIT_LINE_STATE,
  INIT_PLOYGON_STATE,
  INIT_CIRCLE_STATE,
  DRAW_TYPES,
} from "../const/const.map";
import { DrawTool, PointTool } from "../components/map/MapTools";

export const defaultState = {
  type: "",
  uuid: "",
  formData: {},
};
export const useCardStore = defineStore("cardStore", {
  state: () => {
    return {
      list: [],
      showUuid: "",
      active: "",
      drawTool: {},
      drawToolType: "",
    };
  },
  actions: {
    setMapDrawTool({ drawType, map }: { drawType: string; map: Map }) {
      this.drawToolType = drawType;
      let uuid = uuidv4().replace(/-/g, "");

      const cb = (data) => {
        this.addData({ type: drawType, ...data });
      };

      let p = { map, uuid, type: drawType, cb };
      switch (drawType) {
        case DRAW_TYPES.POINT:
          this.drawTool = new PointTool(p);
          break;
        case DRAW_TYPES.LINESTRING:
        case DRAW_TYPES.POLYGON:
        case DRAW_TYPES.CIRCLE:
          this.drawTool = new DrawTool(p);
          break;
      }

      this.drawTool.init();
    },
    setActive(type: string) {
      this.active = type;
    },
    addData(data: { type: string }) {
      const { type } = data;
      let p = { ...defaultState, ...data };
      switch (type) {
        case TYPES.LINESTRING:
          p.formData = INIT_LINE_STATE;
          break;
        case TYPES.POLYGON:
        case TYPES.RECT:
          p.formData = INIT_PLOYGON_STATE;
          break;
        case TYPES.CIRCLE:
          p.formData = INIT_CIRCLE_STATE;
          break;
        default:
      }
      this.list.push({ ...p });
      this.showUuid = data.uuid;
      return p;
    },
    setShowUuid(uuid: string) {
      this.showUuid = uuid;
    },
    setItem(item: Object) {
      this.list.forEach((i: { uuid: string }, index: number) => {
        if (i.uuid == this.showUuid) {
          this.list[index] = { ...i, ...item };
        }
      });
    },
    getItem(): Object {
      return this.list.filter(
        (i: { uuid: string }) => i.uuid == this.showUuid
      )[0];
    },
    removeItem(item: Object) {
      this.list = this.list.filter((i) => i.uuid != item.uuid);
    },
  },
});
