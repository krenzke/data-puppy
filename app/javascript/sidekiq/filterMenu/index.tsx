import React from "react";
import { observer } from "mobx-react";
// import { PlusIcon, MinusIcon } from "@heroicons/react/outline";
import DurationFilter from "components/filters/durationFilter";
import Store from "../store";
import Button from "components/button";

interface Props {
  store: Store;
}

class FilterMenu extends React.Component<Props> {
  onSearch = () => {
    this.props.store.fetchBackgroundJobs();
  };

  onDurationChange = (vMin: number | null, vMax: number | null) => {
    const { store } = this.props;
    if (vMin !== null) store.backgroundJobsQueryParams.minDuration = vMin;
    if (vMax !== null) store.backgroundJobsQueryParams.maxDuration = vMax;
  };

  render() {
    const { store } = this.props;
    return (
      <div>
        <Button onClick={this.onSearch} type="primary" className="m-2">
          Search
        </Button>
        <DurationFilter
          minDuration={store.backgroundJobsQueryParams.minDuration}
          maxDuration={store.backgroundJobsQueryParams.maxDuration}
          onChange={this.onDurationChange}
        />
      </div>
    );
  }
}

export default observer(FilterMenu);
