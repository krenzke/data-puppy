import React from "react";
import cx from "classnames";

export type ButtonType = "primary" | "secondary" | "warning" | "danger";
export type ButtonSize = "xsmall" | "small" | "medium" | "large";

interface ButtonProps {
  children?: React.ReactNode;
  className?: string;
  type?: ButtonType;
  size?: ButtonSize;
  onClick?: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className,
  type = "primary",
  size = "medium",
  ...other
}) => {
  return (
    <button
      {...other}
      className={cx(className, {
        "p-1": true,
        "text-white": true,
        shadow: true,
        "bg-sky-500": type === "primary",
        "hover:bg-sky-800": type === "primary",
        "bg-gray-500": type === "secondary",
        "hover:bg-gray-800": type === "secondary",
        "bg-yellow-500": type === "warning",
        "hover:bg-yellow-800": type === "warning",
        "bg-red-500": type === "danger",
        "hover:bg-red-800": type === "danger",
        "text-xs": size === "xsmall",
        "text-sm": size === "small",
        "text-md": size === "medium",
        "text-lg": size === "large",
      })}
    >
      {children}
    </button>
  );
};

export default Button;
