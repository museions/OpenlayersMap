import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import qiankun from "vite-plugin-qiankun";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    qiankun("vue-openlayers-app", { useDevMode: true }),
  ],
  base: "./",
  build: {
    outDir: "../map_pages",
  },
  resolve: {
    alias: {
      '@': './src',
    }
  },
  server: {
    port: 5158,
  },
});
