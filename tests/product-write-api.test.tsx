import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  create: vi.fn(),
  movementCreate: vi.fn(),
  update: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: { update: db.update },
    $transaction: db.transaction,
  },
}));

import { Prisma } from "@prisma/client";
import { POST } from "@/app/api/products/route";
import { PATCH } from "@/app/api/products/[id]/route";

const localUrl = "mongodb://127.0.0.1:27017/sable_inventory_dev?replicaSet=rs0&directConnection=true";
const createBody = {
  name: "Fictional linen cup",
  sku: "linen-cup-4",
  collection: "Synthetic setup",
  unitCost: "12.00",
  retailPrice: "28.00",
  quantity: "4",
  reorderPoint: "2",
};
const editBody = {
  name: "Fictional linen cup, revised",
  sku: "LINEN-CUP-4",
  collection: "Synthetic setup",
  retailPrice: "30.50",
  reorderPoint: "3",
};
const created = {
  id: "000000000000000000000123",
  sku: "LINEN-CUP-4",
  name: "Fictional linen cup",
  collection: "Synthetic setup",
  retailCents: 2800,
  quantity: 4,
  reorderPoint: 2,
  createdAt: new Date("2026-11-02T10:00:00.000Z"),
  updatedAt: new Date("2026-11-02T10:00:00.000Z"),
};

function uniqueError() {
  return new Prisma.PrismaClientKnownRequestError("Unique constraint failed", { code: "P2002", clientVersion: "test" });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("DATABASE_URL", localUrl);
  db.transaction.mockImplementation((callback: (tx: unknown) => Promise<unknown>) => callback({
    product: { create: db.create },
    stockMovement: { create: db.movementCreate },
  }));
  db.create.mockResolvedValue(created);
  db.movementCreate.mockResolvedValue({ id: "movement-id" });
});

afterEach(() => vi.unstubAllEnvs());

describe("local product write APIs", () => {
  it("creates a normalized product and its opening receipt in one transaction", async () => {
    const response = await POST(new Request("http://localhost/api/products", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(createBody),
    }));

    expect(response.status).toBe(201);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    await expect(response.json()).resolves.toMatchObject({ data: { id: created.id, sku: "LINEN-CUP-4", createdAt: expect.any(String), updatedAt: expect.any(String) } });
    expect(db.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ sku: "LINEN-CUP-4", unitCostCents: 1200, retailCents: 2800, quantity: 4 }) }));
    expect(db.movementCreate).toHaveBeenCalledWith({ data: { productId: created.id, kind: "RECEIPT", quantity: 4, note: "Opening stock at product creation" } });
    expect(db.transaction).toHaveBeenCalledTimes(1);
  });

  it("rejects invalid input and non-loopback origins before writing", async () => {
    const invalid = await POST(new Request("http://localhost/api/products", { method: "POST", body: JSON.stringify({ ...createBody, retailPrice: "-1" }) }));
    const remoteOrigin = await POST(new Request("http://localhost/api/products", { method: "POST", headers: { origin: "https://shop.example" }, body: JSON.stringify(createBody) }));

    expect(invalid.status).toBe(400);
    expect(remoteOrigin.status).toBe(404);
    expect(db.transaction).not.toHaveBeenCalled();
  });

  it("maps a database unique-index race to a stable SKU conflict", async () => {
    db.create.mockRejectedValue(uniqueError());
    const response = await POST(new Request("http://localhost/api/products", { method: "POST", body: JSON.stringify(createBody) }));
    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({ fields: { sku: expect.any(String) } });
  });

  it("updates editable catalog fields but never writes the on-hand quantity", async () => {
    db.update.mockResolvedValue({ ...created, name: editBody.name, retailCents: 3050, reorderPoint: 3 });
    const response = await PATCH(new Request(`http://localhost/api/products/${created.id}`, {
      method: "PATCH", body: JSON.stringify(editBody),
    }), { params: Promise.resolve({ id: created.id }) });

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(db.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: created.id }, data: { sku: "LINEN-CUP-4", name: editBody.name, collection: editBody.collection, retailCents: 3050, reorderPoint: 3 } }));
    expect(db.update.mock.calls[0][0].data).not.toHaveProperty("quantity");
  });

  it("rejects malformed ids, invalid edit fields and SKU races", async () => {
    const invalidId = await PATCH(new Request("http://localhost/api/products/nope", { method: "PATCH", body: JSON.stringify(editBody) }), { params: Promise.resolve({ id: "nope" }) });
    const invalidBody = await PATCH(new Request(`http://localhost/api/products/${created.id}`, { method: "PATCH", body: JSON.stringify({ ...editBody, reorderPoint: "1.5" }) }), { params: Promise.resolve({ id: created.id }) });
    db.update.mockRejectedValue(uniqueError());
    const duplicate = await PATCH(new Request(`http://localhost/api/products/${created.id}`, { method: "PATCH", body: JSON.stringify({ ...editBody, sku: "OTHER-SKU" }) }), { params: Promise.resolve({ id: created.id }) });

    expect(invalidId.status).toBe(404);
    expect(invalidBody.status).toBe(400);
    expect(duplicate.status).toBe(409);
  });
});
