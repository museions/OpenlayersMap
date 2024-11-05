import { Coordinate } from "ol/coordinate";
import Map from "ol/Map";
import Feature from "ol/Feature";
import { Style, Stroke } from "ol/style";
import Overlay from "ol/Overlay";
import { Draw, Interaction } from "ol/interaction";
import { getDistance } from "ol/sphere";
import { transform } from "ol/proj";
import { unByKey } from "ol/Observable";
import { formatLength, formatDistance } from "../../../../util";
import { BaseTool } from "./BaseTool";
import Geometry, { Type } from "ol/geom/Geometry";

export class MeasureDistanceTool extends BaseTool {
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
      width: 3,
    }),
  });

  draw!: Interaction;

  listenGeometryChange: any;

  sketch!: Feature | null;

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
        ? "移动鼠标，点击左键确定下一点位，鼠标右键结束距离测量"
        : "选择起点，左键单击确认";

      this.helpTooltip.setPosition(coordinate);

      this.helpTooltipElement.innerHTML = helpMsg;
      this.helpTooltipElement.style.display = "block";
    };

    this.map.on("pointermove", this.setHelpTooltip);

    this.draw.on("drawstart", this.handleMeasureLineStart.bind(this));
    this.draw.on("drawend", this.handleMeasureLineEnd.bind(this));
  }
  measureTooltip!: Overlay;

  handleMeasureLineStart(evt: {
    feature: Feature<Geometry>;
    coordinate: Coordinate;
  }) {
    this.measureTooltip = this.createOverlay({
      coordinate: [0, 0],
      offset: [0, -15],
      className: "ol-tooltip ol-tooltip-measure",
      stopEvent: false,
      insertFirst: false,
    });

    const { feature, coordinate } = evt;

    this.sketch = feature;

    let tooltipCoord = coordinate;

    this.listenGeometryChange = feature.getGeometry().on("change", (evt) => {
      const geom = evt.target;
      let output = formatLength(geom);

      let startPoint = geom.getFirstCoordinate();

      this.addMarker({ coordinate: startPoint });

      tooltipCoord = geom.getLastCoordinate(); // 折线的最后一个点的坐标

      this.measureTooltip.getElement().innerHTML = "总长" + output; // 显示计算后的距离

      this.measureTooltip.setPosition(tooltipCoord);

      // 展示分段距离
      const coordinates = geom.getCoordinates().slice(0, -1);
      for (let i = 0; i < coordinates.length; i++) {
        const start = coordinates[i];
        this.formatPonit(start);
        const end = coordinates[i + 1];
        if (!end) {
          continue;
        }
        if (tooltipCoord.join("") != end.join("")) {
          const start4326 = transform(start, "EPSG:3857", "EPSG:4326");
          const end4326 = transform(end, "EPSG:3857", "EPSG:4326");
          const distance = getDistance(start4326, end4326);
          this.createOverlay({
            coordinate: end,
            offset: [0, -15],
            className: "ol-tooltip ol-tooltip-measure",
            stopEvent: false,
            content: formatDistance(distance),
          });
        }
      }
    });
  }

  handleMeasureLineEnd(evt: { feature: Feature }) {
    // 显示距离的div设置类名
    this.measureTooltip.getElement().className = "ol-tooltip ol-tooltip-static";
    this.measureTooltip.setOffset([0, -7]);

    evt.feature.setStyle(this.lineStyle);

    unByKey(this.listenGeometryChange);

    this.map.removeInteraction(this.draw);

    this.mapEl?.classList.remove("draw");

    this.helpTooltipElement.style.display = "none";
    this.map.un("pointermove", this.setHelpTooltip);
  }
}
