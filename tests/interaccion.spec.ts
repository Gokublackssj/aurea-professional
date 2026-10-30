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
  await expect(page.locator("[data-hoja='sol']")).toHaveText(/^Hoy el sol se (pone|puso) a las \d{2}:\d{2}\./);
  await expect(page.locator("[data-hoja='luna']")).toHaveText(/Esta noche, .+ con un \d{1,3} % iluminado\./);
});

test.describe("Formulario de reserva", () => {
  test("calcula noches y estimación, y dice a qué hora se pone el sol el día de llegada", async ({ page }) => {
    await page.goto("reservas/");
    await page.getByRole("radio", { name: /Suite Mirador/ }).check({ force: true });
    await page.getByLabel("Llegada").fill("2027-06-21");
    await page.getByLabel("Salida").fill("2027-06-24");
    await expect(page.locator("[data-resumen='noches']")).toHaveText("3 noches");
    await expect(page.locator("[data-resumen='total']")).toHaveText(/1830\s?€/);
    await expect(page.locator("[data-resumen='sol']")).toHaveText(/el sol se pone a las 21:\d{2}/);
  });

  test("no deja elegir más huéspedes de los que caben en la habitación", async ({ page }) => {
    await page.goto("reservas/");
    const huespedes = page.locator("select[name='huespedes']");
    const deshabilitadas = () => huespedes.locator("option").evaluateAll((os) => os.filter((o) => (o as HTMLOptionElement).disabled).map((o) => (o as HTMLOptionElement).value));
    // Suite Terraza admite tres: se eligen tres.
    await page.getByRole("radio", { name: /Suite Terraza/ }).check({ force: true });
    await huespedes.selectOption("3");
    expect(await deshabilitadas()).toEqual(["4"]);
    // Suite Mirador admite dos: el número baja solo y el 3 deja de poder elegirse.
    await page.getByRole("radio", { name: /Suite Mirador/ }).check({ force: true });
    await expect(huespedes).toHaveValue("2");
    expect(await deshabilitadas()).toEqual(["3", "4"]);
  });

  test("avisa de lo que falta y marca los campos", async ({ page }) => {
    await page.goto("reservas/");
    await page.getByRole("button", { name: "Enviar solicitud" }).click();
    const errores = page.getByRole("alert");
    await expect(errores).toContainText("Falta la fecha de llegada");
    await expect(errores).toContainText("Falta tu nombre");
    await expect(page.getByLabel("Llegada")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel("Llegada")).toBeFocused();
  });

  test("con todo correcto abre el correo con la solicitud escrita", async ({ page }) => {
    await page.goto("reservas/?habitacion=estudio-jardin");
    await page.getByLabel("Llegada").fill("2027-03-10");
    await page.getByLabel("Salida").fill("2027-03-12");
    await page.getByLabel("Nombre").fill("Ana Prueba");
    await page.getByLabel("Correo electrónico").fill("ana@example.com");
    await page.getByRole("button", { name: "Enviar solicitud" }).click();
    const formulario = page.locator("form.formulario");
    await expect(formulario).toHaveAttribute("data-enviado", /^mailto:/);
    const url = decodeURIComponent((await formulario.getAttribute("data-enviado")) ?? "");
    expect(url).toMatch(/^mailto:reservas@aurea-hotel\.example\?subject=Solicitud de estancia: Estudio Jardín, 2027-03-10/);
    expect(url).toContain("Salida: 2027-03-12 (2 noches)");
    expect(url).toContain("Nombre: Ana Prueba");
  });
});
