import { test, expect } from "./ayudas";
import type { Page } from "@playwright/test";

// Piezas interactivas: control de movimiento (y la limpieza del motor al
// cambiar de modo), explorador de habitaciones, visor de fotos, vídeo del mar,
// el cielo y la vista flotante del cartel.

const motorListo = (page: Page) => expect(page.locator("html")).toHaveAttribute("data-motion", "listo");

test.describe("Control de movimiento", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });

  test("cambia de modo, se recuerda y el motor se reconstruye sin restos", async ({ page }) => {
    await page.goto("");
    await motorListo(page);
    await expect(page.locator(".llegada-escena")).toHaveCSS("position", "sticky");
    await expect(page.locator('input[name="movimiento"][value="auto"]')).toBeChecked();

    // A reducido: sin escenarios fijos, Un día en bloques, la preferencia se guarda.
    await page.getByRole("radio", { name: "Reducido" }).check();
    await expect(page.locator("html")).toHaveAttribute("data-movimiento", "reducido");
    await expect(page.locator(".pin-spacer")).toHaveCount(0);
    await expect(page.locator(".llegada-escena")).not.toHaveCSS("position", "sticky");
    await expect(page.locator(".dia-lista")).toBeVisible();
    await expect(page.locator("[data-movimiento-nota]")).toContainText("reducido");
    expect(await page.evaluate(() => localStorage.getItem("aurea-movimiento"))).toBe("reducido");

    // Se recuerda al volver a cargar, antes de que arranque el motor.
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-movimiento", "reducido");
    await expect(page.locator('input[name="movimiento"][value="reducido"]')).toBeChecked();

    // De vuelta a completo: los escenarios sticky vuelven, sin pins ni duplicados.
    await motorListo(page);
    await page.getByRole("radio", { name: "Completo" }).check();
    await expect(page.locator("html")).toHaveAttribute("data-movimiento", "completo");
    await expect(page.locator(".llegada-escena")).toHaveCSS("position", "sticky");
    await expect(page.locator(".pin-spacer")).toHaveCount(0);
    // Las palabras del manifiesto se partieron una sola vez
    await expect(page.locator(".frase .palabra .palabra")).toHaveCount(0);
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

test.describe("Explorador de habitaciones", () => {
  test("recorre las fotos de una habitación: miniatura, flechas, pie y contador; nunca otra habitación", async ({ page }) => {
    await page.goto("habitaciones/");
    await motorListo(page);
    const hab = page.locator(".hab.actual");
    await expect(hab.locator(".tira-contador")).toHaveText("1 / 4");
    await hab.locator(".tira-paso[data-paso='1']").click();
    await expect(hab.locator(".tira-contador")).toHaveText("2 / 4");
    await expect(hab.locator(".hab-rotulo-pie")).toHaveText("El porche");
    await hab.locator(".tira-fotos button").nth(3).click();
    await expect(hab.locator(".tira-contador")).toHaveText("4 / 4");
    await expect(hab.locator(".tira-fotos button").nth(3)).toHaveAttribute("aria-current", "true");
    // Cambio de habitación: su propia galería, empezando por su primera foto
    await page.getByRole("tab", { name: /Residencia Aurea/ }).click();
    await expect(page.locator(".hab.actual .tira-contador")).toHaveText("1 / 6");
    await expect(page.locator(".hab.actual .hab-rotulo-pie")).toHaveText("La piscina desbordante");
    await expect(page.locator("thead th.resaltada")).toHaveText("Residencia Aurea");
  });
});

test.describe("El mar y el cielo", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });

  test("el vídeo no se descarga al cargar, se reproduce al verlo, se pausa con el botón y fuera de pantalla", async ({ page }) => {
    const videos: string[] = [];
    page.on("request", (r) => r.url().endsWith(".mp4") && videos.push(r.url()));
    await page.goto("experiencias/");
    await motorListo(page);
    expect(videos).toEqual([]);
    const video = page.locator(".mar-video");
    await video.scrollIntoViewIfNeeded();
    await page.locator(".mar-escena").evaluate((e) => e.scrollIntoView({ block: "center" }));
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused && v.currentTime > 0), { timeout: 10_000 }).toBe(true);
    expect(videos.some((u) => u.endsWith("mar-ocaso-1280.mp4"))).toBe(true);
    await page.getByRole("button", { name: "Pausar vídeo" }).click();
    await expect(video).toHaveJSProperty("paused", true);
    await expect(page.getByRole("button", { name: "Reanudar vídeo" })).toBeVisible();
  });

  test("el cielo: el círculo crece hasta cubrir la pantalla y después aparece el texto", async ({ page }) => {
    await page.goto("experiencias/");
    await motorListo(page);
    const { top, alto } = await page.locator(".cielo").evaluate((e) => ({ top: e.getBoundingClientRect().top + scrollY, alto: (e as HTMLElement).offsetHeight }));
    const radio = () => page.locator(".cielo-foto").evaluate((e) => e.getBoundingClientRect().width / 2);
    await page.evaluate((y) => scrollTo(0, y), top - 200);
    await page.waitForTimeout(800);
    const pequeno = await radio();
    await page.evaluate((y) => scrollTo(0, y), top + alto - 900);
    await expect.poll(radio, { timeout: 5000 }).toBeGreaterThan(Math.hypot(1440, 900) / 2);
    expect(pequeno).toBeLessThan(400);
    await expect(page.locator(".cielo-texto .etiqueta")).toHaveCSS("opacity", "1", { timeout: 5000 });
  });
});

