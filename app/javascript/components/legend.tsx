import React from "react";
import { LineSpec } from "components/timeGraph";
import cx from "classnames";

interface Props {
  lines: LineSpec[];
  activeLineIndex?: number | null;
  onClick?: (i: number) => void;
}

class Legend extends React.Component<Props> {
  render() {
    const { lines, activeLineIndex, onClick } = this.props;
    return (
      <div className="flex justify-center p-2">
        {lines.map((lineSpec, i) => {
          return (
            <div
              key={i}
              className="flex items-center p-1 cursor-pointer hover:bg-slate-100"
              onClick={() => (onClick ? onClick(i) : {})}
            >
              <div
                className={cx("w-[10px] mr-1", {
                  "h-[1px]": i !== activeLineIndex,
                  "h-[2px]": i === activeLineIndex,
                })}
                style={{ backgroundColor: lineSpec.color }}
              ></div>
              <span className="text-xs">{lineSpec.name}</span>
            </div>
          );
        })}
      </div>
    );
  }
}

export default Legend;
