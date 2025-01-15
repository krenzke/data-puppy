import { autorun, makeAutoObservable, runInAction, transaction } from "mobx";
import { encodeParams, ApiPath, PaginationData, JSON_HEADERS } from "../api";
import TimespanStore from "stores/timespanStore";
import {
  HistoryGraphData,
  BackgroundJobsResponse,
  BackgroundJobRecord,
} from "stores/types";

interface SidekiqStats {
  processed: number;
  failed: number;
  scheduled: number;
  retries: number;
  dead: number;
  enqueued: number;
  processes: number;
  busy: number;
  queue_latency: number;
}

interface StatsResponse extends SidekiqStats {
  time: number;
}

interface SidekiqProcess {
  hostname: string;
  pid: string;
  tag: string;
  labels: string[];
  stopping: boolean;
  isLead: boolean;
  queues: string[];
  startedAt: number;
  rss: number;
  concurrency: number;
  busy: number;
}

interface ProcessStats {
  processes: number;
  threads: number;
  busy: number;
  rss: number;
}

interface ProcessResponse {
  stats: ProcessStats;
  processes: SidekiqProcess[];
  jobs: SidekiqJobRecordWithProcess[];
}

interface HistoryDataPoint {
  time: number; // unix epoch
  success: number;
  error: number;
}

export const historyKeys = ["processedCount", "failedCount"] as const;
export type HistoryKeys = (typeof historyKeys)[number];

interface HistoryResponse {
  data: HistoryDataPoint[];
  meta: {
    start_time: number;
    end_time: number;
  };
}

export type JobType = "retry" | "dead" | "scheduled";
type JobUpdateAction = "retry" | "kill" | "delete" | "add_to_queue";
type JobUpdateAllAction = "retry_all" | "kill_all" | "clear";

export interface SidekiqJobRecord {
  at: number | null;
  score: number | null;
  queue: string;
  displayClass: string;
  displayArgs: string[];
  enqueuedAt: number | null;
  createdAt: number;
  item: {
    error_class: string;
    error_message: string;
    jid: string;
    failed_at: number;
    retry_count: number;
  };
}

interface SidekiqJobRecordWithProcess extends SidekiqJobRecord {
  process: string;
  thread: string;
  runAt: number;
}

export interface Queue {
  name: string;
  size: number;
  paused: boolean;
  latency: number;
}

export interface SidekiqPagination {
  currPage: number;
  recordCount: number;
  perPage: number;
}

interface SortedSidekiqJobResponse {
  jobs: SidekiqJobRecord[];
  pagination: SidekiqPagination;
}

interface BackgroundJobsQueryParams {
  page?: number;
  perPage?: number;
  jobClass?: string;
  minDuration: number;
  maxDuration: number;
}

export const sortOptions = ["time", "duration"] as const;
export type SortOption = (typeof sortOptions)[number];

const LIVE_POLLING_INTERVAL = 5000;

export default class SidekiqStore {
  sidekiqStats: SidekiqStats = {
    processed: 0,
    failed: 0,
    scheduled: 0,
    retries: 0,
    dead: 0,
    enqueued: 0,
    processes: 0,
    busy: 0,
    queue_latency: 0,
  };

  historyData: HistoryGraphData<HistoryDataPoint[]> = {
    data: [],
    startTime: null,
    endTime: null,
    fetching: false,
    livePolling: false,
    timeout: null,
  };

  sidekiqJobsQueryParams = { jobType: "retry", page: 1 };
  sidekiqJobsData: SortedSidekiqJobResponse = {
    jobs: [],
    pagination: {
      currPage: 1,
      recordCount: 0,
      perPage: 25,
    },
  };

  queues: Queue[] = [];
  queue: Queue | null = null;

  currentSidekiqJob: SidekiqJobRecord | null = null;

  processes: SidekiqProcess[] = [];
  processStats: ProcessStats = {
    processes: 0,
    threads: 0,
    busy: 0,
    rss: 0,
  };
  processJobs: SidekiqJobRecordWithProcess[] = [];

  backgroundJobs: BackgroundJobRecord[] = [];
  backgroundJobsQueryParams: BackgroundJobsQueryParams = {
    page: 1,
    perPage: 10,
    minDuration: 0,
    maxDuration: Infinity,
  };
  backgroundJobsSortOrder: SortOption = "time";
  backgroundJobsPagination: PaginationData | null = null;
  backgroundJobsPage: number = 1;
  backgroundJobsStartTime: number | null = null;
  backgroundJobsEndTime: number | null = null;

