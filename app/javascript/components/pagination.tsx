import React from "react";
import { PaginationData } from "../api";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";
import cx from "classnames";

interface Props {
  pagination: PaginationData;
  onNext: () => void;
  onPrev: () => void;
}

const Pagination: React.FC<Props> = ({ pagination, onNext, onPrev }) => {
  if (pagination.max_page === 1) {
    return null;
  }
  const hasPrev = pagination.curr_page > 1;
  const hasNext = pagination.curr_page < pagination.max_page;

  return (
    <div className="flex items-center justify-between h-12">
      <button
        onClick={hasPrev ? onPrev : () => {}}
        className={cx("border-2 rounded py-1 px-5", {
          "border-slate-100": !hasPrev,
          "border-slate-300": hasPrev,
          "hover:bg-slate-100": hasPrev,
          "cursor-pointer": hasPrev,
          "cursor-not-allowed": !hasPrev,
        })}
        title="Previous Page"
      >
        <ChevronDoubleLeftIcon
          className={cx("h-5 w-5 stroke-2", {
            "text-slate-100": !hasPrev,
            "text-slate-300": hasPrev,
          })}
        />
      </button>
      <div className="text-sm text-slate-300">
        Page {pagination.curr_page} / {pagination.max_page}
      </div>
      <button
        className={cx("border-2 rounded py-1 px-5", {
          "border-slate-100": !hasNext,
          "border-slate-300": hasNext,
          "hover:bg-slate-100": hasNext,
          "cursor-pointer": hasNext,
          "cursor-not-allowed": !hasNext,
        })}
        onClick={hasNext ? onNext : () => {}}
        title="Next Page"
      >
        <ChevronDoubleRightIcon
          className={cx("h-5 w-5 stroke-2", {
            "text-slate-100": !hasNext,
            "text-slate-300": hasNext,
          })}
        />
      </button>
    </div>
  );
};

export default Pagination;
