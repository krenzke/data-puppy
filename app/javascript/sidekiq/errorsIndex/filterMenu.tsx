import React from "react";
import { observer } from "mobx-react";
import TextFilter from "components/filters/textFilter";
import Store from "./store";
import Button from "components/button";

interface Props {
  store: Store;
}

class FilterMenu extends React.Component<Props> {
  onSearch = () => {
    this.props.store.fetchBackgroundJobErrors();
  };

  onJobClassChange = (s: string) => {
    const { store } = this.props;
    store.filterParams.jobClass = s;
  };

  render() {
    const { store } = this.props;
    return (
      <div>
        <Button onClick={this.onSearch} type="primary" className="m-2">
          Search
        </Button>
        <TextFilter
          label="Error Class"
          value={store.filterParams.jobClass}
          onChange={this.onJobClassChange}
        />
      </div>
    );
  }
}

export default observer(FilterMenu);
