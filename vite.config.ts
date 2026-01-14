import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Custom Favicon Injector: This replaces any icon with your Aura logo
    {
      name: 'favicon-override',
      transformIndexHtml(html) {
        return html.replace(
          /<link rel="icon".*?>/,
          `<link rel="icon" type="image/png" href="https://i.ibb.co/9Hd1f7jr/cropped-circle-image-1.png?v=${Date.now()}" />`
        );
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
