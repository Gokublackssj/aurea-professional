import { test, expect } from "./ayudas";
import type { Page } from "@playwright/test";

// El motor de movimiento del inicio: que GSAP arranca, que las escenas existen
// y que responden al desplazamiento; y que con movimiento reducido no se
// oculta ni se fija nada.

const motorListo = (page: Page) => expect(page.locator("html")).toHaveAttribute("data-motion", "listo");

async function inicioPin(page: Page, selector: string) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel)!;
    const spacer = el.closest(".pin-spacer") ?? el;
    return { top: spacer.getBoundingClientRect().top + scrollY, recorrido: (spacer as HTMLElement).offsetHeight - (el as HTMLElement).offsetHeight };
  }, selector);
}

test.describe("Movimiento en escritorio", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });

  test("arranca el motor con sus cuatro escenas y dos secciones fijadas", async ({ page }) => {
    await page.goto("");
    await motorListo(page);
    await expect(page.locator("html")).toHaveAttribute("data-escenas", "hero manifiesto llegada dia");
    await expect(page.locator(".pin-spacer")).toHaveCount(2);
    await expect(page.locator("html")).not.toHaveClass(/(^|\s)motion(\s|$)/);
  });

  test("el hero entra: la foto se abre del todo, el nombre y la navegación aparecen", async ({ page }) => {
    await page.goto("");
    await motorListo(page);
    await expect(page.locator(".hero-foto")).toHaveCSS("clip-path", "inset(0%)", { timeout: 6000 });
    await expect(page.locator(".hero-nombre")).toBeVisible();
    await expect(page.getByRole("link", { name: "Reservar", exact: true })).toBeVisible();
    // «Aurea» está partido en letras y sigue leyéndose entero
    await expect(page.locator(".hero-nombre-texto")).toHaveAttribute("aria-label", "Aurea");
  });

  test("La llegada: la lente pasa del hueco del panel a la pantalla entera", async ({ page }) => {
    await page.goto("");
    await motorListo(page);
    const { top, recorrido } = await inicioPin(page, ".llegada-escena");
    const lente = page.locator(".llegada-lente");
    await page.evaluate((y) => scrollTo(0, y), top);
    await expect(lente).not.toHaveCSS("clip-path", "inset(0px)");
    await page.evaluate((y) => scrollTo(0, y), top + recorrido * 0.85);
    await expect(lente).toHaveCSS("clip-path", "inset(0px)", { timeout: 5000 });
    await expect(page.locator(".llegada-escena")).toHaveCSS("position", "fixed");
  });

  test("Un día en Aurea: avanza de momento en momento con su rótulo y su barra", async ({ page }) => {
    await page.goto("");
    await motorListo(page);
    const { top, recorrido } = await inicioPin(page, ".dia");
    await page.evaluate((y) => scrollTo(0, y), top + recorrido * 0.6);
    await expect(page.locator(".progreso li.activo")).toHaveText("13:30", { timeout: 5000 });
    // Se deja que la escena se asiente en el momento antes de seguir (un
    // scrollTo programático no interrumpe ese ajuste; la rueda del usuario sí).
    await page.waitForTimeout(1600);
    await page.evaluate((y) => scrollTo(0, y), top + recorrido);
    await expect(page.locator(".progreso li.activo")).toHaveText("22:00", { timeout: 5000 });
  });
});

test.describe("Movimiento en móvil", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "no-preference" });

  test("arranca sin fijar ninguna sección y sin desbordar", async ({ page }) => {
    await page.goto("");
    await motorListo(page);
    await expect(page.locator(".pin-spacer")).toHaveCount(0);
    await expect(page.locator(".hero-foto")).toHaveCSS("clip-path", "inset(0%)", { timeout: 6000 });
    const desborde = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(desborde).toBeLessThanOrEqual(0);
  });
});

test.describe("Movimiento reducido", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("no se oculta ni se fija nada", async ({ page }) => {
    await page.goto("");
    await motorListo(page);
    await expect(page.locator(".pin-spacer")).toHaveCount(0);
    await expect(page.locator(".hero-foto")).toHaveCSS("clip-path", "none");
    await expect(page.locator(".hero-nombre")).toBeVisible();
    await expect(page.locator(".llegada")).not.toHaveClass(/es-escena/);
    await expect(page.locator(".llegada-lente")).toBeHidden();
  });
});
