// Formulario de reserva: preselecciona la habitación que llega en la URL
// (?habitacion=<slug>), calcula noches y estimación, dice a qué hora se pone
// el sol el día de llegada, valida y abre el correo con la solicitud escrita.
// Sin JavaScript, el formulario se envía igualmente por mailto.
import { sitio } from "../data/sitio";
import { hora, puestaDeSol } from "../lib/sol";

interface DatosHabitacion {
  nombre: string;
  precio: number;
  huespedes: number;
}

const form = document.querySelector<HTMLFormElement>(".formulario");

if (form) {
  const datos: Record<string, DatosHabitacion> = JSON.parse(form.dataset.habitaciones ?? "{}");
  const campo = <T extends HTMLElement>(nombre: string) => form.elements.namedItem(nombre) as T;
  const llegada = campo<HTMLInputElement>("llegada");
  const salida = campo<HTMLInputElement>("salida");
  const huespedes = campo<HTMLSelectElement>("huespedes");
  const nombre = campo<HTMLInputElement>("nombre");
  const correo = campo<HTMLInputElement>("correo");
  const telefono = campo<HTMLInputElement>("telefono");
  const mensaje = campo<HTMLTextAreaElement>("mensaje");
  const radios = [...form.querySelectorAll<HTMLInputElement>("input[name='habitacion']")];
  const errores = form.querySelector<HTMLElement>(".errores")!;
  const resumen = (clave: string) => document.querySelector<HTMLElement>(`[data-resumen='${clave}']`)!;

  const euros = (n: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  const isoLocal = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const aFecha = (iso: string) => {
    const [año, mes, dia] = iso.split("-").map(Number);
    return { año, mes, dia };
  };
  const noches = () => {
    if (!llegada.value || !salida.value) return 0;
    return Math.round((Date.parse(salida.value) - Date.parse(llegada.value)) / 86_400_000);
  };
  const elegida = () => radios.find((r) => r.checked)?.value ?? radios[0].value;

  // Fechas: no antes de hoy; la salida, al menos una noche después de la llegada.
  const hoy = isoLocal(new Date());
  llegada.min = hoy;
  salida.min = hoy;

  // Habitación desde la URL
  const pedida = new URLSearchParams(location.search).get("habitacion");
  const radioPedido = radios.find((r) => r.value === pedida);
  if (radioPedido) radioPedido.checked = true;

  const actualizar = () => {
    const h = datos[elegida()];
    resumen("habitacion").textContent = h.nombre;

    // Huéspedes: no más de los que caben en la habitación elegida
    for (const opcion of huespedes.options) opcion.disabled = Number(opcion.value) > h.huespedes;
    if (Number(huespedes.value) > h.huespedes) huespedes.value = String(h.huespedes);

    if (llegada.value) {
      const siguiente = new Date(Date.parse(llegada.value) + 86_400_000);
      salida.min = siguiente.toISOString().slice(0, 10);
    }

    const n = noches();
    if (n > 0) {
      resumen("noches").textContent = `${n} ${n === 1 ? "noche" : "noches"}`;
      resumen("total").textContent = euros(n * h.precio);
    } else {
      resumen("noches").textContent = "Elige las fechas";
      resumen("total").textContent = `Desde ${euros(h.precio)} la noche`;
    }

    if (llegada.value) {
      const puesta = puestaDeSol(aFecha(llegada.value), sitio.latitud, sitio.longitud);
      if (puesta !== null) {
        resumen("sol").textContent = `El día que llegas, el sol se pone a las ${hora(puesta, sitio.zonaHoraria)}. Pide la mesa del ventanal.`;
      }
    }
  };

  const validar = (): string[] => {
    const problemas: [HTMLElement, string][] = [];
    if (!llegada.value) problemas.push([llegada, "Falta la fecha de llegada."]);
    else if (llegada.value < hoy) problemas.push([llegada, "La llegada no puede ser anterior a hoy."]);
    if (!salida.value) problemas.push([salida, "Falta la fecha de salida."]);
    else if (llegada.value && noches() < 1) problemas.push([salida, "La salida tiene que ser al menos un día después de la llegada."]);
    if (!nombre.value.trim()) problemas.push([nombre, "Falta tu nombre."]);
    if (!correo.value.trim()) problemas.push([correo, "Falta tu correo electrónico."]);
    else if (!correo.validity.valid) problemas.push([correo, "El correo electrónico no parece completo."]);

    for (const el of [llegada, salida, nombre, correo]) el.removeAttribute("aria-invalid");
    for (const [el] of problemas) el.setAttribute("aria-invalid", "true");
    return problemas.map(([, texto]) => texto);
  };

  form.addEventListener("input", actualizar);
  form.addEventListener("change", actualizar);
  actualizar();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const problemas = validar();
    if (problemas.length) {
      errores.innerHTML = `<p>Revisa lo siguiente:</p><ul>${problemas.map((p) => `<li>${p}</li>`).join("")}</ul>`;
      (form.querySelector("[aria-invalid='true']") as HTMLElement | null)?.focus();
      return;
    }
    errores.textContent = "";

    const h = datos[elegida()];
    const n = noches();
    const cuerpo = [
      `Hola, quisiera reservar ${h.nombre}.`,
      "",
      `Llegada: ${llegada.value}`,
      `Salida: ${salida.value} (${n} ${n === 1 ? "noche" : "noches"})`,
      `Huéspedes: ${huespedes.value}`,
      `Estimación: ${euros(n * h.precio)}`,
      "",
      `Nombre: ${nombre.value.trim()}`,
      `Correo: ${correo.value.trim()}`,
      telefono.value.trim() ? `Teléfono: ${telefono.value.trim()}` : "",
      mensaje.value.trim() ? `\n${mensaje.value.trim()}` : "",
    ]
      .filter((l, i, todas) => l !== "" || todas[i - 1] !== "")
      .join("\n");
    const asunto = `Solicitud de estancia: ${h.nombre}, ${llegada.value}`;
    const destino = `mailto:${sitio.correo}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
    // Queda anotado en el formulario: lo leen las pruebas sin abrir ningún programa de correo.
    form.dataset.enviado = destino;
    location.href = destino;
  });
}
