import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // FIX: Don't point to /dist/clsx.mjs.
      // Pointing to 'clsx' lets Vite handle the export map resolution.
      "lucide-react": "lucide-react",
      clsx: "clsx",
    },
  },
  // This is the extra "insurance" for Arch/Linux builds
  optimizeDeps: {
    include: ["lucide-react", "clsx"],
  },
});
