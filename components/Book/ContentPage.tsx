import Page, { PageProps } from "./Page";

export default function ContentPage(
  props: PageProps,
) {
  const className = `p-12 print:after:w-0 mb-2 bg-red-400 print:mb-0 ${props.pageNumber !== 0 && (props.pageNumber % 2 === 0
      ? "page-even"
      : "page-odd")
    } ${props.settings.pageSize === "A4" ? "after:max-2xl:w-0" : "after:max-xl:w-0"
    }`;

  return (
    <Page {...props} className={`${props.className} ${className}`}>
      <div className="relative w-full h-full">{props.children}</div>
    </Page>
  );
}
