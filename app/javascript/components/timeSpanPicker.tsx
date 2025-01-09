import React from "react";
import { SpanType } from "stores/timespanStore";
import Dropdown from "components/dropdown";
import Button from "./button";
import TimespanStore from "stores/timespanStore";
import { observer } from "mobx-react";
import { action, autorun, toJS, transaction } from "mobx";
import DatetimePicker from "components/datetimePicker";

interface Props {
  store: TimespanStore;
  onChange: () => void;
}

interface State {
  spanType: SpanType;
  startDate: Date | null;
  endDate: Date | null;
  showDropdown: boolean;
}

interface TimeItemProps {
  checked: boolean;
  onChange: (e: React.FormEvent<HTMLInputElement>) => void;
  label: string;
  id: string;
}

const SpanDescriptions: { [K in SpanType]: string } = {
  custom: "Custom",
  prev_hour: "Last Hour",
  prev_8_hours: "Last 8 Hours",
  prev_day: "Last Day",
  prev_2_days: "Last 2 Days",
  prev_week: "Last Week",
  prev_month: "Last Month",
};

const TimeItem: React.FC<TimeItemProps> = ({
  checked,
  onChange,
  label,
  id,
}) => {
  return (
    <label className="flex items-center gap-1 p-2 cursor-pointer hover:bg-sky-200">
      <input
        type="radio"
        id={id}
        checked={checked}
        onChange={onChange}
        className="cursor-pointer"
      />
      {label}
    </label>
  );
};

class TimeSpanPicker extends React.Component<Props, State> {
  selectRef = React.createRef<HTMLDivElement>();
  dropdownRef = React.createRef<HTMLDivElement>();

  constructor(props: Props) {
    super(props);
    const { store } = this.props;
    this.state = {
      spanType: toJS(store.spanType),
      startDate: toJS(store.startDate),
      endDate: toJS(store.endDate),
      showDropdown: false,
    };
  }

  handleClick = (e: MouseEvent) => {
    if (
      this.selectRef.current &&
      !this.selectRef.current.contains(e.target as Node)
    ) {
      this.setState({ showDropdown: false });
    }
  };

  toggleDropdown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      !this.dropdownRef.current ||
      (this.dropdownRef.current &&
        !this.dropdownRef.current.contains(e.target as Node))
    ) {
      this.setState({ showDropdown: !this.state.showDropdown });
    }
  };

  handleSpanClick = action((s: SpanType) => {
    this.setState({ spanType: s });
  });

  handleCancel = () => {
    this.setState({
      spanType: toJS(this.props.store.spanType),
      startDate: toJS(this.props.store.startDate),
      endDate: toJS(this.props.store.endDate),
      showDropdown: false,
    });
  };

  handleSet = action(() => {
    const { store } = this.props;
    transaction(() => {
      store.spanType = this.state.spanType;
      store.startDate = this.state.startDate;
      store.endDate = this.state.endDate;
    });
    this.setState({ showDropdown: false });
    this.props.onChange();
  });

  handleStartDateChange = (d: Date | null) => {
    this.setState({ startDate: d });
  };

  handleEndDateChange = (d: Date | null) => {
    this.setState({ endDate: d });
  };

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClick);
    const { store } = this.props;

    autorun(() => {
      this.setState({
        spanType: toJS(store.spanType),
        startDate: toJS(store.startDate),
        endDate: toJS(store.endDate),
      });
    });
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClick);
  }

  render() {
    const { spanType, startDate, endDate } = this.state;
    return (
      <div
        onClick={this.toggleDropdown}
        ref={this.selectRef}
        className="relative p-2 border cursor-pointer hover:bg-slate-200"
      >
        {SpanDescriptions[this.props.store.spanType]}
        {this.state.showDropdown && (
          <Dropdown
            ref={this.dropdownRef}
            align="right"
            className="cursor-default"
          >
            <TimeItem
              id="prev_hour"
              checked={spanType === "prev_hour"}
              onChange={(_e) => this.handleSpanClick("prev_hour")}
              label="Last Hour"
            />
            <TimeItem
              id="prev_8_hours"
              checked={spanType === "prev_8_hours"}
              onChange={(_e) => this.handleSpanClick("prev_8_hours")}
              label="Last 8 Hours"
            />
            <TimeItem
              id="prev_day"
              checked={spanType === "prev_day"}
              onChange={(_e) => this.handleSpanClick("prev_day")}
              label="Last Day"
            />
            <TimeItem
              id="prev_2_days"
              checked={spanType === "prev_2_days"}
              onChange={(_e) => this.handleSpanClick("prev_2_days")}
              label="Last 2 Days"
            />
            <TimeItem
              id="prev_week"
              checked={spanType === "prev_week"}
              onChange={(_e) => this.handleSpanClick("prev_week")}
              label="Last Week"
            />

            <TimeItem
              id="prev_month"
              checked={spanType === "prev_month"}
              onChange={(_e) => this.handleSpanClick("prev_month")}
              label="Last Month"
            />
            <TimeItem
              id="custom"
              checked={spanType === "custom"}
              onChange={(_e) => this.handleSpanClick("custom")}
              label="Custom"
            />
            <div className="px-4 text-sm">
              <label>Start Time</label>
              <DatetimePicker
                value={startDate}
                onChange={this.handleStartDateChange}
                disabled={spanType !== "custom"}
              />
              <label>End Time</label>
              <DatetimePicker
                value={endDate}
                onChange={this.handleEndDateChange}
                disabled={spanType !== "custom"}
              />
            </div>
            <div className="flex justify-center gap-2 px-3 py-2">
              <Button
                type="primary"
                className="flex-1"
                onClick={this.handleSet}
              >
                Set
              </Button>
              <Button
                type="secondary"
                className="flex-1"
                onClick={this.handleCancel}
              >
                Cancel
              </Button>
            </div>
          </Dropdown>
        )}
      </div>
    );
  }
}

export default observer(TimeSpanPicker);
