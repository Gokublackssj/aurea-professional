import { test, expect } from "./ayudas";
import type { Page } from "@playwright/test";

// El motor de movimiento del inicio: que GSAP arranca, que las escenas existen
// y responden al desplazamiento; que las escenas largas son sticky (CSS, sin
// pin de GSAP) y que la página nunca se mueve sola; y que con movimiento
// reducido no se oculta ni se fija nada.

const motorListo = (page: Page) => expect(page.locator("html")).toHaveAttribute("data-motion", "listo");

/** Posición de una sección y cuánto se puede desplazar dentro de ella */
async function recorrido(page: Page, selector: string) {
  return page.evaluate((sel) => {
    const el = document.querySelector<HTMLElement>(sel)!;
    return { top: el.getBoundingClientRect().top + scrollY, recorrido: el.offsetHeight - innerHeight };
  }, selector);
}

test.describe("Movimiento en escritorio", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });

  test("arranca el motor con las escenas del inicio y escenarios sticky, sin pins", async ({ page }) => {
    await page.goto("");
    await motorListo(page);
    const escenas = ((await page.locator("html").getAttribute("data-escenas")) ?? "").split(" ");
    for (const e of ["hero", "manifiesto", "llegada", "cartel", "dia", "fuera"]) expect(escenas).toContain(e);
    await expect(page.locator(".pin-spacer")).toHaveCount(0);
    await expect(page.locator(".llegada-escena")).toHaveCSS("position", "sticky");
    await expect(page.locator(".dia-escena")).toHaveCSS("position", "sticky");
    await expect(page.locator("html")).not.toHaveClass(/(^|\s)motion(\s|$)/);
  });

  test("el hero se abre: la foto llega a la pantalla completa y aparecen la cabecera y la acción", async ({ page }) => {
    await page.goto("");
    await motorListo(page);
    await expect(page.locator(".hero-foto")).toHaveCSS("clip-path", /^inset\(0(%|px)?\)$/, { timeout: 7000 });
    await expect(page.locator(".hero-nombre")).toHaveText(/^Aurea/);
    await expect(page.locator(".hero-boton")).toHaveCSS("opacity", "1", { timeout: 7000 });
    await expect(page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Preparar mi estancia" })).toBeVisible();
  });

  test("La llegada: la banda de cine se abre hasta la pantalla completa con el scroll", async ({ page }) => {
    await page.goto("");
    await motorListo(page);
    const { top, recorrido: r } = await recorrido(page, ".llegada");
    const foto = page.locator(".llegada-foto");
    await page.evaluate((y) => scrollTo(0, y), top);
    await expect(foto).not.toHaveCSS("clip-path", /^inset\(0(%|px)?\)$/);
    await page.evaluate((y) => scrollTo(0, y), top + r * 0.85);
    await expect(foto).toHaveCSS("clip-path", /^inset\(0(%|px)?\)$/, { timeout: 5000 });
    // La escena queda fija arriba mientras dura
    expect(await page.locator(".llegada-escena").evaluate((e) => Math.round(e.getBoundingClientRect().top))).toBe(0);
    // Al final sube la frase, entera dentro de la pantalla
    const frase = page.locator(".llegada-frase");
    await expect(frase).toHaveText("Donde termina el camino, empieza el mar.");
    await expect(frase).toHaveCSS("opacity", "1", { timeout: 5000 });
    expect(await frase.evaluate((e) => e.scrollWidth <= e.clientWidth + 1 && e.getBoundingClientRect().right <= innerWidth)).toBe(true);
  });

  test("Un día en Aurea: el reloj y el momento avanzan con el scroll y las barras llevan a cada momento", async ({ page }) => {
    await page.goto("");
    await motorListo(page);
    const { top, recorrido: r } = await recorrido(page, ".dia");
    // El momento más opaco (entre dos momentos hay un fundido cruzado)
    const momentoVisible = () =>
      page.locator(".dia-momento").evaluateAll((ms) => {
        const op = ms.map((m) => Number(getComputedStyle(m).opacity));
        return Math.max(...op) > 0.5 ? op.indexOf(Math.max(...op)) : -1;
      });
    await page.evaluate((y) => scrollTo(0, y), top + r * 0.55);
    await expect.poll(momentoVisible, { timeout: 5000 }).toBe(2);
    await page.evaluate((y) => scrollTo(0, y), top + r);
    await expect.poll(momentoVisible, { timeout: 5000 }).toBe(4);
    // Botón de progreso: lleva al primer momento
    await page.locator(".dia-progreso button").first().click();
    await expect.poll(momentoVisible, { timeout: 6000 }).toBe(0);
  });

  test("con la rueda, la página no se mueve sola (sin ajuste automático)", async ({ page }) => {
    await page.goto("");
    await motorListo(page);
    const { top } = await recorrido(page, ".dia");
    await page.evaluate((y) => scrollTo(0, y), top + 50);
    await page.mouse.move(700, 450);
    let anterior = await page.evaluate(() => Math.round(scrollY));
    for (let i = 0; i < 8; i++) {
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(300);
      const ahora = await page.evaluate(() => Math.round(scrollY));
      expect(ahora - anterior).toBe(100);
      anterior = ahora;
    }
  });
});

