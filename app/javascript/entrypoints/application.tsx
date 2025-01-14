import React from "react";
import { createRoot } from "react-dom/client";
import { observer } from "mobx-react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import PgHeroRoutes from "admin/pghero/routes";
// import SidekiqRoutes from "admin/sidekiq/routes";
import ApiMetricsRoutes from "../apiRequests/routes";
import HostMetricsRoutes from "../hostMetrics/routes";
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
                {ApiMetricsRoutes}
                {HostMetricsRoutes}
                <Route path="/pghero" element={<div>PGHERO</div>} />
                <Route path="/sidekiq" element={<div>SIDEKIQ</div>} />
                <Route path="*" element={<Navigate to="/api-metrics" />} />
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
