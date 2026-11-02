import { test, expect } from "./ayudas";

test.describe("Menú en pantallas estrechas", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("se abre, se cierra con Escape y devuelve el foco", async ({ page }) => {
    await page.goto("");
    const boton = page.getByRole("button", { name: "Menú" });
    const nav = page.getByRole("navigation", { name: "Principal" });
    await expect(nav).toBeHidden();
    await boton.click();
    await expect(page.getByRole("button", { name: "Cerrar" })).toHaveAttribute("aria-expanded", "true");
    await expect(nav).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(nav).toBeHidden();
    await expect(page.getByRole("button", { name: "Menú" })).toBeFocused();
  });
});

test("«La hoja de hoy» sustituye la frase general por la hora del sol y la luna de hoy", async ({ page }) => {
  await page.goto("");
  // Un día en Aurea lo repite en la escena (escritorio) y en la lista (móvil y reducido)
  for (const el of await page.locator("[data-hoja='sol']").all()) await expect(el).toHaveText(/^Hoy el sol se (pone|puso) a las \d{2}:\d{2}\./);
  for (const el of await page.locator("[data-hoja='luna']").all()) await expect(el).toHaveText(/Esta noche, .+ con un \d{1,3} % iluminado\./);
  await expect(page.locator("[data-hoja='sol']")).toHaveCount(2);
});

test.describe("Reserva de demostración", () => {
  const siguiente = (page: import("@playwright/test").Page) => page.locator("[data-adelante]");

  test("calcula noches y estimación, y dice a qué hora se pone el sol el día de llegada", async ({ page }) => {
    await page.goto("reservas/?habitacion=suite-mirador");
    await page.getByLabel("Llegada").fill("2027-06-21");
    await page.getByLabel("Salida").fill("2027-06-24");
    await expect(page.locator("[data-resumen='noches']")).toHaveText("3 noches");
    await expect(page.locator("[data-resumen='total']")).toHaveText(/1830\s?€/);
    await expect(page.locator("[data-resumen='sol']")).toHaveText(/el sol se pone a las 21:\d{2}/);
    await expect(page.locator("[data-resumen='habitacion']")).toHaveText("Suite Mirador");
  });

  test("avanza por pasos, valida cada uno y marca el paso actual", async ({ page }) => {
    await page.goto("reservas/");
    await expect(page.locator(".pasos-nav li[aria-current='step']")).toHaveText("Fechas");
    // Sin fechas no se avanza
    await siguiente(page).click();
    const errores = page.getByRole("alert");
    await expect(errores).toContainText("Falta la fecha de llegada");
    await expect(page.getByLabel("Llegada")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel("Llegada")).toBeFocused();
    // Estancia mínima: una noche no basta
    await page.getByLabel("Llegada").fill("2027-03-10");
    await page.getByLabel("Salida").fill("2027-03-11");
    await siguiente(page).click();
    await expect(errores).toContainText("estancia mínima");
    await page.getByLabel("Salida").fill("2027-03-12");
    await siguiente(page).click();
    await expect(page.locator(".pasos-nav li[aria-current='step']")).toHaveText("Huéspedes");
    // La zona de alerta se vacía (y vacía no se muestra)
    await expect(page.locator(".errores")).toBeEmpty();
    // Atrás conserva lo escrito
    await page.locator("[data-atras]").click();
    await expect(page.getByLabel("Salida")).toHaveValue("2027-03-12");
  });

  test("las habitaciones en las que no cabe el grupo quedan deshabilitadas", async ({ page }) => {
    await page.goto("reservas/?habitacion=suite-mirador");
    await page.getByLabel("Llegada").fill("2027-03-10");
    await page.getByLabel("Salida").fill("2027-03-13");
    await siguiente(page).click();
    await page.locator("select[name='huespedes']").selectOption("3");
    await siguiente(page).click();
    // La Suite Mirador admite dos: queda deshabilitada y deja de estar elegida
    await expect(page.getByRole("radio", { name: /Suite Mirador/ })).toBeDisabled();
    await expect(page.getByRole("radio", { name: /Estudio Jardín/ })).toBeDisabled();
    await expect(page.getByRole("radio", { name: /Suite Terraza/ })).toBeEnabled();
    await expect(page.locator("[data-resumen='habitacion']")).toHaveText("Sin elegir");
    await siguiente(page).click();
    await expect(page.getByRole("alert")).toContainText("Elige una habitación");
  });

  test("con todo correcto muestra la confirmación de demostración y prepara el correo", async ({ page }) => {
    await page.goto("reservas/?habitacion=estudio-jardin");
    await page.getByLabel("Llegada").fill("2027-03-10");
    await page.getByLabel("Salida").fill("2027-03-12");
    await siguiente(page).click();
    await siguiente(page).click();
    await expect(page.getByRole("radio", { name: /Estudio Jardín/ })).toBeChecked();
    await siguiente(page).click();
    await page.getByLabel("Nombre").fill("Ana Prueba");
    // Correo incompleto: se rechaza
    await page.getByLabel("Correo electrónico").fill("ana@example");
    await siguiente(page).click();
    await expect(page.getByRole("alert")).toContainText("no parece completo");
    await page.getByLabel("Correo electrónico").fill("ana@example.com");
    await siguiente(page).click();

    await expect(page.getByRole("heading", { name: "Solicitud preparada" })).toBeVisible();
    await expect(page.locator("[data-codigo]")).toHaveText(/^AUR-DEMO-\d{4}$/);
    await expect(page.locator(".confirmacion")).toContainText("no se ha hecho ninguna reserva ni ningún pago");
    const formulario = page.locator("form.formulario");
    const url = decodeURIComponent((await formulario.getAttribute("data-enviado")) ?? "");
    expect(url).toMatch(/^mailto:reservas@aurea-hotel\.example\?subject=Solicitud de estancia: Estudio Jardín, 2027-03-10/);
    expect(url).toContain("Salida: 2027-03-12 (2 noches)");
    expect(url).toContain("Nombre: Ana Prueba");
    // Empezar de nuevo vuelve al primer paso con el formulario vacío
    await page.getByRole("button", { name: "Empezar de nuevo" }).click();
    await expect(page.locator(".pasos-nav li[aria-current='step']")).toHaveText("Fechas");
    await expect(page.getByLabel("Llegada")).toHaveValue("");
  });
});
