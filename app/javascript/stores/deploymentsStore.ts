import { makeAutoObservable, runInAction, transaction } from "mobx";
import { encodeParams, API_PREFIX, PaginationData } from "../api";
import TimespanStore from "./timespanStore";

export interface DeploymentAttributes {
  time: number;
  branch: string;
  sha: string;
  release: string;
  deployer: string;
}

export interface DeploymentRecord {
  attributes: DeploymentAttributes;
}

export interface DeploymentsResponse {
  data: DeploymentRecord[];
  meta: PaginationData & { start_time: number; end_time: number };
}

export default class DeploymentsStore {
  deployments: DeploymentRecord[] = [];
  startTime: number | null = null;
  endTime: number | null = null;
  pagination: PaginationData | null = null;

  constructor(public timespanStore: TimespanStore) {
    makeAutoObservable(this);
  }

  fetchDeployments() {
    const { spanType, startDate, endDate } = this.timespanStore;

    const params = {
      span_type: spanType,
      start_date: startDate ? startDate.getTime() / 1000 : null,
      end_date: endDate ? endDate.getTime() / 1000 : null,
      per_page: 10,
    };

    fetch(`${API_PREFIX}/admin/deployments?${encodeParams(params)}`)
      .then((response) => response.json())
      .then((response: DeploymentsResponse) => {
        runInAction(() => {
          transaction(() => {
            this.deployments = response.data;
            const { start_time, end_time, ...pagination } = response.meta;
            this.pagination = pagination;
            this.startTime = start_time;
            this.endTime = end_time;
          });
        });
      });
  }
}
