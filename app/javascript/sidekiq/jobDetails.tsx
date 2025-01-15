import React from "react";
import SidekiqStore, { JobType } from "sidekiq/store";
import { observer } from "mobx-react";
import withRoutingInfo, { RoutingInfoProps } from "utils/withRoutingInfo";
import Table, { TR, TD } from "components/table";
import { Link } from "react-router-dom";
import { toJS } from "mobx";
import {
  unixTimestampToISOString,
  unixTimestampRelativeTimeSinceNow,
} from "utils/timeFormatters";
import withSidekiqStoreOutlet from "./helpers/withSidekiqStoreOutlet";

type Props = {
  jobKey: string;
  jobType: JobType;
  store: SidekiqStore;
};

type CombinedProps = RoutingInfoProps<Props>;

class JobDetails extends React.Component<CombinedProps> {
  componentDidMount() {
    const { jobType, jobKey } = this.props;
    this.props.store.fetchJob(jobType, jobKey!);
  }

  componentDidUpdate(prevProps: Props): void {
    const { jobType, jobKey } = this.props;
    if (prevProps.jobType !== jobType || prevProps.jobKey !== jobKey) {
      this.props.store.fetchJob(jobType, jobKey!);
    }
  }

  render() {
    const store = this.props.store;
    const { currentSidekiqJob: currentJob } = store;

    if (!currentJob) {
      return <div className="flex justify-center p-4">Loading...</div>;
    }

    return (
      <div className="pt-4">
        <h2 className="mb-1 text-lg font-semibold">
          Job Details: {currentJob.item.jid}
        </h2>
        <Table>
          <tbody>
            <TR>
              <TD>Type</TD>
              <TD>{this.props.jobType}</TD>
            </TR>
            <TR>
              <TD>Job</TD>
              <TD>{currentJob.displayClass}</TD>
            </TR>
            <TR>
              <TD>Args</TD>
              <TD>{currentJob.displayArgs}</TD>
            </TR>
            <TR>
              <TD>At</TD>
              <TD>
                {currentJob.at ? (
                  <span>
                    {unixTimestampRelativeTimeSinceNow(currentJob.at)} (
                    {unixTimestampToISOString(currentJob.at)})
                  </span>
                ) : (
                  ""
                )}
              </TD>
            </TR>
            <TR>
              <TD>Created At</TD>
              <TD>
                {currentJob.createdAt ? (
                  <span>
                    {unixTimestampRelativeTimeSinceNow(currentJob.createdAt)} (
                    {unixTimestampToISOString(currentJob.createdAt)})
                  </span>
                ) : (
                  ""
                )}
              </TD>
            </TR>
            <TR>
              <TD>Enqueued At</TD>
              <TD>
                {currentJob.enqueuedAt ? (
                  <span>
                    {unixTimestampRelativeTimeSinceNow(currentJob.enqueuedAt)} (
                    {unixTimestampToISOString(currentJob.enqueuedAt)})
                  </span>
                ) : (
                  ""
                )}
              </TD>
            </TR>
            <TR>
              <TD>Queue</TD>
              <TD>
                <Link
                  to={`/sidekiq/queues/${currentJob.queue}`}
                  className="text-blue-500"
                >
                  {currentJob.queue}
                </Link>
              </TD>
            </TR>
            <TR>
              <TD>Raw</TD>
              <TD>
                <pre className="p-1 border rounded bg-slate-100 border-slate-300">
                  {JSON.stringify(toJS(currentJob.item), null, 2)}
                </pre>
              </TD>
            </TR>
          </tbody>
        </Table>
      </div>
    );
  }
}

export default withSidekiqStoreOutlet<{ jobType: string }>(
  withRoutingInfo<Props, { jobKey: string }>(observer(JobDetails))
);
