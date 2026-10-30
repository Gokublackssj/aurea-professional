import { test, expect } from "./ayudas";
import type { Page } from "@playwright/test";

// Piezas interactivas de la fase visual: control de movimiento (y la limpieza
// del motor al cambiar de modo), selector de habitaciones, visor de fotos y
// vista flotante del cartel.

const motorListo = (page: Page) => expect(page.locator("html")).toHaveAttribute("data-motion", "listo");

test.describe("Control de movimiento", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });

  test("cambia de modo, se recuerda y el motor se reconstruye sin restos", async ({ page }) => {
    await page.goto("");
    await motorListo(page);
    await expect(page.locator(".pin-spacer")).toHaveCount(2);
    await expect(page.locator('input[name="movimiento"][value="auto"]')).toBeChecked();

    // A reducido: sin secciones fijadas ni escenas, la preferencia se guarda.
    await page.getByRole("radio", { name: "Reducido" }).check();
    await expect(page.locator("html")).toHaveAttribute("data-movimiento", "reducido");
    await expect(page.locator(".pin-spacer")).toHaveCount(0);
    await expect(page.locator(".llegada")).not.toHaveClass(/es-escena/);
    await expect(page.locator(".dia")).not.toHaveClass(/es-escena/);
    await expect(page.locator("[data-movimiento-nota]")).toContainText("reducido");
    expect(await page.evaluate(() => localStorage.getItem("aurea-movimiento"))).toBe("reducido");

    // Se recuerda al volver a cargar, antes de que arranque el motor.
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-movimiento", "reducido");
    await expect(page.locator('input[name="movimiento"][value="reducido"]')).toBeChecked();

    // De vuelta a completo: las dos escenas fijadas vuelven, una sola vez cada una.
    await motorListo(page);
    await page.getByRole("radio", { name: "Completo" }).check();
    await expect(page.locator("html")).toHaveAttribute("data-movimiento", "completo");
    await expect(page.locator(".pin-spacer")).toHaveCount(2);
  });

});

test.describe("Control de movimiento con el sistema en «reducir movimiento»", () => {
  test.use({ reducedMotion: "reduce" });

  test("«Automático» sigue al sistema, y «Completo» lo sustituye", async ({ page }) => {
    await page.goto("");
    await expect(page.locator("html")).toHaveAttribute("data-preferencia", "auto");
    await expect(page.locator("html")).toHaveAttribute("data-movimiento", "reducido");
    await motorListo(page);
    await expect(page.locator(".pin-spacer")).toHaveCount(0);
    await page.getByRole("radio", { name: "Completo" }).check();
    await expect(page.locator("html")).toHaveAttribute("data-movimiento", "completo");
  });
});

test.describe("Selector de habitaciones", () => {
  test("se elige con clic y con las flechas, y la dirección lo recuerda", async ({ page }) => {
    await page.goto("habitaciones/");
    await motorListo(page);
    const pestanas = page.getByRole("tab");
    await expect(pestanas).toHaveCount(4);
    await expect(pestanas.first()).toHaveAttribute("aria-selected", "true");

    await page.getByRole("tab", { name: /Suite Terraza/ }).click();
    await expect(page.getByRole("tab", { name: /Suite Terraza/ })).toHaveAttribute("aria-selected", "true");
    await expect(page).toHaveURL(/#suite-terraza$/);
    await expect(page.getByRole("heading", { name: "Suite Terraza", level: 2 })).toBeVisible();

    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: /Residencia Aurea/ })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tab", { name: /Residencia Aurea/ })).toBeFocused();
    await page.keyboard.press("Home");
    await expect(page.getByRole("tab", { name: /Estudio Jardín/ })).toHaveAttribute("aria-selected", "true");
  });

  test("abre la habitación de la dirección (#slug)", async ({ page }) => {
    await page.goto("habitaciones/#suite-mirador");
    await motorListo(page);
    await expect(page.getByRole("tab", { name: /Suite Mirador/ })).toHaveAttribute("aria-selected", "true");
  });
});

test.describe("Visor de fotos", () => {
  test("se abre desde una foto, recorre las fotos y devuelve el foco al cerrar", async ({ page }) => {
    await page.goto("habitaciones/suite-mirador/");
    await motorListo(page);
    const primera = page.locator("[data-ampliar]").first();
    await primera.scrollIntoViewIfNeeded();
    await primera.click();
    const visor = page.locator("dialog.visor");
    await expect(visor).toBeVisible();
    await expect(visor.locator(".visor-pie")).toContainText("1 de 2");
    await page.keyboard.press("ArrowRight");
    await expect(visor.locator(".visor-pie")).toContainText("2 de 2");
    await page.keyboard.press("Escape");
    await expect(visor).toBeHidden();
    await expect(primera).toBeFocused();
  });
});

test.describe("Cartel del inicio", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });
  // La vista flotante solo existe con ratón; los proyectos móviles emulan pantalla táctil.
  test.skip(({ isMobile }) => isMobile, "Sin ratón no hay vista flotante");

  test("al pasar por una fila aparece junto al cursor otra vista de la habitación", async ({ page }) => {
    await page.goto("");
    await motorListo(page);
    const fila = page.locator('.cartel tbody tr[data-slug="suite-terraza"]');
    await fila.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    await fila.hover();
    await expect(page.locator(".cartel-vista")).toHaveCSS("opacity", "1", { timeout: 3000 });
    await expect(page.locator('.cartel-capa[data-slug="suite-terraza"]')).toHaveCSS("visibility", "visible");
  });
});
