import { Prisma } from "@prisma/client";
import { z } from "zod";
import { productDraftSchema, productEditDraftSchema } from "@/lib/product-validation";

export const productCreateBodySchema = productDraftSchema;
export const productUpdateBodySchema = productEditDraftSchema;
export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i);

export function isSkuUniqueError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export function fieldErrors(error: z.ZodError) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !(field in errors)) errors[field] = issue.message;
  }
  return errors;
}
