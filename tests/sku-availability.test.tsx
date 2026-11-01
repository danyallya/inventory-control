import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const database = vi.hoisted(() => ({ findFirst: vi.fn() }));

vi.mock("@/lib/prisma", () => ({ prisma: { product: database } }));

import { GET } from "@/app/api/products/sku-availability/route";

const localUrl = "mongodb://127.0.0.1:27017/sable_inventory_dev?replicaSet=rs0&directConnection=true";

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("DATABASE_URL", localUrl);
});

afterEach(() => vi.unstubAllEnvs());

describe("local SKU availability API", () => {
  it("checks a canonical SKU and returns a private no-store result", async () => {
    database.findFirst.mockResolvedValue({ id: "product-id" });

    const response = await GET(new Request("http://localhost/api/products/sku-availability?sku=%20sample-studio-cup%20"));

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    await expect(response.json()).resolves.toEqual({ available: false });
    expect(database.findFirst).toHaveBeenCalledWith({
      where: { sku: "SAMPLE-STUDIO-CUP" },
      select: { id: true },
    });
  });

  it("reports a SKU as available when no record uses it", async () => {
    database.findFirst.mockResolvedValue(null);

    const response = await GET(new Request("http://localhost/api/products/sku-availability?sku=NEW-PIECE"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ available: true });
  });

  it("rejects missing or malformed SKUs before a database query", async () => {
    const missing = await GET(new Request("http://localhost/api/products/sku-availability"));
    const malformed = await GET(new Request("http://localhost/api/products/sku-availability?sku=bad%20sku"));

    expect(missing.status).toBe(400);
    expect(malformed.status).toBe(400);
    expect(database.findFirst).not.toHaveBeenCalled();
  });

  it("hides the route outside the guarded development database", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const response = await GET(new Request("http://localhost/api/products/sku-availability?sku=NEW-PIECE"));

    expect(response.status).toBe(404);
    expect(database.findFirst).not.toHaveBeenCalled();
  });

  it("hides database errors behind a generic service response", async () => {
    database.findFirst.mockRejectedValue(new Error("private connection details"));

    const response = await GET(new Request("http://localhost/api/products/sku-availability?sku=NEW-PIECE"));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: "SKU availability could not be checked." });
  });
});
