import React from "react";
import { NavLink } from "react-router-dom";
import cx from "classnames";

interface NavigationTabProps {
  label: string;
  to: string;
}

const NavigationTab: React.FC<NavigationTabProps> = ({ label, to }) => {
  return (
    <NavLink
      end
      to={to}
      className={({ isActive }) =>
        cx(
          "border-slate-200 border-t-2 border-x border-b px-4 py-2 min-w-[150px] hover:border-t-sky-500 hover:bg-slate-200",
          {
            "border-t-transparent": !isActive,
            "border-x-transparent": !isActive,
            "border-t-sky-500": isActive,
            "border-b-transparent": isActive,
          }
        )
      }
    >
      {label}
    </NavLink>
  );
};

interface NavigaionTabsProps {
  tabs: NavigationTabProps[];
}

const NavigationTabs: React.FC<NavigaionTabsProps> = ({ tabs }) => {
  return (
    <div className="flex">
      {tabs.map((t, i) => (
        <NavigationTab {...t} key={i} />
      ))}
    </div>
  );
};

export default NavigationTabs;
