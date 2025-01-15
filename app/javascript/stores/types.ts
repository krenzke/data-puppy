import { PaginationData, ResourceIdentifier } from "../api";

declare global {
  interface Window {
    currentProject: Project;
    projects: Project[];
  }
}

export type Project = {
  id: number;
  name: string;
  slug: string;
  has_pghero: boolean;
  has_sidekiq: boolean;
};

//////////////////////////////
// Generic
//////////////////////////////

export const httpVerbs = [
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
  "HEAD",
  "OPTION",
] as const;
export type HTTPVerb = (typeof httpVerbs)[number];

export const responseStatusRange = ["1xx", "2xx", "3xx", "4xx", "5xx"] as const;
export type ResponseStatusRange = (typeof responseStatusRange)[number];

//////////////////////////////
// Record Attributes
//////////////////////////////
export interface ApiRequestAttributes {
  time: number;
  path: string;
  verb: string;
  response_status: number;
  request_id: string;
  dt: number;
  query_count: number;
  total_query_duraction: number;
  error_class: string;
  error_message: string;
  backtrace: string[];
  trace: TraceSpan[];
}

export interface TraceSpan {
  id: number;
  name: string;
  duration: number;
  parent_id: number | null;
  t_start: number | null;
  sql: string;
}

export interface HostMetricAttributes {
  time: number;
  total_system_mem: number;
  free_system_mem: number;
  pct_free_system_mem: number;
  system_pct_cpu: number;
  total_hdd: number;
  free_hdd: number;
  postgres_pct_cpu: number;
  postgres_pct_mem: number;
  ruby_pct_cpu: number;
  ruby_pct_mem: number;
  nginx_pct_cpu: number;
  nginx_pct_mem: number;
  elasticsearch_pct_cpu: number;
  elasticsearch_pct_mem: number;
  redis_pct_cpu: number;
  redis_pct_mem: number;
}

export interface BackgroundJobAttributes {
  time: number;
  job_class: string;
  dt: number;
  jid: string;
  job_args: string[];
  request_id: string;
}

export interface BackgroundJobErrorAttributes {
  time: number;
  request_id: string;
  jid: string;
  job_class: string;
  error_class: string;
  error_message: string;
  backtrace: string[];
}

//////////////////////////////
// Record and Response types
//////////////////////////////
export interface ApiRequestRecord {
  attributes: ApiRequestAttributes;
  relationships: {
    api_errors: { data: ResourceIdentifier[] };
  };
}
export interface HostMetricRecord {
  attributes: HostMetricAttributes;
}
export interface BackgroundJobRecord {
  attributes: BackgroundJobAttributes;
}
export interface BackgroundJobErrorRecord {
  attributes: BackgroundJobErrorAttributes;
}
export interface ApiRequestsResponse {
  data: ApiRequestRecord[];
  meta: PaginationData & { start_time: number; end_time: number };
}
export interface HostMetricsResponse {
  data: HostMetricRecord[];
  meta: PaginationData & { start_time: number; end_time: number };
}
export interface BackgroundJobsResponse {
  data: BackgroundJobRecord[];
  meta: PaginationData & { start_time: number; end_time: number };
}
export interface BackgroundJobErrorsResponse {
  data: BackgroundJobErrorRecord[];
  meta: PaginationData & { start_time: number; end_time: number };
}

//////////////////////////////
// History data types
//////////////////////////////
export type HistoryGraphData<T> = {
  data: T;
  startTime: number | null;
  endTime: number | null;
  livePolling: boolean;
  fetching: boolean;
  timeout: NodeJS.Timeout | null;
};

export interface ApiHistoryByStatusDataPoint {
  time: number;
  "1xx": number;
  "2xx": number;
  "3xx": number;
  "4xx": number;
  "5xx": number;
}

export interface ApiHistoryBySuccessDataPoint {
  time: number;
  success: number;
  error: number;
}

export interface LatencyDataPoint {
  time: number;
  p50: number;
  p95: number;
  p99: number;
}

export interface ApiHistoryResponse {
  data: (ApiHistoryByStatusDataPoint | ApiHistoryBySuccessDataPoint)[];
  meta: {
    start_time: number;
    end_time: number;
  };
}

export interface LatencyResponse {
  data: LatencyDataPoint[];
  meta: {
    start_time: number;
    end_time: number;
  };
}

export function isStatusDataPoint(
  obj: any
): obj is ApiHistoryByStatusDataPoint {
  return obj["1xx"] !== undefined;
}

export function isSuccessDataPoint(
  obj: any
): obj is ApiHistoryBySuccessDataPoint {
  return obj["success"] !== undefined;
}
