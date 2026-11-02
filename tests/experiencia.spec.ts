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

  test("la galería de la ficha también amplía, con su encuadre, y el visor sigue abriéndose", async ({ page, hasTouch }) => {
    await page.goto("habitaciones/suite-mirador/");
    await motorListo(page);
    const conHover = await page.evaluate(() => matchMedia("(hover: hover)").matches);
    expect(conHover).toBe(!hasTouch);
    const boton = page.locator(".ampliar").first();
    await boton.scrollIntoViewIfNeeded();
    // Tamaño que se ve de la foto respecto a su marco (incluye cualquier transform)
    const escala = () => boton.evaluate((b) => b.querySelector("img")!.getBoundingClientRect().width / b.getBoundingClientRect().width);
    const encuadre = () => boton.locator("img").evaluate((i) => getComputedStyle(i).objectPosition);
    // Fin del revelado (la foto retrocede de 1,18 a 1): es el que deja un transform en línea en la foto
    await expect.poll(escala, { timeout: 5000 }).toBeLessThan(1.001);
    const antes = await encuadre();
    await boton.hover();
    if (conHover) {
      await expect.poll(escala).toBeGreaterThan(1.03);
    } else {
      await page.waitForTimeout(1000);
      expect(await escala()).toBeLessThan(1.001);
    }
    expect(await encuadre()).toBe(antes);
    await boton.click();
    await expect(page.locator("dialog.visor")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("dialog.visor")).toBeHidden();
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
  // complete no garantiza que el póster ya esté decodificado y pintado
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

// Fotogramas reales del mar, sin depender del color: «textura» es la
// desviación de la luminancia en la zona (una superficie vacía es lisa) y
// «cambio», la diferencia media con el fotograma anterior (el póster está
// quieto; el vídeo, no). Escala de 0 a 255.
const TEXTURA_MINIMA = 12;
const MOVIMIENTO_MINIMO = 0.25;
const mediana = (xs: number[]) => (xs.length ? [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)] : 0);
type Zona = { x: number; y: number; ancho: number; alto: number };

/** Parte de la escena sin texto ni botón, en fracciones de la ventana */
function zonaDelMar(page: Page): Promise<Zona> {
  return page.evaluate(() => {
    const r = document.querySelector(".mar-escena")!.getBoundingClientRect();
    const texto = document.querySelector(".mar-texto")!.getBoundingClientRect();
    const [arriba, abajo] = [r.top + r.height * 0.15, Math.min(texto.top - 8, r.top + r.height * 0.6)];
    return { x: (r.left + r.width * 0.1) / innerWidth, y: arriba / innerHeight, ancho: (r.width * 0.8) / innerWidth, alto: (abajo - arriba) / innerHeight };
  });
}

/** Graba lo que compone Chrome (screencast): cada fotograma pintado, con su hora y su scroll */
async function grabarFotogramas(page: Page) {
  const cdp = await page.context().newCDPSession(page);
  const fotogramas: { t: number; y: number; jpg: string }[] = [];
  cdp.on("Page.screencastFrame", (f) => {
    fotogramas.push({ t: (f.metadata.timestamp ?? 0) * 1000, y: f.metadata.scrollOffsetY, jpg: f.data });
    cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 85, maxWidth: 480, maxHeight: 480 });
  return {
    parar: async () => {
      await cdp.send("Page.stopScreencast");
      await cdp.detach();
      return fotogramas;
    },
  };
}

async function analizarFotogramas(browser: Browser, fotogramas: { t: number; jpg: string }[], zona: Zona) {
  const lienzo = await browser.newPage();
  const resultado = await lienzo.evaluate(
    async ({ fotogramas, zona }) => {
      let anterior: Float32Array | null = null;
      const salida: { t: number; textura: number; cambio: number }[] = [];
      for (const { t, jpg } of fotogramas) {
        const img = new Image();
        img.src = `data:image/jpeg;base64,${jpg}`;
        await img.decode();
        const c = document.createElement("canvas");
        [c.width, c.height] = [img.width, img.height];
        const ctx = c.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const d = ctx.getImageData(zona.x * img.width, zona.y * img.height, zona.ancho * img.width, zona.alto * img.height).data;
        const luz = new Float32Array(d.length / 4);
        for (let i = 0; i < luz.length; i++) luz[i] = 0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2];
        const m = luz.reduce((a, b) => a + b, 0) / luz.length;
        const textura = Math.sqrt(luz.reduce((a, b) => a + (b - m) ** 2, 0) / luz.length);
        let cambio = 0;
        if (anterior && anterior.length === luz.length) {
          for (let i = 0; i < luz.length; i++) cambio += Math.abs(luz[i] - anterior[i]);
          cambio /= luz.length;
        }
        anterior = luz;
        salida.push({ t, textura, cambio });
      }
      return salida;
    },
    { fotogramas, zona },
  );
  await lienzo.close();
  return resultado;
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
      await new Promise((ok) => setTimeout(ok, 4000));
      await r.continue();
    });
    const pedidos = pedidosDelMar(page);
    await page.goto("experiencias/");
    await motorListo(page);
    const video = page.locator(".mar-video");
    // Hora del primer fotograma del vídeo, para separar las dos fases
    const primerFotograma = video.evaluate(
      (v: HTMLVideoElement) => new Promise<number>((ok) => v.addEventListener("loadeddata", () => ok(performance.timeOrigin + performance.now()), { once: true })),
    );
    await page.locator(".mar-escena").evaluate((e) => e.scrollIntoView({ block: "center" }));
    // Lo que pinta el navegador mientras espera el MP4, en el paso al vídeo y
    // durante la reproducción: cada fotograma real, no el estado de los recursos
    const zona = await zonaDelMar(page);
    const scroll = await page.evaluate(() => scrollY);
    const grabacion = await grabarFotogramas(page);
    // El screencast puede saltarse un hueco muy corto: además, en cada fotograma
    // de la página, el póster o el vídeo tienen que estar a la vista (ni ellos ni
    // sus contenedores ocultos o transparentes)
    const vigilancia = page.evaluate(async () => {
      const v = document.querySelector<HTMLVideoElement>(".mar-video")!;
      const i = document.querySelector<HTMLImageElement>(".mar-poster img")!;
      const aLaVista = (e: Element) => {
        if (getComputedStyle(e).visibility === "hidden") return false;
        for (let x: Element | null = e; x; x = x.parentElement) {
          const s = getComputedStyle(x);
          if (s.display === "none" || Number(s.opacity) < 0.05) return false;
        }
        return true;
      };
      let vacios = 0;
      let reproduciendoDesde = 0;
      const t0 = performance.now();
      while (performance.now() - t0 < 12_000 && !(reproduciendoDesde && performance.now() - reproduciendoDesde > 2000)) {
        await new Promise(requestAnimationFrame);
        if (!reproduciendoDesde && !v.paused && v.readyState >= 2) reproduciendoDesde = performance.now();
        const conPoster = i.complete && i.naturalWidth > 0 && aLaVista(i);
        const conVideo = v.readyState >= 2 && aLaVista(v);
        if (!conPoster && !conVideo) vacios++;
      }
      return vacios;
    });
    const t0 = await page.evaluate(() => performance.timeOrigin + performance.now());
    await page.waitForTimeout(1200);
    expect(await video.evaluate((v: HTMLVideoElement) => v.readyState)).toBeLessThan(2);
    const esperando = await cieloDelMar(page, browser, "mar-esperando-mp4");
    expect(esCielo(esperando), `póster mientras llega el vídeo: ${JSON.stringify(esperando)}`).toBe(true);
    const t1 = await primerFotograma;
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused && v.currentTime > 0), { timeout: 10_000 }).toBe(true);
    await page.waitForTimeout(2000);
    // Fuera el último fotograma de antes del desplazamiento, que el screencast entrega al empezar
    const grabados = (await grabacion.parar()).filter((f) => Math.abs(f.y - scroll) < 2);
    const fotogramas = await analizarFotogramas(browser, grabados, zona);
    // El póster, una vez asentada la entrada de la escena con el scroll (scrub de
    // 0,3 s) y con margen antes del primer fotograma del vídeo (relojes distintos)
    const poster = fotogramas.filter((f) => f.t > t0 + 800 && f.t < t1 - 200);
    const enVideo = fotogramas.filter((f) => f.t > t1 + 300);
    test.info().annotations.push({ type: "fotogramas", description: JSON.stringify({ poster: poster.length, video: enVideo.length, texturaMin: Math.min(...fotogramas.map((f) => f.textura)), movimientoPoster: mediana(poster.slice(1).map((f) => f.cambio)), movimientoVideo: mediana(enVideo.map((f) => f.cambio)) }) });
    // Ningún fotograma vacío: siempre hay imagen con detalle (póster o vídeo), nunca una superficie lisa
    expect(fotogramas.filter((f) => f.t < t1).length, "fotogramas mientras se espera el MP4").toBeGreaterThan(0);
    for (const f of fotogramas) expect(f.textura, `fotograma vacío a ${Math.round(f.t - t1)} ms del primer fotograma del vídeo`).toBeGreaterThan(TEXTURA_MINIMA);
    expect(await vigilancia, "fotogramas de la página sin póster ni vídeo a la vista").toBe(0);
    // El vídeo se ve: la escena se mueve como el mar, cosa que el póster, estático, no hace
    expect(enVideo.length, "fotogramas pintados durante la reproducción").toBeGreaterThanOrEqual(10);
    expect(mediana(enVideo.map((f) => f.cambio)), "movimiento visible durante la reproducción").toBeGreaterThan(MOVIMIENTO_MINIMO);
    // Quieto: Chrome casi no pinta fotogramas nuevos, y los que pinta no cambian
    expect(mediana(poster.slice(1).map((f) => f.cambio)), "el póster está quieto").toBeLessThan(MOVIMIENTO_MINIMO);
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

