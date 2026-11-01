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

function parsePositiveInteger(value: string | null, fallback: number, maximum: number): number | null {
  if (value === null) return fallback;
  if (!/^[1-9]\d*$/.test(value)) return null;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed <= maximum ? parsed : null;
}

export async function GET(request: Request) {
  if (!canReadLocalInventoryPreview()) return json({ error: "Not found." }, 404);

  const params = new URL(request.url).searchParams;
  const page = parsePositiveInteger(params.get("page"), 1, 10_000);
  const pageSize = parsePositiveInteger(params.get("pageSize"), 8, 50);
  if (page === null || pageSize === null) {
    return json({ error: "Page must be 1–10000 and pageSize must be 1–50." }, 400);
  }

  try {
    const where = { archived: false };
    const [data, totalItems] = await Promise.all([
      prisma.product.findMany({
        where,
        select: productSelect,
        orderBy: [{ name: "asc" }, { sku: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    return json({
      data,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    });
  } catch {
    return json({ error: "The catalog could not be loaded." }, 503);
  }
}
