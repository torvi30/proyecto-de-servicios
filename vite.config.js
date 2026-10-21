import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2020",
    minify: "esbuild",
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("firebase")) {
              return "vendor-firebase";
            }
            if (id.includes("jspdf") || id.includes("html2canvas") || id.includes("dompurify")) {
              return "vendor-pdf";
            }
            if (id.includes("react-router") || id.includes("react-dom") || id.includes("react")) {
              return "vendor-react";
            }
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
            if (id.includes("canvas-confetti") || id.includes("qrcode.react")) {
              return "vendor-utils";
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
});
