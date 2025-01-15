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
class Scheduled extends React.Component<Props> {
  componentDidMount() {
    this.props.store.fetchScheduled();
  }

  handleUpdate = (job: SidekiqJobRecord, action: "add_to_queue" | "delete") => {
    const store = this.props.store;
    store.updateScheduled(job, action).then((_d) => {
      store.fetchScheduled();
    });
  };

  render() {
    const store = this.props.store;
    const { sidekiqJobsData: jobsData } = store;

    return (
      <div className="mt-6">
        <Pagination
          pagination={jobsData.pagination}
          onNext={() => store.incrementJobsPage()}
          onPrev={() => store.decrementJobsPage()}
        />
        <Table className="w-full border-collapse">
          <thead>
            <tr>
              <TH>JID</TH>
              <TH>Will Run</TH>
              <TH>Queue</TH>
              <TH>Job</TH>
              <TH>Arguments</TH>
              <TH></TH>
            </tr>
          </thead>
          <tbody>
            {jobsData.jobs.length === 0 && <EmptyTR>No Scheduled Jobs</EmptyTR>}
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
                    <TD>
                      <Link
                        to={`/sidekiq/queues/${r.queue}`}
                        className="text-blue-500"
                      >
                        {r.queue}
                      </Link>
                    </TD>
                    <TD>{r.displayClass}</TD>
                    <TD>{r.displayArgs}</TD>
                    <TD>
                      <div className="flex gap-1">
                        <Button
                          type="primary"
                          size="small"
                          className="flex-1"
                          onClick={() => this.handleUpdate(r, "add_to_queue")}
                        >
                          Add To Queue
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

export default withSidekiqStoreOutlet(observer(Scheduled));
