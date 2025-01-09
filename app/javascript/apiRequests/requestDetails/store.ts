import { makeAutoObservable, runInAction, transaction } from "mobx";
import { API_PREFIX, JSON_HEADERS } from "../../api";
import {
  ApiRequestRecord,
  BackgroundJobErrorRecord,
  BackgroundJobRecord,
} from "stores/types";

interface DetailsResponse {
  api_request: ApiRequestRecord;
  background_jobs: BackgroundJobRecord[];
  background_job_errors: BackgroundJobErrorRecord[];
}

export default class RequestDetailsStore {
  request: ApiRequestRecord | null = null;
  backgroundJobs: BackgroundJobRecord[] = [];
  backgroundJobErrors: BackgroundJobErrorRecord[] = [];
  fetching: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  fetchRequestDetails(requestId: string) {
    this.fetching = true;
    fetch(`${API_PREFIX}/admin/api_requests/${requestId}`, {
      headers: JSON_HEADERS,
    })
      .then((response) => response.json())
      .then((response: DetailsResponse) => {
        runInAction(() => {
          transaction(() => {
            this.request = response.api_request;
            this.backgroundJobs = response.background_jobs;
            this.backgroundJobErrors = response.background_job_errors;
          });
        });
      })
      .finally(() => {
        runInAction(() => (this.fetching = false));
      });
  }
}
