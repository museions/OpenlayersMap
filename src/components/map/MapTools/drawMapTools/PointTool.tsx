import { Coordinate } from "ol/coordinate";
import Map from "ol/Map";
import Feature from "ol/Feature";
import * as olStyle from "ol/style";
import { Point } from "ol/geom";
import { Type } from "ol/geom/Geometry";
import Overlay from "ol/Overlay";
import { getSVGForSrcById } from "../../../../util";
import { BaseTool } from "./BaseTool";

// 创建 overlay 内容的函数
function createOverlayElement(content: string, uuid: string) {
  var element = document.createElement("div");
  element.className = `popMarker`;
  element.id = `marker_${uuid}`;
  element.innerHTML = content;
  return element;
}

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
      const overlay = this.addOverlay(coord);
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

  addOverlay(coordinate: Coordinate) {
    var overlay = new Overlay({
      element: createOverlayElement("Your text content", this.uuid), // 创建 overlay 的内容
      positioning: "bottom-center",
      offset: [15, -30],
      position: coordinate,
      autoPan: true,
    });

    this.map.addOverlay(overlay);
    return overlay;
  }

  addMarker(coordinate: Coordinate) {
    const that = this;
    let marker = new Feature({
      id: that.uuid,
      geometry: new Point(coordinate),
    });

    var markerStyle = new olStyle.Style({
      image: new olStyle.Icon({
        anchor: [0.5, 1],
        src: getSVGForSrcById({}),
        scale: 1,
      }),
    });
    marker.setStyle(markerStyle);
    that.vectorLayer.getSource().addFeature(marker);

    return marker;
  }

  removeListener() {
    this.map.un("click", this.handle);
    this.mapEl?.classList.remove("draw");
  }
}
