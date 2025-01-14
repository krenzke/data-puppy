import React from "react";
import { StoreContext, ContextType } from "stores/rootStore";
import { observer } from "mobx-react";
import Button from "components/button";
import Store from "./store";
import TimeSpanPicker from "components/timeSpanPicker";
import LivePollCheckbox from "components/livePollCheckbox";
import UTCClock from "components/utcClock";
import HistoryGraph from "./historyGraph";
import TimeRangeDescription from "components/timeRangeDescription";

interface Props {}

interface State {
  tMin: number | null;
  tMax: number | null;
}

class HostMetrics extends React.Component<Props, State> {
  static contextType = StoreContext;
  declare context: ContextType;

  store: Store;

  constructor(props: Props, context: ContextType) {
    super(props);
    this.store = new Store(context.timespanStore, context.deploymentStore);
    this.store.fetchMetrics();
    context.deploymentStore.fetchDeployments();
    this.state = {
      tMin: null,
      tMax: null,
    };
  }

  handleTimeSpanChange = () => {
    this.store.fetchMetrics();
    this.context.deploymentStore.fetchDeployments();
    this.resetZoom();
  };

  resetZoom = () => {
    this.setState({ tMin: null, tMax: null });
  };

  handleZoom = (min: number, max: number) => {
    this.setState({ tMin: min, tMax: max });
  };

  handleLivePolling = (e: React.FormEvent<HTMLInputElement>) => {
    const isLive = e.currentTarget.checked;
    this.store.setHistoryLivePolling(isLive);
  };

  refineTimeSpan = () => {
    const { tMin, tMax } = this.state;
    this.store.timespanStore.setSpanAsTimestamps(tMin, tMax);
    this.store.fetchMetrics();
    this.setState({ tMin: null, tMax: null });
  };

  render() {
    const {
      history: { livePolling, data, startTime, endTime },
      timespanStore,
    } = this.store;
    const { deploymentStore } = this.context;

    const { tMin, tMax } = this.state;

    let [t1, t2] = [startTime, endTime];
    if (tMin !== null && tMax !== null) {
      [t1, t2] = [tMin, tMax];
    }

    const commonProps = {
      data: data,
      startTime: t1,
      endTime: t2,
      onZoom: this.handleZoom,
      onPan: this.handleZoom,
      deployments: deploymentStore.deployments,
    };

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <div></div>
          <div>
            Time (UTC): <UTCClock />
          </div>
          <div className="flex items-center gap-2">
            <LivePollCheckbox
              active={livePolling}
              onChange={this.handleLivePolling}
              disabled={!timespanStore.includesNow}
            />
            <TimeSpanPicker
              store={timespanStore}
              onChange={this.handleTimeSpanChange}
            />
          </div>
        </div>
        {(tMin || tMax) && (
          <TimeRangeDescription
            tStart={tMin}
            tEnd={tMax}
            onClick={this.refineTimeSpan}
          />
        )}
        <div className="mb-1">
          <Button size="xsmall" type="secondary" onClick={this.resetZoom}>
            Reset Zoom
          </Button>
        </div>
        <div className="flex justify-center gap-3 mb-4">
          <div className="min-h-[200px] min-w-[200px] flex-1 border border-slate-200 pt-3 px-3 relative">
            System CPU/Memory (%)
            <HistoryGraph
              {...commonProps}
              metricNames={["system_pct_cpu", "pct_free_system_mem"]}
              yAxisType="percent"
              yMin={0}
              yMax={100}
            />
          </div>
          <div className="min-h-[200px] min-w-[200px] flex-1 border border-slate-200 pt-3 px-3 relative">
            System Memory
            <HistoryGraph
              {...commonProps}
              metricNames={["free_system_mem", "total_system_mem"]}
              yAxisType="bytes"
            />
          </div>
        </div>
        <div className="flex justify-center gap-3 mb-4">
          <div className="min-h-[200px] min-w-[200px] flex-1 border border-slate-200 pt-3 px-3 relative">
            Process CPU (%)
            <HistoryGraph
              {...commonProps}
              metricNames={[
                "postgres_pct_cpu",
                "ruby_pct_cpu",
                "nginx_pct_cpu",
                "elasticsearch_pct_cpu",
                "redis_pct_cpu",
              ]}
              yAxisType="percent"
              yMin={0}
              yMax={100}
            />
          </div>
          <div className="min-h-[200px] min-w-[200px] flex-1 border border-slate-200 pt-3 px-3 relative">
            Process Memory (%)
            <HistoryGraph
              {...commonProps}
              metricNames={[
                "postgres_pct_mem",
                "ruby_pct_mem",
                "nginx_pct_mem",
                "elasticsearch_pct_mem",
                "redis_pct_mem",
              ]}
              yAxisType="percent"
              yMin={0}
              yMax={100}
            />
          </div>
        </div>
        <div className="flex justify-center gap-3 mb-4">
          <div className="min-h-[200px] min-w-[200px] flex-1 border border-slate-200 pt-3 px-3 relative">
            Free Disk Space
            <HistoryGraph
              {...commonProps}
              metricNames={["free_hdd"]}
              yAxisType="bytes"
            />
          </div>
        </div>
      </div>
    );
  }
}

export default observer(HostMetrics);
