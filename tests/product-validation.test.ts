import { describe, expect, it } from "vitest";
import { productSkuSchema, validateProductDraft, validateProductEditDraft } from "@/lib/product-validation";

const validDraft = {
  name: "Studio cup",
  sku: " sample-studio-cup ",
  collection: "Ceramics",
  unitCost: "12.5",
  retailPrice: "28.00",
  quantity: "4",
  reorderPoint: "3",
};

describe("product input validation", () => {
  it("normalizes SKU and converts decimal prices to integer cents", () => {
    const result = validateProductDraft(validDraft);

    expect(result).toEqual({
      success: true,
      data: {
        name: "Studio cup",
        sku: "SAMPLE-STUDIO-CUP",
        collection: "Ceramics",
        unitCostCents: 1250,
        retailCents: 2800,
        quantity: 4,
        reorderPoint: 3,
      },
    });
  });

  it("rejects an SKU already present after canonicalization", () => {
    const result = validateProductDraft(validDraft, ["sample-studio-cup"]);

    expect(result).toEqual({ success: false, errors: { sku: "A product with this SKU already exists." } });
  });

  it("accepts zero cost and zero stock while keeping both as integers", () => {
    const result = validateProductDraft({ ...validDraft, unitCost: "0", retailPrice: "0.01", quantity: "0", reorderPoint: "0" });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toMatchObject({ unitCostCents: 0, retailCents: 1, quantity: 0, reorderPoint: 0 });
  });

  it.each(["-1", "1.234", "$2.00", "21474836.48", ""]) (
    "rejects invalid money value %s with a field error",
    (unitCost) => {
      const result = validateProductDraft({ ...validDraft, unitCost });

      expect(result.success).toBe(false);
      if (!result.success) expect(result.errors.unitCost).toBeTruthy();
    },
  );

  it.each(["-1", "1.5", "2147483648", ""]) (
    "rejects invalid quantity %s",
    (quantity) => {
      const result = validateProductDraft({ ...validDraft, quantity });

      expect(result.success).toBe(false);
      if (!result.success) expect(result.errors.quantity).toBeTruthy();
    },
  );

  it("reports invalid fields with clear names and messages", () => {
    const result = validateProductDraft({ ...validDraft, sku: "bad sku", name: " ", reorderPoint: "1.5" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.sku).toMatch(/letters, numbers/i);
      expect(result.errors.name).toMatch(/product name/i);
      expect(result.errors.reorderPoint).toMatch(/whole number/i);
    }
  });

  it("shares SKU canonicalization rules with server availability checks", () => {
    expect(productSkuSchema.parse(" st-2041 ")).toBe("ST-2041");
    expect(productSkuSchema.safeParse("ST--2041").success).toBe(false);
  });
});

describe("product edit validation", () => {
  const editDraft = { name: "Studio vessel", sku: "VASE-1", collection: "Objects", retailPrice: "29.95", reorderPoint: "4" };

  it("normalizes an unchanged SKU and converts retail price without accepting stock quantity", () => {
    expect(validateProductEditDraft({ ...editDraft, sku: " vase-1 " }, ["VASE-1"], "VASE-1")).toEqual({
      success: true,
      data: { ...editDraft, sku: "VASE-1", retailCents: 2995 },
    });
  });

  it("rejects another product's SKU and invalid reorder points", () => {
    expect(validateProductEditDraft(editDraft, ["VASE-1", "OTHER-1"], "VASE-1")).toEqual({
      success: false,
      errors: { sku: "A product with this SKU already exists." },
    });
    expect(validateProductEditDraft({ ...editDraft, reorderPoint: "-2" }, [], "VASE-1")).toMatchObject({
      success: false,
      errors: { reorderPoint: expect.any(String) },
    });
  });
});
