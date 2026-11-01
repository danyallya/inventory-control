import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CatalogBrowser } from "@/app/catalog/catalog-browser";

describe("catalog browser", () => {
  it("starts with an announced loading state and a route back to the overview", () => {
    const markup = renderToStaticMarkup(createElement(CatalogBrowser));

    expect(markup).toContain("Product catalog");
    expect(markup).toContain("role=\"status\"");
    expect(markup).toContain("Loading catalog");
    expect(markup).toContain("Overview");
  });
});
