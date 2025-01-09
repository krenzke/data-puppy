import { makeAutoObservable, runInAction } from "mobx";
import { encodeParams, ApiPath } from "../api";

interface SummaryData {
  numConnections: number;
  maxConnections: number;
  dbSize: number;
  relationSummaries: RelationSummary[];
}

interface RelationSummary {
  name: string;
  size: number;
  type: string;
  used: boolean;
}

interface ExplainResponse {
  explanation: string;
}

interface QueriesResponse {
  liveQueries?: LiveQueryData[];
  historicalQueries?: HistoricalQueryData[];
}

interface LiveQueryData {
  pid: string;
  duration_ms: number;
  state: string;
  query: string;
  source: string;
}

interface HistoricalQueryData {
  all_queries_total_minutes: number;
  average_time: number;
  calls: number;
  query: string;
  total_minutes: number;
  total_percent: number;
}

declare global {
  interface Window {
    pgHeroSummaryData?: SummaryData;
    liveQueryData?: LiveQueryData[];
    historicalQueryData?: HistoricalQueryData[];
  }
}

export type QuerySortOption = "average_time" | "calls" | null;

export default class PgHeroStore {
  // Summary
  summaryData: SummaryData = {
    numConnections: 0,
    maxConnections: 0,
    dbSize: 0,
    relationSummaries: [],
  };

  // Explain
  explainQuery: string = "";
  explainResult: string = "";

  // Queries
  liveQueries: LiveQueryData[] = [];
  historicalQueries: HistoricalQueryData[] = [];
  queriesSortBy: QuerySortOption = null;

  constructor() {
    makeAutoObservable(this);
  }

  loadSummaryData() {
    if (window.pgHeroSummaryData) {
      this.summaryData = window.pgHeroSummaryData;
      delete window.pgHeroSummaryData;
    } else {
      fetch(`${ApiPath("/pghero")}`, {
        headers: {
          Accepts: "application/json",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data: SummaryData) => {
          runInAction(() => {
            this.summaryData = data;
          });
        });
    }
  }

  loadLiveQueryData() {
    const queryString = encodeParams({
      live: true,
    });
    fetch(`${ApiPath("/pghero/queries")}?${queryString}`)
      .then((response) => response.json())
      .then((data: QueriesResponse) => {
        runInAction(() => {
          this.liveQueries = data.liveQueries!;
        });
      });
  }

  loadHistoricalQueryData(sort: QuerySortOption) {
    this.queriesSortBy = sort;
    const queryString = encodeParams({
      historical: true,
      sort: this.queriesSortBy,
    });
    fetch(`${ApiPath("/pghero/queries")}?${queryString}`)
      .then((response) => response.json())
      .then((data: QueriesResponse) => {
        runInAction(() => {
          this.historicalQueries = data.historicalQueries!;
        });
      });
  }

  fetchExplain(analyze = false) {
    fetch(`${ApiPath("/pghero/explain")}`, {
      method: "POST",
      headers: {
        Accepts: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: this.explainQuery, analyze: analyze }),
    })
      .then((response) => response.json())
      .then((data: ExplainResponse) => {
        runInAction(() => {
          this.explainResult = data.explanation;
        });
      });
  }

  get sortedRelationSummaries(): RelationSummary[] {
    return this.summaryData.relationSummaries
      .slice()
      .sort((a, b) => b.size - a.size);
  }
}