  constructor(public timespanStore: TimespanStore) {
    makeAutoObservable(this);
    autorun(() => {
      if (!timespanStore.includesNow) {
        runInAction(() => {
          this.setLivePolling(false);
        });
      }
    });
  }

  fetchStats() {
    fetch(`${ApiPath("/sidekiq/stats")}`)
      .then((response) => response.json())
      .then((data: StatsResponse) => {
        runInAction(() => {
          const { time, ...rest } = data;
          this.sidekiqStats = rest;
        });
      });
  }

  fetchHistory() {
    this.historyData.fetching = true;
    const { spanType, startDate, endDate } = this.timespanStore;
    const params = {
      span_type: spanType,
      start_date: startDate ? startDate.getTime() / 1000 : null,
      end_date: endDate ? endDate.getTime() / 1000 : null,
      bucket_size: this.timespanStore.preferredBucketSize,
    };

    fetch(`${ApiPath("/sidekiq/history")}?${encodeParams(params)}`)
      .then((response) => response.json())
      .then((data: HistoryResponse) => {
        runInAction(() => {
          transaction(() => {
            this.historyData.data = data.data;
            this.historyData.startTime = data.meta.start_time;
            this.historyData.endTime = data.meta.end_time;
            if (
              this.historyData.livePolling &&
              this.timespanStore.includesNow
            ) {
              this.historyData.timeout = setTimeout(() => {
                this.fetchHistory();
              }, LIVE_POLLING_INTERVAL);
            }
          });
        });
      })
      .finally(() => {
        runInAction(() => (this.historyData.fetching = false));
      });
  }

  setLivePolling(live: boolean = true) {
    const { includesNow } = this.timespanStore;
    if (!includesNow || !live) {
      this.historyData.livePolling = false;
      if (this.historyData.timeout) {
        clearTimeout(this.historyData.timeout);
        this.historyData.timeout = null;
      }
    } else if (live) {
      this.historyData.livePolling = true;
      if (!this.historyData.timeout) {
        this.historyData.timeout = setTimeout(() => {
          this.fetchHistory();
        }, LIVE_POLLING_INTERVAL);
      }
    }
  }

  fetchQueues() {
    fetch(`${ApiPath("/sidekiq/queues")}`, {
      headers: JSON_HEADERS,
    })
      .then((response) => response.json())
      .then((data: { queues: Queue[] }) => {
        runInAction(() => {
          this.queues = data.queues;
        });
      });
  }

  fetchQueue(name: string) {
    return fetch(ApiPath(`/sidekiq/queues/${name}`), {
      headers: JSON_HEADERS,
    })
      .then((response) => response.json())
      .then((data: { queue: Queue }) => {
        runInAction(() => {
          this.queue = data.queue;
        });
      });
  }

  fetchProcesses() {
    return fetch(`${ApiPath("/sidekiq/processes")}`, {
      headers: JSON_HEADERS,
    })
      .then((response) => response.json())
      .then((data: ProcessResponse) => {
        runInAction(() => {
          this.processStats = data.stats;
          this.processes = data.processes;
          this.processJobs = data.jobs;
        });
      });
  }

  fetchBackgroundJobs() {
    const { spanType, startDate, endDate } = this.timespanStore;
    const params = {
      min_duration: this.backgroundJobsQueryParams.minDuration,
      max_duration:
        this.backgroundJobsQueryParams.maxDuration === Infinity
          ? null
          : this.backgroundJobsQueryParams.maxDuration,
      span_type: spanType,
      start_date: startDate ? startDate.getTime() / 1000 : null,
      end_date: endDate ? endDate.getTime() / 1000 : null,
      sort: this.backgroundJobsSortOrder,
      page: this.backgroundJobsPage,
      per_page: 10,
      job_class: this.backgroundJobsQueryParams.jobClass,
    };
    fetch(`${ApiPath("/sidekiq")}?${encodeParams(params)}`, {
      headers: JSON_HEADERS,
    })
      .then((response) => response.json())
      .then((data: BackgroundJobsResponse) => {
        runInAction(() => {
          transaction(() => {
            this.backgroundJobs = data.data;
            const { start_time, end_time, ...pagination } = data.meta;
            this.backgroundJobsPagination = pagination;
            this.backgroundJobsStartTime = start_time;
            this.backgroundJobsEndTime = end_time;
          });
        });
      });
  }

  incrementPage() {
    this.backgroundJobsPage = this.backgroundJobsPage + 1;
    if (this.backgroundJobsPage > this.backgroundJobsPagination!.max_page)
      this.backgroundJobsPage = this.backgroundJobsPagination!.max_page;
  }

  decrementPage() {
    this.backgroundJobsPage = this.backgroundJobsPage - 1;
    if (this.backgroundJobsPage <= 0) this.backgroundJobsPage = 1;
  }

