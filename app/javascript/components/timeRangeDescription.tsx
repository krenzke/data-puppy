import React from "react";
import Button from "components/button";
import { unixTimestampToISOString } from "utils/timeFormatters";

interface Props {
  tStart: number | null;
  tEnd: number | null;
  onClick?: () => void;
}

export default class TimeRangeDescription extends React.Component<Props> {
  render() {
    const { tStart, tEnd, onClick } = this.props;
    return (
      <div className="flex items-center justify-center gap-2 text-sm text-center">
        <span>
          Zoomed to: {tStart ? unixTimestampToISOString(tStart) : "forever"} -{" "}
          {tEnd ? unixTimestampToISOString(tEnd) : "now"}
        </span>
        {onClick && (
          <Button type="secondary" size="xsmall" onClick={onClick}>
            Search This Span
          </Button>
        )}
      </div>
    );
  }
}
