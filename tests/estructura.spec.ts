import { test, expect, modos, abrirMenuSiHaceFalta, recorrer } from "./ayudas";
import { habitaciones } from "../src/data/habitaciones";

const paginas = [
  { ruta: "", h1: /^Aurea/, nav: "Inicio" },
  { ruta: "habitaciones/", h1: /^Habitaciones$/, nav: "Habitaciones" },
  { ruta: "experiencias/", h1: /^Experiencias$/, nav: "Experiencias" },
  { ruta: "reservas/", h1: /^Reservas$/, nav: "Reservar" },
  ...habitaciones.map((h) => ({ ruta: `habitaciones/${h.slug}/`, h1: new RegExp(`^${h.nombre}$`), nav: "Habitaciones" })),
];

for (const modo of modos) {
  test.describe(`Estructura (${modo.nombre})`, () => {
    test.use({ reducedMotion: modo.reducedMotion });

    for (const p of paginas) {
      test(`/${p.ruta}: un h1, navegación activa, sin desbordamiento y con imágenes correctas`, async ({ page }) => {
        const respuesta = await page.goto(p.ruta);
        expect(respuesta?.status()).toBe(200);
        await expect(page.locator("h1")).toHaveCount(1);
        await expect(page.locator("h1")).toHaveText(p.h1);

        // Por id: en móvil el menú está plegado y no tiene rol accesible hasta abrirlo.
        const activo = page.locator('#menu-principal [aria-current="page"]');
        await expect(activo).toHaveCount(1);
        await expect(activo).toHaveText(p.nav);

        const desborde = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(desborde).toBeLessThanOrEqual(0);
        await expect(page.locator(".pie-demo")).toContainText("Aurea es un hotel ficticio");

        // Todas las imágenes: locales, con alt, con dimensiones, en AVIF o WebP, y cargan.
        await recorrer(page);
        await page.evaluate(() => document.querySelectorAll("img").forEach((i) => (i.loading = "eager")));
        await page.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0), null, { timeout: 30_000 });
        const imagenes = await page.evaluate(() =>
          [...document.images].map((i) => ({
            alt: i.hasAttribute("alt"),
            dims: i.hasAttribute("width") && i.hasAttribute("height"),
            src: i.currentSrc,
          })),
        );
        expect(imagenes.length).toBeGreaterThanOrEqual(4);
        for (const i of imagenes) {
          expect(i.alt).toBe(true);
          expect(i.dims).toBe(true);
          expect(new URL(i.src).hostname).toBe("127.0.0.1");
          expect(i.src).toMatch(/\.(avif|webp)$/);
        }
      });
    }
  });
}

test("la navegación principal lleva a las cuatro páginas", async ({ page }) => {
  await page.goto("");
  const destinos = [
    ["Habitaciones", /^Habitaciones$/],
    ["Experiencias", /^Experiencias$/],
    ["Reservar", /^Reservas$/],
    ["Inicio", /^Aurea/],
  ] as const;
  for (const [enlace, h1] of destinos) {
    await abrirMenuSiHaceFalta(page);
    await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: enlace, exact: true }).click();
    await expect(page.locator("h1")).toHaveText(h1);
  }
});

test("cada habitación del selector abre su página de detalle", async ({ page }) => {
  for (const h of habitaciones) {
    await page.goto("habitaciones/");
    await page.getByRole("tab", { name: new RegExp(h.nombre) }).click();
    await page.getByRole("link", { name: `Ver ${h.conArticulo}` }).click();
    await expect(page).toHaveURL(new RegExp(`/habitaciones/${h.slug}/?$`));
    await expect(page.locator("h1")).toHaveText(h.nombre);
  }
});

test("el botón Reservar de una habitación la deja elegida en el formulario", async ({ page }) => {
  await page.goto("habitaciones/suite-terraza/");
  await page.locator(".portada-reserva").getByRole("link", { name: "Reservar" }).click();
  await expect(page).toHaveURL(/reservas\/?\?habitacion=suite-terraza$/);
  await expect(page.getByRole("radio", { name: /Suite Terraza/ })).toBeChecked();
  await expect(page.locator("[data-resumen='habitacion']")).toHaveText("Suite Terraza");
});

test("una ruta inexistente devuelve la página 404", async ({ page, errores }) => {
  const respuesta = await page.goto("no-existe/");
  expect(respuesta?.status()).toBe(404);
  await expect(page.locator("h1")).toContainText("no lleva a ninguna parte");
  // Chrome anota en la consola el 404 del propio documento: aquí es lo esperado.
  const esperado = "Failed to load resource: the server responded with a status of 404 (Not Found)";
  errores.splice(0, errores.length, ...errores.filter((e) => e !== esperado));
});

// Las 43 fotografías de src/assets/fotos, una por fila (como en CREDITS.md).
const totalFotos = 43;

test("la página de créditos nombra a los autores de todas las fotografías", async ({ page }) => {
  await page.goto("creditos/");
  const filas = page.locator("tbody tr");
  await expect(filas).toHaveCount(totalFotos);
  await expect(filas.locator("a[href^='https://unsplash.com/@']")).toHaveCount(totalFotos);
  await expect(filas.locator("a[href^='https://unsplash.com/photos/']")).toHaveCount(totalFotos);
});
