export function assertMongoDevelopment(raw) {
  let url;
  try { url = new URL(raw); } catch { throw new Error('Set a loopback MongoDB development URL.'); }
  if (url.protocol !== 'mongodb:' || !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || url.pathname !== '/sable_inventory_dev' || url.searchParams.get('replicaSet') !== 'rs0' || url.searchParams.get('directConnection') !== 'true') {
    throw new Error('Local Mongo commands require sable_inventory_dev on loopback replica set rs0.');
  }
  if ([...url.searchParams.keys()].some(key => !['replicaSet', 'directConnection', 'serverSelectionTimeoutMS', 'authSource'].includes(key))) throw new Error('Unsupported local Mongo connection option.');
  return raw;
}
