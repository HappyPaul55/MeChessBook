import Page, { PageProps } from "./page";

export default function CoverPage(
  props: PageProps,
) {
  return (
    <Page {...props}>
      {props.children}
    </Page>
  );
}
