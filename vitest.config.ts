import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const projectRoot = fileURLToPath(new URL("./", import.meta.url));
const vitestConfig = defineConfig({
  esbuild: { jsx: "automatic" },
  resolve: { alias: { "@": projectRoot } },
  test: { environment: "node", include: ["tests/**/*.test.tsx"] },
});

export default vitestConfig;