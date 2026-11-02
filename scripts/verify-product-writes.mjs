import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { assertMongoDevelopment } from "./mongo-target.mjs";

if (existsSync(".env")) process.loadEnvFile(".env");
assertMongoDevelopment(process.env.DATABASE_URL ?? "");

const baseUrl = process.env.INVENTORY_BASE_URL ?? "http://127.0.0.1:3039";
const target = new URL(baseUrl);
if (target.protocol !== "http:" || !["localhost", "127.0.0.1", "[::1]"].includes(target.hostname)) {
  throw new Error("Product write verification requires a loopback development URL.");
}

const sku = `SABLE-DAY05-${randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;
const body = {
  name: "Synthetic Day 05 sample",
  sku,
  collection: "Automated acceptance",
  unitCost: "8.25",
  retailPrice: "16.50",
  quantity: "3",
  reorderPoint: "2",
};
const db = new PrismaClient();
let id;

async function request(path, init) {
  const response = await fetch(new URL(path, baseUrl), init);
  const payload = await response.json();
  return { response, payload };
}

try {
  const created = await request("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (created.response.status !== 201 || !created.payload.data?.id) throw new Error(`Create returned ${created.response.status}.`);
  id = created.payload.data.id;
  if (created.payload.data.sku !== sku || !created.payload.data.createdAt || !created.payload.data.updatedAt) throw new Error("Create response missed normalized data or audit timestamps.");

  const duplicate = await request("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (duplicate.response.status !== 409) throw new Error(`Duplicate SKU returned ${duplicate.response.status}, expected 409.`);

  await new Promise((resolve) => setTimeout(resolve, 25));
  const edit = await request(`/api/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Synthetic Day 05 sample, edited", sku, collection: body.collection, retailPrice: "18.75", reorderPoint: "4" }),
  });
  if (edit.response.status !== 200) throw new Error(`Edit returned ${edit.response.status}.`);

  const detail = await request(`/api/products/${id}`);
  if (detail.response.status !== 200) throw new Error(`Detail returned ${detail.response.status}.`);
  const product = await db.product.findUnique({ where: { id } });
  const opening = await db.stockMovement.findMany({ where: { productId: id } });
  if (detail.payload.data.name !== "Synthetic Day 05 sample, edited" || detail.payload.data.retailCents !== 1875) throw new Error("Edited values were not persisted.");
  if (product?.quantity !== 3 || opening.length !== 1 || opening[0].kind !== "RECEIPT" || opening[0].quantity !== 3) throw new Error("The opening receipt and product quantity did not reconcile.");
  if (new Date(detail.payload.data.updatedAt) <= new Date(detail.payload.data.createdAt)) throw new Error("The update audit timestamp did not advance.");
  if (detail.response.headers.get("cache-control") !== "private, no-store") throw new Error("Detail response was not private and no-store.");

  console.log("Local product writes passed: create=201, duplicate SKU=409, edit=200, opening receipt reconciles, quantity remains ledger-safe, and updatedAt advances.");
} finally {
  if (id) {
    await db.stockMovement.deleteMany({ where: { productId: id } });
    await db.product.deleteMany({ where: { id, sku } });
  }
  await db.$disconnect();
}
