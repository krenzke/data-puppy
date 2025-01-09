import React from "react";
import cx from "classnames";

interface TableProps {
  children?: React.ReactNode;
  className?: string;
}

const Table: React.FC<TableProps> = ({ children, className }) => (
  <table className={cx(className, "w-full border-collapse text-sm")}>
    {children}
  </table>
);

interface THProps {
  children?: React.ReactNode;
  className?: string;
}
const TH: React.FC<THProps> = ({ children, className }) => (
  <th
    className={cx(
      className,
      "border-b border-slate-300 bg-slate-50 font-normal p-2 text-slate-400 text-left"
    )}
  >
    {children}
  </th>
);

interface TRProps {
  children?: React.ReactNode;
  className?: string;
}
const TR: React.FC<TRProps> = ({ children, className }) => (
  <tr className={cx(className, "border-b border-slate-300")}>{children}</tr>
);

interface TDProps {
  children?: React.ReactNode;
  className?: string;
}
const TD: React.FC<TDProps> = ({ children, className }) => (
  <td className={cx(className, "px-2 py-1 text-slate-700")}>{children}</td>
);

// interface EmptyTRProps {
//   children?: React.ReactNode;
//   className?: string;
// }
const EmptyTR: React.FC<TRProps> = ({ children, className }) => (
  <tr className={cx(className, "border-b border-slate-300")}>
    <td colSpan={99} className="text-center">
      {children}
    </td>
  </tr>
);

export default Table;
export { TH, TR, TD, EmptyTR };
