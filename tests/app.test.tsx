import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import HomePage from "../app/page";

describe("inventory-control workspace", () => {
  it("renders its initial workspace content", () => {
    const markup = renderToStaticMarkup(createElement(HomePage));
    expect(markup).toContain("Stock movement");
    expect(markup).toContain("TUESDAY, 27 OCTOBER 2026");
    expect(markup).toContain("Add product");
    expect(markup).toContain("Needs attention");
  });
});
