import type { ReactNode } from "react";
import { Settings } from "../../types";

const styles = {
  "A4": "w-a4 h-a4",
  "A5": "w-a5 h-a5",
} as const;

export type PageProps = {
  pageNumber?: number;
  children?: ReactNode;
  settings: Settings;
};

export default function Page(
  props: PageProps,
) {
  return (
    <div
      className={`${
        styles[props.settings.pageSize]
      } relative bg-white print:bg-none p-12 print:after:w-0 mb-2 print:mb-0 ${
        props.pageNumber && (props.pageNumber % 2 === 0
          ? "print:pl-8 print:pr-16"
          : "print:pl-16 print:pr-8")
      } ${
        props.settings.pageSize === "A4"
          ? "after:2xl:w-[10%]"
          : "after:xl:w-[10%]"
      }`}
    >
      {props.pageNumber !== undefined && (
        <div
          className={`absolute top-6 ${
            props.pageNumber % 2 === 0
              ? "left-10 print:left-6"
              : "right-10 print:right-6"
          }`}
        >
          {props.pageNumber}
        </div>
      )}
      <div className="relative w-full h-full">{props.children}</div>
    </div>
  );
}
