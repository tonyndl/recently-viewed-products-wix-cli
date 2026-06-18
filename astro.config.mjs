// @ts-check
import { defineConfig } from 'astro/config';
import wix from '@wix/astro';
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  output: "server",
  adapter: cloudflare(),
  integrations: [wix(), react()],
  image: { domains: ["static.wixstatic.com"] },
  security: { checkOrigin: false },
  devToolbar: { enabled: false },
  // The site widget calls the app backend (/api/products) cross-origin. Recent
  // Vite versions block cross-origin dev requests by default, so allow them
  // here — production CORS is handled by the API route's own headers.
  vite: {
    server: {
      cors: { origin: true },
    },
  },
});
