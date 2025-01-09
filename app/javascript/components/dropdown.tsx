import React from "react";
import cx from "classnames";

interface Props {
  children?: React.ReactNode;
  className?: string;
  align?: "left" | "right";
}

const Dropdown = React.forwardRef<HTMLDivElement, Props>(
  ({ children, className, align = "left" }, ref) => {
    return (
      <div
        ref={ref}
        className={cx(
          "absolute top-full bg-white border-slate-100 border-2 z-50",
          className,
          { "left-0": align === "left", "right-0": align === "right" }
        )}
      >
        {children}
      </div>
    );
  }
);

export default Dropdown;
