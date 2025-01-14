import React from "react";
import { observer } from "mobx-react";
import { computed } from "mobx";
import Spinner from "components/spinner";
import { DeploymentRecord } from "stores/deploymentsStore";
import TimeGraph from "components/timeGraph";
import { ParentSize } from "@visx/responsive";
import { formatLineData } from "components/graphHelpers";
import { HostMetricNames, HostMetricName } from "./store";
import { HostMetricAttributes } from "stores/types";

interface Props {
  deployments: DeploymentRecord[];
  onZoom?: (xMin: number, xMax: number) => void;
  onPan?: (xMin: number, xMax: number) => void;
  startTime: number | null;
  endTime: number | null;
  data: HostMetricAttributes[];
  metricNames: HostMetricName[];
  yMax?: number | null;
  yMin?: number | null;
  yAxisType?: "number" | "bytes" | "percent";
}

const MetricMap: {
  [key in (typeof HostMetricNames)[number]]: { name: string; color: string };
} = {
  total_system_mem: { name: "Total Sys Mem", color: "#22c55e" },
  free_system_mem: { name: "Free Sys Mem", color: "#0ea5e9" },
  pct_free_system_mem: { name: "Free Sys Mem (%)", color: "#22c55e" },
  system_pct_cpu: { name: "System CPU (%)", color: "#0ea5e9" },
  total_hdd: { name: "Total HDD", color: "#64748B" },
  free_hdd: { name: "Free HDD", color: "#64748B" },
  postgres_pct_cpu: { name: "Postgres CPU (%)", color: "#22c55e" },
  postgres_pct_mem: { name: "Postgres Mem (%)", color: "#22c55e" },
  ruby_pct_cpu: { name: "Ruby CPU (%)", color: "#ef4444" },
  ruby_pct_mem: { name: "Ruby Mem (%)", color: "#ef4444" },
  nginx_pct_cpu: { name: "Nginx CPU (%)", color: "#14b8a6" },
  nginx_pct_mem: { name: "Nginx Mem (%)", color: "#14b8a6" },
  elasticsearch_pct_cpu: { name: "Elasticsearch CPU (%)", color: "#6366f1" },
  elasticsearch_pct_mem: { name: "Elasticsearch Mem (%)", color: "#6366f1" },
  redis_pct_cpu: { name: "Redis CPU (%)", color: "#f97316" },
  redis_pct_mem: { name: "Redis Mem (%)", color: "#f97316" },
};

class HistoryGraph extends React.Component<Props> {
  lineData = () =>
    computed(() => {
      const { metricNames } = this.props;
      const formatOptions = Object.fromEntries(
        Object.entries(MetricMap).filter(([metricName, _values]) =>
          metricNames.includes(metricName as HostMetricName)
        )
      );
      //@ts-ignore
      return formatLineData(this.props.data, formatOptions);
    });

  render() {
    const {
      startTime,
      endTime,
      deployments,
      onZoom,
      onPan,
      yMax,
      yMin,
      yAxisType = "number",
    } = this.props;

    if (!startTime || !endTime) {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </div>
      );
    }

    const yDomain = [
      typeof yMin === "undefined" ? null : yMin,
      typeof yMax === "undefined" ? null : yMax,
    ];

    return (
      <ParentSize debounceTime={100}>
        {({ width }) => {
          return (
            <TimeGraph
              width={width === 0 ? 200 : width}
              height={200}
              xDomain={[startTime, endTime]}
              yDomain={yDomain}
              lineData={this.lineData().get()}
              epochs={deployments.map((d) => ({
                id: `${d.attributes.sha}-${d.attributes.time}`,
                x: d.attributes.time,
                name: d.attributes.sha.substring(0, 6),
              }))}
              yAxisType={yAxisType}
              onZoom={onZoom}
              onPan={onPan}
            />
          );
        }}
      </ParentSize>
    );
  }
}

export default observer(HistoryGraph);
