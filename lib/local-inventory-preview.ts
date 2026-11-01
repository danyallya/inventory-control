import { assertMongoDevelopment } from "../scripts/mongo-target.mjs";

export function canReadLocalInventoryPreview(env: NodeJS.ProcessEnv = process.env): boolean {
  if (env.NODE_ENV !== "development") return false;

  try {
    assertMongoDevelopment(env.DATABASE_URL ?? "");
    return true;
  } catch {
    return false;
  }
}
