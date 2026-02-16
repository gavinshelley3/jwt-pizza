import { defineConfig } from "vite";
import istanbul from "vite-plugin-istanbul";

export default defineConfig({
  build: { sourcemap: true },
  plugins: [
    istanbul({
      exclude: ["node_modules"],
      requireEnv: true,
    }),
  ],
});
