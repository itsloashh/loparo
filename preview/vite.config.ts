import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import path from "node:path";

/** Static, server-less build of the same components — used for shareable previews. */
export default defineConfig({
  root: path.resolve(__dirname),
  base: "./",
  publicDir: path.resolve(__dirname, "../public"),
  plugins: [react(), tailwind()],
  resolve: { alias: { "@": path.resolve(__dirname, "../src") } },
  define: { "process.env": "{}" },
  build: { outDir: path.resolve(__dirname, "../dist-preview"), emptyOutDir: true, assetsInlineLimit: 0 },
});
