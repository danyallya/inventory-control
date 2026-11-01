import { NextResponse } from "next/server";
import { canReadLocalInventoryPreview } from "@/lib/local-inventory-preview";
import { productSkuSchema } from "@/lib/product-validation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const responseHeaders = { "Cache-Control": "private, no-store" };

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: responseHeaders });
}

export async function GET(request: Request) {
  if (!canReadLocalInventoryPreview()) return json({ error: "Not found." }, 404);

  const rawSku = new URL(request.url).searchParams.get("sku");
  const parsedSku = productSkuSchema.safeParse(rawSku);
  if (!parsedSku.success) return json({ error: "Enter a valid product SKU." }, 400);

  try {
    const existing = await prisma.product.findFirst({
      where: { sku: parsedSku.data },
      select: { id: true },
    });

    return json({ available: existing === null });
  } catch {
    return json({ error: "SKU availability could not be checked." }, 503);
  }
}
