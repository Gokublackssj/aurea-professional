import { test, expect, modos, abrirMenuSiHaceFalta } from "./ayudas";

// No fijar viewport aquí: las mismas rutas se prueban a 320 y 390 px.
for (const modo of modos) {
  test.describe(`Navegación móvil (${modo.nombre})`, () => {
    test.use({ reducedMotion: modo.reducedMotion });
    test.skip(({ isMobile }) => !isMobile, "Recorrido del menú móvil");

    test("conserva el ancho al navegar y al volver por el historial", async ({ page, viewport }) => {
      const medidas: { ruta: string; ancho: number; visual: number }[] = [];
      page.on("console", (m) => {
        if (m.type() === "debug" && m.text().startsWith("viewport-aurea:")) {
          medidas.push(JSON.parse(m.text().slice("viewport-aurea:".length)));
        }
      });
      // Registrar también cambios transitorios entre páginas, no solo el
      // scrollWidth final. Los errores siguen llegando al fixture de ayudas.
      await page.addInitScript(() => {
        let anterior = "";
        const medir = () => {
          const medida = JSON.stringify({ ruta: location.pathname, ancho: innerWidth, visual: visualViewport?.width ?? innerWidth });
          if (medida !== anterior) {
            console.debug(`viewport-aurea:${medida}`);
            anterior = medida;
          }
          requestAnimationFrame(medir);
        };
        document.addEventListener("DOMContentLoaded", medir, { once: true });
      });
      await page.goto("");
      for (const [nombre, titulo] of [
        ["Habitaciones", /^Habitaciones$/],
        ["Experiencias", /^Experiencias$/],
        ["Preparar mi estancia", /^Reservas$/],
      ] as const) {
        await abrirMenuSiHaceFalta(page);
        await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: nombre, exact: true }).click();
        await expect(page.locator("h1")).toHaveText(titulo);
        await expect(page.locator("html")).toHaveAttribute("data-motion", "listo");
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport!.width);
      }
      await page.goBack();
      await expect(page.locator("h1")).toHaveText("Experiencias");
      await abrirMenuSiHaceFalta(page);
      await expect(page.getByRole("navigation", { name: "Principal" })).toBeVisible();
      await page.keyboard.press("Escape");
      await page.goForward();
      await expect(page.locator("h1")).toHaveText("Reservas");
      await abrirMenuSiHaceFalta(page);
      await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Inicio", exact: true }).click();
      await expect(page.locator("h1")).toHaveText(/^Aurea/);
      await expect(page.locator("html")).toHaveAttribute("data-motion", "listo");
      await abrirMenuSiHaceFalta(page);
      await expect(page.getByRole("navigation", { name: "Principal" })).toBeVisible();

      expect(medidas.length).toBeGreaterThan(0);
      expect(new Set(medidas.map((m) => m.ruta)).size).toBe(4);
      expect(medidas.filter((m) => m.ancho !== viewport!.width || Math.abs(m.visual - viewport!.width) > 1), "cambios inesperados del viewport").toEqual([]);
    });
  });
}
