import React from "react";
import { observer } from "mobx-react";
import { action } from "mobx";
import Button from "components/button";

import { StoreContext, ContextType } from "stores/rootStore";

interface Props {}

class Explain extends React.Component<Props> {
  static contextType = StoreContext;
  declare context: ContextType;

  render() {
    const store = this.context.pgheroStore;
    const { explainQuery, explainResult } = store;

    return (
      <div className="px-6 pt-4">
        <label htmlFor="query" className="block">
          Query
        </label>
        <textarea
          id="query"
          rows={10}
          className="w-full p-4 border border-slate-200"
          value={explainQuery}
          onChange={action((e) => (store.explainQuery = e.currentTarget.value))}
        />
        <div className="flex gap-2">
          <Button type="primary" onClick={() => store.fetchExplain(false)}>
            Explain
          </Button>
          <Button type="warning" onClick={() => store.fetchExplain(true)}>
            Analyze
          </Button>
        </div>
        {explainResult !== "" && (
          <>
            <h2 className="mt-4">Result</h2>
            <pre className="p-4 overflow-auto border border-slate-200 bg-slate-100">
              {explainResult}
            </pre>
          </>
        )}
      </div>
    );
  }
}

export default observer(Explain);
