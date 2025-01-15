import React from "react";
import SidekiqStore, { SidekiqJobRecord } from "./store";
import { observer } from "mobx-react";
import { unixTimestampRelativeTimeSinceNow } from "utils/timeFormatters";
import Pagination from "./pagination";
import Table, { TH, TR, TD } from "components/table";
import Button from "components/button";
import { Link } from "react-router-dom";
import withSidekiqStoreOutlet from "./helpers/withSidekiqStoreOutlet";

interface Props {
  store: SidekiqStore;
}

class Retries extends React.Component<Props> {
  componentDidMount() {
    this.props.store.fetchRetries();
  }

  handleUpdate = (
    job: SidekiqJobRecord,
    action: "retry" | "kill" | "delete"
  ) => {
    const store = this.props.store;
    store.updateRetry(job, action).then(() => {
      store.fetchSidekiqJobs();
    });
  };

  handleUpdateAll = (action: "retry_all" | "kill_all" | "clear") => {
    if (confirm("Are you sure?")) {
      const store = this.props.store;
      store.updateAllRetry(action).then(() => {
        store.fetchSidekiqJobs();
      });
    }
  };

  render() {
    const store = this.props.store;
    const { sidekiqJobsData: jobsData } = store;

    return (
      <div className="mt-6">
        {jobsData.jobs.length > 0 && (
          <div className="flex max-w-sm gap-1 p-6">
            <Button
              className="flex-1"
              type="primary"
              size="small"
              onClick={() => this.handleUpdateAll("retry_all")}
            >
              Retry All
            </Button>
            <Button
              className="flex-1"
              type="warning"
              size="small"
              onClick={() => this.handleUpdateAll("clear")}
            >
              Delete All
            </Button>
            <Button
              className="flex-1"
              type="danger"
              size="small"
              onClick={() => this.handleUpdateAll("kill_all")}
            >
              Kill All
            </Button>
          </div>
        )}
        <Pagination
          pagination={jobsData.pagination}
          onNext={() => store.incrementJobsPage()}
          onPrev={() => store.decrementJobsPage()}
        />
        <Table>
          <thead>
            <tr>
              <TH>JID</TH>
              <TH>Next Retry</TH>
              <TH>Retry Count</TH>
              <TH>Queue</TH>
              <TH>Job</TH>
              <TH>Arguments</TH>
              <TH>Error</TH>
              <TH></TH>
            </tr>
          </thead>
          <tbody>
            {jobsData.jobs.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-center">
                  No Retry Jobs
                </td>
              </tr>
            )}
            {jobsData.jobs.length > 0 &&
              jobsData.jobs.map((r) => {
                return (
                  <TR key={r.item.jid}>
                    <TD>
                      <Link
                        to={`${r.at}-${r.item.jid}`}
                        className="text-blue-500"
                      >
                        {r.item.jid}
                      </Link>
                    </TD>
                    <TD>{unixTimestampRelativeTimeSinceNow(r.at!)}</TD>
                    <TD>{r.item.retry_count}</TD>
                    <TD>{r.queue}</TD>
                    <TD>{r.displayClass}</TD>
                    <TD>{r.displayArgs}</TD>
                    <TD>
                      {r.item.error_class}: {r.item.error_message}
                    </TD>
                    <TD>
                      <div className="flex gap-1">
                        <Button
                          size="small"
                          type="primary"
                          className="flex-1"
                          onClick={() => this.handleUpdate(r, "retry")}
                        >
                          Retry
                        </Button>
                        <Button
                          size="small"
                          type="warning"
                          className="flex-1"
                          onClick={() => this.handleUpdate(r, "delete")}
                        >
                          Delete
                        </Button>
                        <Button
                          size="small"
                          type="danger"
                          className="flex-1"
                          onClick={() => this.handleUpdate(r, "kill")}
                        >
                          Kill
                        </Button>
                      </div>
                    </TD>
                  </TR>
                );
              })}
          </tbody>
        </Table>
      </div>
    );
  }
}

export default withSidekiqStoreOutlet(observer(Retries));
