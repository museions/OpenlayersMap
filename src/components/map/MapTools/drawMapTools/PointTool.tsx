import Map from "ol/Map";
import { Type } from "ol/geom/Geometry";
import { BaseTool } from "./BaseTool";

export class PointTool extends BaseTool {
  handle: Function = () => {};
  constructor({
    map,
    type,
    uuid,
    cb,
  }: {
    map: Map;
    type: Type;
    uuid: string;
    cb: Function;
  }) {
    super({ map, type, uuid, cb });
  }
  init() {
    this.mapEl?.classList.add("draw");
    this.handle = (event: { coordinate: any }) => {
      const coord = event.coordinate;
      const marker = this.addMarker(coord);
      const overlay = this.createOverlay({
        coordinate: coord,
        className: "popMarker",
        offset: [15, -30],
        content:"未命名"
      });
      this.callback({
        operate: "add",
        uuid: this.uuid,
        marker,
        overlay,
      });
      this.removeListener();
    };
    this.map.on("click", this.handle);
  }

  removeListener() {
    this.map.un("click", this.handle);
    this.mapEl?.classList.remove("draw");
  }
}
