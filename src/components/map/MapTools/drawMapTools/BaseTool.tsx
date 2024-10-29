import Map from "ol/Map";
import BaseLayer from "ol/layer/Base";
import { Type } from "ol/geom/Geometry";
import { LAYER_NAMES } from "../../../../baseComponent/OpenlayersMap/layers";

export class BaseTool {
  map: Map;
  callback: Function = () => {};
  mapEl = document.querySelector(".ol-viewport");
  uuid: string = "";
  vectorLayer!: BaseLayer | undefined;
  type: Type;

  constructor({
    map,
    uuid,
    type,
    cb,
  }: {
    map: Map;
    uuid: string;
    type: Type;
    cb: Function;
  }) {
    this.map = map;
    this.uuid = uuid;
    this.callback = cb;
    this.type = type;
    this.vectorLayer = map
      .getLayers()
      .getArray()
      .find((i) => i.getClassName() == LAYER_NAMES.VECTOR_LAYER);
  }

  init() {
    /*** 实例化后执行初始化方法*/
  }
}
