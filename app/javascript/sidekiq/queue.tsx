import React from "react";
import SidekiqStore, { SidekiqJobRecord } from "./store";
import { observer } from "mobx-react";
import withRoutingInfo, { RoutingInfoProps } from "utils/withRoutingInfo";
import Pagination from "./pagination";
import Table, { TH, TR, TD, EmptyTR } from "components/table";
import Button from "components/button";
import { Queue as SidekiqQueue } from "./store";
import withSidekiqStoreOutlet from "./helpers/withSidekiqStoreOutlet";

type Props = {
  queueName: string;
  store: SidekiqStore;
};

type CombinedProps = RoutingInfoProps<Props>;

class Queue extends React.Component<CombinedProps> {
  componentDidMount() {
    this.props.store.fetchQueue(this.props.queueName!).then(() => {
      this.props.store.fetchJobsForQueue(this.props.queueName!);
    });
  }

  componentDidUpdate(prevProps: Props): void {
    if (prevProps.queueName !== this.props.queueName) {
      this.props.store.fetchQueue(this.props.queueName!).then(() => {
        this.props.store.fetchJobsForQueue(this.props.queueName!);
      });
    }
  }

  handleRemove = (job: SidekiqJobRecord, queue: SidekiqQueue) => {
    if (confirm("Are you sure?")) {
      this.props.store.removeJobFromQueue(job, queue).then(() => {
        this.props.store.fetchJobsForQueue(this.props.queueName!);
      });
    }
  };

  render() {
    const store = this.props.store;
    const { queue, sidekiqJobsData: jobsData } = store;

    if (!queue) {
      return <div className="flex justify-center p-4">Loading...</div>;
    }

    return (
      <div className="pt-4">
        <h2 className="mb-1 text-lg font-semibold">Queue: {queue.name}</h2>
        <Pagination
          pagination={jobsData.pagination}
          onNext={() => store.incrementJobsPage()}
          onPrev={() => store.decrementJobsPage()}
        />
        <Table>
          <thead>
            <tr>
              <TH>Job</TH>
              <TH>Arguments</TH>
              <TH></TH>
            </tr>
          </thead>
          <tbody>
            {jobsData.jobs.length === 0 && <EmptyTR>No Jobs Queued</EmptyTR>}
            {jobsData.jobs.length > 0 &&
              jobsData.jobs.map((job) => {
                return (
                  <TR key={job.item.jid}>
                    <TD>{job.displayClass}</TD>
                    <TD>{job.displayArgs}</TD>
                    <TD>
                      <Button
                        type="danger"
                        size="small"
                        onClick={() => this.handleRemove(job, queue)}
                      >
                        Remove
                      </Button>
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

export default withSidekiqStoreOutlet(
  withRoutingInfo<Props, { queueName: string }>(observer(Queue))
);
