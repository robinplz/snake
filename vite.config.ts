import { defineConfig } from "vite";
import { readFileSync } from 'fs';

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
});
