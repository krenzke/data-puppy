import React from "react";
import { createRoot } from "react-dom/client";
import { observer } from "mobx-react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import PgHeroRoutes from "admin/pghero/routes";
// import SidekiqRoutes from "admin/sidekiq/routes";
// import ApiMetricsRoutes from "admin/apiRequests/routes";
// import HostMetricsRoutes from "admin/hostMetrics/routes";
// import { API_PREFIX } from "api";
import Sidebar from "../components/sidebar";
import RootStore, { StoreProvider } from "../stores/rootStore";

const store = new RootStore(window.project);

const App = observer(
  class App extends React.Component {
    render() {
      return (
        <BrowserRouter basename={window.project.slug}>
          <StoreProvider value={store}>
            <div className="min-h-screen pl-40">
              <Sidebar />
              <Routes>
                <Route path="/api-metrics" element={<div>API REQUESTS</div>} />
                <Route path="/host-metrics" element={<div>HOST METRICS</div>} />
                <Route path="/pghero" element={<div>PGHERO</div>} />
                <Route path="/sidekiq" element={<div>SIDEKIQ</div>} />
                <Route path="*" element={<div>OTHER</div>}></Route>
              </Routes>
            </div>
          </StoreProvider>
        </BrowserRouter>
      );
    }
  }
);

const root = createRoot(document.getElementById("app")!);
root.render(<App />);