test.describe("Motor que llega tarde (red lenta)", () => {
  test.use({ reducedMotion: "no-preference" });

  test("lo que el aviso de 4 s ya enseñó no se vuelve a ocultar: ni la foto del hero ni la cabecera de página", async ({ page }) => {
    // Los scripts tardan 5 s: el aviso del <head> quita «motion» antes de que llegue el motor
    await page.route(/\/_astro\/.*\.js$/, async (r) => {
      await new Promise((ok) => setTimeout(ok, 5000));
      await r.continue();
    });
    // Fracción visible de la foto del hero en cada fotograma
    await page.addInitScript(() => {
      const serie: [number, number][] = ((window as unknown as { __serie: [number, number][] }).__serie = []);
      const fraccion = (cp: string) => {
        const n = (cp.match(/inset\(([^)]*)\)/) || [])[1];
        if (!n) return 1;
        const [a, d = a, b = a, i = d] = n.split("round")[0].trim().split(/\s+/).map(parseFloat);
        return Math.max(0, (100 - a - b) / 100) * Math.max(0, (100 - d - i) / 100);
      };
      const bucle = () => {
        const f = document.querySelector(".hero-foto");
        if (f) serie.push([performance.now(), fraccion(getComputedStyle(f).clipPath)]);
        if (!(window as unknown as { __parar?: boolean }).__parar) requestAnimationFrame(bucle);
      };
      requestAnimationFrame(bucle);
    });
    await page.goto("");
    await motorListo(page);
    await page.waitForTimeout(2000);
    const serie = await page.evaluate(() => {
      const w = window as unknown as { __serie: [number, number][]; __parar: boolean };
      w.__parar = true;
      return w.__serie;
    });
    const entera = serie.findIndex(([, f]) => f > 0.95);
    expect(entera, "el aviso enseña la foto entera").toBeGreaterThanOrEqual(0);
    const cierre = serie.slice(entera).find(([, f]) => f < 0.95);
    expect(cierre && `la foto se cierra a ${Math.round(cierre[0])} ms`).toBeFalsy();
    await expect(page.locator(".hero-boton")).toHaveCSS("opacity", "1");

    // La cabecera de una página interior (data-entrada) tampoco desaparece al llegar el motor
    await page.goto("experiencias/");
    await expect(page.locator("html")).not.toHaveClass(/(^|\s)motion(\s|$)/, { timeout: 6000 });
    const titulo = page.locator("[data-entrada] h1");
    await expect(titulo).toBeVisible();
    const visibleHastaElMotor = page.evaluate(async () => {
      const h1 = document.querySelector("[data-entrada] h1")!;
      let oculto = 0;
      while (document.documentElement.dataset.motion !== "listo") await new Promise(requestAnimationFrame);
      const t0 = performance.now();
      while (performance.now() - t0 < 1500) {
        await new Promise(requestAnimationFrame);
        // La entrada oculta el título bajando sus líneas fuera de su máscara (SplitText)
        const desplazado = [...h1.querySelectorAll("*")].some((e) => Math.abs(new DOMMatrix(getComputedStyle(e).transform).f) > 1);
        const s = getComputedStyle(h1.closest("[data-entrada]")!);
        if (s.visibility === "hidden" || Number(s.opacity) < 0.5 || desplazado) oculto++;
      }
      return oculto;
    });
    expect(await visibleHastaElMotor, "fotogramas con la cabecera oculta tras llegar el motor").toBe(0);
  });
});

test.describe("Movimiento en móvil", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "no-preference" });

  test("arranca sin fijar la llegada ni el día y sin desbordar", async ({ page }) => {
    await page.goto("");
    await motorListo(page);
    await expect(page.locator(".pin-spacer")).toHaveCount(0);
    await expect(page.locator(".llegada-escena")).not.toHaveCSS("position", "sticky");
    await expect(page.locator(".dia-escena")).toBeHidden();
    await expect(page.locator(".dia-lista")).toBeVisible();
    await expect(page.locator(".hero-foto")).toHaveCSS("clip-path", /^inset\(0(%|px)?\)$/, { timeout: 7000 });
    const desborde = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(desborde).toBeLessThanOrEqual(0);
  });
});

test.describe("Movimiento reducido", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("no se oculta ni se fija nada: composición final y bloques normales", async ({ page }) => {
    await page.goto("");
    await motorListo(page);
    await expect(page.locator(".pin-spacer")).toHaveCount(0);
    await expect(page.locator(".llegada-escena")).not.toHaveCSS("position", "sticky");
    await expect(page.locator(".hero-nombre")).toBeVisible();
    await expect(page.locator(".hero-boton")).toHaveCSS("opacity", "1");
    await expect(page.locator(".dia-escena")).toBeHidden();
    await expect(page.locator(".dia-lista")).toBeVisible();
  });
});
