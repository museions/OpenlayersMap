import * as sphere from "ol/sphere";
import { Style, Stroke, Icon } from "ol/style";
import { Geometry, Geometry, Point } from "ol/geom";

export const formatDistance = (dis: number) => {
  if (dis > 100) {
    return Math.round((dis / 1000) * 100) / 100 + " " + "km";
  } else {
    return Math.round(dis * 100) / 100 + " " + "m";
  }
};

export const formatLength = (line: Geometry) => {
  const length = sphere.getLength(line);
  return formatDistance(length);
};

export const formatArea = (area: number) => {
  if (area > 1000000) {
    return Math.round((area / 1000000) * 100) / 100 + " " + "km²";
  } else {
    return Math.round(area * 100) / 100 + " " + "m²";
  }
};

export const getArea = (geometry: Geometry, format = true) => {
  const area = sphere.getArea(geometry);
  return format ? formatArea(area) : area;
};

/**
 *  颜色值添加透明度
 * @param {*} opacity 透明度
 * @param {*} color 旧颜色值
 * @returns
 */
export const convertToRGBA = (opacity: number, color: string) => {
  let rgbaColor = "";

  if (color.includes("rgba")) {
    rgbaColor = color.replace(/[\d\.]+\)$/g, opacity.toString() + ")");
  } else if (color.includes("rgb")) {
    const rgbValues = color.match(/\d+/g);
    const [r, g, b] = rgbValues.map(Number);
    rgbaColor = `rgba(${r},${g},${b},${opacity})`;
  } else {
    const tempDiv = document.createElement("div");
    tempDiv.style.color = color;
    document.body.appendChild(tempDiv);
    const computedColor = window.getComputedStyle(tempDiv).color;
    document.body.removeChild(tempDiv);

    if (computedColor.startsWith("rgb")) {
      const rgbValues = computedColor.match(/\d+/g);
      const [r, g, b] = rgbValues.map(Number);
      rgbaColor = `rgba(${r},${g},${b},${opacity})`;
    } else {
      throw new Error("Invalid color value");
    }
  }

  return rgbaColor;
};

/**
 * 获取图像模板
 * @param {*} imgUrl  图像源
 * @param {*} opacity 透明度
 * @returns
 */
export const getImagePattern = (imgUrl: string, opacity = 1) => {
  return new Promise((resolve, reject) => {
    var img = new Image();
    img.src = imgUrl;
    img.onload = function () {
      var cnv = document.createElement("canvas");
      var ctx = cnv.getContext("2d");
      cnv.width = img.width;
      cnv.height = img.height;
      ctx.drawImage(img, 0, 0);

      var imageData = ctx.getImageData(0, 0, cnv.width, cnv.height);
      var data = imageData.data;

      for (var i = 3; i < data.length; i += 4) {
        data[i] = opacity * 255;
      }
      ctx.putImageData(imageData, 0, 0);
      var pattern = ctx.createPattern(cnv, "repeat");
      resolve(pattern);
    };
    img.onerror = function (error) {
      reject(error);
    };
  });
};

export const getStyleFunction = ({
  steps,
  color,
  width,
  imgsrc,
  scale,
  wrapperRotation,
}) => {
  steps = steps || 40;
  scale = scale || 0.5;
  return (feature: { getGeometry: () => any }, resolution: number) => {
    const geometry = feature.getGeometry();
    console.log("🚀 ~ return ~ resolution:", resolution);
    var styles = [
      new Style({
        stroke: new Stroke({
          color: color,
          width: width,
        }),
      }),
    ];
    let length = geometry.getLength();
    let geo_steps = steps * resolution;
    let num = parseInt(length / geo_steps);
    for (let i = 1; i <= num; i++) {
      let fraction = i / (num + 1);
      let arraw_coor = geometry.getCoordinateAt(fraction);
      let previousCoordinate = geometry.getCoordinateAt(fraction - 0.001);
      let nextCoordinate = geometry.getCoordinateAt(fraction + 0.001);
      let rotation = Math.atan2(
        nextCoordinate[1] - previousCoordinate[1],
        nextCoordinate[0] - previousCoordinate[0]
      );
      styles.push(
        new Style({
          geometry: new Point(arraw_coor),
          image: new Icon({
            src: imgsrc,
            scale: scale,
            anchor: [0.5, 0.5],
            anchorXUnits: "fraction",
            anchorYUnits: "fraction",
            rotation: wrapperRotation(rotation),
          }),
        })
      );
    }
    return styles;
  };
};

export const calculateAngle = (points: [any, any, any]) => {
  // 提取坐标点 A, B, C
  const [A, B, C] = points;

  // 计算向量 AB 和 BC
  const AB = { x: B[0] - A[0], y: B[1] - A[1] };
  const BC = { x: C[0] - B[0], y: C[1] - B[1] };

  // 计算点积
  const dotProduct = AB.x * BC.x + AB.y * BC.y;

  // 计算向量的模
  const magnitudeAB = Math.sqrt(AB.x ** 2 + AB.y ** 2);
  const magnitudeBC = Math.sqrt(BC.x ** 2 + BC.y ** 2);

  // 计算余弦值
  const cosTheta = dotProduct / (magnitudeAB * magnitudeBC);

  // 确保 cosTheta 在 -1 和 1 之间
  const clippedCosTheta = Math.max(-1, Math.min(1, cosTheta));

  // 计算夹角（弧度转换为度）
  const angleInRadians = Math.acos(clippedCosTheta);
  const angleInDegrees = angleInRadians * (180 / Math.PI);

  // 计算方向（使用叉积）
  const crossProduct = AB.x * BC.y - AB.y * BC.x;

  // 如果叉积为负
  const angle = crossProduct < 0 ? angleInDegrees - 180 : 180 - angleInDegrees;

  // 计算向量 AB 与水平线 (x轴) 的夹角
  const angleABWithXAxis = -Math.atan2(AB.y, AB.x) * (180 / Math.PI);

  return {
    Angle: Number(Math.abs(angle.toFixed(0))),
    rotate: angleABWithXAxis,
  };
};
