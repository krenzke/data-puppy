import { makeAutoObservable, runInAction, transaction, autorun } from "mobx";
import { encodeParams, ApiPath, PaginationData } from "../api";
import TimespanStore from "stores/timespanStore";
import {
  HistoryGraphData,
  HostMetricAttributes,
  HostMetricsResponse,
} from "stores/types";
import DeploymentsStore from "stores/deploymentsStore";

export const HostMetricNames = [
  "total_system_mem",
  "free_system_mem",
  "pct_free_system_mem",
  "system_pct_cpu",
  "total_hdd",
  "free_hdd",
  "postgres_pct_cpu",
  "postgres_pct_mem",
  "ruby_pct_cpu",
  "ruby_pct_mem",
  "nginx_pct_cpu",
  "nginx_pct_mem",
  "elasticsearch_pct_cpu",
  "elasticsearch_pct_mem",
  "redis_pct_cpu",
  "redis_pct_mem",
] as const;
export type HostMetricName = (typeof HostMetricNames)[number];

const LIVE_POLL_INTERVAL = 10_000; // 10 seconds

export default class HostMetricsStore {
  history: HistoryGraphData<HostMetricAttributes[]> = {
    data: [],
    startTime: null,
    endTime: null,
    fetching: false,
    livePolling: false,
    timeout: null,
  };
  pagination: PaginationData | null = null;

  constructor(
    public timespanStore: TimespanStore,
    public deploymentsStore: DeploymentsStore
  ) {
    makeAutoObservable(this);
    autorun(() => {
      if (!timespanStore.includesNow) {
        runInAction(() => {
          this.setHistoryLivePolling(false);
        });
      }
    });
  }

  async fetchMetrics() {
    runInAction(() => {
      this.history.fetching = true;
      this.history.data.length = 0;
    });

    let page = 1;

    while (true) {
      const response = await this.fetchPage(page);
      if (response.meta.next_page) {
        page = response.meta.next_page;
      } else {
        break;
      }
    }

    if (this.history.livePolling && this.timespanStore.includesNow) {
      this.history.timeout = setTimeout(() => {
        this.fetchMetrics();
      }, LIVE_POLL_INTERVAL);
    }

    runInAction(() => (this.history.fetching = false));
  }

  fetchPage(page: number) {
    const { spanType, startDate, endDate, preferredDownsampleInterval } =
      this.timespanStore;

    const params = {
      span_type: spanType,
      start_date: startDate ? startDate.getTime() / 1000 : null,
      end_date: endDate ? endDate.getTime() / 1000 : null,
      page: page,
      per_page: 100,
      min_sample_spacing: preferredDownsampleInterval,
    };

    return fetch(`${ApiPath("/host_metrics")}?${encodeParams(params)}`)
      .then((response) => response.json())
      .then((response: HostMetricsResponse) => {
        return runInAction(() => {
          return transaction(() => {
            this.history.data.push(...response.data.map((d) => d.attributes));
            const { start_time, end_time, ...pagination } = response.meta;
            this.pagination = pagination;
            this.history.startTime = start_time;
            this.history.endTime = end_time;
            return response;
          });
        });
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
          this.fetchMetrics();
        }, LIVE_POLL_INTERVAL);
      }
    }
  }
}