/**
 * Para cada fotograma, cuánto se parece la zona a la foto de destino frente a
 * la de partida: 0 = la de antes, 1 = la nueva (diferencia media de luminancia
 * con cada referencia). Y su textura, para detectar una capa vacía.
 */
async function progresoEntreFotos(browser: Browser, fotogramas: { t: number; jpg: string }[], zona: Zona, desde: string, hasta: string) {
  const lienzo = await browser.newPage();
  const resultado = await lienzo.evaluate(
    async ({ fotogramas, zona, desde, hasta }) => {
      const luz = async (jpg: string) => {
        const img = new Image();
        img.src = `data:image/jpeg;base64,${jpg}`;
        await img.decode();
        const c = document.createElement("canvas");
        [c.width, c.height] = [img.width, img.height];
        const ctx = c.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const d = ctx.getImageData(zona.x * img.width, zona.y * img.height, zona.ancho * img.width, zona.alto * img.height).data;
        const l = new Float32Array(d.length / 4);
        for (let i = 0; i < l.length; i++) l[i] = 0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2];
        return l;
      };
      const diferencia = (a: Float32Array, b: Float32Array) => a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0) / a.length;
      const [a, b] = [await luz(desde), await luz(hasta)];
      const salida: { t: number; progreso: number; textura: number }[] = [];
      for (const { t, jpg } of fotogramas) {
        const l = await luz(jpg);
        const [da, db] = [diferencia(l, a), diferencia(l, b)];
        const m = l.reduce((s, v) => s + v, 0) / l.length;
        salida.push({ t, progreso: da / (da + db || 1), textura: Math.sqrt(l.reduce((s, v) => s + (v - m) ** 2, 0) / l.length) });
      }
      return salida;
    },
    { fotogramas, zona, desde, hasta },
  );
  await lienzo.close();
  return resultado;
}

