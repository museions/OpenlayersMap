import Map from "ol/Map";
import Feature from "ol/Feature";
import { Style, Stroke, Fill } from "ol/style";
import { Draw, Interaction } from "ol/interaction";
import { createRegularPolygon, createBox } from "ol/interaction/Draw";
import { TYPES } from "../../../../const/const.map";
import { BaseTool } from "./BaseTool";
import { Type } from "ol/geom/Geometry";

export class DrawTool extends BaseTool {
  drawStyle: Style = new Style({
    stroke: new Stroke({
      color: "red",
      width: 2,
    }),
    fill: new Fill({
      color: "rgba(255, 0, 0, 0.2)",
    }),
  });
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
    this.initInteraction();
  }

  initInteraction() {
    let draw: Interaction | undefined;
    if ([TYPES.CIRCLE, TYPES.RECT].includes(this.type)) {
      draw = new Draw({
        source: this.vectorLayer?.getSource(),
        type: "Circle",
        style: this.drawStyle,
        freehand: true,
        geometryFunction:
          this.type === TYPES.CIRCLE ? createRegularPolygon(12) : createBox(),
      });
    } else {
      draw = new Draw({
        source: this.vectorLayer?.getSource(),
        type: this.type,
        style: this.drawStyle,
      });
    }

    this.map.addInteraction(draw);

    draw.on("drawend", (evt: { feature: Feature }) => {
      evt.feature.setStyle(this.drawStyle);
      evt.feature.setId(this.uuid);

      this.map.removeInteraction(draw);
      this.callback({
        operate: "add",
        type: this.type,
        uuid: this.uuid,
        feature: evt.feature,
      });
    });
  }
}
