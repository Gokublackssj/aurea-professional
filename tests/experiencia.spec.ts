import { test, expect } from "./ayudas";
import type { Browser, Page } from "@playwright/test";

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

// Lo que de verdad se ve en el mar, no lo que se descargó: color medio de una
// franja del cielo en una captura de la escena. El póster y el vídeo tienen un
// cielo naranja; una superficie oscura (vídeo vacío, controles) no.
type Color = { r: number; g: number; b: number };
async function cieloDelMar(page: Page, browser: Browser, nombre: string): Promise<Color> {
  // complete no garantiza que el póster ya esté pintado (decoding="async")
  await page.locator(".mar-poster img").evaluate((i: HTMLImageElement) => i.decode());
  const captura = await page.locator(".mar-escena").screenshot();
  await test.info().attach(nombre, { body: captura, contentType: "image/png" });
  const lienzo = await browser.newPage();
  const color = await lienzo.evaluate(async (png) => {
    const img = new Image();
    img.src = `data:image/png;base64,${png}`;
    await img.decode();
    const c = document.createElement("canvas");
    [c.width, c.height] = [img.width, img.height];
    const ctx = c.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    // Centro horizontal, entre el 15 % y el 40 % de alto: cielo, sin texto ni botón
    const d = ctx.getImageData(img.width * 0.25, img.height * 0.15, img.width * 0.5, img.height * 0.25).data;
    const suma = [0, 0, 0];
    for (let i = 0; i < d.length; i += 4) for (let k = 0; k < 3; k++) suma[k] += d[i + k];
    const n = d.length / 4;
    return { r: suma[0] / n, g: suma[1] / n, b: suma[2] / n };
  }, captura.toString("base64"));
  await lienzo.close();
  return color;
}
const esCielo = (c: Color) => c.r > 140 && c.r - c.b > 60;

/** Pósteres y vídeos del mar que pide la página */
function pedidosDelMar(page: Page) {
  const pedidos: string[] = [];
  page.on("request", (r) => /mar-ocaso.*\.(webp|mp4)$/.test(r.url()) && pedidos.push(r.url().split("/video/")[1]));
  return pedidos;
}
const posterDe = (page: Page) => ((page.viewportSize()?.width ?? 1440) < 768 ? "mar-ocaso-movil.webp" : "mar-ocaso-1280.webp");

async function sinDesborde(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
}

test.describe("El mar sin JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("se ve el póster de su tamaño y el vídeo no lo tapa", async ({ page, browser }) => {
    const pedidos = pedidosDelMar(page);
    await page.goto("experiencias/");
    await page.locator(".mar-escena").scrollIntoViewIfNeeded();
    const poster = page.locator(".mar-poster img");
    await expect(poster).toBeVisible();
    await expect.poll(() => poster.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
    // Sin scripts el navegador mostraría los controles del vídeo encima
    await expect(page.locator(".mar-video")).toBeHidden();
    const cielo = await cieloDelMar(page, browser, "mar-sin-js");
    expect(esCielo(cielo), `cielo del póster, no una superficie oscura: ${JSON.stringify(cielo)}`).toBe(true);
    expect(pedidos).toEqual([posterDe(page)]);
    await sinDesborde(page);
  });
});

test.describe("El mar con JavaScript: el póster se ve hasta que llega el vídeo", () => {
  test.use({ reducedMotion: "no-preference" });

  test("movimiento completo y MP4 retrasado: póster, después vídeo, sin fotogramas vacíos", async ({ page, browser }) => {
    await page.route(/\.mp4$/, async (r) => {
      await new Promise((ok) => setTimeout(ok, 2500));
      await r.continue();
    });
    const pedidos = pedidosDelMar(page);
    await page.goto("experiencias/");
    await motorListo(page);
    const video = page.locator(".mar-video");
    // Fotograma a fotograma mientras se acerca y espera al MP4: siempre hay imagen
    const muestreo = page.evaluate(async () => {
      const v = document.querySelector<HTMLVideoElement>(".mar-video")!;
      const i = document.querySelector<HTMLImageElement>(".mar-poster img")!;
      let vacios = 0;
      const t0 = performance.now();
      while (performance.now() - t0 < 6000 && !(v.readyState >= 2 && !v.paused)) {
        await new Promise(requestAnimationFrame);
        if (!(i.complete && i.naturalWidth > 0) && v.readyState < 2) vacios++;
      }
      return vacios;
    });
    await page.locator(".mar-escena").evaluate((e) => e.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(1200);
    expect(await video.evaluate((v: HTMLVideoElement) => v.readyState)).toBeLessThan(2);
    const esperando = await cieloDelMar(page, browser, "mar-esperando-mp4");
    expect(esCielo(esperando), `póster mientras llega el vídeo: ${JSON.stringify(esperando)}`).toBe(true);
    expect(await muestreo).toBe(0);
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused && v.currentTime > 0), { timeout: 10_000 }).toBe(true);
    const reproduciendo = await cieloDelMar(page, browser, "mar-reproduciendo");
    expect(esCielo(reproduciendo), `vídeo reproduciéndose: ${JSON.stringify(reproduciendo)}`).toBe(true);
    expect(pedidos.filter((p) => p.endsWith(".webp"))).toEqual([posterDe(page)]);
    expect(pedidos.filter((p) => p.endsWith(".mp4"))).toHaveLength(1);
    await sinDesborde(page);
  });
});

test.describe("El mar con movimiento reducido: imagen fija", () => {
  test.use({ reducedMotion: "reduce" });

  test("se ve el póster de su tamaño y no se pide el vídeo", async ({ page, browser }) => {
    const pedidos = pedidosDelMar(page);
    await page.goto("experiencias/");
    await motorListo(page);
    await page.locator(".mar-escena").evaluate((e) => e.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(1500);
    const cielo = await cieloDelMar(page, browser, "mar-reducido");
    expect(esCielo(cielo), JSON.stringify(cielo)).toBe(true);
    await expect(page.locator(".mar-pausa")).toBeHidden();
    expect(pedidos).toEqual([posterDe(page)]);
    await sinDesborde(page);
  });
});

for (const [caso, conexion] of [
  ["red lenta (3G)", { effectiveType: "3g", saveData: false }],
  ["ahorro de datos", { effectiveType: "4g", saveData: true }],
] as const) {
  test.describe(`El mar con ${caso}: imagen fija`, () => {
    test.use({ reducedMotion: "no-preference" });

    test("se ve el póster de su tamaño y no se pide el vídeo", async ({ page, browser }) => {
      await page.addInitScript((c) => Object.defineProperty(navigator, "connection", { value: c, configurable: true }), conexion);
      const pedidos = pedidosDelMar(page);
      await page.goto("experiencias/");
      await motorListo(page);
      await page.locator(".mar-escena").evaluate((e) => e.scrollIntoView({ block: "center" }));
      await page.waitForTimeout(1500);
      const cielo = await cieloDelMar(page, browser, `mar-${caso}`);
      expect(esCielo(cielo), JSON.stringify(cielo)).toBe(true);
      await expect(page.locator(".mar-pausa")).toBeHidden();
      expect(pedidos).toEqual([posterDe(page)]);
      await sinDesborde(page);
    });
  });
}

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
