import React from "react";
import MetricCard from "components/metricCard";
import { observer } from "mobx-react";
import formatBytes from "utils/formatBytes";
import Table, { TH, TR, TD } from "components/table";

import { StoreContext, ContextType } from "stores/rootStore";

interface Props {}

class Home extends React.Component<Props> {
  static contextType = StoreContext;
  declare context: ContextType;

  componentDidMount() {
    this.context.pgheroStore.loadSummaryData();
  }

  render() {
    const { summaryData, sortedRelationSummaries } = this.context.pgheroStore;

    const [dbSizeBytes, dbSizeUnits] = formatBytes(summaryData.dbSize);

    return (
      <div className="mt-4">
        <div className="text-center">
          <div className="inline-grid grid-cols-2 grid-rows-1 gap-4">
            <MetricCard
              title="Connections"
              value={`${summaryData.numConnections}/${summaryData.maxConnections}`}
            />
            <MetricCard
              title="DB Size"
              value={dbSizeBytes}
              unit={dbSizeUnits}
            />
          </div>
        </div>
        <div className="mt-4">
          <Table>
            <thead>
              <tr>
                <TH>Relation</TH>
                <TH></TH>
                <TH>Size</TH>
                <TH>Unused</TH>
              </tr>
            </thead>
            <tbody>
              {sortedRelationSummaries.map((relation, i) => {
                return (
                  <TR key={i}>
                    <TD>{relation.name}</TD>
                    <TD>{relation.type}</TD>
                    <TD>{formatBytes(relation.size).join(" ")}</TD>
                    <TD>{!relation.used ? "Unused" : ""}</TD>
                  </TR>
                );
              })}
            </tbody>
          </Table>
        </div>
      </div>
    );
  }
}

export default observer(Home);
