import React from "react";
import cx from "classnames";
import { XCircleIcon } from "@heroicons/react/24/outline";

interface Props {
  value: Date | null;
  onChange: (d: Date | null) => void;
  disabled?: boolean;
  className?: string;
}

interface State {
  dateStr: string;
  timeStr: string;
}

function partsToDate(datePart: string, timePart: string): Date | null {
  const emptyDate = datePart.trim().length === 0;
  const emptyTime = timePart.trim().length === 0;
  if (emptyDate && emptyTime) return null;

  if (emptyDate) {
    datePart = dateToDateStr(new Date());
  }
  if (emptyTime) {
    timePart = "00:00";
  }

  return new Date(Date.parse(`${datePart}T${timePart}Z`));
}

function dateToDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function dateToTimeStr(d: Date): string {
  return d.toISOString().split("T")[1].substring(0, 5);
}

export default class DatetimePicker extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { value } = this.props;
    this.state = {
      dateStr: value ? dateToDateStr(value) : "",
      timeStr: value ? dateToTimeStr(value) : "",
    };
  }

  handleClear = () => {
    this.setState({ dateStr: "", timeStr: "" });
    this.props.onChange(null);
  };

  handleDateChange = (e: React.FormEvent<HTMLInputElement>) => {
    const newDateStr = e.currentTarget.value;
    const newTimeStr =
      this.state.timeStr.trim().length === 0 ? "00:00" : this.state.timeStr;
    this.setState({ dateStr: newDateStr, timeStr: newTimeStr });

    this.props.onChange(partsToDate(newDateStr, newTimeStr));
  };

  handleTimeChange = (e: React.FormEvent<HTMLInputElement>) => {
    let newDateStr = this.state.dateStr;
    if (newDateStr.trim().length === 0) {
      const date = new Date();
      newDateStr = `${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()}`;
    }
    const newTimeStr = e.currentTarget.value;
    this.setState({ dateStr: newDateStr, timeStr: newTimeStr });

    this.props.onChange(partsToDate(newDateStr, newTimeStr));
  };

  render() {
    const { disabled, className } = this.props;
    const { dateStr, timeStr } = this.state;

    return (
      <div
        className={cx("flex items-center gap-1", className, {
          "opacity-50": disabled,
        })}
      >
        <input
          className="px-2 py-1 border border-gray-300"
          type="date"
          value={dateStr}
          onChange={this.handleDateChange}
          disabled={disabled}
        />
        <input
          className="px-2 py-1 border border-gray-300"
          type="time"
          value={timeStr}
          onChange={this.handleTimeChange}
          disabled={disabled}
        />
        <span>
          <XCircleIcon
            className={cx("h-6 w-6 stroke-1 text-gray-500", {
              "hover:text-gray-800": !disabled,
              "cursor-pointer": !disabled,
              "cursor-not-allowed": disabled,
            })}
            onClick={this.handleClear}
          />
        </span>
      </div>
    );
  }
}
