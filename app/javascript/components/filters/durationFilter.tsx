import { observer } from "mobx-react";
import React from "react";
import CollapsibleMenuItem from "components/collapsibleMenuItem";
import { action } from "mobx";

interface Props {
  minDuration: number;
  maxDuration: number;
  onChange: (vMin: number | null, vMax: number | null) => void;
}

interface State {
  minStr: string;
  maxStr: string;
}

class DurationFilter extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { minDuration, maxDuration } = this.props;

    this.state = {
      minStr: minDuration.toString(),
      maxStr: maxDuration === Infinity ? "" : maxDuration.toString(),
    };
  }

  onMinChange = action((e: React.FormEvent<HTMLInputElement>) => {
    this.setState({ minStr: e.currentTarget.value });
    const parsedVal = parseFloat(e.currentTarget.value);
    const v = isNaN(parsedVal) ? 0 : parsedVal;
    this.props.onChange(v, null);
  });

  onMaxChange = action((e: React.FormEvent<HTMLInputElement>) => {
    this.setState({ maxStr: e.currentTarget.value });
    const parsedVal = parseFloat(e.currentTarget.value);
    const v = isNaN(parsedVal) ? Infinity : parsedVal;
    this.props.onChange(null, v);
  });

  formatDurations(min: number, max: number): string {
    if (min === 0 && max === Infinity) return "";
    return `${min} - ${max === Infinity ? "inf" : max}`;
  }

  render() {
    const { minDuration, maxDuration } = this.props;

    const { minStr, maxStr } = this.state;

    return (
      <CollapsibleMenuItem
        title="Duration"
        subtitle={this.formatDurations(minDuration, maxDuration)}
      >
        <label htmlFor="minDuration" className="text-sm">
          Greater than (ms)
        </label>
        <input
          id="minDuration"
          className="w-full p-1 text-sm border border-slate-200"
          type="text"
          value={minStr}
          onChange={this.onMinChange}
        />

        <label htmlFor="maxDuration" className="text-sm">
          Less than (ms)
        </label>
        <input
          id="maxDuration"
          className="w-full p-1 text-sm border border-slate-200"
          type="text"
          value={maxStr}
          onChange={this.onMaxChange}
        />
      </CollapsibleMenuItem>
    );
  }
}

export default observer(DurationFilter);
