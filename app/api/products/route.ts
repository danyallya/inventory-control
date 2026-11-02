import { NextResponse } from "next/server";
import { canReadLocalInventoryPreview } from "@/lib/local-inventory-preview";
import { canWriteLocalInventory } from "@/lib/local-write-guard";
import { prisma } from "@/lib/prisma";
import { MovementKind } from "@prisma/client";
import { fieldErrors, isSkuUniqueError, productCreateBodySchema } from "./write-rules";

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

export async function POST(request: Request) {
  if (!canWriteLocalInventory(request)) return json({ error: "Not found." }, 404);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Product details must be valid JSON." }, 400);
  }

  const parsed = productCreateBodySchema.safeParse(body);
  if (!parsed.success) return json({ error: "Review the product fields.", fields: fieldErrors(parsed.error) }, 400);

  try {
    const product = await prisma.$transaction(async (transaction) => {
      const created = await transaction.product.create({
        data: {
          sku: parsed.data.sku,
          name: parsed.data.name,
          collection: parsed.data.collection,
          unitCostCents: parsed.data.unitCostCents,
          retailCents: parsed.data.retailCents,
          quantity: parsed.data.quantity,
          reorderPoint: parsed.data.reorderPoint,
        },
        select: { id: true, sku: true, name: true, collection: true, retailCents: true, quantity: true, reorderPoint: true, createdAt: true, updatedAt: true },
      });

      if (created.quantity > 0) {
        await transaction.stockMovement.create({
          data: { productId: created.id, kind: MovementKind.RECEIPT, quantity: created.quantity, note: "Opening stock at product creation" },
        });
      }
      return created;
    });
    return json({ data: product }, 201);
  } catch (error) {
    if (isSkuUniqueError(error)) return json({ error: "A product with this SKU already exists.", fields: { sku: "A product with this SKU already exists." } }, 409);
    return json({ error: "The product could not be saved." }, 503);
  }
}
