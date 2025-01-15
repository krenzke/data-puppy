import React from "react";
import { observer } from "mobx-react";
import { computed } from "mobx";
import Store from "../store";
// import { action } from "mobx";
import TimeGraph from "../../components/timeGraph";
import { ParentSize } from "@visx/responsive";
import Spinner from "components/spinner";
import { formatLineData } from "components/graphHelpers";
// import Button from "admin/components/button";

interface Props {
  store: Store;
  onZoom?: (xMin: number, xMax: number) => void;
  onPan?: (xMin: number, xMax: number) => void;
  startTime: number | null;
  endTime: number | null;
}

class HistoryGraph extends React.Component<Props> {
  lineData = () =>
    computed(() => {
      const { store } = this.props;
      //@ts-ignore
      return formatLineData(store.historyData.data, {
        success: { name: "Success", color: "#22C55E" },
        error: { name: "Error", color: "#EF4444" },
      });
    });

  render() {
    const { startTime, endTime, onZoom, onPan } = this.props;

    if (startTime === null || endTime === null) {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </div>
      );
    }

    return (
      <ParentSize debounceTime={100}>
        {({ width }) => {
          return (
            <TimeGraph
              width={width === 0 ? 200 : width}
              height={200}
              xDomain={[startTime, endTime]}
              yDomain={[0, null]}
              lineData={this.lineData().get()}
              yLabel="Count"
              onZoom={onZoom}
              onPan={onPan}
            />
          );
        }}
      </ParentSize>
    );
  }
}

export default observer(HistoryGraph);
