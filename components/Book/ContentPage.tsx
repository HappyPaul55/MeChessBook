import Page, { PageProps } from "./page";

export default function ContentPage(
  props: PageProps,
) {
  const className = `p-12 print:after:w-0 mb-2 print:mb-0 ${
    props.pageNumber !== 0 && (props.pageNumber % 2 === 0
      ? "print:pl-8 print:pr-16"
      : "print:pl-16 print:pr-8")
  } ${
    props.settings.pageSize === "A4" ? "after:max-2xl:w-0" : "after:max-xl:w-0"
  }`;

  return (
    <Page {...props} className={`${props.className} ${className}`}>
      <div className="relative w-full h-full">{props.children}</div>
    </Page>
  );
}
