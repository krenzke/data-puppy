import React from "react";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";

interface Props {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

interface State {
  expanded: boolean;
}

class CollapsibleMenuItem extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      expanded: false,
    };
  }

  toggleExpand = () => {
    this.setState({ expanded: !this.state.expanded });
  };

  render() {
    const { title, subtitle, children } = this.props;
    const { expanded } = this.state;
    return (
      <div className="border-t border-slate-200">
        <div className="flex items-center p-2">
          <span>{title}</span>
          {subtitle && !expanded && (
            <span className="mx-2 overflow-hidden text-xs text-sky-400 whitespace-nowrap text-ellipsis">
              {subtitle}
            </span>
          )}
          {expanded && (
            <MinusIcon
              className="w-4 h-4 ml-auto border cursor-pointer stroke-1 border-slate-400 hover:border-slate-600 text-slate-400 hover:text-slate-600"
              onClick={this.toggleExpand}
            />
          )}
          {!expanded && (
            <PlusIcon
              className="w-4 h-4 ml-auto border cursor-pointer stroke-1 border-slate-400 hover:border-slate-600 text-slate-400 hover:text-slate-600"
              onClick={this.toggleExpand}
            />
          )}
        </div>
        {expanded && <div className="px-3 pb-2">{children}</div>}
      </div>
    );
  }
}

export default CollapsibleMenuItem;
