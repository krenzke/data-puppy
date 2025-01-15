import React from "react";
import { Route, Outlet } from "react-router-dom";
import { StoreContext, ContextType } from "stores/rootStore";
import Scheduled from "./scheduled";
import Retries from "./retries";
import Errors from "./errorsIndex";
import Dashboard from "./dashboard";
import Queues from "./queues";
import Queue from "./queue";
import Busy from "./busy";
import Dead from "./dead";
import JobDetails from "./jobDetails";
import NavigationTabs from "components/navigationTabs";
import SidekiqStore from "./store";

interface Props {}
class Wrapper extends React.Component<Props> {
  static contextType = StoreContext;
  declare context: ContextType;

  store: SidekiqStore;

  constructor(props: Props, context: ContextType) {
    super(props);
    this.store = new SidekiqStore(context.timespanStore);
  }

  render() {
    if (window.currentProject.has_sidekiq) {
      return (
        <>
          <div className="mt-4">
            <NavigationTabs
              tabs={[
                { to: "", label: "Dashboard" },
                { to: "errors", label: "Errors" },
                { to: "busy", label: "Busy" },
                { to: "queues", label: "Queues" },
                { to: "retries", label: "Retries" },
                { to: "scheduled", label: "Scheduled" },
                { to: "dead", label: "Dead" },
              ]}
            />
          </div>
          <Outlet context={this.store} />
        </>
      );
    } else {
      return (
        <div className="flex justify-center mt-8">
          <div className="p-6 text-center border rounded">
            Sidekiq does not appear to be configured for this project
          </div>
        </div>
      );
    }
  }
}

const PgHeroRoutes = (
  <Route path="/sidekiq" element={<Wrapper />}>
    <Route path="retries" element={<Retries />} />
    <Route path="errors" element={<Errors />} />
    <Route path="scheduled" element={<Scheduled />} />
    <Route path="dead" element={<Dead />} />
    <Route path="busy" element={<Busy />} />
    <Route path="queues/:queueName" element={<Queue />} />
    <Route path="queues" element={<Queues />} />
    <Route path="retries/:jobKey" element={<JobDetails jobType="retry" />} />
    <Route
      path="scheduled/:jobKey"
      element={<JobDetails jobType="scheduled" />}
    />
    <Route path="dead/:jobKey" element={<JobDetails jobType="dead" />} />
    <Route index element={<Dashboard />} />
    <Route path="*" element={<Dashboard />} />
  </Route>
);

export default PgHeroRoutes;
