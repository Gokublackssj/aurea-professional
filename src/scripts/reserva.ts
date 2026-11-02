// Reserva de demostración. Sin JavaScript, el formulario completo se envía
// por mailto. Con él se convierte en cinco pasos:
//   fechas → huéspedes → habitación → datos → confirmación
// - Cada paso se valida al avanzar (mensajes en la zona de alerta, campos
//   marcados con aria-invalid y el foco en el primero que falta).
// - Estancia mínima de las políticas: dos noches; tres en la Residencia y si
//   la llegada es en julio o agosto.
// - Las habitaciones en las que no cabe el grupo quedan deshabilitadas.
// - Preselecciona la habitación que llega en la URL (?habitacion=<slug>).
// - El resumen se actualiza (la estimación cuenta hasta su valor) y dice a qué
//   hora se pone el sol el día de llegada.
// - La confirmación es una demostración: no se reserva ni se cobra nada. Prepara
//   la solicitud como mensaje de correo y solo la abre si el visitante lo pide.
import { gsap } from "gsap";
import { sitio } from "../data/sitio";
import { hora, puestaDeSol } from "../lib/sol";
import { modoActual } from "./motion/preferencia";

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
  const pasos = [...form.querySelectorAll<HTMLElement>(".paso")];
  const marcas = [...form.querySelectorAll<HTMLElement>(".pasos-nav li")];
  const atras = form.querySelector<HTMLButtonElement>("[data-atras]")!;
  const adelante = form.querySelector<HTMLButtonElement>("[data-adelante]")!;
  const resumen = (clave: string) => document.querySelector<HTMLElement>(`[data-resumen='${clave}']`)!;
  const reducido = () => modoActual() === "reducido";

  const euros = (n: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  const isoLocal = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const aFecha = (iso: string) => {
    const [año, mes, dia] = iso.split("-").map(Number);
    return { año, mes, dia };
  };
  const fechaCorta = (iso: string) => new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", timeZone: "UTC" }).format(Date.parse(iso));
  const noches = () => (llegada.value && salida.value ? Math.round((Date.parse(salida.value) - Date.parse(llegada.value)) / 86_400_000) : 0);
  const elegida = () => radios.find((r) => r.checked && !r.disabled)?.value;
  const minimoNoches = (slug?: string) => {
    const mes = llegada.value ? aFecha(llegada.value).mes : 0;
    return slug === "residencia-aurea" || mes === 7 || mes === 8 ? 3 : 2;
  };

  // Fechas: no antes de hoy
  const hoy = isoLocal(new Date());
  llegada.min = hoy;
  salida.min = hoy;

  // Habitación desde la URL
  const pedida = new URLSearchParams(location.search).get("habitacion");
  const radioPedido = radios.find((r) => r.value === pedida);
  if (radioPedido) radioPedido.checked = true;

  // — Resumen —
  let totalMostrado = 0;
  const pintarTotal = (destino: number, texto: string) => {
    const el = resumen("total");
    if (!destino || reducido()) {
      el.textContent = texto;
      totalMostrado = destino;
      return;
    }
    const valor = { n: totalMostrado };
    gsap.to(valor, { n: destino, duration: 0.8, ease: "power2.out", overwrite: true, onUpdate: () => void (el.textContent = euros(Math.round(valor.n))) });
    totalMostrado = destino;
  };

  const actualizar = () => {
    // Habitaciones en las que no cabe el grupo: deshabilitadas
    const gente = Number(huespedes.value);
    for (const r of radios) {
      r.disabled = datos[r.value].huespedes < gente;
      if (r.disabled && r.checked) r.checked = false;
    }
    const slug = elegida();
    const h = slug ? datos[slug] : undefined;
    resumen("habitacion").textContent = h ? h.nombre : "Sin elegir";
    resumen("huespedes").textContent = `${gente} ${gente === 1 ? "huésped" : "huéspedes"}`;

    if (llegada.value) salida.min = isoLocal(new Date(Date.parse(llegada.value) + 86_400_000 * 1.5));

    const n = noches();
    resumen("fechas").textContent =
      llegada.value && salida.value && n > 0
        ? `${fechaCorta(llegada.value)} – ${fechaCorta(salida.value)}`
        : llegada.value
          ? `Llegada el ${fechaCorta(llegada.value)} · elige la salida`
          : "Elige las fechas";
    if (n > 0) {
      resumen("noches").textContent = `${n} ${n === 1 ? "noche" : "noches"}`;
      if (h) pintarTotal(n * h.precio, euros(n * h.precio));
      else pintarTotal(0, "Elige una habitación");
    } else {
      resumen("noches").textContent = "Elige las fechas";
      pintarTotal(0, h ? `Desde ${euros(h.precio)} la noche` : "—");
    }

    if (llegada.value) {
      const puesta = puestaDeSol(aFecha(llegada.value), sitio.latitud, sitio.longitud);
      if (puesta !== null) resumen("sol").textContent = `El día que llegas, el sol se pone a las ${hora(puesta, sitio.zonaHoraria)}. Pide la mesa del ventanal.`;
    }
  };

  // — Validación —
  const correoCompleto = () => correo.validity.valid && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo.value.trim());
  const problemasDe = (paso: number | "todo"): [HTMLElement, string][] => {
    const p: [HTMLElement, string][] = [];
    const todo = paso === "todo";
    if (todo || paso === 0) {
      const minimo = minimoNoches(todo ? elegida() : undefined);
      if (!llegada.value) p.push([llegada, "Falta la fecha de llegada."]);
      else if (llegada.value < hoy) p.push([llegada, "La llegada no puede ser anterior a hoy."]);
      if (!salida.value) p.push([salida, "Falta la fecha de salida."]);
      else if (llegada.value && noches() < minimo) p.push([salida, `La estancia mínima en esas fechas es de ${minimo} noches.`]);
    }
    if (todo || paso === 2) {
      const slug = elegida();
      if (!slug) p.push([radios.find((r) => !r.disabled) ?? radios[0], "Elige una habitación en la que quepáis."]);
      else if (noches() > 0 && noches() < minimoNoches(slug)) p.push([radios.find((r) => r.value === slug)!, `${datos[slug].nombre} pide una estancia mínima de ${minimoNoches(slug)} noches.`]);
    }
    if (todo || paso === 3) {
      if (!nombre.value.trim()) p.push([nombre, "Falta tu nombre."]);
      if (!correo.value.trim()) p.push([correo, "Falta tu correo electrónico."]);
      else if (!correoCompleto()) p.push([correo, "El correo electrónico no parece completo."]);
    }
    return p;
  };
  const mostrarProblemas = (problemas: [HTMLElement, string][]) => {
    for (const el of [llegada, salida, nombre, correo]) el.removeAttribute("aria-invalid");
    for (const [el] of problemas) el.setAttribute("aria-invalid", "true");
    if (!problemas.length) {
      errores.textContent = "";
      return false;
    }
    errores.innerHTML = `<p>Revisa lo siguiente:</p><ul>${problemas.map(([, t]) => `<li>${t}</li>`).join("")}</ul>`;
    problemas[0][0].focus();
    if (!reducido()) gsap.fromTo(errores, { x: -6 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.4)" });
    return true;
  };

  // — Solicitud (mismo mensaje de correo que sin JavaScript) —
  const destinoCorreo = () => {
    const slug = elegida()!;
    const h = datos[slug];
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
    return `mailto:${sitio.correo}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
  };

  // — Pasos —
  const etiquetas = ["Elegir huéspedes", "Elegir habitación", "Añadir tus datos", "Preparar solicitud"];
  let actual = 0;
  form.classList.add("en-pasos");
  form.querySelector<HTMLElement>(".pasos-nav")!.hidden = false;
  pasos.forEach((p) => p.setAttribute("tabindex", "-1"));

  const mostrar = (nuevo: number, sentido = 1, inicial = false) => {
    const viejo = pasos[actual];
    const siguiente = pasos[nuevo];
    actual = nuevo;
    marcas.forEach((m, i) => {
      m.classList.toggle("hecho", i < nuevo);
      if (i === nuevo) m.setAttribute("aria-current", "step");
      else m.removeAttribute("aria-current");
    });
    atras.hidden = nuevo === 0 || nuevo === 4;
    adelante.hidden = nuevo === 4;
    adelante.innerHTML = `${etiquetas[nuevo] ?? ""} <span class="flecha" aria-hidden="true">→</span>`;
    const entrar = () => {
      pasos.forEach((p) => (p.hidden = p !== siguiente));
      // Al cargar la página no se mueve el foco ni se anima nada
      if (inicial) return;
      siguiente.focus({ preventScroll: true });
      if (reducido()) {
        gsap.fromTo(siguiente, { opacity: 0 }, { opacity: 1, duration: 0.25 });
        return;
      }
      gsap.fromTo(siguiente, { opacity: 0, x: 32 * sentido }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" });
      gsap.fromTo(siguiente.querySelectorAll("legend, label, .opcion, .confirmacion > *, .nota"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.05, ease: "power2.out", delay: 0.1 });
    };
    if (viejo === siguiente || reducido()) return entrar();
    gsap.to(viejo, { opacity: 0, x: -24 * sentido, duration: 0.3, ease: "power2.in", onComplete: entrar });
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (actual < 3) {
      if (mostrarProblemas(problemasDe(actual))) return;
      mostrar(actual + 1, 1);
      return;
    }
    if (mostrarProblemas(problemasDe("todo"))) return;
    const destino = destinoCorreo();
    // Queda anotado en el formulario: lo leen las pruebas sin abrir ningún programa de correo.
    form.dataset.enviado = destino;
    form.querySelector<HTMLElement>("[data-codigo]")!.textContent = `AUR-DEMO-${String(Math.floor(1000 + Math.random() * 9000))}`;
    mostrar(4, 1);
  });

  atras.addEventListener("click", () => {
    errores.textContent = "";
    mostrar(actual - 1, -1);
  });

  form.querySelector("[data-abrir-correo]")!.addEventListener("click", () => {
    if (form.dataset.enviado) location.href = form.dataset.enviado;
  });

  form.querySelector("[data-reiniciar]")!.addEventListener("click", () => {
    form.reset();
    delete form.dataset.enviado;
    totalMostrado = 0;
    errores.textContent = "";
    actualizar();
    mostrar(0, -1);
  });

  form.addEventListener("input", actualizar);
  form.addEventListener("change", actualizar);
  actualizar();
  mostrar(0, 1, true);
}
