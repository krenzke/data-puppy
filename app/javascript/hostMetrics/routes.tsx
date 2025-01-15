import { Route, Outlet } from "react-router-dom";
import Dashboard from "./dashboard";

const Wrapper = () => {
  return (
    <div className="mt-4">
      <Outlet />
    </div>
  );
};

const HostMetricsRoutes = (
  <Route path="/host-metrics" element={<Wrapper />}>
    <Route index element={<Dashboard />} />
    <Route path="*" element={<Dashboard />} />
  </Route>
);

export default HostMetricsRoutes;
