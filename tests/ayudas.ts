import { test as base, expect, type Page } from "@playwright/test";

// Cada prueba falla si la página escribe un error en la consola o lanza una
// excepción.
export const test = base.extend<{ errores: string[] }>({
  errores: [
    async ({ page }, usar) => {
      const errores: string[] = [];
      page.on("console", (m) => m.type() === "error" && errores.push(m.text()));
      page.on("pageerror", (e) => errores.push(e.message));
      await usar(errores);
      expect(errores, "errores en la consola").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

/** Los dos modos de movimiento con los que se repiten las pruebas. */
export const modos = [
  { nombre: "con movimiento", reducedMotion: "no-preference" },
  { nombre: "movimiento reducido", reducedMotion: "reduce" },
] as const;

/**
 * En pantallas estrechas la navegación está tras el botón «Menú». En el
 * inicio, el botón llega con la entrada del hero: click() espera a que se vea.
 */
export async function abrirMenuSiHaceFalta(page: Page) {
  if ((page.viewportSize()?.width ?? 1440) >= 768) return;
  await page.getByRole("button", { name: "Menú" }).click();
}

/** Recorre la página entera, como haría un visitante, para que carguen las imágenes diferidas. */
export async function recorrer(page: Page) {
  const alto = await page.evaluate(() => document.documentElement.scrollHeight);
  const paso = Math.round((page.viewportSize()?.height ?? 800) * 0.7);
  for (let y = 0; y < alto; y += paso) {
    await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), y);
    await page.waitForTimeout(80);
  }
}
