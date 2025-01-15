import { Route, Outlet } from "react-router-dom";
import Explain from "./explain";
import Queries from "./queries";
import Home from "./home";
import NavigationTabs from "components/navigationTabs";

const Wrapper = () => {
  if (window.currentProject.has_pghero) {
    return (
      <>
        <div className="mt-2">
          <NavigationTabs
            tabs={[
              { to: "", label: "Summary" },
              { to: "explain", label: "Explain" },
              { to: "queries", label: "Queries" },
            ]}
          />
        </div>
        <Outlet />
      </>
    );
  } else {
    return (
      <div className="flex justify-center mt-8">
        <div className="p-6 text-center border rounded">
          PgHero does not appear to be configured for this project
        </div>
      </div>
    );
  }
};

const PgHeroRoutes = (
  <Route path="/pghero" element={<Wrapper />}>
    <Route path="explain" element={<Explain />} />
    <Route path="queries" element={<Queries />} />
    <Route index element={<Home />} />
    <Route path="*" element={<Home />} />
  </Route>
);

export default PgHeroRoutes;