test.describe("Selector de habitaciones", () => {
  test.use({ reducedMotion: "no-preference" });

  for (const destino of [1, 2]) {
    test(`primer cambio a la habitación ${destino + 1}, sin caché: ni la nueva antes del barrido, ni vuelta atrás, ni capa vacía`, async ({ page, browser }) => {
      await page.goto("habitaciones/");
      await motorListo(page);
      await page.waitForTimeout(1000);
      const escena = page.locator(".hab.actual .hab-escena");
      await escena.evaluate((e) => e.scrollIntoView({ block: "center" }));
      await page.waitForTimeout(400);
      // Zona de la foto (sin el rótulo de abajo), en fracciones de la ventana
      const zona = await escena.evaluate((e) => {
        const r = e.getBoundingClientRect();
        return { x: (r.left + r.width * 0.1) / innerWidth, y: (r.top + r.height * 0.1) / innerHeight, ancho: (r.width * 0.8) / innerWidth, alto: (r.height * 0.55) / innerHeight };
      });
      const scroll = await page.evaluate(() => scrollY);
      const grabacion = await grabarFotogramas(page);
      await page.waitForTimeout(400);
      const tClic = await page.evaluate(() => performance.timeOrigin + performance.now());
      // Clic sin desplazar la página, y en el primer fotograma después: la ficha nueva aún no enseña su texto
      const textoNuevoVisible = await page.evaluate(async (n) => {
        (document.querySelectorAll('[role="tab"]')[n] as HTMLElement).click();
        await new Promise(requestAnimationFrame);
        return [...document.querySelectorAll(".hab")[n].querySelector(".hab-info")!.children].some((h) => getComputedStyle(h).visibility !== "hidden" && Number(getComputedStyle(h).opacity) > 0.05);
      }, destino);
      expect(textoNuevoVisible, "el texto de la habitación nueva, superpuesto al de la anterior antes de la transición").toBe(false);
      await page.waitForTimeout(2600);
      const fotogramas = (await grabacion.parar()).filter((f) => Math.abs(f.y - scroll) < 2);
      const antes = fotogramas.filter((f) => f.t < tClic);
      const despues = fotogramas.filter((f) => f.t >= tClic);
      expect(antes.length, "fotograma de referencia antes del clic").toBeGreaterThan(0);
      const serie = await progresoEntreFotos(browser, despues, zona, antes[antes.length - 1].jpg, despues[despues.length - 1].jpg);
      test.info().annotations.push({ type: "progreso", description: serie.map((s) => `${Math.round(s.t - tClic)}ms:${s.progreso.toFixed(2)}`).join(" ") });
      for (const s of serie) expect(s.textura, `capa vacía a ${Math.round(s.t - tClic)} ms del clic`).toBeGreaterThan(TEXTURA_MINIMA);
      // Del clic al final la escena va de la foto anterior a la nueva sin volver atrás
      const llegada = serie.findIndex((s) => s.progreso > 0.8);
      expect(llegada, "la foto nueva llega").toBeGreaterThanOrEqual(0);
      const retroceso = serie.slice(llegada).find((s) => s.progreso < 0.5);
      expect(retroceso && `vuelve a la foto anterior a ${Math.round(retroceso.t - tClic)} ms tras verse la nueva a ${Math.round(serie[llegada].t - tClic)} ms`).toBeFalsy();
    });
  }

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
