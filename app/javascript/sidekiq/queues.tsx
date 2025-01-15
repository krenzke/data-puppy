import React from "react";
import SidekiqStore, { Queue } from "./store";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import Table, { TH, TR, TD } from "components/table";
import Button from "components/button";
import withSidekiqStoreOutlet from "./helpers/withSidekiqStoreOutlet";

interface Props {
  store: SidekiqStore;
}

class Queues extends React.Component<Props> {
  componentDidMount() {
    this.props.store.fetchQueues();
  }

  handleClear = (queue: Queue) => {
    if (confirm("Are you sure?")) {
      this.props.store.clearQueue(queue).then(() => {
        this.props.store.fetchQueues();
      });
    }
  };

  render() {
    const { queues } = this.props.store;
    return (
      <div className="pt-4">
        <Table>
          <thead>
            <tr>
              <TH>Queue</TH>
              <TH>Size</TH>
              <TH>Latency</TH>
              <TH></TH>
              <TH></TH>
            </tr>
          </thead>
          <tbody>
            {queues.map((queue) => {
              return (
                <TR key={queue.name}>
                  <TD>
                    <Link to={`${queue.name}`} className="text-blue-500">
                      {queue.name}
                    </Link>
                    {queue.paused && (
                      <span className="text-sm text-slate-500">(paused)</span>
                    )}
                  </TD>
                  <TD>{queue.size}</TD>
                  <TD>{queue.latency}</TD>
                  <TD>
                    <Button
                      type="danger"
                      size="small"
                      onClick={() => this.handleClear(queue)}
                    >
                      Clear
                    </Button>
                  </TD>
                </TR>
              );
            })}
          </tbody>
        </Table>
      </div>
    );
  }
}

export default withSidekiqStoreOutlet(observer(Queues));
