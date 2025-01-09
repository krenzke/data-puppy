import React from "react";
import { Link } from "react-router-dom";
import { StoreContext, ContextType } from "stores/rootStore";
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
    this.store.fetchApiErrors();
  }

  handleTimeSpanChange = () => {
    this.store.fetchApiErrors();
  };

  onNextPage = () => {
    this.store.incrementPage();
    this.store.fetchApiErrors();
  };

  onPrevPage = () => {
    this.store.decrementPage();
    this.store.fetchApiErrors();
  };

  render() {
    const { timespanStore } = this.context;
    const { apiErrors, apiErrorsPagination } = this.store;
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
                  <TH>Error Class</TH>
                  <TH>Error Message</TH>
                </TR>
              </thead>
              <tbody>
                {apiErrors.length === 0 && <EmptyTR>No Errors Found</EmptyTR>}
                {apiErrors.length > 0 &&
                  apiErrors.map((error) => {
                    return (
                      <TR key={error.attributes.request_id}>
                        <TD>
                          {unixTimestampToISOString(error.attributes.time)}
                        </TD>
                        <TD>
                          <Link
                            to={`/api-metrics/${error.attributes.request_id}`}
                            className="text-blue-500"
                          >
                            {error.attributes.request_id}
                          </Link>
                        </TD>
                        <TD>{error.attributes.error_class}</TD>
                        <TD>{error.attributes.error_message}</TD>
                      </TR>
                    );
                  })}
              </tbody>
            </Table>
            {apiErrorsPagination && (
              <Pagination
                pagination={apiErrorsPagination}
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
