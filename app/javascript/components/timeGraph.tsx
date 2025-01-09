import React from "react";
import { AxisLeft, AxisBottom } from "@visx/axis";
import { scaleLinear } from "@visx/scale";
import { Line, LinePath } from "@visx/shape";
import { Group } from "@visx/group";
import { Text } from "@visx/text";
import { RectClipPath } from "@visx/clip-path";
import { localPoint } from "@visx/event";
import { ScaleLinear } from "d3-scale";
import { v4 } from "uuid";
import Legend from "components/legend";
import {
  maxYDataPoint,
  minYDataPoint,
  formatTimestampTick,
  computeTimestampTicks,
  formatByteTick,
} from "components/graphHelpers";
import throttle from "utils/throttle";

interface LineDataPoint {
  x: number;
  y: number;
}

export interface LineSpec {
  color: string;
  name: string;
  data: LineDataPoint[];
}

interface EpochSpec {
  id: string;
  name: string;
  x: number;
}

interface Props {
  width: number;
  height: number;
  xDomain: number[];
  yDomain: (number | null)[];
  lineData: LineSpec[];
  yLabel?: string;
  epochs?: EpochSpec[];
  yAxisType?: "number" | "bytes" | "percent";
  allowZoom?: boolean;
  onZoom?: (xMin: number, xMax: number) => void;
  onPan?: (xMin: number, xMax: number) => void;
}

interface State {
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  isZooming: boolean;
  isPanning: boolean;
  initialDragX: number | null;
  currentDragX: number | null;
  activeLineIndex: number | null;
  randId: string;
}

const MARGINS = {
  top: 20,
  bottom: 30,
  left: 65,
  right: 20,
};

function generateScale({
  direction,
  domain,
  width,
  height,
}: {
  direction: "x" | "y";
  domain: number[];
  width: number;
  height: number;
}) {
  const range =
    direction === "x"
      ? [0, width - MARGINS.left - MARGINS.right]
      : [height - MARGINS.top - MARGINS.bottom, 0];
  return scaleLinear({ domain, range });
}

class TimeGraph extends React.Component<Props, State> {
  canvasRectRef = React.createRef<SVGRectElement>();

  constructor(props: Props) {
    super(props);

    const { width, height, xDomain, yDomain, lineData } = this.props;
    const maxData = maxYDataPoint(lineData);
    const minData = minYDataPoint(lineData);

    this.state = {
      yScale: generateScale({
        direction: "y",
        width,
        height,
        domain: [
          yDomain[0] === null ? minData : yDomain[0],
          yDomain[1] === null ? maxData : yDomain[1],
        ],
      }),
      xScale: generateScale({ direction: "x", width, height, domain: xDomain }),
      isZooming: false,
      isPanning: false,
      initialDragX: null,
      currentDragX: null,
      activeLineIndex: null,
      randId: v4(),
    };
  }

  componentDidMount(): void {
    window.addEventListener("mouseup", this.onMouseUp);
    window.addEventListener("keydown", this.onKeyDown);
  }

  componentWillUnmount(): void {
    window.removeEventListener("mouseup", this.onMouseUp);
    window.removeEventListener("keydown", this.onKeyDown);
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    const { width, height, xDomain, yDomain, lineData } = this.props;

    const xDomainChanged =
      prevProps.xDomain[0] !== xDomain[0] ||
      prevProps.xDomain[1] !== xDomain[1];

    const currMax = maxYDataPoint(lineData);
    const prevMax = maxYDataPoint(prevProps.lineData);

    const currMin = minYDataPoint(lineData);
    const prevMin = minYDataPoint(prevProps.lineData);

    const yDomainChanged =
      prevProps.yDomain[0] !== yDomain[0] ||
      prevProps.yDomain[1] !== yDomain[1] ||
      currMax !== prevMax ||
      currMin !== prevMin;

    if (xDomainChanged) {
      const newXScale = generateScale({
        direction: "x",
        domain: xDomain,
        width,
        height,
      });
      this.setState({
        xScale: newXScale,
      });
      if (!this.state.isPanning) {
        this.setState({
          isZooming: false,
          initialDragX: null,
          currentDragX: null,
        });
      }
    }

    if (prevProps.width !== width) {
      const { xScale } = this.state;
      const newXScale = generateScale({
        direction: "x",
        domain: xScale.domain(),
        width,
        height,
      });
      this.setState({ xScale: newXScale });
    }

    if (prevProps.height !== height || yDomainChanged) {
      const newYScale = generateScale({
        direction: "y",
        width,
        height,
        domain: [
          yDomain[0] === null ? currMin : yDomain[0],
          yDomain[1] === null ? currMax : yDomain[1],
        ],
      });
      this.setState({ yScale: newYScale });
    }
  }

  onKeyDown = (e: KeyboardEvent) => {
    if (this.state.isZooming && e.key === "Escape") {
      this.setState({
        isZooming: false,
        initialDragX: null,
        currentDragX: null,
      });
    }
  };

  onMouseDown = (e: React.MouseEvent) => {
    const { allowZoom = true } = this.props;
    if (!allowZoom) return;

    e.preventDefault();
    const point = localPoint(this.canvasRectRef.current!, e);
    if (point) {
      this.setState({ initialDragX: point.x });
    }
  };

