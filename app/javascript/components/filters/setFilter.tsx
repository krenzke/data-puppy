import { observer } from "mobx-react";
import React from "react";
import CollapsibleMenuItem from "components/collapsibleMenuItem";
import { action } from "mobx";

interface Props<T> {
  label: string;
  onChange: (v: T) => void;
  set: Set<T>;
  options: readonly T[];
}

class SetFilter<T extends string> extends React.Component<Props<T>> {
  onChange = action((_e: React.FormEvent<HTMLInputElement>, v: T) => {
    this.props.onChange(v);
  });

  render() {
    const { set, options, label } = this.props;

    const nameList = options.filter((v) => set.has(v)).join(",");

    return (
      <CollapsibleMenuItem title={label} subtitle={nameList}>
        {options.map((v) => {
          return (
            <label key={v} className="block text-sm">
              <input
                className="mr-1"
                type="checkbox"
                checked={set.has(v)}
                onChange={(e) => this.onChange(e, v)}
              />
              {v}
            </label>
          );
        })}
      </CollapsibleMenuItem>
    );
  }
}

export default observer(SetFilter);
