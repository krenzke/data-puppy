import React from "react";
import { observer } from "mobx-react";
import { computed } from "mobx";
import Spinner from "components/spinner";
import { DeploymentRecord } from "stores/deploymentsStore";
import TimeGraph from "components/timeGraph";
import { ParentSize } from "@visx/responsive";
import { formatLineData } from "components/graphHelpers";
import { LatencyDataPoint } from "stores/types";

interface Props {
  deployments: DeploymentRecord[];
  onZoom?: (xMin: number, xMax: number) => void;
  onPan?: (xMin: number, xMax: number) => void;
  startTime: number | null;
  endTime: number | null;
  data: LatencyDataPoint[];
}

class LatencyGraph extends React.Component<Props> {
  lineData = () =>
    computed(() => {
      //@ts-ignore
      return formatLineData(this.props.data, {
        p50: { name: "p50", color: "#64748B" },
        p95: { name: "p95", color: "#22C55E" },
        p99: { name: "p99", color: "#EF4444" },
      });
    });

  render() {
    const { startTime, endTime, deployments, onZoom, onPan } = this.props;

    if (!startTime || !endTime) {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </div>
      );
    }

    return (
      <div>
        Latency
        <ParentSize debounceTime={100}>
          {({ width }) => {
            return (
              <TimeGraph
                width={width || 200}
                height={200}
                xDomain={[startTime, endTime]}
                yDomain={[0, null]}
                lineData={this.lineData().get()}
                epochs={deployments.map((d) => ({
                  id: `${d.attributes.sha}-${d.attributes.time}`,
                  x: d.attributes.time,
                  name: d.attributes.sha.substring(0, 6),
                }))}
                yLabel="Time (ms)"
                onZoom={onZoom}
                onPan={onPan}
              />
            );
          }}
        </ParentSize>
      </div>
    );
  }
}

export default observer(LatencyGraph);
