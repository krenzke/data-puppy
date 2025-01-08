import React from "react";
import PgHeroStore from "./pgheroStore";
import TimespanStore from "./timespanStore";
import DeploymentsStore from "./deploymentsStore";
import { Project } from "./types";

type StoreContextType = RootStore;

export const StoreContext = React.createContext<StoreContextType>(
  {} as RootStore
);
export const StoreProvider = StoreContext.Provider;

export type ContextType = React.ContextType<typeof StoreContext>;

export default class RootStore {
  public pgheroStore: PgHeroStore;
  public timespanStore: TimespanStore;
  public deploymentStore: DeploymentsStore;
  public project: Project;

  constructor(project: Project) {
    this.project = project;
    this.pgheroStore = new PgHeroStore();
    this.timespanStore = new TimespanStore();
    this.deploymentStore = new DeploymentsStore(this.timespanStore);
  }
}
