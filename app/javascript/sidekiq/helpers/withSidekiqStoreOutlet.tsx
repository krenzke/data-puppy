import React from "react";
import { useOutletContext } from "react-router";

export default function withSidekiqStoreOutlet<P = {}>(
  Component: React.ComponentType<any>
) {
  const F: React.FC<P> = (props: P) => {
    const store = useOutletContext();
    return <Component store={store} {...props} />;
  };
  return F;
}
