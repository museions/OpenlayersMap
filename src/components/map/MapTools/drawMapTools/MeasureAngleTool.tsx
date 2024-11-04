import { Coordinate } from "ol/coordinate";
import Map from "ol/Map";
import Feature from "ol/Feature";
import { Style, Stroke, Icon } from "ol/style";
import { Draw, Interaction } from "ol/interaction";
import { unByKey } from "ol/Observable";
import { calculateAngle, createAngleSVG } from "../../../../util";
import { BaseTool } from "./BaseTool";
import Geometry, { Type } from "ol/geom/Geometry";
import { Point } from "ol/geom";

export class MeasureAngleTool extends BaseTool {
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

  lineStyle = new Style({
    stroke: new Stroke({
      color: "red",
      width: 1,
    }),
  });

  draw!: Interaction;

  listenGeometryChange: any;

  sketch!: Feature | null;

  lineCount: number = 0;

  init() {
    this.draw = new Draw({
      source: this.vectorLayer?.getSource(),
      type: "LineString",
      style: this.lineStyle,
    });

    this.map.addInteraction(this.draw);

    this.setHelpTooltip = (evt: {
      coordinate: Coordinate;
      dragging: boolean;
    }) => {
      const { coordinate, dragging } = evt;
      if (dragging) {
        return;
      }
      let helpMsg = "";

      helpMsg = this.sketch
        ? "移动鼠标，点击左键确定下一点位"
        : "选择起点，左键单击确认";

      this.helpTooltip.setPosition(coordinate);

      this.helpTooltipElement.innerHTML = helpMsg;
      this.helpTooltipElement.style.display = "block";
    };

    this.map.on("pointermove", this.setHelpTooltip);

    this.draw.on("drawstart", this.handleMeasureLineStart.bind(this));
    this.draw.on("drawend", this.handleMeasureLineEnd.bind(this));
  }

  handleMeasureLineStart(evt: {
    feature: Feature<Geometry>;
    coordinate: Coordinate;
  }) {
    const { feature, coordinate } = evt;

    this.sketch = feature;

    this.listenGeometryChange = feature.getGeometry().on("change", (evt) => {
      const geom = evt.target;

      // 展示分段距离
      const coordinates = geom.getCoordinates().slice(0, -1);

      const pointscount = geom.getCoordinates();
      if (pointscount.length >= 4) {
        console.log(coordinates, calculateAngle(coordinates));
        this.addAngleMark({
          coordinate: coordinates[1],
          Angles: calculateAngle(coordinates),
        });
        this.draw.finishDrawing();
      }
    });
  }

  handleMeasureLineEnd(evt: { feature: Feature }) {
    evt.feature.setStyle(this.lineStyle);

    unByKey(this.listenGeometryChange);

    this.map.removeInteraction(this.draw);

    this.mapEl?.classList.remove("draw");

    this.helpTooltipElement.style.display = "none";
    this.map.un("pointermove", this.setHelpTooltip);
  }

  addAngleMark({
    coordinate,
    Angles,
  }: {
    coordinate: Coordinate;
    Angles: { Angle: number; rotate: number };
  }) {
    const { uuid, vectorLayer } = this;
    let marker = new Feature({
      id: uuid,
      geometry: new Point(coordinate),
    });

    var markerStyle = new Style({
      image: new Icon({
        anchor: [0.5, 0.5],
        src: createAngleSVG(Angles),
        scale: 1,
      }),
    });
    marker.setStyle(markerStyle);
    vectorLayer?.getSource().addFeature(marker);
  }
}
