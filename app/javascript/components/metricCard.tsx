import React from "react";
import cx from "classnames";

interface MetricCardProps {
  title?: React.ReactNode;
  value: React.ReactNode;
  unit?: string;
  size?: "s" | "m" | "l";
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  className,
  size = "l"
}) => {
  return (
    <div className={cx("shadow-md p-4", className)}>
      <div className="whitespace-nowrap overflow-hidden text-ellipsis">
        {title}
      </div>
      <div className="flex items-end justify-center">
        <span
          className={cx({
            "text-6xl": size === "l",
            "text-4xl": size === "m",
            "text-2xl": size === "s"
          })}
        >
          {value}
        </span>
        {unit && (
          <span
            className={cx("ml-1", {
              "text-sm": size === "l",
              "text-xs": size === "m" || size === "s"
            })}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
