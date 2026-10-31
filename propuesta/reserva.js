// Reserva de demostración: fechas → huéspedes → habitación → datos →
// confirmación. Sin disponibilidad real, sin pagos y sin enviar nada.
// Las transiciones entre pasos y el total animado usan GSAP; en modo reducido
// los pasos cambian con un fundido breve y el total se actualiza sin contar.
(function () {
  const form = document.querySelector(".reserva-flujo");
  if (!form) return;
  const reducido = () => document.documentElement.dataset.movimiento === "reducido";
  const { habitaciones } = window.AUREA;
  const paneles = [...form.querySelectorAll(".paso-panel")];
  const marcas = [...form.querySelectorAll(".pasos-nav li")];
  const error = form.querySelector(".aviso-error");
  const atras = form.querySelector("[data-atras]");
  const adelante = form.querySelector("[data-adelante]");
  const resumen = (k) => document.querySelector(`[data-resumen="${k}"]`);
  const euros = (n) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  const fechaCorta = (d) => d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });

  const estado = { paso: 0, llegada: null, salida: null, adultos: 2, jovenes: 0, habitacion: null, total: 0 };
  const noches = () => (estado.llegada && estado.salida ? Math.round((estado.salida - estado.llegada) / 86400000) : 0);
  const huespedes = () => estado.adultos + estado.jovenes;

  // — Calendario: este mes y el siguiente, sin días pasados —
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const contenedor = form.querySelector(".calendarios");
  const pintarCalendarios = () => {
    contenedor.innerHTML = "";
    for (let m = 0; m < 2; m++) {
      const primero = new Date(hoy.getFullYear(), hoy.getMonth() + m, 1);
      const diasMes = new Date(primero.getFullYear(), primero.getMonth() + 1, 0).getDate();
      const hueco = (primero.getDay() + 6) % 7; // lunes primero
      const mes = document.createElement("div");
      mes.className = "mes";
      const nombreMes = primero.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
      mes.innerHTML = `<h4>${nombreMes[0].toUpperCase() + nombreMes.slice(1)}</h4><div class="dias-semana">${["L", "M", "X", "J", "V", "S", "D"].map((d) => `<span>${d}</span>`).join("")}</div>`;
      const rejilla = document.createElement("div");
      rejilla.className = "dias";
      for (let i = 0; i < hueco; i++) rejilla.appendChild(document.createElement("span"));
      for (let d = 1; d <= diasMes; d++) {
        const fecha = new Date(primero.getFullYear(), primero.getMonth(), d);
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = d;
        b.dataset.t = fecha.getTime();
        b.setAttribute("aria-label", fecha.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }));
        if (fecha < hoy) b.disabled = true;
        rejilla.appendChild(b);
      }
      mes.appendChild(rejilla);
      contenedor.appendChild(mes);
    }
    marcarRango();
  };
  const marcarRango = () => {
    contenedor.querySelectorAll(".dias button").forEach((b) => {
      const t = Number(b.dataset.t);
      const ext = t === estado.llegada?.getTime() || t === estado.salida?.getTime();
      b.classList.toggle("extremo", ext);
      b.classList.toggle("en-rango", !!(estado.llegada && estado.salida && t > estado.llegada.getTime() && t < estado.salida.getTime()));
      b.setAttribute("aria-pressed", String(ext));
    });
  };
  contenedor.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b || b.disabled) return;
    const fecha = new Date(Number(b.dataset.t));
    if (!estado.llegada || estado.salida || fecha <= estado.llegada) {
      estado.llegada = fecha;
      estado.salida = null;
    } else {
      estado.salida = fecha;
    }
    marcarRango();
    actualizar();
  });

  // — Huéspedes —
  form.querySelectorAll("[data-cambiar]").forEach((b) =>
    b.addEventListener("click", () => {
      const [clave, paso] = b.dataset.cambiar.split(":");
      const nuevo = estado[clave] + Number(paso);
      const minimo = clave === "adultos" ? 1 : 0;
      if (nuevo < minimo || (Number(paso) > 0 && huespedes() >= 4)) return;
      estado[clave] = nuevo;
      form.querySelector(`[data-valor="${clave}"]`).textContent = nuevo;
      actualizar();
    }),
  );

  // — Habitaciones —
  const opciones = form.querySelector(".opciones-hab");
  opciones.innerHTML = habitaciones
    .map(
      (h) => `<label class="opcion-hab"><input type="radio" name="habitacion" value="${h.slug}" />
      <img class="foto" src="fotos/${h.fotos[0][0]}.webp" alt="" loading="lazy" /><b>${h.nombre}</b><span>${h.metros} m² · hasta ${h.huespedes} · desde ${euros(h.precio)}</span></label>`,
    )
    .join("");
  opciones.addEventListener("change", (e) => {
    estado.habitacion = habitaciones.find((h) => h.slug === e.target.value) ?? null;
    actualizar();
  });

  // — Resumen —
  const contarTotal = (destino) => {
    const el = resumen("total");
    if (!destino) {
      el.textContent = "—";
      estado.total = 0;
      return;
    }
    if (reducido() || !window.gsap) {
      el.textContent = euros(destino);
      estado.total = destino;
      return;
    }
    const obj = { v: estado.total };
    gsap.to(obj, { v: destino, duration: 0.8, ease: "power2.out", onUpdate: () => (el.textContent = euros(Math.round(obj.v))) });
    estado.total = destino;
  };
  const destacar = (k) => {
    if (reducido() || !window.gsap) return;
    gsap.fromTo(resumen(k), { opacity: 0.35, y: 6 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
  };
  let anterior = {};
  function actualizar() {
    const n = noches();
    const fechas = estado.llegada ? (estado.salida ? `${fechaCorta(estado.llegada)} – ${fechaCorta(estado.salida)} · ${n} ${n === 1 ? "noche" : "noches"}` : `Llegada ${fechaCorta(estado.llegada)} · elige la salida`) : "Elige en el calendario";
    const gente = `${estado.adultos} ${estado.adultos === 1 ? "adulto" : "adultos"}${estado.jovenes ? ` · ${estado.jovenes} mayor${estado.jovenes === 1 ? "" : "es"} de 12` : ""}`;
    const hab = estado.habitacion ? estado.habitacion.nombre : "Sin elegir";
    const actual = { fechas, huespedes: gente, habitacion: hab };
    for (const [k, v] of Object.entries(actual)) {
      if (anterior[k] !== v) {
        resumen(k).textContent = v;
        if (anterior[k] !== undefined) destacar(k);
      }
    }
    anterior = actual;
    // Habitaciones en las que no cabe el grupo: deshabilitadas
    opciones.querySelectorAll("input").forEach((i) => {
      const h = habitaciones.find((x) => x.slug === i.value);
      i.disabled = h.huespedes < huespedes();
      if (i.disabled && i.checked) {
        i.checked = false;
        estado.habitacion = null;
      }
    });
    contarTotal(estado.habitacion && n > 0 ? estado.habitacion.precio * n : 0);
  }

  // — Pasos —
  const validar = () => {
    if (estado.paso === 0 && (!estado.salida || noches() < 2)) return "Elige la llegada y la salida en el calendario (mínimo dos noches).";
    if (estado.paso === 2 && !estado.habitacion) return "Elige una habitación en la que quepáis.";
    if (estado.paso === 3) {
      const nombre = form.elements.nombre;
      const correo = form.elements.correo;
      // El navegador acepta «ana@ejemplo»; aquí se pide también el dominio completo
      const correoBien = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo.value.trim());
      nombre.setAttribute("aria-invalid", String(!nombre.value.trim()));
      correo.setAttribute("aria-invalid", String(!correoBien));
      if (!nombre.value.trim()) return "Escribe tu nombre.";
      if (!correoBien) return "El correo electrónico no parece completo.";
    }
    return "";
  };
  const mostrar = (nuevo, direccion = 1) => {
    const viejo = paneles[estado.paso];
    const siguiente = paneles[nuevo];
    estado.paso = nuevo;
    marcas.forEach((m, i) => {
      m.classList.toggle("hecho", i < nuevo);
      m.classList.toggle("actual", i === nuevo);
      if (i === nuevo) m.setAttribute("aria-current", "step");
      else m.removeAttribute("aria-current");
    });
    atras.hidden = nuevo === 0 || nuevo === 4;
    adelante.hidden = nuevo === 4;
    adelante.firstChild.textContent = nuevo === 3 ? "Confirmar solicitud " : "Continuar ";
    const entrar = () => {
      viejo.classList.remove("actual");
      siguiente.classList.add("actual");
      if (reducido() || !window.gsap) {
        if (window.gsap) gsap.fromTo(siguiente, { opacity: 0 }, { opacity: 1, duration: 0.25 });
      } else {
        gsap.fromTo(siguiente, { opacity: 0, x: 32 * direccion }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" });
        gsap.fromTo(siguiente.querySelectorAll("h3, .mes, .contador, .opcion-hab, .campo, .confirmacion > *"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.05, ease: "power2.out", delay: 0.1 });
      }
    };
    if (viejo === siguiente) return entrar();
    if (reducido() || !window.gsap) return entrar();
    gsap.to(viejo, { opacity: 0, x: -24 * direccion, duration: 0.3, ease: "power2.in", onComplete: entrar });
  };
  adelante.addEventListener("click", () => {
    const fallo = validar();
    error.textContent = fallo;
    if (fallo) {
      if (window.gsap && !reducido()) gsap.fromTo(error, { x: -6 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.4)" });
      return;
    }
    if (estado.paso === 3) form.querySelector(".codigo").textContent = `AUR-DEMO-${String(Math.floor(1000 + Math.random() * 9000))}`;
    mostrar(estado.paso + 1, 1);
  });
  atras.addEventListener("click", () => {
    error.textContent = "";
    mostrar(estado.paso - 1, -1);
  });
  form.querySelector("[data-reiniciar]").addEventListener("click", () => {
    Object.assign(estado, { llegada: null, salida: null, adultos: 2, jovenes: 0, habitacion: null });
    form.reset();
    form.querySelectorAll("[data-valor]").forEach((o) => (o.textContent = o.dataset.valor === "adultos" ? 2 : 0));
    pintarCalendarios();
    actualizar();
    mostrar(0, -1);
  });

  pintarCalendarios();
  actualizar();
  paneles[0].classList.add("actual");
  mostrar(0);
  window.AureaReserva = { estado };
})();
