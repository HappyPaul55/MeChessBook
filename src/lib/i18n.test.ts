import { describe, expect, test } from "bun:test";
import { t } from "./i18n";

describe("t", () => {
  test("resolves dotted keys", () => {
    expect(t("project.title")).toBe("Me Chess Book");
    expect(t("button.print")).toBe("Print");
    expect(t("form.settings.pageSize.title")).toBe("Page Size");
    expect(t("form.settings.pageSize.options.A5")).toBe("A5");
  });

  test("returns the key when it is missing", () => {
    expect(t("no.such.key")).toBe("no.such.key");
    expect(t("form.settings.title.deeper")).toBe("form.settings.title.deeper");
  });
});
