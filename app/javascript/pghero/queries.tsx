import React from "react";
import { observer } from "mobx-react";
import Button from "components/button";
import Table, { TH, TR, TD, EmptyTR } from "components/table";
import cx from "classnames";

import { StoreContext, ContextType } from "stores/rootStore";
import { QuerySortOption } from "stores/pgheroStore";

interface Props {}

class Queries extends React.Component<Props> {
  static contextType = StoreContext;
  declare context: ContextType;

  componentDidMount() {
    this.context.pgheroStore.loadLiveQueryData();
    this.context.pgheroStore.loadHistoricalQueryData(null);
  }

  handleSort = (sort: QuerySortOption) => {
    this.context.pgheroStore.loadHistoricalQueryData(sort);
  };

  render() {
    const store = this.context.pgheroStore;
    const { liveQueries, historicalQueries, queriesSortBy } = store;

    return (
      <div className="mt-4">
        <h2 className="text-lg">Live Queries</h2>
        <Table>
          <thead>
            <tr>
              <TH>Query</TH>
              <TH>Duration</TH>
              <TH>State</TH>
            </tr>
          </thead>
          <tbody>
            {liveQueries.length === 0 && <EmptyTR>No live queries</EmptyTR>}
            {liveQueries.length > 0 &&
              liveQueries.map((q, i) => {
                return (
                  <TR key={i}>
                    <TD>{q.query}</TD>
                    <TD>{q.duration_ms}</TD>
                    <TD>{q.state}</TD>
                  </TR>
                );
              })}
          </tbody>
        </Table>
        <Button
          className="mt-4"
          type="primary"
          onClick={() => store.loadLiveQueryData()}
        >
          Refresh
        </Button>

        <div className="flex justify-between mt-8">
          <span className="text-lg">Historical Queries</span>
          <div className="flex gap-1">
            <span>Sort By:</span>
            <span className="flex gap-2">
              <SortLink
                onClick={() => this.handleSort(null)}
                active={queriesSortBy === null}
              >
                Total Time
              </SortLink>
              <SortLink
                onClick={() => this.handleSort("average_time")}
                active={queriesSortBy === "average_time"}
              >
                Average Time
              </SortLink>
              <SortLink
                onClick={() => this.handleSort("calls")}
                active={queriesSortBy === "calls"}
              >
                Calls
              </SortLink>
            </span>
          </div>
        </div>
        <Table>
          <thead>
            <tr>
              <TH>Query</TH>
              <TH>Avg. Time (ms)</TH>
              <TH>Calls</TH>
            </tr>
          </thead>
          <tbody>
            {historicalQueries.map((q, i) => {
              return (
                <TR key={i}>
                  <TD>
                    <div className="overflow-auto max-h-36">{q.query}</div>
                  </TD>
                  <TD>{q.average_time.toFixed(4)}</TD>
                  <TD>{q.calls}</TD>
                </TR>
              );
            })}
          </tbody>
        </Table>
      </div>
    );
  }
}

interface SortLinkProps {
  children?: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

const SortLink: React.FC<SortLinkProps> = ({ children, active, onClick }) => {
  return (
    <a
      href="#"
      className={cx({
        underline: active,
        "cursor-pointer": !active,
        "cursor-default": active,
        "text-blue-500": !active,
        "text-gray-500": active,
        "hover:text-blue-800": !active,
      })}
      onClick={onClick}
    >
      {children}
    </a>
  );
};

export default observer(Queries);
