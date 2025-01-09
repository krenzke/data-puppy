import React from "react";
import { action, makeAutoObservable } from "mobx";
import { TraceSpan } from "stores/types";
import { observer } from "mobx-react";
import cx from "classnames";
import Table, { TR, TD } from "components/table";

interface Props {
  spans: TraceSpan[];
}

type SpanMap = Record<number, TraceSpan[]>;

class Trace extends React.Component<Props> {
  store: Store = new Store();

  constructor(props: Props) {
    super(props);
    this.store.spans = props.spans;
  }

  rootSpans = () => {
    const rSpans = this.props.spans.filter((s) => s.parent_id == null);
    return sortSpans(rSpans);
  };

  childSpans = () => {
    const rSpans = this.props.spans.filter((s) => s.parent_id == null);
    return sortSpans(rSpans);
  };

  setActiveSpan = action((id: number) => {
    if (this.store.activeSpanId !== id) {
      this.store.activeSpanId = id;
    } else [(this.store.activeSpanId = null)];
  });

  renderSpanItem(span: TraceSpan) {
    const children = this.store.childrenFor(span);
    return (
      <li key={span.id}>
        {span.name}
        {children.length > 0 && (
          <ul className="ml-2 list-disc">
            {children.map((s) => this.renderSpanItem(s))}
          </ul>
        )}
      </li>
    );
  }

  renderSpanBar(
    span: TraceSpan,
    depth: number,
    accumulator: React.ReactNode[]
  ) {
    const { timeRange } = this.store;
    const t_start = span.t_start === null ? timeRange[0] : span.t_start;
    const t_end = t_start + span.duration;

    const pct_start =
      ((t_start * 1.0 - timeRange[0]) / (timeRange[1] - timeRange[0])) * 100.0;
    const pct_end =
      ((t_end * 1.0 - timeRange[0]) / (timeRange[1] - timeRange[0])) * 100.0;
    accumulator.push(
      <div
        key={span.id}
        title={span.name}
        onClick={() => this.setActiveSpan(span.id)}
        className={cx(
          "absolute bg-sky-400 text-white text-sm px-2 text-ellipsis overflow-hidden cursor-pointer hover:bg-sky-700",
          {
            active: "bg-sky-700",
          }
        )}
        style={{
          left: `${pct_start}%`,
          right: `${100.0 - pct_end}%`,
          top: `${depth * 25}px`,
          height: "20px",
        }}
      >
        {span.name}
      </div>
    );

    const children = this.store.childrenFor(span);
    if (children.length > 0) {
      children.forEach((c) => this.renderSpanBar(c, depth + 1, accumulator));
    }
  }

  render() {
    const { timeRange, activeSpan } = this.store;
    let bars: React.ReactNode[] = [];
    this.store.rootSpans.forEach((rootSpan) =>
      this.renderSpanBar(rootSpan, 0, bars)
    );

    return (
      <>
        <div>
          <span>
            {timeRange[0]} - {timeRange[1]}
          </span>
          <ul className="ml-2 list-disc">
            {this.store.rootSpans.map((span) => this.renderSpanItem(span))}
          </ul>
        </div>
        <div className="relative bg-slate-100 min-h-[200px]">{bars}</div>
        {activeSpan && (
          <div>
            <Table>
              <tbody>
                <TR>
                  <TD>ID</TD>
                  <TD>{activeSpan.id}</TD>
                </TR>
                <TR>
                  <TD>Start</TD>
                  <TD>{activeSpan.t_start}</TD>
                </TR>
                <TR>
                  <TD>Duration</TD>
                  <TD>{activeSpan.duration / 1000}ms</TD>
                </TR>
                <TR>
                  <TD>SQL</TD>
                  <TD>{activeSpan.sql}</TD>
                </TR>
              </tbody>
            </Table>
          </div>
        )}
      </>
    );
  }
}

function sortSpans(spans: TraceSpan[]): TraceSpan[] {
  return [...spans].sort((s1, s2) => {
    if (s1.t_start === null && s2.t_start === null) {
      return s1.name.localeCompare(s2.name);
    } else if (s1.t_start === null) {
      return 1;
    } else if (s2.t_start === null) {
      return -1;
    } else {
      return s2.t_start - s1.t_start;
    }
  });
}

class Store {
  spans: TraceSpan[] = [];
  activeSpanId: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  childrenFor(span: TraceSpan): TraceSpan[] {
    const children = this.spanMap[span.id] || [];
    return sortSpans(children);
  }

  get rootSpans(): TraceSpan[] {
    return sortSpans(this.spans.filter((s) => s.parent_id === null));
  }

  get activeSpan(): TraceSpan | null {
    if (this.activeSpanId === null) return null;
    const span = this.spans.find((s) => s.id === this.activeSpanId);
    return span || null;
  }

  get spanMap(): SpanMap {
    return this.spans.reduce((o: SpanMap, s) => {
      const key = s.parent_id || 0;
      o[key] ||= [];
      o[key].push(s);
      return o;
    }, {});
  }

  get timeRange(): number[] {
    let min = Infinity;
    let max = 0;
    this.spans.forEach((span) => {
      if (span.t_start && span.t_start < min) {
        min = span.t_start;
      }
      const t_end =
        span.t_start !== null && span.duration !== null
          ? span.t_start + span.duration
          : null;
      if (t_end && t_end > max) {
        max = t_end;
      }
    });

    if (min === Infinity) {
      min = 0;
    }
    if (max < min) {
      max = min + 100;
    }
    return [min, max];
  }
}

export default observer(Trace);
