import React from "react";
import { createRoot } from "react-dom/client";
import { observer } from "mobx-react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PgHeroRoutes from "../pghero/routes";
import SidekiqRoutes from "../sidekiq/routes";
import ApiMetricsRoutes from "../apiRequests/routes";
import HostMetricsRoutes from "../hostMetrics/routes";
import Sidebar from "../components/sidebar";
import RootStore, { StoreProvider } from "../stores/rootStore";

const store = new RootStore(window.currentProject);

const App = observer(
  class App extends React.Component {
    render() {
      return (
        <BrowserRouter basename={window.currentProject.slug}>
          <StoreProvider value={store}>
            <div className="flex min-h-screen">
              <div className="w-40">
                <Sidebar />
              </div>
              <div className="flex-1 px-4">
                <Routes>
                  {ApiMetricsRoutes}
                  {HostMetricsRoutes}
                  {PgHeroRoutes}
                  {SidekiqRoutes}
                  <Route path="*" element={<Navigate to="/api-metrics" />} />
                </Routes>
              </div>
            </div>
          </StoreProvider>
        </BrowserRouter>
      );
    }
  }
);

const root = createRoot(document.getElementById("app")!);
root.render(<App />);

document.addEventListener("DOMContentLoaded", () => {
  const projectSelector =
    document.querySelector<HTMLSelectElement>("#project-selector");

  projectSelector?.addEventListener("change", (e) => {
    const selectedOption =
      projectSelector.options[projectSelector.selectedIndex];

    window.location.href = selectedOption.dataset.url!;
  });
});
