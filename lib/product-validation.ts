import { z } from "zod";

const MAX_PRISMA_INT = 2_147_483_647;
const MAX_PRISMA_INT_BIGINT = BigInt(MAX_PRISMA_INT);

export const productSkuSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .pipe(
    z
      .string()
      .min(2, "Use at least 2 characters for the SKU.")
      .max(32, "Use no more than 32 characters for the SKU.")
      .regex(/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/, "Use letters, numbers, and single hyphens only."),
  );

const nonNegativeInteger = z
  .string()
  .trim()
  .min(1, "Enter a whole number of units.")
  .regex(/^\d{1,10}$/, "Use a whole number of units with no decimals or minus sign.")
  .transform(Number)
  .refine(Number.isSafeInteger, "Enter a whole number of units.")
  .refine((value) => value <= MAX_PRISMA_INT, "The quantity is above the supported limit.");

function toCents(value: string): number | null {
  if (!/^\d{1,8}(?:\.\d{1,2})?$/.test(value)) return null;

  const [whole, fraction = ""] = value.split(".");
  const cents = BigInt(whole) * BigInt(100) + BigInt(fraction.padEnd(2, "0"));
  return cents <= MAX_PRISMA_INT_BIGINT ? Number(cents) : null;
}

const nonNegativeMoneyCents = z
  .string()
  .trim()
  .min(1, "Enter an amount in dollars.")
  .superRefine((value, context) => {
    if (!/^\d+(?:\.\d{1,2})?$/.test(value)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Use a non-negative dollar amount with up to two decimal places.",
      });
      return;
    }

    if (toCents(value) === null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Amount must be no more than $21,474,836.47.",
      });
    }
  })
  .transform((value) => toCents(value) as number);

const productDraftInputSchema = z.object({
  sku: productSkuSchema,
  name: z.string().trim().min(2, "Enter a product name with at least 2 characters.").max(100, "Use no more than 100 characters for the name."),
  collection: z.string().trim().min(1, "Enter a collection.").max(80, "Use no more than 80 characters for the collection."),
  unitCost: nonNegativeMoneyCents,
  retailPrice: nonNegativeMoneyCents,
  quantity: nonNegativeInteger,
  reorderPoint: nonNegativeInteger,
});

const productEditInputSchema = z.object({
  sku: productSkuSchema,
  name: productDraftInputSchema.shape.name,
  collection: productDraftInputSchema.shape.collection,
  retailPrice: nonNegativeMoneyCents,
  reorderPoint: nonNegativeInteger,
});

export const productDraftSchema = productDraftInputSchema.transform(({ unitCost, retailPrice, ...product }) => ({
  ...product,
  unitCostCents: unitCost,
  retailCents: retailPrice,
}));

export const productEditDraftSchema = productEditInputSchema.transform(({ retailPrice, ...product }) => ({
  ...product,
  retailCents: retailPrice,
}));

export type ProductDraft = z.input<typeof productDraftSchema>;
export type ValidatedProductDraft = z.output<typeof productDraftSchema>;
export type ProductDraftField = keyof ProductDraft;
export type ProductDraftErrors = Partial<Record<ProductDraftField, string>>;
export type ProductEditDraft = z.input<typeof productEditDraftSchema>;
export type ValidatedProductEditDraft = z.output<typeof productEditDraftSchema>;
export type ProductEditDraftErrors = Partial<Record<keyof ProductEditDraft, string>>;

export type ProductDraftValidation =
  | { success: true; data: ValidatedProductDraft }
  | { success: false; errors: ProductDraftErrors };

export function normalizeSku(value: string): string {
  return value.trim().toUpperCase();
}

export function validateProductDraft(
  input: unknown,
  existingSkus: readonly string[] = [],
): ProductDraftValidation {
  const parsed = productDraftSchema.safeParse(input);
  if (!parsed.success) {
    const errors: ProductDraftErrors = {};

    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !(field in errors)) {
        errors[field as ProductDraftField] = issue.message;
      }
    }

    return { success: false, errors };
  }

  const skuAlreadyExists = existingSkus.some((sku) => normalizeSku(sku) === parsed.data.sku);
  if (skuAlreadyExists) {
    return { success: false, errors: { sku: "A product with this SKU already exists." } };
  }

  return { success: true, data: parsed.data };
}

export function validateProductEditDraft(input: unknown, existingSkus: readonly string[], currentSku: string):
  | { success: true; data: ValidatedProductEditDraft }
  | { success: false; errors: ProductEditDraftErrors } {
  const parsed = productEditDraftSchema.safeParse(input);
  if (!parsed.success) {
    const errors: ProductEditDraftErrors = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !(field in errors)) errors[field as keyof ProductEditDraft] = issue.message;
    }
    return { success: false, errors };
  }

  const duplicate = parsed.data.sku !== normalizeSku(currentSku)
    && existingSkus.some((sku) => normalizeSku(sku) === parsed.data.sku);
  return duplicate
    ? { success: false, errors: { sku: "A product with this SKU already exists." } }
    : { success: true, data: parsed.data };
}
