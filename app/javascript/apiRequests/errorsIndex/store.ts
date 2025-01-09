import { makeAutoObservable, runInAction, transaction } from "mobx";
import { encodeParams, ApiPath, PaginationData, JSON_HEADERS } from "../../api";
import TimespanStore from "stores/timespanStore";
import { ApiRequestsResponse, ApiRequestRecord, HTTPVerb } from "stores/types";

interface FilterParams {
  path: string;
  errorClass: string;
  minDuration: number;
  maxDuration: number;
  verbs: Set<HTTPVerb>;
}

export default class ApiErrorsStore {
  apiErrors: ApiRequestRecord[] = [];
  apiErrorsPagination: PaginationData | null = null;
  apiErrorsPage: number = 1;
  filterParams: FilterParams = {
    path: "",
    errorClass: "",
    minDuration: 0,
    maxDuration: Infinity,
    verbs: new Set<HTTPVerb>(),
  };

  constructor(public timespanStore: TimespanStore) {
    makeAutoObservable(this);
  }

  fetchApiErrors() {
    const { spanType, startDate, endDate } = this.timespanStore;
    const params = {
      path: this.filterParams.path,
      error_class: this.filterParams.errorClass,
      min_duration_ms: this.filterParams.minDuration,
      max_duration_ms:
        this.filterParams.maxDuration === Infinity
          ? null
          : this.filterParams.maxDuration,
      verbs: Array.from(this.filterParams.verbs),
      span_type: spanType,
      start_date: startDate ? startDate.getTime() / 1000 : null,
      end_date: endDate ? endDate.getTime() / 1000 : null,
      page: this.apiErrorsPage,
      per_page: 10,
      with_error: true,
    };
    fetch(`${ApiPath("/api_requests")}?${encodeParams(params)}`, {
      headers: JSON_HEADERS,
    })
      .then((response) => response.json())
      .then((response: ApiRequestsResponse) => {
        runInAction(() => {
          transaction(() => {
            this.apiErrors = response.data;
            const { start_time, end_time, ...pagination } = response.meta;
            this.apiErrorsPagination = pagination;
          });
        });
      });
  }

  incrementPage() {
    this.apiErrorsPage = this.apiErrorsPage + 1;
    if (this.apiErrorsPage > this.apiErrorsPagination!.max_page)
      this.apiErrorsPage = this.apiErrorsPagination!.max_page;
  }

  decrementPage() {
    this.apiErrorsPage = this.apiErrorsPage - 1;
    if (this.apiErrorsPage <= 0) this.apiErrorsPage = 1;
  }
}
