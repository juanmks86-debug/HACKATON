import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Tailwind v4 se configura desde el CSS (src/index.css), por eso no hay tailwind.config.js.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173, host: true },
});
