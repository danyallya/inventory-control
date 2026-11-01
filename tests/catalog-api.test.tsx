import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const database = vi.hoisted(() => ({
  count: vi.fn(),
  findMany: vi.fn(),
  findFirst: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { product: database },
}));

import { GET as getProducts } from "@/app/api/products/route";
import { GET as getProduct } from "@/app/api/products/[id]/route";

const localUrl = "mongodb://127.0.0.1:27017/sable_inventory_dev?replicaSet=rs0&directConnection=true";
const product = {
  id: "000000000000000000000101",
  sku: "SAMPLE-STUDIO-CUP",
  name: "Fictional studio cup",
  collection: "Synthetic setup",
  retailCents: 2800,
  quantity: 4,
  reorderPoint: 3,
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("DATABASE_URL", localUrl);
});

afterEach(() => vi.unstubAllEnvs());

describe("local catalog list API", () => {
  it("returns a stable selected page with private no-store caching", async () => {
    database.findMany.mockResolvedValue([product]);
    database.count.mockResolvedValue(12);

    const response = await getProducts(new Request("http://localhost/api/products?page=2&pageSize=5"));

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    await expect(response.json()).resolves.toEqual({
      data: [product],
      pagination: { page: 2, pageSize: 5, totalItems: 12, totalPages: 3 },
    });
    expect(database.findMany).toHaveBeenCalledWith(expect.objectContaining({
      skip: 5,
      take: 5,
      orderBy: [{ name: "asc" }, { sku: "asc" }],
      where: { archived: false },
      select: expect.not.objectContaining({ unitCostCents: true }),
    }));
  });

  it("rejects invalid page values before querying", async () => {
    const response = await getProducts(new Request("http://localhost/api/products?page=0&pageSize=51"));

    expect(response.status).toBe(400);
    expect(database.findMany).not.toHaveBeenCalled();
    expect(database.count).not.toHaveBeenCalled();
  });

  it("returns not found outside the guarded development database", async () => {
    vi.stubEnv("DATABASE_URL", "mongodb+srv://cluster.example/production");

    const response = await getProducts(new Request("http://localhost/api/products"));

    expect(response.status).toBe(404);
    expect(database.findMany).not.toHaveBeenCalled();
  });

  it("hides database failures behind a generic service response", async () => {
    database.findMany.mockRejectedValue(new Error("private connection details"));
    database.count.mockResolvedValue(1);

    const response = await getProducts(new Request("http://localhost/api/products"));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: "The catalog could not be loaded." });
  });
});

describe("local catalog detail API", () => {
  it("returns only the public catalog fields for an active product", async () => {
    database.findFirst.mockResolvedValue(product);

    const response = await getProduct(new Request(`http://localhost/api/products/${product.id}`), {
      params: Promise.resolve({ id: product.id }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    await expect(response.json()).resolves.toEqual({ data: product });
    expect(database.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: product.id, archived: false },
      select: expect.not.objectContaining({ unitCostCents: true }),
    }));
  });

  it("returns not found for malformed IDs and absent or archived products", async () => {
    const malformed = await getProduct(new Request("http://localhost/api/products/invalid"), {
      params: Promise.resolve({ id: "invalid" }),
    });
    expect(malformed.status).toBe(404);
    expect(database.findFirst).not.toHaveBeenCalled();

    database.findFirst.mockResolvedValue(null);
    const missing = await getProduct(new Request("http://localhost/api/products/000000000000000000000101"), {
      params: Promise.resolve({ id: product.id }),
    });
    expect(missing.status).toBe(404);
    expect(database.findFirst).toHaveBeenCalledTimes(1);
    expect(database.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: product.id, archived: false },
    }));
  });
});
