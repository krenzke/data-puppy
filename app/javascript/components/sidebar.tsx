import React from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router";
import cx from "classnames";

const PATH_PREFIXES = {
  "/api-metrics": "api-metrics",
  "/host-metrics": "host-metrics",
  "/sidekiq": "sidekiq",
  "/pghero": "pghero"
};

interface SidebarItemProps {
  to: string;
  active: boolean;
  label: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, active, label }) => (
  <li>
    <Link
      to={to}
      className={cx("p-6 block hover:bg-slate-500", {
        "bg-slate-500": active
      })}
    >
      {label}
    </Link>
  </li>
);

const Sidebar = () => {
  const location = useLocation();
  let currActive: string | null = null;
  for (const [k, v] of Object.entries(PATH_PREFIXES)) {
    if (location.pathname.startsWith(k)) {
      currActive = v;
    }
  }

  return (
    <ul className="fixed left-0 top-0 bottom-0 w-40 bg-slate-700 text-white min-h-screen">
      <SidebarItem
        to="/api-metrics"
        label="API Metrics"
        active={currActive === "api-metrics"}
      />
      <SidebarItem
        to="/host-metrics"
        label="Host Metrics"
        active={currActive === "host-metrics"}
      />
      <SidebarItem
        to="/pghero"
        label="PgHero"
        active={currActive === "pghero"}
      />
      <SidebarItem
        to="/sidekiq"
        label="Sidekiq"
        active={currActive === "sidekiq"}
      />
    </ul>
  );
};

export default Sidebar;
