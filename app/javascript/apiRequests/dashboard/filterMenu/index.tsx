import React from "react";
import { observer } from "mobx-react";
import DurationFilter from "components/filters/durationFilter";
import TextFilter from "components/filters/textFilter";
import SetFilter from "components/filters/setFilter";
import Store from "../store";
import {
  HTTPVerb,
  httpVerbs,
  ResponseStatusRange,
  responseStatusRange,
} from "stores/types";
import Button from "components/button";

interface Props {
  store: Store;
}

class FilterMenu extends React.Component<Props> {
  onSearch = () => {
    this.props.store.fetchApiRequests();
  };

  onDurationChange = (vMin: number | null, vMax: number | null) => {
    const { store } = this.props;
    if (vMin !== null) store.requestsFilterParams.minDuration = vMin;
    if (vMax !== null) store.requestsFilterParams.maxDuration = vMax;
  };

  onPathChange = (path: string) => {
    const { store } = this.props;
    store.requestsFilterParams.path = path;
  };

  onVerbChange = (verb: HTTPVerb) => {
    const { store } = this.props;
    if (store.requestsFilterParams.verbs.has(verb)) {
      store.requestsFilterParams.verbs.delete(verb);
    } else {
      store.requestsFilterParams.verbs.add(verb);
    }
  };

  onStatusChange = (status: ResponseStatusRange) => {
    const { store } = this.props;
    if (store.requestsFilterParams.statuses.has(status)) {
      store.requestsFilterParams.statuses.delete(status);
    } else {
      store.requestsFilterParams.statuses.add(status);
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
          value={store.requestsFilterParams.path}
          onChange={this.onPathChange}
        />
        <SetFilter
          label="Verb"
          set={store.requestsFilterParams.verbs}
          options={httpVerbs}
          onChange={this.onVerbChange}
        />
        <DurationFilter
          minDuration={store.requestsFilterParams.minDuration}
          maxDuration={store.requestsFilterParams.maxDuration}
          onChange={this.onDurationChange}
        />
        <SetFilter
          label="Status"
          set={store.requestsFilterParams.statuses}
          options={responseStatusRange}
          onChange={this.onStatusChange}
        />
      </div>
    );
  }
}

export default observer(FilterMenu);
