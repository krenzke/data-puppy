import React from "react";
// import { Link } from "react-router-dom";
import { StoreContext, ContextType } from "stores/rootStore";
// import { action } from "mobx";
import { observer } from "mobx-react";
import TimeSpanPicker from "components/timeSpanPicker";
import UTCClock from "components/utcClock";
import FilterMenu from "./filterMenu";
import Store from "./store";
import Table, { TH, TR, TD, EmptyTR } from "components/table";
import { unixTimestampToISOString } from "utils/timeFormatters";
import Pagination from "components/pagination";

interface Props {}

interface State {}

class Errors extends React.Component<Props, State> {
  static contextType = StoreContext;
  declare context: ContextType;

  store: Store;

  constructor(props: Props, context: ContextType) {
    super(props);
    this.store = new Store(context.timespanStore);
    this.store.fetchBackgroundJobErrors();
  }

  handleTimeSpanChange = () => {
    this.store.fetchBackgroundJobErrors();
  };

  onNextPage = () => {
    this.store.incrementPage();
    this.store.fetchBackgroundJobErrors();
  };

  onPrevPage = () => {
    this.store.decrementPage();
    this.store.fetchBackgroundJobErrors();
  };

  render() {
    const { timespanStore } = this.context;
    const { backgroundJobErrors, backgroundJobErrorsPagination } = this.store;
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <div></div>
          <div>
            Time (UTC): <UTCClock />
          </div>
          <div className="flex items-center gap-2">
            <TimeSpanPicker
              store={timespanStore}
              onChange={this.handleTimeSpanChange}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="border border-slate-200 flex-1 min-w-[200px]">
            <FilterMenu store={this.store} />
          </div>
          <div className="min-h-[200px] grow-[3]">
            <Table>
              <thead>
                <TR>
                  <TH>Time</TH>
                  <TH>Request ID</TH>
                  <TH>Job Class</TH>
                  <TH>Error Class</TH>
                  <TH>Error Message</TH>
                  <TH>Backtrace</TH>
                </TR>
              </thead>
              <tbody>
                {backgroundJobErrors.length === 0 && (
                  <EmptyTR>No Errors Found</EmptyTR>
                )}
                {backgroundJobErrors.length > 0 &&
                  backgroundJobErrors.map((error) => {
                    return (
                      <TR>
                        <TD>
                          {unixTimestampToISOString(error.attributes.time)}
                        </TD>
                        <TD>{error.attributes.request_id}</TD>
                        <TD>{error.attributes.job_class}</TD>
                        <TD>{error.attributes.error_class}</TD>
                        <TD>{error.attributes.error_message}</TD>
                        <TD>
                          <ul className="max-h-[150px] overflow-y-auto">
                            {(error.attributes.backtrace || []).map((r, _i) => (
                              <li>{r}</li>
                            ))}
                          </ul>
                        </TD>
                      </TR>
                    );
                  })}
              </tbody>
            </Table>
            {backgroundJobErrorsPagination && (
              <Pagination
                pagination={backgroundJobErrorsPagination}
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

export default observer(Errors);