  fetchSidekiqJobs() {
    const { jobType, ...rest } = this.sidekiqJobsQueryParams;
    fetch(`${ApiPath(`/sidekiq/jobs/${jobType}`)}?${encodeParams(rest)}`, {
      headers: JSON_HEADERS,
    })
      .then((response) => response.json())
      .then((data: SortedSidekiqJobResponse) => {
        runInAction(() => {
          transaction(() => {
            this.sidekiqJobsData = data;
            this.sidekiqJobsQueryParams.page = data.pagination.currPage;
          });
        });
      });
  }

  fetchRetries() {
    this.sidekiqJobsQueryParams.jobType = "retry";
    this.sidekiqJobsQueryParams.page = 1;
    this.fetchSidekiqJobs();
  }

  fetchScheduled() {
    this.sidekiqJobsQueryParams.jobType = "scheduled";
    this.sidekiqJobsQueryParams.page = 1;
    this.fetchSidekiqJobs();
  }

  fetchDead() {
    this.sidekiqJobsQueryParams.jobType = "dead";
    this.sidekiqJobsQueryParams.page = 1;
    this.fetchSidekiqJobs();
  }

  fetchJobsForQueue(_queueName: string) {
    this.sidekiqJobsQueryParams.jobType = "queue";
    this.sidekiqJobsQueryParams.page = 1;
    this.fetchSidekiqJobs();
  }

  incrementJobsPage() {
    const { pagination } = this.sidekiqJobsData;
    const maxPage = Math.ceil(pagination.recordCount / pagination.perPage);
    if (this.sidekiqJobsQueryParams.page < maxPage) {
      this.sidekiqJobsQueryParams.page += 1;
      this.fetchSidekiqJobs();
    }
  }

  decrementJobsPage() {
    if (this.sidekiqJobsQueryParams.page > 1) {
      this.sidekiqJobsQueryParams.page -= 1;
      this.fetchSidekiqJobs();
    }
  }

  fetchJob(jobType: JobType, key: string) {
    return fetch(ApiPath(`/sidekiq/jobs/${jobType}/${key}`), {
      headers: JSON_HEADERS,
    })
      .then((response) => response.json())
      .then((data: { job: SidekiqJobRecord }) => {
        runInAction(() => {
          this.currentSidekiqJob = data.job;
        });
      });
  }

  fetchRetryJob(key: string) {
    return this.fetchJob("retry", key);
  }

  fetchScheduledJob(key: string) {
    return this.fetchJob("scheduled", key);
  }

  fetchDeadJob(key: string) {
    return this.fetchJob("dead", key);
  }

  updateJob(job: SidekiqJobRecord, jobType: JobType, action: JobUpdateAction) {
    return fetch(
      ApiPath(`/sidekiq/jobs/${jobType}/${job.at}-${job.item.jid}`),
      {
        headers: JSON_HEADERS,
        method: "PUT",
        body: JSON.stringify({ job_action: action }),
      }
    ).then((response) => response.json());
  }

  updateScheduled(job: SidekiqJobRecord, action: "add_to_queue" | "delete") {
    return this.updateJob(job, "scheduled", action);
  }

  updateRetry(job: SidekiqJobRecord, action: "retry" | "kill" | "delete") {
    return this.updateJob(job, "retry", action);
  }

  updateDead(job: SidekiqJobRecord, action: "retry" | "delete") {
    return this.updateJob(job, "dead", action);
  }

  updateAll(jobType: JobType, action: JobUpdateAllAction) {
    return fetch(ApiPath(`/sidekiq/jobs/${jobType}`), {
      headers: JSON_HEADERS,
      method: "PUT",
      body: JSON.stringify({ job_action: action }),
    }).then((response) => response.json());
  }

  updateAllRetry(action: "retry_all" | "kill_all" | "clear") {
    return this.updateAll("retry", action);
  }

  updateAllDead(action: "retry_all" | "clear") {
    return this.updateAll("dead", action);
  }

  clearQueue(queue: Queue) {
    return fetch(ApiPath(`/sidekiq/queues/${queue.name}`), {
      headers: JSON_HEADERS,
      method: "DELETE",
    }).then((response) => response.json());
  }

  removeJobFromQueue(job: SidekiqJobRecord, queue: Queue) {
    return fetch(ApiPath(`/sidekiq/queues/${queue.name}/remove_job`), {
      headers: JSON_HEADERS,
      method: "POST",
      body: JSON.stringify({ job_item: JSON.stringify(job.item) }),
    }).then((response) => response.json());
  }
}
