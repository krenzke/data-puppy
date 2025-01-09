import { scaleTime } from "@visx/scale";
import { ScaleLinear } from "d3-scale";
import { LineSpec } from "components/timeGraph";
import { dateToAxixLabel } from "utils/timeFormatters";

function maxYDataPoint(lineData: LineSpec[]): number {
  return lineData.reduce((prev, curr) => {
    const lineMax = curr.data.reduce((p, c) => (c.y > p ? c.y : p), 0);
    return lineMax > prev ? lineMax : prev;
  }, 0);
}

function minYDataPoint(lineData: LineSpec[]): number {
  return lineData.reduce((prev, curr) => {
    const lineMax = curr.data.reduce((p, c) => (c.y < p ? c.y : p), Infinity);
    return lineMax < prev ? lineMax : prev;
  }, Infinity);
}

function formatTimestampTick(v: number) {
  const date = new Date(v * 1000);
  return dateToAxixLabel(date);
}

function formatByteTick(v: number) {
  const thresh = 1024;
  if (Math.abs(v) < thresh) {
    return v + " B";
  }
  const units = ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  do {
    v /= thresh;
    ++u;
  } while (Math.abs(v) >= thresh && u < units.length - 1);
  return v.toFixed(1) + " " + units[u];
}

function computeTimestampTicks(scale: ScaleLinear<number, number>) {
  // Use scaleTime to get a 'nice' set
  // of time stamp ticks. Regular number
  // ticks don't space quite right.
  const [t1, t2] = scale.domain();
  return scaleTime()
    .domain([new Date(t1 * 1000), new Date(t2 * 1000)])
    .ticks()
    .map((t) => t.getTime() / 1000);
}

type StringMap = { [key: string]: number };
type NameMap = { [key: string]: { name: string; color: string } };
function formatLineData(rawData: StringMap[], nameMap: NameMap) {
  const keys = Object.keys(nameMap);
  return keys.map((key) => {
    return {
      name: nameMap[key].name,
      color: nameMap[key].color,
      data: rawData.map((d) => {
        return {
          x: d["time"],
          y: d[key] || 0,
        };
      }),
    };
  });
}

export {
  maxYDataPoint,
  minYDataPoint,
  formatTimestampTick,
  computeTimestampTicks,
  formatLineData,
  formatByteTick,
};
