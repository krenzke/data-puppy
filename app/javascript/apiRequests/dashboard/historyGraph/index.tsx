import React from "react";
import { observer } from "mobx-react";
import { computed, makeObservable, observable } from "mobx";
import { HistoryOption } from "../store";
import {
  ApiHistoryByStatusDataPoint,
  ApiHistoryBySuccessDataPoint,
} from "stores/types";
import { action } from "mobx";
import { DeploymentRecord } from "stores/deploymentsStore";
import TimeGraph from "components/timeGraph";
// import { ParentSizeModern } from "@visx/responsive";
import Spinner from "components/spinner";
import { formatLineData } from "components/graphHelpers";

interface Props {
  deployments: DeploymentRecord[];
  onZoom?: (xMin: number, xMax: number) => void;
  onPan?: (xMin: number, xMax: number) => void;
  startTime: number | null;
  endTime: number | null;
  data: (ApiHistoryByStatusDataPoint | ApiHistoryBySuccessDataPoint)[];
  groupingType: HistoryOption;
  onGroupingChange: (type: HistoryOption) => void;
}

class HistoryGraph extends React.Component<Props> {
  onTypeChange = action((e: React.FormEvent<HTMLSelectElement>) => {
    this.props.onGroupingChange(e.currentTarget.value as HistoryOption);
  });

  render() {
    const {
      data,
      groupingType,
      startTime,
      endTime,
      deployments,
      onZoom,
      onPan,
    } = this.props;

    if (startTime === null || endTime === null) {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </div>
      );
    }

    const graph =
      groupingType === "response_status" ? (
        <OStatusHistory
          startTime={startTime}
          endTime={endTime}
          data={data as ApiHistoryByStatusDataPoint[]}
          deployments={deployments}
          onZoom={onZoom}
          onPan={onPan}
        />
      ) : (
        <OSuccessHistory
          startTime={startTime}
          endTime={endTime}
          data={data as ApiHistoryBySuccessDataPoint[]}
          deployments={deployments}
          onZoom={onZoom}
          onPan={onPan}
        />
      );
    return (
      <div>
        <div className="flex justify-between">
          <span>API Requests</span>
          <label className="ml-4 text-sm">
            Group by:
            <select
              value={groupingType}
              onChange={this.onTypeChange}
              className="ml-2"
            >
              <option value="response_status">Status Code</option>
              <option value="error">Success/Error</option>
            </select>
          </label>
        </div>
        {graph}
      </div>
    );
  }
}

interface StatusHistoryProps {
  data: ApiHistoryByStatusDataPoint[];
  startTime: number;
  endTime: number;
  deployments: DeploymentRecord[];
  onZoom?: (xMin: number, xMax: number) => void;
  onPan?: (xMin: number, xMax: number) => void;
}

class StatusHistory extends React.Component<StatusHistoryProps> {
  dataPoints: ApiHistoryByStatusDataPoint[];

  constructor(props: StatusHistoryProps) {
    super(props);
    this.dataPoints = this.props.data;
  }

  lineData = () =>
    computed(() => {
      //@ts-ignore
      return formatLineData(this.dataPoints, {
        "1xx": { name: "1xx", color: "#64748B" },
        "2xx": { name: "2xx", color: "#22C55E" },
        "3xx": { name: "3xx", color: "#06B6D4" },
        "4xx": { name: "4xx", color: "#EAB308" },
        "5xx": { name: "5xx", color: "#EF4444" },
      });
    });

  render() {
    const { deployments, startTime, endTime, onZoom, onPan } = this.props;

    return (
      // <ParentSizeModern debounceTime={100}>
      //   {({ width }) => {
      // return (
      <TimeGraph
        width={200}
        height={200}
        xDomain={[startTime, endTime]}
        yDomain={[0, null]}
        lineData={this.lineData().get()}
        epochs={deployments.map((d) => ({
          id: `${d.attributes.sha}-${d.attributes.time}`,
          x: d.attributes.time,
          name: d.attributes.sha.substring(0, 6),
        }))}
        yLabel="Count"
        onZoom={onZoom}
        onPan={onPan}
      />
      // );
      //   }}
      // </ParentSizeModern>
    );
  }
}

const OStatusHistory = observer(StatusHistory);

interface SuccessHistoryProps {
  data: ApiHistoryBySuccessDataPoint[];
  startTime: number;
  endTime: number;
  deployments: DeploymentRecord[];
  onZoom?: (xMin: number, xMax: number) => void;
  onPan?: (xMin: number, xMax: number) => void;
}

class SuccessHistory extends React.Component<SuccessHistoryProps> {
  lineData = () =>
    computed(() => {
      //@ts-ignore
      return formatLineData(this.props.data, {
        success: { name: "Success", color: "#22C55E" },
        error: { name: "Error", color: "#EF4444" },
      });
    });

  render() {
    const { deployments, startTime, endTime, onZoom, onPan } = this.props;

    return (
      // <ParentSizeModern debounceTime={100}>
      //   {({ width, height }) => {
      //     return (
      <TimeGraph
        width={200}
        height={200}
        xDomain={[startTime, endTime]}
        yDomain={[0, null]}
        lineData={this.lineData().get()}
        epochs={deployments.map((d) => ({
          id: `${d.attributes.sha}-${d.attributes.time}`,
          x: d.attributes.time,
          name: d.attributes.sha.substring(0, 6),
        }))}
        yLabel="Count"
        onZoom={onZoom}
        onPan={onPan}
      />
      // );
      // }}
      // </ParentSizeModern>
    );
  }
}

const OSuccessHistory = observer(SuccessHistory);

export default observer(HistoryGraph);
