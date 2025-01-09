import React from "react";
import { observer } from "mobx-react";
import DurationFilter from "components/filters/durationFilter";
import TextFilter from "components/filters/textFilter";
import SetFilter from "components/filters/setFilter";
import Store from "./store";
import { HTTPVerb, httpVerbs } from "stores/types";
import Button from "components/button";

interface Props {
  store: Store;
}

class FilterMenu extends React.Component<Props> {
  onSearch = () => {
    this.props.store.fetchApiErrors();
  };

  onDurationChange = (vMin: number | null, vMax: number | null) => {
    const { store } = this.props;
    if (vMin !== null) store.filterParams.minDuration = vMin;
    if (vMax !== null) store.filterParams.maxDuration = vMax;
  };

  onPathChange = (path: string) => {
    const { store } = this.props;
    store.filterParams.path = path;
  };

  onErrorClassChange = (s: string) => {
    const { store } = this.props;
    store.filterParams.errorClass = s;
  };

  onVerbChange = (verb: HTTPVerb) => {
    const { store } = this.props;
    if (store.filterParams.verbs.has(verb)) {
      store.filterParams.verbs.delete(verb);
    } else {
      store.filterParams.verbs.add(verb);
    }
  };

  render() {
    const { store } = this.props;
    return (
      <div>
        <Button onClick={this.onSearch} type="primary" className="m-2">
          Search
        </Button>
        <TextFilter
          label="Path"
          value={store.filterParams.path}
          onChange={this.onPathChange}
        />
        <TextFilter
          label="Error Class"
          value={store.filterParams.errorClass}
          onChange={this.onErrorClassChange}
        />
        <SetFilter
          label="Verb"
          set={store.filterParams.verbs}
          options={httpVerbs}
          onChange={this.onVerbChange}
        />
        <DurationFilter
          minDuration={store.filterParams.minDuration}
          maxDuration={store.filterParams.maxDuration}
          onChange={this.onDurationChange}
        />
      </div>
    );
  }
}

export default observer(FilterMenu);
