import React from "react";
import { observer } from "mobx-react";
import withRoutingInfo, { RoutingInfoProps } from "utils/withRoutingInfo";
import Table, { TR, TD } from "components/table";
import Store from "./store";
import Spinner from "components/spinner";
import {
  unixTimestampToISOString,
  unixTimestampRelativeTimeSinceNow,
} from "utils/timeFormatters";
import Trace from "./trace";

type Props = {
  requestId?: string;
};

type CombinedProps = RoutingInfoProps<Props>;

class RequestDetails extends React.Component<CombinedProps> {
  store: Store = new Store();

  componentDidMount() {
    this.store.fetchRequestDetails(this.props.requestId!);
  }

  componentDidUpdate(prevProps: Props): void {
    if (prevProps.requestId !== this.props.requestId) {
      this.store.fetchRequestDetails(this.props.requestId!);
    }
  }

  render() {
    const { requestId } = this.props;
    const { fetching, request, backgroundJobErrors, backgroundJobs } =
      this.store;

    if (fetching) {
      return (
        <div className="flex items-center p-6">
          <Spinner />
        </div>
      );
    }

    return (
      <div className="pt-4">
        <h1 className="mb-2 text-lg font-bold">{requestId}</h1>
        <div className="flex-1 p-4 mb-2 border border-slate-300">
          <h2>Request Details</h2>
          {!request && (
            <div className="text-sm text-center">No Request Found</div>
          )}
          {request && (
            <Table>
              <tbody>
                <TR>
                  <TD>Time</TD>
                  <TD>
                    {unixTimestampToISOString(request.attributes.time)}
                    <br />
                    <span className="text-slate-500">
                      {unixTimestampRelativeTimeSinceNow(
                        request.attributes.time
                      )}
                    </span>
                  </TD>
                </TR>
                <TR>
                  <TD>Duration (ms)</TD>
                  <TD>{request.attributes.dt * 1000}</TD>
                </TR>
                <TR>
                  <TD>Path</TD>
                  <TD>{request.attributes.path}</TD>
                </TR>
                <TR>
                  <TD>Verb</TD>
                  <TD>{request.attributes.verb}</TD>
                </TR>
                <TR>
                  <TD>Error Class</TD>
                  <TD>{request.attributes.error_class}</TD>
                </TR>
                <TR>
                  <TD>Error Message</TD>
                  <TD>{request.attributes.error_message}</TD>
                </TR>
                <TR>
                  <TD>Backtrace</TD>
                  <TD>
                    <ul>
                      {(request.attributes.backtrace || []).map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </TD>
                </TR>
              </tbody>
            </Table>
          )}
          {!request && <span>No Request Found</span>}
        </div>
        {request && request.attributes.trace && (
          <div className="flex-1 p-4 mb-2 border border-slate-300">
            <h2>Trace</h2>
            <Trace spans={request.attributes.trace} />
          </div>
        )}
        <div className="flex items-stretch gap-2">
          <div className="flex-1 p-4 border border-slate-300">
            <h2>Background Jobs</h2>
            {backgroundJobs.length === 0 && (
              <div className="text-sm text-center">No Jobs Found</div>
            )}
            {backgroundJobs.length > 0 &&
              backgroundJobs.map((job, i) => {
                return (
                  <div key={i} className="mb-4">
                    <Table>
                      <tbody>
                        <TR>
                          <TD>Time</TD>
                          <TD>
                            {unixTimestampToISOString(job.attributes.time)}
                            <br />
                            <span className="text-slate-500">
                              {unixTimestampRelativeTimeSinceNow(
                                job.attributes.time
                              )}
                            </span>
                          </TD>
                        </TR>
                        <TR>
                          <TD>JID</TD>
                          <TD>{job.attributes.jid}</TD>
                        </TR>
                        <TR>
                          <TD>Job Class</TD>
                          <TD>{job.attributes.job_class}</TD>
                        </TR>
                        <TR>
                          <TD>Args</TD>
                          <TD>{job.attributes.job_args}</TD>
                        </TR>
                        <TR>
                          <TD>Duration (ms)</TD>
                          <TD>{job.attributes.dt * 1000}</TD>
                        </TR>
                      </tbody>
                    </Table>
                  </div>
                );
              })}
          </div>
          <div className="flex-1 p-4 border border-slate-300">
            <h2>Background Job Errors</h2>
            {backgroundJobErrors.length === 0 && (
              <div className="text-sm text-center">No Errors Found</div>
            )}
            {backgroundJobErrors.length > 0 &&
              backgroundJobErrors.map((error, i) => {
                return (
                  <div key={i} className="mb-4">
                    <Table>
                      <tbody>
                        <TR>
                          <TD>Time</TD>
                          <TD>
                            {unixTimestampToISOString(error.attributes.time)}
                            <br />
                            <span className="text-slate-500">
                              {unixTimestampRelativeTimeSinceNow(
                                error.attributes.time
                              )}
                            </span>
                          </TD>
                        </TR>
                        <TR>
                          <TD>JID</TD>
                          <TD>{error.attributes.jid}</TD>
                        </TR>
                        <TR>
                          <TD>Error Class</TD>
                          <TD>{error.attributes.error_class}</TD>
                        </TR>
                        <TR>
                          <TD>Error Message</TD>
                          <TD>{error.attributes.error_message}</TD>
                        </TR>
                        <TR>
                          <TD>Backtrace</TD>
                          <TD>
                            <ul className="max-h-[300px] overflow-y-auto">
                              {(error.attributes.backtrace || []).map(
                                (r, _i) => (
                                  <li>{r}</li>
                                )
                              )}
                            </ul>
                          </TD>
                        </TR>
                      </tbody>
                    </Table>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    );
  }
}

export default withRoutingInfo<Props, Props>(observer(RequestDetails));
