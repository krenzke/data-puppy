import React from "react";
import qs from "qs";
import {
  NavigateFunction,
  useNavigate,
  useSearchParams,
  useParams
} from "react-router-dom";

export type RoutingInfoProps<T extends {} = {}> = T & {
  navigate: NavigateFunction;
  queryParams: qs.ParsedQs;
};

function withRoutingInfo<
  P = {},
  T extends string | Record<string, string | undefined> = string
>(Component: React.ComponentType<P & RoutingInfoProps>) {
  const WrappedComponent = (props: P) => {
    let [searchParams, _setSearchParams] = useSearchParams();
    let navigate = useNavigate();
    let pathParams = useParams<T>();
    const queryParams = qs.parse(searchParams.toString(), {
      ignoreQueryPrefix: true
    });

    return (
      <Component
        navigate={navigate}
        queryParams={queryParams}
        {...pathParams}
        {...props}
      />
    );
  };
  return WrappedComponent;
}

export default withRoutingInfo;
