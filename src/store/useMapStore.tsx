import { defineStore } from "pinia";

export const useMapStore = defineStore("mapStore", {
  state: () => {
    return {
      map: {},
      mode: "2D",
      showGrid: false,
      showWaterMarker: false,
    };
  },
  actions: {
    setMap(map: Object) {
      this.map = map;
    },
    setMapMode(mode: string) {
      this.mode = mode;
    },
    setShowGrid(visible: boolean) {
      this.showGrid = visible;
    },
  },
});
