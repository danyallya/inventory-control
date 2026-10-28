import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';
import { assertMongoDevelopment } from './mongo-target.mjs';
import { sampleProduct, sampleReceipt } from './sample-stock.mjs';

if (existsSync('.env')) process.loadEnvFile('.env');
assertMongoDevelopment(process.env.DATABASE_URL);
const command = process.argv[2];
if (command === 'push') {
  const require = createRequire(import.meta.url);
  const result = spawnSync(process.execPath, [require.resolve('prisma/build/index.js'), 'db', 'push', '--skip-generate'], { stdio: 'inherit', env: process.env });
  process.exitCode = result.status ?? 1;
} else if (command === 'check' || command === 'seed') {
  const db = new PrismaClient();
  try {
    if (command === 'check') await db.$runCommandRaw({ ping: 1 });
    else await db.$transaction([
      db.product.upsert({ where: { id: sampleProduct.id }, update: {}, create: sampleProduct }),
      db.stockMovement.upsert({ where: { id: sampleReceipt.id }, update: {}, create: sampleReceipt }),
    ]);
    console.log(command === 'check' ? 'Local MongoDB responds.' : 'Synthetic stock and opening receipt ready; existing fixtures preserved.');
  } catch {
    console.error('Local Mongo command failed. Check service, rs0 initialization and schema; connection details omitted.'); process.exitCode = 1;
  } finally { await db.$disconnect(); }
} else throw new Error('Choose push, check or seed.');
