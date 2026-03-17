/**
 * @file vite.config.ts
 * @description Vite build configuration with Tailwind CSS integration
 * @version 1.0.0
 *
 * === CONFIGURATION ===
 * - Tailwind CSS plugin for instant styling
 * - TypeScript path aliases for clean imports
 * - Multi-page app setup with multiple HTML entries
 *
 * === PATH ALIASES ===
 *
 * Use these aliases in imports for cleaner code:
 *
 * ```typescript
 * import { initAnimations } from '@animations/fade';
 * import { changeLanguage } from '@js/utils/i18n';
 * import { initGlobe } from '@utils/map';
 * ```
 *
 * Instead of:
 *
 * ```typescript
 * import { initAnimations } from '../../../js/animations/fade';
 * import { changeLanguage } from '../../utils/i18n';
 * ```
 *
 * === BUILD TARGETS ===
 *
 * Multiple entry points:
 * - index.html (Home page)
 * - shipper.html (Shipper page)
 * - carrier.html (Carrier page)
 */

import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  base: "/",
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@js": path.resolve(__dirname, "./src/js"),
      "@css": path.resolve(__dirname, "./src/css"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@locales": path.resolve(__dirname, "./src/locales"),
      "@i18n": path.resolve(__dirname, "./src/js/i18n"),
      "@pages": path.resolve(__dirname, "./src/js/pages"),
      "@animations": path.resolve(__dirname, "./src/js/animations"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        shipper: path.resolve(__dirname, "shipper.html"),
        carrier: path.resolve(__dirname, "carrier.html"),
        about: path.resolve(__dirname, "about.html"),
        faq: path.resolve(__dirname, "faq.html"),
        getStarted: path.resolve(__dirname, "get-started.html"),
        cookies: path.resolve(__dirname, "cookies.html"),
        terms: path.resolve(__dirname, "terms.html"),
        imprint: path.resolve(__dirname, "imprint.html"),
        investor: path.resolve(__dirname, "investor.html"),
        careers: path.resolve(__dirname, "careers.html"),
        corridor: path.resolve(__dirname, "corridor.html"),
        capital: path.resolve(__dirname, "capital.html"),
        privacy: path.resolve(__dirname, "privacy.html"),
        pricing: path.resolve(__dirname, "pricing.html"),
        apiDocs: path.resolve(__dirname, "api-docs.html"),
        careersJobs: path.resolve(__dirname, "careers/jobs.html"),
        careersApply: path.resolve(__dirname, "careers/apply.html"),
      },
    },
  },
});
