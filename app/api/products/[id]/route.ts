import { NextResponse } from "next/server";
import { canReadLocalInventoryPreview } from "@/lib/local-inventory-preview";
import { prisma } from "@/lib/prisma";

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
