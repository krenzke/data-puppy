import React from "react";
import { Route, Outlet } from "react-router-dom";
import Dashboard from "./dashboard";
import ErrorsIndex from "./errorsIndex";
import RequestDetails from "./requestDetails";
import NavigationTabs from "components/navigationTabs";

const Wrapper = () => {
  return (
    <>
      <>
        <div>
          <NavigationTabs
            tabs={[
              { to: "", label: "Dashboard" },
              { to: "errors", label: "Errors" },
            ]}
          />
        </div>
        <Outlet />
      </>
    </>
  );
};

const ApiMetricsRoutes = (
  <Route path="/api-metrics" element={<Wrapper />}>
    <Route path="errors" element={<ErrorsIndex />} />
    <Route path=":requestId" element={<RequestDetails />} />
    <Route index element={<Dashboard />} />
    <Route path="*" element={<Dashboard />} />
  </Route>
);

export default ApiMetricsRoutes;
