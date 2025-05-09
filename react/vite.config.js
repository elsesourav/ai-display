import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
   plugins: [react(), tailwindcss()],
   build: {
      outDir: "../",
      rollupOptions: {
         input: {
            main: resolve(__dirname, "popup.html"),
            selection: resolve(__dirname, "./inject/selection.html"),
            window: resolve(__dirname, "./inject/window.html"),
         },
      },
   },
});
