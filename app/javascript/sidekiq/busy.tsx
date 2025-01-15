import React from "react";
import { observer } from "mobx-react";
import { unixTimestampRelativeTimeSinceNow } from "utils/timeFormatters";
import SidekiqStore from "./store";
import MetricCard from "components/metricCard";
import Table, { TR, TH, TD, EmptyTR } from "components/table";
import withSidekiqStoreOutlet from "./helpers/withSidekiqStoreOutlet";

interface Props {
  store: SidekiqStore;
}
class Busy extends React.Component<Props> {
  componentDidMount() {
    this.props.store.fetchProcesses();
  }

  render() {
    const store = this.props.store;
    const { processJobs, processes, processStats } = store;
    const formatter = Intl.NumberFormat("en", { notation: "compact" });

    return (
      <div className="pt-4">
        <div className="flex items-stretch justify-center gap-2">
          <MetricCard
            className="flex-1"
            title="Busy"
            value={formatter.format(processStats.busy)}
            size="s"
          />
          <MetricCard
            className="flex-1"
            title="Processes"
            value={formatter.format(processStats.processes)}
            size="s"
          />
          <MetricCard
            className="flex-1"
            title="Threads"
            value={formatter.format(processStats.threads)}
            size="s"
          />
          <MetricCard
            className="flex-1"
            title="RSS"
            value={formatter.format(processStats.rss)}
            size="s"
          />
        </div>
        <h1 className="mt-4 mb-2 text-lg font-bold">Processes</h1>
        <Table>
          <thead>
            <tr>
              <TH>Name</TH>
              <TH>Queues</TH>
              <TH>Started</TH>
              <TH>Threads</TH>
              <TH>Busy</TH>
              <TH></TH>
            </tr>
          </thead>
          <tbody>
            {processes.length === 0 && <EmptyTR>No Processes Running</EmptyTR>}
            {processes.length > 0 &&
              processes.map((process) => {
                return (
                  <TR key={process.pid}>
                    <TD>
                      {process.hostname}:{process.pid}
                    </TD>
                    <TD>{process.queues.join(", ")}</TD>
                    <TD>
                      {unixTimestampRelativeTimeSinceNow(process.startedAt)}
                    </TD>
                    <TD>{process.concurrency}</TD>
                    <TD>{process.busy}</TD>
                    <TD className="py-1"></TD>
                  </TR>
                );
              })}
          </tbody>
        </Table>

        <h1 className="mt-4 mb-2 text-lg font-bold">Jobs</h1>
        <Table>
          <thead>
            <tr>
              <TH>Process</TH>
              <TH>TID</TH>
              <TH>JID</TH>
              <TH>Queue</TH>
              <TH>Job</TH>
              <TH>Arguments</TH>
              <TH>Started</TH>
              <TH></TH>
            </tr>
          </thead>
          <tbody>
            {processJobs.length === 0 && <EmptyTR>No Job Processing</EmptyTR>}
            {processJobs.length > 0 &&
              processJobs.map((job) => {
                return (
                  <TR key={job.item.jid}>
                    <TD>{job.process}</TD>
                    <TD>{job.thread}</TD>
                    <TD>{job.item.jid}</TD>
                    <TD>{job.queue}</TD>
                    <TD>{job.displayClass}</TD>
                    <TD>{job.displayArgs}</TD>
                    <TD>{unixTimestampRelativeTimeSinceNow(job.runAt)}</TD>
                    <TD></TD>
                  </TR>
                );
              })}
          </tbody>
        </Table>
      </div>
    );
  }
}

export default withSidekiqStoreOutlet(observer(Busy));
