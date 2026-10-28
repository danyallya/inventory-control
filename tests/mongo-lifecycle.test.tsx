import { describe, expect, it } from 'vitest';
import { assertMongoDevelopment } from '../scripts/mongo-target.mjs';
import { sampleProduct, sampleReceipt } from '../scripts/sample-stock.mjs';
describe('Sable Mongo setup contract', () => {
  it('requires the dedicated local replica-set database', () => {
    expect(assertMongoDevelopment('mongodb://127.0.0.1:27017/sable_inventory_dev?replicaSet=rs0&directConnection=true')).toContain('rs0');
    for (const target of ['mongodb://remote.example/sable_inventory_dev?replicaSet=rs0', 'mongodb://localhost/production?replicaSet=rs0', 'mongodb://localhost/sable_inventory_dev', 'mongodb://localhost/sable_inventory_dev?replicaSet=rs0&proxyHost=remote.example']) expect(() => assertMongoDevelopment(target)).toThrow();
  });
  it('reconciles a synthetic opening receipt with integer-cent stock valuation', () => {
    expect(sampleReceipt.productId).toBe(sampleProduct.id);
    expect(sampleReceipt.quantity).toBe(sampleProduct.quantity);
    expect(sampleProduct.quantity * sampleProduct.unitCostCents).toBe(4800);
    expect(Number.isInteger(sampleProduct.retailCents)).toBe(true);
    expect(sampleProduct.id).toMatch(/^[0-9a-f]{24}$/);
  });
});
