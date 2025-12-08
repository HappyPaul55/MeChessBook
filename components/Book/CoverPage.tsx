import Page, { PageProps } from "./Page";

export default function CoverPage(
  props: PageProps,
) {
  return (
    <Page {...props}>
      {props.children}
    </Page>
  );
}
