import React from "react";
import cx from "classnames";

interface Props {
  active: boolean;
  onChange: (e: React.FormEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
}

class LivePollCheckbox extends React.Component<Props> {
  render() {
    const { active, onChange, className, disabled } = this.props;
    return (
      <label
        className={cx(
          "flex items-center relative rounded-sm",
          {
            "opacity-50": disabled,
          },
          className
        )}
      >
        {active && (
          <div className="w-1 h-1 bg-green-400 animate-ping absolute top-0 -right-1 rounded-full"></div>
        )}
        <input
          type="checkbox"
          checked={active}
          onChange={onChange}
          disabled={disabled}
          className="mr-1"
        />
        <span>Live Poll</span>
      </label>
    );
  }
}

export default LivePollCheckbox;