test.describe("El mar con movimiento reducido", () => {
  test.use({ reducedMotion: "reduce" });

  test("solo el póster: ni descarga el vídeo ni muestra el botón", async ({ page }) => {
    const videos: string[] = [];
    page.on("request", (r) => r.url().endsWith(".mp4") && videos.push(r.url()));
    await page.goto("experiencias/");
    await motorListo(page);
    await page.locator(".mar-escena").evaluate((e) => e.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(1500);
    expect(videos).toEqual([]);
    await expect(page.locator(".mar-pausa")).toBeHidden();
    // La imagen fija se ve: cargada y sin vídeo encima con fotogramas
    await expect(page.locator(".mar-poster img")).toBeVisible();
    expect(await page.locator(".mar-poster img").evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
    await expect(page.locator(".mar-video")).toHaveJSProperty("readyState", 0);
  });
});

test.describe("Zoom de las fotos al pasar", () => {
  test.use({ reducedMotion: "no-preference" });

  test("amplía con un puntero que pasa por encima y no en pantallas táctiles", async ({ page, hasTouch }) => {
    await page.goto("habitaciones/suite-mirador/");
    await motorListo(page);
    const conHover = await page.evaluate(() => matchMedia("(hover: hover)").matches);
    expect(conHover).toBe(!hasTouch);
    const enlace = page.locator(".otras a").first();
    await enlace.scrollIntoViewIfNeeded();
    await enlace.hover();
    const escala = () => enlace.locator("img").evaluate((i) => new DOMMatrix(getComputedStyle(i).transform).a);
    if (conHover) {
      await expect.poll(escala).toBeGreaterThan(1.03);
    } else {
      await page.waitForTimeout(1000);
      expect(await escala()).toBe(1);
    }
  });
});

test.describe("Póster del mar", () => {
  test("se descarga un solo póster, el de su tamaño, y vídeo y póster se escalan juntos", async ({ page }) => {
    const posteres: string[] = [];
    page.on("request", (r) => /mar-ocaso.*\.webp$/.test(r.url()) && posteres.push(r.url().split("/video/")[1]));
    await page.goto("experiencias/");
    await motorListo(page);
    const esperado = (page.viewportSize()?.width ?? 1440) < 768 ? "mar-ocaso-movil.webp" : "mar-ocaso-1280.webp";
    const poster = page.locator(".mar-poster img");
    await page.locator(".mar-escena").evaluate((e) => e.scrollIntoView({ block: "center" }));
    // Antes del primer fotograma ya está la imagen: nunca se ve el fondo vacío
    await expect.poll(() => poster.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
    expect(await poster.evaluate((i: HTMLImageElement) => i.currentSrc.split("/video/")[1])).toBe(esperado);
    await page.waitForTimeout(1500);
    expect(posteres).toEqual([esperado]);
    // Mismo rectángulo para los dos: al pasar de la imagen al vídeo no hay salto
    const caja = (sel: string) => page.locator(sel).evaluate((e) => JSON.stringify(e.getBoundingClientRect()));
    expect(await caja(".mar-poster img")).toBe(await caja(".mar-video"));
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
    // La Suite Mirador tiene 4 fotos: la portada y 3 en el mosaico
    await expect(visor.locator(".visor-pie")).toContainText("1 de 3");
    await page.keyboard.press("ArrowRight");
    await expect(visor.locator(".visor-pie")).toContainText("2 de 3");
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
