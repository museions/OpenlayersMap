import Map from "ol/Map";
import { Coordinate } from "ol/coordinate";
import BaseLayer from "ol/layer/Base";
import { Type } from "ol/geom/Geometry";
import { Point } from "ol/geom";
import Overlay, { Positioning } from "ol/Overlay";
import Feature from "ol/Feature";
import { Style, Icon, Circle, Stroke, Fill } from "ol/style";
import { getSVGForSrcById } from "../../../../util";
import { LAYER_NAMES } from "../../../../baseComponent/OpenlayersMap/layers";

export class BaseTool {
  map: Map;
  callback: Function = () => {};
  mapEl = document.querySelector(".ol-viewport");
  uuid: string = "";
  vectorLayer!: BaseLayer | undefined;
  type: Type;
  helpTooltip!: Overlay; //提示文本
  setHelpTooltip: Function = () => void 0;
  helpTooltipElement!: Element;
  drawIng!: boolean; //是否在绘制

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

    this.helpTooltip = this.createOverlay({
      coordinate: [0, 0],
      offset: [15, 0],
      element: document.querySelector("#helpTxt"),
      positioning: "center-left",
    });

    this.helpTooltipElement = this.helpTooltip.getElement();

    this.map.getViewport().addEventListener("mouseleave", () => {
      this.helpTooltipElement.style.display = "none";
    });

    this.map.getViewport().addEventListener("mouseenter", () => {
      if (this.drawIng) {
        this.helpTooltipElement.style.display = "block";
      }
    });
  }

  createOverlay({
    coordinate,
    className = "",
    offset,
    stopEvent = true,
    insertFirst = true,
    content = "",
    element = null,
    positioning = "bottom-center",
  }: {
    coordinate: Coordinate;
    className?: string;
    content?: string;
    offset: Array<number>;
    stopEvent?: boolean;
    insertFirst?: boolean;
    element?: Element | null;
    positioning?: Positioning;
  }) {
    var overlay = new Overlay({
      element:
        element ||
        this.createOverlayElement({
          content: content,
          uuid: this.uuid,
          className,
        }),
      positioning: positioning,
      offset: offset || [15, -30],
      position: coordinate,
      autoPan: false,
      stopEvent: stopEvent,
      insertFirst: insertFirst,
    });

    this.map.addOverlay(overlay);
    return overlay;
  }

  createOverlayElement({
    content,
    uuid,
    className,
  }: {
    content: string;
    uuid: string;
    className: string;
  }) {
    var element = document.createElement("div");
    element.className = className || `popOverlay`;
    element.id = `overlay_${uuid}_${content}`;
    element.innerHTML = content;
    return element;
  }

  addMarker({
    coordinate,
    symbolId = "icon-symbol-one",
    color = "red",
    anchor = [0.5, 1],
  }: {
    coordinate: Coordinate;
    symbolId?: string;
    color?: string;
    anchor?: Array<number>;
  }) {
    const { uuid, vectorLayer } = this;
    let marker = new Feature({
      id: uuid,
      geometry: new Point(coordinate),
    });

    var markerStyle = new Style({
      image: new Icon({
        anchor: anchor,
        src: getSVGForSrcById({ symbolId, color }),
        scale: 1,
      }),
    });
    marker.setStyle(markerStyle);
    vectorLayer?.getSource().addFeature(marker);

    return marker;
  }

  formatPonit(coordinate: Coordinate) {
    const point = new Point(coordinate);
    const pointFeature = new Feature({
      geometry: point,
    });
    pointFeature.setStyle(
      new Style({
        image: new Circle({
          radius: 5,
          stroke: new Stroke({
            color: "red",
            width: 2,
          }),
          fill: new Fill({
            color: "#fff",
          }),
        }),
      })
    );
    this.vectorLayer?.getSource().addFeature(pointFeature);
  }
  init() {
    /*** 实例化后执行初始化方法*/
  }
}
