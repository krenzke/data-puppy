import React from "react";
import { Link } from "react-router-dom";
import { StoreContext, ContextType } from "stores/rootStore";
import { action } from "mobx";
import { observer } from "mobx-react";
import TimeSpanPicker from "components/timeSpanPicker";
import LivePollCheckbox from "components/livePollCheckbox";
import UTCClock from "components/utcClock";
import FilterMenu from "./filterMenu";
import Store, { HistoryOption, SortOption } from "./store";
import Table, { TH, TR, TD, EmptyTR } from "components/table";
import { unixTimestampToISOString } from "utils/timeFormatters";
import HistoryGraph from "./historyGraph";
import LatencyGraph from "./latencyGraph";
import Button from "components/button";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import Pagination from "components/pagination";
import TimeRangeDescription from "components/timeRangeDescription";

interface Props {}

interface State {
  tMin: number | null;
  tMax: number | null;
}

class ApiMetrics extends React.Component<Props, State> {
  static contextType = StoreContext;
  declare context: ContextType;

  store: Store;

  constructor(props: Props, context: ContextType) {
    super(props);
    this.store = new Store(context.timespanStore);
    this.store.fetchApiRequests();
    this.store.fetchHistoryData();
    context.deploymentStore.fetchDeployments();
    this.state = {
      tMin: null,
      tMax: null,
    };
  }

  handleTimeSpanChange = () => {
    this.store.fetchApiRequests();
    this.store.fetchHistoryData();
    this.context.deploymentStore.fetchDeployments();
    this.resetZoom();
  };

  handleSortChange = action((e: React.FormEvent<HTMLSelectElement>) => {
    this.store.sortOption = e.currentTarget.value as SortOption;
    this.store.fetchApiRequests();
  });

  handleGroupingChange = (grouping: HistoryOption) => {
    this.store.historyGrouping = grouping;
    this.store.fetchHistoryData();
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

  onNextPage = () => {
    this.store.incrementPage();
    this.store.fetchApiRequests();
  };

  onPrevPage = () => {
    this.store.decrementPage();
    this.store.fetchApiRequests();
  };

  refineTimeSpan = action(() => {
    const { tMin, tMax } = this.state;
    this.store.timespanStore.setSpanAsTimestamps(tMin, tMax);
    this.store.apiRequestsPage = 1;
    this.store.fetchApiRequests();
    this.store.fetchHistoryData();
    this.setState({ tMin: null, tMax: null });
  });

  render() {
    const { timespanStore, deploymentStore } = this.context;
    const {
      apiRequests,
      apiRequestsPagination,
      history: { startTime, endTime, livePolling },
    } = this.store;
    const { tMin, tMax } = this.state;

    let [t1, t2] = [startTime, endTime];
    if (tMin !== null && tMax !== null) {
      [t1, t2] = [tMin, tMax];
    }

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
              disabled={!this.store.timespanStore.includesNow}
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
            <HistoryGraph
              data={this.store.history.data.requests}
              groupingType={this.store.historyGrouping}
              onGroupingChange={this.handleGroupingChange}
              deployments={deploymentStore.deployments}
              onZoom={this.handleZoom}
              onPan={this.handleZoom}
              startTime={t1}
              endTime={t2}
            />
          </div>
          <div className="min-h-[200px] min-w-[200px] flex-1 border border-slate-200 pt-3 px-3 relative">
            <LatencyGraph
              data={this.store.history.data.latency}
              deployments={deploymentStore.deployments}
              onZoom={this.handleZoom}
              onPan={this.handleZoom}
              startTime={t1}
              endTime={t2}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <div className="border border-slate-200 flex-1 min-w-[200px]">
            <FilterMenu store={this.store} />
          </div>
          <div className="min-h-[200px] grow-[3]">
            <div className="px-3 py-1 text-right">
              <span className="mr-2">Sort:</span>
              <select
                value={this.store.sortOption}
                onChange={this.handleSortChange}
              >
                <option value="time">Time</option>
                <option value="duration">Duration</option>
                <option value="query_count">Query Count</option>
              </select>
            </div>
            <Table>
              <thead>
                <TR>
                  <TH></TH>
                  <TH>Time</TH>
                  <TH>Verb</TH>
                  <TH>Path</TH>
                  <TH>Status</TH>
                  <TH>Duration (ms)</TH>
                  <TH>DB Queries</TH>
                </TR>
              </thead>
              <tbody>
                {apiRequests.length === 0 && (
                  <EmptyTR>No Requests Found</EmptyTR>
                )}
                {apiRequests.length > 0 &&
                  apiRequests.map((request) => {
                    const numErrors =
                      request.relationships?.api_errors?.data?.length;
                    const hasError =
                      typeof numErrors !== "undefined" && numErrors > 0;
                    return (
                      <TR key={request.attributes.request_id}>
                        <TD>
                          {hasError && (
                            <span title="Has Error(s)">
                              <ExclamationCircleIcon className="w-4 h-4 text-red-500 stroke-2" />
                            </span>
                          )}
                        </TD>
                        <TD>
                          <Link
                            to={`${request.attributes.request_id}`}
                            className="text-blue-500"
                          >
                            {unixTimestampToISOString(request.attributes.time)}
                          </Link>
                        </TD>
                        <TD>{request.attributes.verb}</TD>
                        <TD>{request.attributes.path}</TD>
                        <TD>{request.attributes.response_status}</TD>
                        <TD>{(request.attributes.dt * 1000).toFixed(4)}</TD>
                        <TD>{request.attributes.query_count}</TD>
                      </TR>
                    );
                  })}
              </tbody>
            </Table>
            {apiRequestsPagination && (
              <Pagination
                pagination={apiRequestsPagination}
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

export default observer(ApiMetrics);
