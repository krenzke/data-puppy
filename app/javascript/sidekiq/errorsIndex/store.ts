import { makeAutoObservable, runInAction, transaction } from "mobx";
import { encodeParams, ApiPath, PaginationData, JSON_HEADERS } from "../../api";
import TimespanStore from "stores/timespanStore";
import {
  BackgroundJobErrorRecord,
  BackgroundJobErrorsResponse,
} from "stores/types";

interface FilterParams {
  jobClass: string;
}

export default class BackgroundJobErrorsStore {
  backgroundJobErrors: BackgroundJobErrorRecord[] = [];
  backgroundJobErrorsPagination: PaginationData | null = null;
  backgroundJobErrorsPage: number = 1;
  filterParams: FilterParams = {
    jobClass: "",
  };

  constructor(public timespanStore: TimespanStore) {
    makeAutoObservable(this);
  }

  fetchBackgroundJobErrors() {
    const { spanType, startDate, endDate } = this.timespanStore;
    const params = {
      job_class: this.filterParams.jobClass,
      span_type: spanType,
      start_date: startDate ? startDate.getTime() / 1000 : null,
      end_date: endDate ? endDate.getTime() / 1000 : null,
      page: this.backgroundJobErrorsPage,
      per_page: 10,
    };
    fetch(`${ApiPath("/sidekiq/errors")}?${encodeParams(params)}`, {
      headers: JSON_HEADERS,
    })
      .then((response) => response.json())
      .then((response: BackgroundJobErrorsResponse) => {
        runInAction(() => {
          transaction(() => {
            this.backgroundJobErrors = response.data;
            const { start_time, end_time, ...pagination } = response.meta;
            this.backgroundJobErrorsPagination = pagination;
          });
        });
      });
  }

  incrementPage() {
    this.backgroundJobErrorsPage = this.backgroundJobErrorsPage + 1;
    if (
      this.backgroundJobErrorsPage >
      this.backgroundJobErrorsPagination!.max_page
    )
      this.backgroundJobErrorsPage =
        this.backgroundJobErrorsPagination!.max_page;
  }

  decrementPage() {
    this.backgroundJobErrorsPage = this.backgroundJobErrorsPage - 1;
    if (this.backgroundJobErrorsPage <= 0) this.backgroundJobErrorsPage = 1;
  }
}
