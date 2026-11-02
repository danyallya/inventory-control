import { NextResponse } from "next/server";
import { canReadLocalInventoryPreview } from "@/lib/local-inventory-preview";
import { prisma } from "@/lib/prisma";
import { canWriteLocalInventory } from "@/lib/local-write-guard";
import { fieldErrors, isSkuUniqueError, objectIdSchema, productUpdateBodySchema } from "../write-rules";

export const dynamic = "force-dynamic";

const responseHeaders = { "Cache-Control": "private, no-store" };
const productSelect = {
  id: true,
  sku: true,
  name: true,
  collection: true,
  retailCents: true,
  quantity: true,
  reorderPoint: true,
  createdAt: true,
  updatedAt: true,
};

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: responseHeaders });
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!canReadLocalInventoryPreview()) return json({ error: "Not found." }, 404);

  const { id } = await context.params;
  if (!/^[a-f\d]{24}$/i.test(id)) return json({ error: "Not found." }, 404);

  try {
    const product = await prisma.product.findFirst({
      where: { id, archived: false },
      select: productSelect,
    });

    return product ? json({ data: product }) : json({ error: "Not found." }, 404);
  } catch {
    return json({ error: "The product could not be loaded." }, 503);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!canWriteLocalInventory(request)) return json({ error: "Not found." }, 404);

  const { id } = await context.params;
  if (!objectIdSchema.safeParse(id).success) return json({ error: "Not found." }, 404);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Product details must be valid JSON." }, 400);
  }

  const parsed = productUpdateBodySchema.safeParse(body);
  if (!parsed.success) return json({ error: "Review the product fields.", fields: fieldErrors(parsed.error) }, 400);

  try {
    const product = await prisma.product.update({
      where: { id },
      data: parsed.data,
      select: { id: true, sku: true, name: true, collection: true, retailCents: true, quantity: true, reorderPoint: true, createdAt: true, updatedAt: true },
    });
    return json({ data: product });
  } catch (error) {
    if (isSkuUniqueError(error)) return json({ error: "A product with this SKU already exists.", fields: { sku: "A product with this SKU already exists." } }, 409);
    if (error instanceof Error && "code" in error && error.code === "P2025") return json({ error: "This product is no longer available." }, 404);
    return json({ error: "The product could not be updated." }, 503);
  }
}
