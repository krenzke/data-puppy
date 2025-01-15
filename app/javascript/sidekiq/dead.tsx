import React from "react";
import SidekiqStore, { SidekiqJobRecord } from "./store";
import { observer } from "mobx-react";
import { unixTimestampRelativeTimeSinceNow } from "utils/timeFormatters";
import Pagination from "./pagination";
import Button from "components/button";
import Table, { TH, TR, TD, EmptyTR } from "components/table";
import { Link } from "react-router-dom";
import withSidekiqStoreOutlet from "./helpers/withSidekiqStoreOutlet";

interface Props {
  store: SidekiqStore;
}
class Dead extends React.Component<Props> {
  componentDidMount() {
    this.props.store.fetchDead();
  }

  handleUpdate = (job: SidekiqJobRecord, action: "retry" | "delete") => {
    const store = this.props.store;
    store.updateDead(job, action).then(() => {
      store.fetchSidekiqJobs();
    });
  };

  handleUpdateAll = (action: "retry_all" | "clear") => {
    if (confirm("Are you sure?")) {
      const store = this.props.store;
      store.updateAllDead(action).then(() => {
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
              type="primary"
              size="small"
              className="flex-1"
              onClick={() => this.handleUpdateAll("retry_all")}
            >
              Retry All
            </Button>
            <Button
              type="danger"
              size="small"
              className="flex-1"
              onClick={() => this.handleUpdateAll("clear")}
            >
              Delete All
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
              <TH>Last Retry</TH>
              <TH>Queue</TH>
              <TH>Job</TH>
              <TH>Arguments</TH>
              <TH>Error</TH>
              <TH></TH>
            </tr>
          </thead>
          <tbody>
            {jobsData.jobs.length === 0 && <EmptyTR>No Dead Jobs</EmptyTR>}
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
                    <TD>{r.queue}</TD>
                    <TD>{r.displayClass}</TD>
                    <TD>{r.displayArgs}</TD>
                    <TD>
                      {r.item.error_class}: {r.item.error_message}
                    </TD>
                    <TD className="py-1">
                      <div className="flex gap-1">
                        <Button
                          type="primary"
                          size="small"
                          className="flex-1"
                          onClick={() => this.handleUpdate(r, "retry")}
                        >
                          Retry
                        </Button>
                        <Button
                          type="danger"
                          size="small"
                          className="flex-1"
                          onClick={() => this.handleUpdate(r, "delete")}
                        >
                          Delete
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

export default withSidekiqStoreOutlet(observer(Dead));
