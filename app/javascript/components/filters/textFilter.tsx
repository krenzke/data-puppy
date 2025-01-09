import { observer } from "mobx-react";
import React from "react";
import CollapsibleMenuItem from "components/collapsibleMenuItem";
import { action } from "mobx";

interface Props {
  label: string;
  value: string;
  onChange: (s: string) => void;
}

class TextFilter extends React.Component<Props> {
  onChange = action((e: React.FormEvent<HTMLInputElement>) => {
    this.props.onChange(e.currentTarget.value);
  });

  render() {
    const { label, value } = this.props;

    return (
      <CollapsibleMenuItem title={label} subtitle={value}>
        <input
          className="w-full p-1 text-sm border border-slate-200"
          type="text"
          value={value}
          onChange={this.onChange}
        />
      </CollapsibleMenuItem>
    );
  }
}

export default observer(TextFilter);
