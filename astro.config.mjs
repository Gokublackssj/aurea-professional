import { defineConfig } from "astro/config";

// Sitio estático. Para publicarlo en una ruta de proyecto (p. ej. GitHub Pages)
// se definen SITE y BASE al construir; en un dominio propio, solo SITE.
// Los enlaces internos pasan siempre por ruta() (src/lib/ruta.ts) para respetar BASE.
export default defineConfig({
  site: process.env.SITE ?? "https://example.com",
  base: process.env.BASE ?? "/",
  trailingSlash: "ignore",
  build: { inlineStylesheets: "always" },
  devToolbar: { enabled: false },
});
