import { autorun, makeAutoObservable, transaction } from "mobx";

export type SpanType =
  | "custom"
  | "prev_hour"
  | "prev_8_hours"
  | "prev_day"
  | "prev_2_days"
  | "prev_week"
  | "prev_month";

function fetchSpanFromLocalStorage(): {
  type: SpanType;
  startDate: Date | null;
  endDate: Date | null;
} | null {
  const v = localStorage.getItem("timespan");
  if (!v) return null;

  if (
    v === "prev_hour" ||
    v === "prev_8_hours" ||
    v === "prev_day" ||
    v === "prev_2_days" ||
    v === "prev_week" ||
    v === "prev_month"
  ) {
    return { type: v, startDate: null, endDate: null };
  }
  // otherwise, it's a comma-separated pair of unix timestamps
  const m = v.match(/^(?<t1>\d+),(?<t2>\d+)$/);
  if (!m) return null;

  const t1 = parseInt(m.groups!["t1"]);
  const t2 = parseInt(m.groups!["t2"]);
  return {
    type: "custom",
    startDate: new Date(t1 * 1000),
    endDate: new Date(t2 * 1000),
  };
}

export default class TimespanStore {
  spanType: SpanType;
  startDate: Date | null = null;
  endDate: Date | null = null;

  constructor() {
    makeAutoObservable(this);

    const localSpan = fetchSpanFromLocalStorage();
    if (!localSpan) {
      this.spanType = "prev_8_hours";
    } else if (localSpan.type === "custom") {
      this.spanType = "custom";
      this.startDate = localSpan.startDate;
      this.endDate = localSpan.endDate;
    } else {
      this.spanType = localSpan.type;
    }

    autorun(() => {
      switch (this.spanType) {
        case "prev_hour":
        case "prev_8_hours":
        case "prev_day":
        case "prev_2_days":
        case "prev_week":
        case "prev_month":
          localStorage.setItem("timespan", this.spanType);
          break;
        case "custom":
          if (this.startDate && this.endDate) {
            localStorage.setItem(
              "timespan",
              `${Math.floor(this.startDate.getTime() / 1000)},${Math.floor(
                this.endDate.getTime() / 1000
              )}`
            );
          }
          break;
      }
    });
  }

  setSpanAsTimestamps(t1: number | null, t2: number | null) {
    transaction(() => {
      this.spanType = "custom";
      this.startDate = t1 ? new Date(t1 * 1000) : null;
      this.endDate = t2 ? new Date(t2 * 1000) : null;
    });
  }

  get spanSizeInMin(): number {
    const customStart = this.startDate
      ? this.startDate.getTime()
      : new Date().getTime() - 3600_000;
    const customEnd = this.endDate
      ? this.endDate.getTime()
      : new Date().getTime();
    const customSize = (customEnd - customStart) / 1000 / 60;
    return {
      prev_hour: 60,
      prev_8_hours: 8 * 60,
      prev_day: 1440,
      prev_2_days: 2880,
      prev_week: 7 * 1440,
      prev_month: 30 * 1440,
      custom: customSize,
    }[this.spanType];
  }

  get preferredBucketSize(): string {
    const spanSize = this.spanSizeInMin;

    if (spanSize <= 120) {
      return "1m";
    } else if (spanSize <= 8 * 60) {
      return "5m";
    } else if (spanSize <= 1440) {
      return "30m";
    } else if (spanSize <= 2880) {
      return "1h";
    } else if (spanSize <= 7 * 1440) {
      return "12h";
    } else {
      return "1d";
    }
  }

  // only for host metrics currently, assumes
  // a nominal data point spacing of 30 sec
  // returns a number of _seconds_ for interval
  get preferredDownsampleInterval(): number {
    const spanSize = this.spanSizeInMin;

    if (spanSize <= 8 * 60) {
      return 30;
    } else if (spanSize <= 2880) {
      return 5 * 60;
    } else if (spanSize <= 7 * 1440) {
      return 10 * 60;
    } else {
      return 30 * 60;
    }
  }

  get includesNow(): boolean {
    return this.spanType !== "custom" || this.endDate === null;
  }
}
