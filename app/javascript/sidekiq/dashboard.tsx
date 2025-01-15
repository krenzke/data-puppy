import React from "react";
import MetricCard from "components/metricCard";
import { observer } from "mobx-react";
import LivePollCheckbox from "components/livePollCheckbox";
import TimeSpanPicker from "components/timeSpanPicker";
import UTCClock from "components/utcClock";
import { action } from "mobx";
import Table, { TH, TR, TD, EmptyTR } from "components/table";
import { Link } from "react-router-dom";
import FilterMenu from "./filterMenu";
import SidekiqStore, { SortOption } from "./store";
import { unixTimestampToISOString } from "utils/timeFormatters";
import withSidekiqStoreOutlet from "./helpers/withSidekiqStoreOutlet";
import HistoryGraph from "./historyGraph";
import Pagination from "components/pagination";
import TimeRangeDescription from "components/timeRangeDescription";
import Button from "components/button";

interface Props {
  store: SidekiqStore;
}

interface State {
  tMin: number | null;
  tMax: number | null;
}

class Dashboard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      tMin: null,
      tMax: null,
    };
  }

  componentDidMount() {
    const { store } = this.props;
    store.fetchStats();
    store.fetchHistory();
    store.fetchBackgroundJobs();
  }

  handleTimeSpanChange = () => {
    const { store } = this.props;
    store.fetchBackgroundJobs();
    store.fetchHistory();
  };

  handleSortChange = action((e: React.FormEvent<HTMLSelectElement>) => {
    this.props.store.backgroundJobsSortOrder = e.currentTarget
      .value as SortOption;
    this.props.store.fetchBackgroundJobs();
  });

  handleLivePolling = (e: React.FormEvent<HTMLInputElement>) => {
    const isLive = e.currentTarget.checked;
    this.props.store.setLivePolling(isLive);
  };

  onNextPage = () => {
    this.props.store.incrementPage();
    this.props.store.fetchBackgroundJobs();
  };

  onPrevPage = () => {
    this.props.store.decrementPage();
    this.props.store.fetchBackgroundJobs();
  };

  resetZoom = () => {
    this.setState({ tMin: null, tMax: null });
  };

  handleZoom = (min: number, max: number) => {
    this.setState({ tMin: min, tMax: max });
  };

  refineTimeSpan = action(() => {
    const { store } = this.props;
    const { tMin, tMax } = this.state;
    store.timespanStore.setSpanAsTimestamps(tMin, tMax);
    store.backgroundJobsPage = 1;
    store.fetchBackgroundJobs();
    store.fetchHistory();
    this.setState({ tMin: null, tMax: null });
  });

  render() {
    const store = this.props.store;
    const {
      sidekiqStats,
      backgroundJobs,
      backgroundJobsPagination,
      historyData: { livePolling, startTime, endTime },
    } = store;
    const formatter = Intl.NumberFormat("en", { notation: "compact" });

    const { tMin, tMax } = this.state;

    let [t1, t2] = [startTime, endTime];
    if (tMin !== null && tMax !== null) {
      [t1, t2] = [tMin, tMax];
    }

    return (
      <div className="pt-4">
        <div className="flex items-stretch justify-center gap-2 mb-4">
          <MetricCard
            className="flex-1"
            title="Processed"
            value={formatter.format(sidekiqStats.processed)}
            size="s"
          />
          <MetricCard
            className="flex-1"
            title="Failed"
            value={formatter.format(sidekiqStats.failed)}
            size="s"
          />
          <MetricCard
            className="flex-1"
            title={
              <Link to="busy" className="text-blue-500">
                Busy
              </Link>
            }
            value={formatter.format(sidekiqStats.busy)}
            size="s"
          />
          <MetricCard
            className="flex-1"
            title={
              <Link to="queues" className="text-blue-500">
                Enqueued
              </Link>
            }
            value={formatter.format(sidekiqStats.enqueued)}
            size="s"
          />
          <MetricCard
            className="flex-1"
            title={
              <Link to="retries" className="text-blue-500">
                Retries
              </Link>
            }
            value={formatter.format(sidekiqStats.retries)}
            size="s"
          />
          <MetricCard
            className="flex-1"
            title={
              <Link to="scheduled" className="text-blue-500">
                Scheduled
              </Link>
            }
            value={formatter.format(sidekiqStats.scheduled)}
            size="s"
          />
          <MetricCard
            className="flex-1"
            title={
              <Link to="dead" className="text-blue-500">
                Dead
              </Link>
            }
            value={formatter.format(sidekiqStats.dead)}
            size="s"
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>&nbsp;</div>
          <div>
            Time (UTC): <UTCClock />
          </div>
          <div className="flex items-center gap-2">
            <LivePollCheckbox
              active={livePolling}
              onChange={this.handleLivePolling}
              disabled={!this.props.store.timespanStore.includesNow}
            />
            <TimeSpanPicker
              store={store.timespanStore}
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
        <div className="pb-4">
          <div className="min-h-[200px] min-w-[200px] flex-1 border border-slate-200 pt-3 px-3 relative">
            <HistoryGraph
              store={store}
              onZoom={this.handleZoom}
              onPan={this.handleZoom}
              startTime={t1}
              endTime={t2}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="border border-slate-200 flex-1 min-w-[200px]">
            <FilterMenu store={store} />
          </div>
          <div className="min-h-[200px] grow-[3]">
            <div className="px-3 py-1 text-right">
              <span className="mr-2">Sort:</span>
              <select
                value={store.backgroundJobsSortOrder}
                onChange={this.handleSortChange}
              >
                <option value="time">Time</option>
                <option value="duration">Duration</option>
              </select>
            </div>
            <Table>
              <thead>
                <TR>
                  <TH>Time</TH>
                  <TH>Job Class</TH>
                  <TH>JID</TH>
                  <TH>Duration (ms)</TH>
                </TR>
              </thead>
              <tbody>
                {backgroundJobs.length === 0 && (
                  <EmptyTR>No Jobs Found</EmptyTR>
                )}
                {backgroundJobs.length > 0 &&
                  backgroundJobs.map((job) => {
                    return (
                      <TR key={job.attributes.jid}>
                        <TD>{unixTimestampToISOString(job.attributes.time)}</TD>
                        <TD>{job.attributes.job_class}</TD>
                        <TD>{job.attributes.jid}</TD>
                        <TD>{(job.attributes.dt * 1000).toFixed(4)}</TD>
                      </TR>
                    );
                  })}
              </tbody>
            </Table>
            {backgroundJobsPagination && (
              <Pagination
                pagination={backgroundJobsPagination}
                onNext={this.onNextPage}
                onPrev={this.onPrevPage}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default withSidekiqStoreOutlet(observer(Dashboard));
