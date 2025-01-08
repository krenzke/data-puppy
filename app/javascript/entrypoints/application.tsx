import React from "react";
import { createRoot } from "react-dom/client";
import { observer } from "mobx-react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import PgHeroRoutes from "admin/pghero/routes";
// import SidekiqRoutes from "admin/sidekiq/routes";
// import ApiMetricsRoutes from "admin/apiRequests/routes";
// import HostMetricsRoutes from "admin/hostMetrics/routes";
// import { API_PREFIX } from "api";
// import Sidebar from "admin/components/sidebar";
// import store, { StoreProvider } from "admin/rootStore";

// import "./admin.css";

class App extends React.Component {
  render() {
    return (
      <div className="min-h-screen">
        <div className="pl-40">
          <div className="p-4">
            <h1>This is react</h1>
          </div>
        </div>
      </div>
    );
  }
}

const OApp = observer(App);
const root = createRoot(document.getElementById("app")!);
root.render(<OApp />);