  onMouseMove = (e: React.MouseEvent) => {
    const { allowZoom = true } = this.props;
    const { isZooming, isPanning, initialDragX } = this.state;

    if (!allowZoom) return;
    const point = localPoint(this.canvasRectRef.current!, e);
    if (!point) return;

    // update current drag if needed
    if ((isZooming || isPanning) && initialDragX) {
      this.setState({ currentDragX: point.x });
      if (isPanning) {
        this.panTo(point.x);
      }
    } else if (initialDragX && point && Math.abs(point.x - initialDragX) > 5) {
      // only initiate zoom/pan if we've moved reasonable distance while
      // holding the mouse key down
      if (e.ctrlKey) {
        this.setState({ isPanning: true, currentDragX: point.x });
      } else {
        this.setState({ isZooming: true, currentDragX: point.x });
      }
    }
  };

  onMouseUp = () => {
    const { onZoom, allowZoom = true } = this.props;
    if (!allowZoom) return;
    if (this.state.isZooming) {
      const { xScale } = this.state;
      const dLimits = this.dragLimits();
      if (dLimits) {
        const [xMin, xMax] = [
          xScale.invert(dLimits[0]),
          xScale.invert(dLimits[1]),
        ];
        if (onZoom) onZoom(xMin, xMax);
      }
    }

    this.setState({
      isZooming: false,
      isPanning: false,
      initialDragX: null,
      currentDragX: null,
    });
  };

  panTo = throttle((n: number) => {
    const { initialDragX, xScale } = this.state;
    if (initialDragX === null) return;
    if (!this.props.onPan) return;

    // shift xScale domain by n - initialDragX
    const t1 = xScale.invert(initialDragX);
    const t2 = xScale.invert(n);
    const tDiff = t2 - t1;
    this.setState({ initialDragX: n });
    this.props.onPan(xScale.domain()[0] - tDiff, xScale.domain()[1] - tDiff);
  }, 50);

  dragLimits = (): number[] | null => {
    const { xScale, isZooming, initialDragX, currentDragX } = this.state;
    if (!isZooming || initialDragX === null || currentDragX === null)
      return null;

    const range = xScale.range();

    let left = Math.min(initialDragX, currentDragX);
    let right = Math.max(initialDragX, currentDragX);
    left = Math.max(left, range[0]);
    right = Math.min(right, range[1]);

    return [left, right];
  };

  yAxisTickFormat = (v: number) => {
    switch (this.props.yAxisType) {
      case "bytes":
        return formatByteTick(v);
      default:
        return this.state.yScale.tickFormat()(v);
    }
  };

  xAxisTickFormat = (v: number) => formatTimestampTick(v);

  xAxisTicks = () => computeTimestampTicks(this.state.xScale);

  toggleActiveLine = (i: number) => {
    this.setState({
      activeLineIndex: i === this.state.activeLineIndex ? null : i,
    });
  };

  render() {
    const {
      width,
      height,
      yLabel,
      lineData,
      epochs = [],
      allowZoom = true,
    } = this.props;
    const { xScale, yScale, activeLineIndex, randId } = this.state;

    let dragRect = null;
    const dLimits = this.dragLimits();
    if (dLimits && allowZoom) {
      dragRect = (
        <rect
          width={dLimits[1] - dLimits[0]}
          height={height - MARGINS.top - MARGINS.bottom}
          y={0}
          x={dLimits[0]}
          fill="#CBD5E1"
          fillOpacity={0.5}
        />
      );
    }

    const clipRectId = `graph-canvas-${randId}`;

    return (
      <>
        <svg
          width={width}
          height={height}
          onMouseDown={this.onMouseDown}
          onMouseMove={this.onMouseMove}
        >
          <Group top={MARGINS.top} left={MARGINS.left}>
            <AxisLeft
              scale={yScale}
              //@ts-ignore
              tickFormat={this.yAxisTickFormat}
            />
            <AxisBottom
              scale={xScale}
              top={height - MARGINS.top - MARGINS.bottom}
              //@ts-ignore
              tickFormat={this.xAxisTickFormat}
              tickValues={this.xAxisTicks()}
            />
            {yLabel && (
              <Text
                x={20 - MARGINS.left}
                y={(height - MARGINS.top - MARGINS.bottom) / 2}
                angle={-90}
                fontSize={10}
              >
                {yLabel}
              </Text>
            )}
            <svg overflow="visible">
              <RectClipPath
                id={clipRectId} // ids need to be document-global
                width={width - MARGINS.left - MARGINS.right}
                height={height - MARGINS.top - MARGINS.bottom}
                x={0}
                y={0}
              />
              <rect
                ref={this.canvasRectRef}
                width={width - MARGINS.left - MARGINS.right}
                height={height - MARGINS.top - MARGINS.bottom}
                fill="transparent"
              />
              {dragRect}
              {lineData.map((ld, i) => {
                return (
                  <LinePath
                    key={ld.name}
                    stroke={ld.color}
                    data={ld.data}
                    strokeWidth={activeLineIndex === i ? 2 : 1}
                    x={(d) => xScale(d.x)}
                    y={(d) => yScale(d.y)}
                    clipPath={`url(#${clipRectId})`}
                  />
                );
              })}
              {epochs.map((epoch) => {
                return (
                  <g key={epoch.id}>
                    <Text x={xScale(epoch.x) - 15} y={-5} fontSize="10">
                      {epoch.name}
                    </Text>
                    <Line
                      from={{
                        x: xScale(epoch.x),
                        y: yScale.range()[0] as number,
                      }}
                      to={{
                        x: xScale(epoch.x),
                        y: yScale.range()[1] as number,
                      }}
                      stroke="#CBD5E1"
                      strokeDasharray="3 3"
                    />
                  </g>
                );
              })}
            </svg>
          </Group>
        </svg>
        <div>
          <Legend
            lines={lineData}
            activeLineIndex={activeLineIndex}
            onClick={this.toggleActiveLine}
          />
        </div>
      </>
    );
  }
}

export default TimeGraph;
