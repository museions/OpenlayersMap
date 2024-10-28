import { Coordinate } from "ol/coordinate";
import Map from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import Feature from "ol/Feature";
import * as olStyle from "ol/style";
import { Point } from "ol/geom";
import Overlay from "ol/Overlay";
import { getSVGForSrcById } from "../../../../util";
import { LAYER_NAMES } from "../../../../baseComponent/OpenlayersMap/layers";

// 创建 overlay 内容的函数
function createOverlayElement(content: string, uuid: string) {
  var element = document.createElement("div");
  element.className = `popMarker`;
  element.id = `marker_${uuid}`;
  element.innerHTML = content;
  return element;
}

export class PointTool {
  map: Map;
  layers: any = null;
  callback: Function = () => {};
  mapEl = document.querySelector(".ol-viewport");
  uuid: string = "";
  vectorLayer!: VectorLayer;

  constructor({ map, uuid }: { map: Map; uuid: string }) {
    this.map = map;
    this.uuid = uuid;
    this.vectorLayer = map
      .getLayers()
      .getArray()
      .find((i) => i.getClassName() == LAYER_NAMES.VECTOR_LAYER);

    this.mapEl?.classList.add("draw");
    this.map.on("click", this.handle.bind(this));
  }

  handle(event: { coordinate: any }) {
    const coord = event.coordinate;
    const marker = this.addMarker(coord);
    const overlay = this.addOverlay(coord);
    this.callback({
      operate: "add",
      uuid: this.uuid,
      marker,
      overlay,
    });
  }

  insertCb(cb: () => {}) {
    this.callback = cb;
  }

  removeAll() {
    var source = this.layers.vectorLayer.getSource();
    var features = source.getFeatures();
    for (var i = 0; i < features.length; i++) {
      source.removeFeature(features[i]);
    }
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
  }
}
