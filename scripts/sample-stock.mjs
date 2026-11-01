export const sampleProduct = Object.freeze({
  id: '000000000000000000000101', sku: 'SAMPLE-STUDIO-CUP', name: 'Fictional studio cup', collection: 'Synthetic setup',
  unitCostCents: 1200, retailCents: 2800, quantity: 4, reorderPoint: 3,
});
export const sampleReceipt = Object.freeze({ id: '000000000000000000000201', productId: sampleProduct.id, kind: 'RECEIPT', quantity: 4, note: 'Synthetic opening receipt; not operational stock.' });
