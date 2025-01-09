import { makeAutoObservable, runInAction, transaction, autorun } from "mobx";
import { encodeParams, API_PREFIX, PaginationData } from "../../api";
import TimespanStore from "stores/timespanStore";
import {
  ApiRequestRecord,
  ApiRequestsResponse,
  ApiHistoryByStatusDataPoint,
  ApiHistoryBySuccessDataPoint,
  ApiHistoryResponse,
  isStatusDataPoint,
  LatencyDataPoint,
  LatencyResponse,
  HistoryGraphData,
  HTTPVerb,
  ResponseStatusRange,
} from "stores/types";

export const sortOptions = ["time", "duration", "query_count"] as const;
export type SortOption = (typeof sortOptions)[number];

export const historyOptions = ["response_status", "error"] as const;
export type HistoryOption = (typeof historyOptions)[number];

type HistoryDataType = {
  latency: LatencyDataPoint[];
  requests: (ApiHistoryByStatusDataPoint | ApiHistoryBySuccessDataPoint)[];
};

interface FilterParams {
  path: string;
  minDuration: number;
  maxDuration: number;
  verbs: Set<HTTPVerb>;
  statuses: Set<ResponseStatusRange>;
}

interface QueryParams {
  path: string;
  min_duration_ms: number;
  max_duration_ms: number | null;
  verbs: string[];
  statuses: string[];
  span_type: string;
  start_date: number | null;
  end_date: number | null;
  sort: string;
  page?: number;
  per_page?: number;
}

const LIVE_POLL_INTERVAL = 5000;

export default class ApiMetricsStore {
  requestsFilterParams: FilterParams = {
    path: "",
    minDuration: 0,
    maxDuration: Infinity,
    verbs: new Set<HTTPVerb>(),
    statuses: new Set<ResponseStatusRange>(),
  };
  sortOption: SortOption = "time";
  apiRequests: ApiRequestRecord[] = [];
  apiRequestsPagination: PaginationData | null = null;
  apiRequestsPage: number = 1;

  historyGrouping: HistoryOption = "response_status";
  history: HistoryGraphData<HistoryDataType> = {
    data: {
      latency: [],
      requests: [],
    },
    startTime: null,
    endTime: null,
    livePolling: false,
    fetching: false,
    timeout: null,
  };

  constructor(public timespanStore: TimespanStore) {
    makeAutoObservable(this);
    autorun(() => {
      if (!timespanStore.includesNow) {
        runInAction(() => {
          this.setHistoryLivePolling(false);
        });
      }
    });
  }

  fetchApiRequests() {
    const params = this.queryParams;
    fetch(`${API_PREFIX}/admin/api_requests?${encodeParams(params)}`)
      .then((response) => response.json())
      .then((response: ApiRequestsResponse) => {
        runInAction(() => {
          transaction(() => {
            this.apiRequests = response.data;
            const { start_time, end_time, ...pagination } = response.meta;
            this.apiRequestsPagination = pagination;
          });
        });
      });
  }

  incrementPage() {
    this.apiRequestsPage = this.apiRequestsPage + 1;
    if (this.apiRequestsPage > this.apiRequestsPagination!.max_page)
      this.apiRequestsPage = this.apiRequestsPagination!.max_page;
  }

  decrementPage() {
    this.apiRequestsPage = this.apiRequestsPage - 1;
    if (this.apiRequestsPage <= 0) this.apiRequestsPage = 1;
  }

  fetchHistoryData() {
    this.history.fetching = true;
    const { span_type, start_date, end_date } = this.queryParams;
    const params = {
      span_type,
      start_date,
      end_date,
      group_by: this.historyGrouping,
      bucket_size: this.timespanStore.preferredBucketSize,
    };
    const requestHistory = fetch(
      `${API_PREFIX}/admin/api_requests/history?${encodeParams(params)}`
    ).then((response) => response.json());

    const latencyHistory = fetch(
      `${API_PREFIX}/admin/api_requests/latency_history?${encodeParams(params)}`
    ).then((response) => response.json());

    Promise.all([requestHistory, latencyHistory])
      .then(
        ([requestData, latencyData]: [ApiHistoryResponse, LatencyResponse]) => {
          runInAction(() => {
            transaction(() => {
              this.history.startTime = requestData.meta.start_time;
              this.history.endTime = requestData.meta.end_time;
              this.history.data.requests = requestData.data;
              this.history.data.latency = latencyData.data;
              if (this.history.livePolling && this.timespanStore.includesNow) {
                this.history.timeout = setTimeout(() => {
                  this.fetchHistoryData();
                }, LIVE_POLL_INTERVAL);
              }
            });
          });
        }
      )
      .finally(() => {
        runInAction(() => (this.history.fetching = false));
      });
  }

  setHistoryLivePolling(live: boolean = true) {
    const { includesNow } = this.timespanStore;
    if (!includesNow || !live) {
      this.history.livePolling = false;
      if (this.history.timeout) {
        clearTimeout(this.history.timeout);
        this.history.timeout = null;
      }
    } else if (live) {
      this.history.livePolling = true;
      if (!this.history.timeout) {
        this.history.timeout = setTimeout(() => {
          this.fetchHistoryData();
        }, LIVE_POLL_INTERVAL);
      }
    }
  }

  get queryParams(): QueryParams {
    const { spanType, startDate, endDate } = this.timespanStore;
    return {
      path: this.requestsFilterParams.path,
      min_duration_ms: this.requestsFilterParams.minDuration,
      max_duration_ms:
        this.requestsFilterParams.maxDuration === Infinity
          ? null
          : this.requestsFilterParams.maxDuration,
      verbs: Array.from(this.requestsFilterParams.verbs),
      statuses: Array.from(this.requestsFilterParams.statuses),
      span_type: spanType,
      start_date: startDate ? startDate.getTime() / 1000 : null,
      end_date: endDate ? endDate.getTime() / 1000 : null,
      sort: this.sortOption,
      page: this.apiRequestsPage,
      per_page: 10,
    };
  }

  get isStatusHistory(): boolean {
    if (this.history.data.requests.length === 0) return true;
    return isStatusDataPoint(this.history.data.requests[0]);
  }
}
