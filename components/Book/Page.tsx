import type { ReactNode } from "react";
import { Settings } from "../../types";

const styles = {
  "A4": "w-a4 h-a4",
  "A5": "w-a5 h-a5",
} as const;

export type PageProps = {
  pageNumber: number;
  children?: ReactNode;
  settings: Settings;
  className?: string;
  onClick?: (pageNumber: number) => void;
};

export default function Page(
  props: PageProps,
) {
  return (
    <div
      className={`overflow-hidden relative bg-white print:bg-none rounded-lg print:rounded-none ${
        props.className ?? ""
      } ${styles[props.settings.pageSize]}  ${
        props.onClick && "cursor-pointer"
      }`}
      style={{
        zIndex: props.className?.includes("turned")
          ? Math.abs(props.pageNumber)
          : -Math.abs(props.pageNumber),
      }}
      onClick={(e) => {
        e.preventDefault();
        props.onClick?.(props.pageNumber);
      }}
    >
      {props.pageNumber !== 0 && (
        <div
          className={`absolute top-6 ${
            props.pageNumber % 2 !== 0
              ? "left-10 print:left-6"
              : "right-10 print:right-6"
          } ${props.settings.pageSize === "A5" && "text-sm"}`}
        >
          {props.pageNumber}
        </div>
      )}
      {props.children}
    </div>
  );
}
