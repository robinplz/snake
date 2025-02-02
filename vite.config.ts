import { defineConfig } from "vite";
import { readFileSync } from 'fs';
import { VitePWA } from "vite-plugin-pwa";

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 8080,
    open: true,
  },
  base: "/snake",
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version), // version number from package.json
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Snake Game",
        short_name: "Snake",
        start_url: "/snake/",
        display: "standalone",
        background_color: "#F0FAFF",
        theme_color: "#1DBF53",
        icons: [
          {
            src: "icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
      },
    }),
  ],
});
