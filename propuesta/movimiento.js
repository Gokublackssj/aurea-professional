// Aurea · sistema de movimiento del prototipo.
// Un lenguaje compartido (tokens) y una identidad por sección:
//   hero        abertura: línea → píldora → foto a sangre
//   manifiesto  tinta que avanza palabra a palabra; arcos que se abren desde una rendija
//   llegada     formato cine: la banda panorámica se abre en vertical (escenario sticky)
//   habitaciones explorador: empuje horizontal entre habitaciones, fundido entre fotos
//   experiencias persiana, arco, ventana de vídeo y círculo a pantalla completa;
//               la página cambia a noche
//   un día      reloj que rueda; fondos que se abren de abajo arriba (escenario sticky)
// Las escenas largas no usan pin de GSAP: el escenario es position: sticky (CSS) y
// GSAP solo traduce el scroll en la animación. Sin snap: la página no se mueve sola.
//   galería     cada foto con su máscara; visor que crece desde la foto
//   ubicación   la ruta se dibuja con el scroll
//   reservas    pasos que se deslizan; total que cuenta (reserva.js)
//   pie         el nombre se levanta letra a letra
// Un único gsap.matchMedia() distingue escritorio y móvil; el modo reducido
// sustituye todo desplazamiento, zoom y sección fijada por fundidos.
(function () {
  if (window.aureaProto) return; // nunca dos inicializaciones
  window.aureaProto = {};
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const T = {
    corto: 0.5, medio: 0.9, largo: 1.4, escena: 2.2,
    salida: "power4.out", entrada: "power3.in", travesia: "power3.inOut",
    distancia: { s: 16, m: 40, l: 90 },
    stagger: { fino: 0.04, normal: 0.08, amplio: 0.14 },
    paralaje: { suave: 0.06, medio: 0.12 },
    aparecer: "top 82%",
  };
  const reducido = document.documentElement.dataset.movimiento === "reducido";
  const { habitaciones, dia } = window.AUREA;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const euros = (n) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  document.querySelectorAll("[data-modo]").forEach((a) => a.classList.toggle("activo", a.dataset.modo === (reducido ? "reducido" : "completo")));

  // ————— Construcción del DOM dinámico (una vez) —————
  $(".pestanas").innerHTML = habitaciones.map((h, i) => `<button type="button" role="tab" id="tab-${h.slug}" aria-controls="ficha-${h.slug}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}"><span>${h.nombre}</span><span>desde ${euros(h.precio)}</span></button>`).join("");
  $(".ficha").innerHTML = habitaciones
    .map(
      (h, i) => `<div class="ficha-hab ${i === 0 ? "actual" : ""}" id="ficha-${h.slug}" role="tabpanel" aria-labelledby="tab-${h.slug}">
      <p class="entrada">${h.resumen}</p>
      <dl class="datos"><div><dt>Superficie</dt><dd>${h.metros} m²</dd></div><div><dt>Huéspedes</dt><dd>${h.huespedes}</dd></div><div><dt>Desde</dt><dd>${euros(h.precio)}</dd></div></dl>
      <ul class="servicios" aria-label="Servicios">${h.servicios.map((s) => `<li>${s}</li>`).join("")}</ul>
      <p class="suave"><b>En qué se diferencia:</b> ${h.diferencia}</p>
      <div class="acciones"><a class="boton boton-teal" href="#reservar" data-elegir="${h.slug}">Elegir ${h.nombre} <span class="flecha">→</span></a><a class="enlace" href="#comparar-titulo">Comparar</a></div>
    </div>`,
    )
    .join("");
  const filas = [["Superficie", (h) => `${h.metros} m²`], ["Huéspedes", (h) => `Hasta ${h.huespedes}`], ["Vista", (h) => h.vista], ["Exterior", (h) => h.exterior], ["Cama", (h) => h.cama], ["Baño", (h) => h.bano], ["Desde", (h) => `${euros(h.precio)} / noche`]];
  $(".comparador table").innerHTML = `<thead><tr><th scope="col"><span class="solo-lector">Característica</span></th>${habitaciones.map((h, i) => `<th scope="col" data-col="${i}">${h.nombre}</th>`).join("")}</tr></thead><tbody>${filas.map(([n, f]) => `<tr><th scope="row">${n}</th>${habitaciones.map((h, i) => `<td data-col="${i}">${f(h)}</td>`).join("")}</tr>`).join("")}</tbody>`;

  // Un día: escena de escritorio (fondos apilados + reloj) y lista para móvil
  const posiciones = [0, 1, 3, 4]; // dígitos de "HH:MM"
  $(".reloj").innerHTML = posiciones.map((p, k) => `${k === 2 ? '<span class="dos-puntos">:</span>' : ""}<span class="rueda">${dia.map((m) => `<span>${m.hora[p]}</span>`).join("")}</span>`).join("");
  $(".reloj").setAttribute("aria-label", dia[0].hora);
  $(".dia-momentos").innerHTML = dia.map((m, i) => `<div class="dia-momento" data-i="${i}"><h3 class="titulo">${m.titulo}</h3><p>${m.texto}</p></div>`).join("");
  $(".dia-fotos").innerHTML = dia.map((m, i) => `<figure class="dia-foto" data-i="${i}"><img class="foto" src="fotos/${m.fondo[0]}.webp" alt="${m.fondo[1]}" loading="lazy" /><div class="secundarias">${m.secundarias.map((s) => `<img class="foto" src="fotos/${s[0]}.webp" alt="${s[1]}" loading="lazy" />`).join("")}</div></figure>`).join("");
  // Las barras de progreso son botones: llevan a su momento (sustituyen al ajuste automático)
  $(".dia-progreso").innerHTML = dia.map((m, i) => `<button type="button" data-i="${i}" aria-label="Ir a las ${m.hora}: ${m.titulo}"><i></i></button>`).join("");
  $(".dia-lista").insertAdjacentHTML("beforeend", dia.map((m, i) => `<article class="dia-bloque" data-i="${i}">
    <figure class="dia-bloque-foto"><img class="foto" src="fotos/${m.fondo[0]}.webp" alt="${m.fondo[1]}" loading="lazy" /></figure>
    <div class="dia-bloque-texto"><span class="dia-bloque-hora">${m.hora}</span><h3 class="titulo">${m.titulo}</h3><p>${m.texto}</p></div>
  </article>`).join(""));

  // ————— Interacciones (una vez; su animación mira el modo al ocurrir) —————
  // Explorador de habitaciones.
  // hab: la pestaña elegida (responde al instante). mostrada/foto: lo que hay en
  // pantalla, que solo cambia cuando las imágenes nuevas ya están decodificadas.
  // El escenario tiene dos capas: la nueva se prepara detrás y nunca se ve vacía.
  let hab = 0, mostrada = 0, fotoHab = 0, enCurso = null;
  const capas = $$(".escenario .capa");
  let frente = 0; // índice de la capa visible
  const fichas = $$(".ficha-hab");
  const tira = $(".tira-fotos");
  const contador = $(".tira-contador");
  const src = (f) => `fotos/${f.n}.webp`;
  const decodificar = (url) => new Promise((ok) => {
    const im = new Image();
    im.src = url;
    const listo = () => ok(im);
    (im.decode ? im.decode() : Promise.reject()).then(listo, () => (im.complete ? listo() : (im.onload = im.onerror = listo)));
    setTimeout(listo, 2500); // si la red tarda, no se bloquea la interacción
  });
  const pintarCapa = (capa, f) => {
    const img = capa.querySelector("img");
    img.src = src(f);
    img.alt = f.alt;
    img.style.objectPosition = f.foco || "50% 50%";
  };
  const rotulo = () => {
    const h = habitaciones[mostrada];
    $(".marca-nombre").textContent = h.nombre;
    $(".marca-foto").textContent = h.fotos[fotoHab].alt;
    contador.textContent = `${fotoHab + 1} / ${h.fotos.length}`;
    $$("button", tira).forEach((b, i) => b.setAttribute("aria-current", String(i === fotoHab)));
  };
  const pintarTira = () => {
    const h = habitaciones[mostrada];
    tira.innerHTML = h.fotos.map((f, i) => `<li><button type="button" data-i="${i}" aria-label="Foto ${i + 1} de ${h.fotos.length}: ${f.alt}"><img class="foto" src="fotos/${f.n}-mini.webp" alt="" style="object-position:${f.foco || "50% 50%"}" /></button></li>`).join("");
  };
  // Transición entre dos capas. sentido: 1 avanza (sale hacia la izquierda), -1 retrocede.
  // tipo "habitacion": empuje horizontal completo; "foto": deslizamiento corto con fundido.
  const transicion = (f, sentido, tipo, extra) => {
    enCurso?.progress(1); // si había otra a medias, se completa antes de empezar
    const vieja = capas[frente];
    const nueva = capas[1 - frente];
    pintarCapa(nueva, f);
    frente = 1 - frente;
    gsap.set(nueva, { zIndex: 2, clipPath: "inset(0% 0% 0% 0%)", opacity: 1, xPercent: 0 });
    gsap.set(vieja, { zIndex: 1 });
    const tl = gsap.timeline({ onComplete: () => { gsap.set(vieja, { opacity: 0 }); enCurso = null; } });
    enCurso = tl;
    if (reducido) {
      tl.fromTo(nueva, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power1.out" });
    } else if (tipo === "habitacion") {
      // La nueva entra desde un lado mientras la anterior se aparta: bordes complementarios, sin hueco
      const entra = sentido > 0 ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)";
      const sale = sentido > 0 ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 100%)";
      tl.fromTo(nueva, { clipPath: entra }, { clipPath: "inset(0% 0% 0% 0%)", duration: T.medio, ease: T.travesia }, 0)
        .fromTo(nueva.querySelector("img"), { xPercent: 8 * sentido, scale: 1.06 }, { xPercent: 0, scale: 1, duration: T.largo, ease: T.salida }, 0)
        .fromTo(vieja, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: sale, duration: T.medio, ease: T.travesia }, 0)
        .fromTo(vieja.querySelector("img"), { xPercent: 0 }, { xPercent: -6 * sentido, duration: T.medio, ease: T.travesia }, 0);
    } else {
      tl.fromTo(nueva, { opacity: 0 }, { opacity: 1, duration: 0.55, ease: "power2.out" }, 0)
        .fromTo(nueva.querySelector("img"), { xPercent: 3 * sentido }, { xPercent: 0, duration: 0.8, ease: T.salida }, 0);
    }
    extra?.(tl);
    return tl;
  };
  const verFoto = (i) => {
    const h = habitaciones[mostrada];
    const n = (i + h.fotos.length) % h.fotos.length;
    if (n === fotoHab) return;
    const sentido = n > fotoHab ? 1 : -1;
    const destino = mostrada;
    decodificar(src(h.fotos[n])).then(() => {
      if (mostrada !== destino) return;
      fotoHab = n;
      transicion(h.fotos[n], sentido, "foto");
      rotulo();
    });
  };
  const elegirHab = (n, enfocar = false) => {
    const pestanas = $$(".pestanas button");
    if (enfocar) pestanas[n].focus();
    if (n === hab) return;
    const sentido = n > hab ? 1 : -1;
    hab = n;
    pestanas.forEach((p, i) => { p.setAttribute("aria-selected", String(i === n)); p.tabIndex = i === n ? 0 : -1; });
    $$("[data-col]").forEach((c) => c.classList.toggle("resaltada", Number(c.dataset.col) === n));
    // Todas las fotos de la habitación nueva (grandes y miniaturas) listas antes de mover nada
    const h = habitaciones[n];
    Promise.all([decodificar(src(h.fotos[0])), ...h.fotos.map((f) => decodificar(`fotos/${f.n}-mini.webp`))]).then(() => {
      if (hab !== n) return;
      mostrarHab(n, sentido);
    });
  };
  const mostrarHab = (n, sentido) => {
    if (n === mostrada) return;
    const fichaVieja = fichas[mostrada];
    const fichaNueva = fichas[n];
    mostrada = n;
    fotoHab = 0;
    fichaVieja.classList.remove("actual");
    fichaNueva.classList.add("actual");
    pintarTira();
    rotulo();
    transicion(habitaciones[n].fotos[0], sentido, "habitacion", (tl) => {
      if (reducido) { tl.fromTo([fichaNueva, tira], { opacity: 0 }, { opacity: 1, duration: 0.35 }, 0); return; }
      // La ficha y la tira cambian al ritmo de la foto
      tl.fromTo(fichaNueva.children, { opacity: 0, y: T.distancia.s }, { opacity: 1, y: 0, duration: T.medio, stagger: T.stagger.normal, ease: T.salida }, 0.2)
        .fromTo(fichaNueva.querySelectorAll(".servicios li"), { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: T.corto, stagger: T.stagger.fino, ease: "back.out(2)" }, 0.45)
        .fromTo($$("li", tira), { opacity: 0, x: 24 * sentido }, { opacity: 1, x: 0, duration: T.corto, stagger: T.stagger.fino, ease: T.salida }, 0.3)
        .fromTo(".marca-hab", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: T.corto, ease: T.salida }, 0.45);
    });
  };
  // Estado inicial: primera habitación, primera foto
  pintarCapa(capas[0], habitaciones[0].fotos[0]);
  gsap.set(capas[1], { opacity: 0 });
  pintarTira();
  rotulo();
  $(".pestanas").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) elegirHab($$(".pestanas button").indexOf(b)); });
  $(".pestanas").addEventListener("keydown", (e) => {
    const n = habitaciones.length;
    const d = { ArrowRight: hab + 1, ArrowDown: hab + 1, ArrowLeft: hab - 1, ArrowUp: hab - 1, Home: 0, End: n - 1 }[e.key];
    if (d === undefined) return;
    e.preventDefault();
    elegirHab((d + n) % n, true);
  });
  $$("[data-col='0']").forEach((c) => c.classList.add("resaltada"));
  tira.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) verFoto(Number(b.dataset.i)); });
  $$(".tira-paso").forEach((b) => b.addEventListener("click", () => verFoto(fotoHab + Number(b.dataset.paso))));
  // Deslizar con el dedo sobre la foto: siguiente o anterior (el scroll vertical sigue libre)
  let toque = null;
  const escena = $(".escenario");
  escena.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") toque = [e.clientX, e.clientY]; });
  escena.addEventListener("pointerup", (e) => {
    if (!toque) return;
    const [dx, dy] = [e.clientX - toque[0], e.clientY - toque[1]];
    toque = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) verFoto(fotoHab + (dx < 0 ? 1 : -1));
  });
  escena.addEventListener("pointercancel", () => (toque = null));
  // «Elegir» lleva la habitación a la reserva
  $(".ficha").addEventListener("click", (e) => {
    const a = e.target.closest("[data-elegir]");
    if (!a) return;
    const radio = $(`.opciones-hab input[value="${a.dataset.elegir}"]`);
    if (radio && !radio.disabled) { radio.checked = true; radio.dispatchEvent(new Event("change", { bubbles: true })); }
  });

  // Visor a pantalla completa: lo usan la galería y el explorador de habitaciones
  // (allí muestra la foto entera, sin el recorte del escenario)
  const visor = $(".visor");
  const fotosGaleria = $$(".mosaico [data-ampliar]");
  let foto = 0, origen, lista = [];
  const deGaleria = () => fotosGaleria.map((b) => { const im = b.querySelector("img"); return { src: im.getAttribute("src"), alt: im.alt }; });
  const mostrarFoto = (i, desde) => {
    foto = (i + lista.length) % lista.length;
    const f = lista[foto];
    $(".visor-foto").innerHTML = `<img src="${f.src}" alt="${f.alt}" />`;
    $(".visor-texto").textContent = `${f.alt} · ${foto + 1} de ${lista.length}`;
    const img = $(".visor-foto img");
    if (reducido) { gsap.fromTo(img, { opacity: 0 }, { opacity: 1, duration: 0.3 }); return; }
    if (desde) {
      const r = img.getBoundingClientRect();
      gsap.fromTo(img, { x: desde.left + desde.width / 2 - (r.left + r.width / 2), y: desde.top + desde.height / 2 - (r.top + r.height / 2), scale: desde.width / Math.max(r.width, 1), opacity: 0.6 }, { x: 0, y: 0, scale: 1, opacity: 1, duration: T.medio, ease: T.salida });
    } else gsap.fromTo(img, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.5, ease: T.salida });
  };
  fotosGaleria.forEach((b, i) => b.addEventListener("click", () => { origen = b; lista = deGaleria(); visor.showModal(); mostrarFoto(i, b.getBoundingClientRect()); }));
  $(".ampliar-hab").addEventListener("click", (e) => {
    origen = e.currentTarget;
    lista = habitaciones[mostrada].fotos.map((f) => ({ src: src(f), alt: f.alt }));
    visor.showModal();
    mostrarFoto(fotoHab, $(".escenario").getBoundingClientRect());
  });
  $(".visor-cerrar").addEventListener("click", () => visor.close());
  $(".visor-anterior").addEventListener("click", () => mostrarFoto(foto - 1));
  $(".visor-siguiente").addEventListener("click", () => mostrarFoto(foto + 1));
  visor.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") mostrarFoto(foto + 1); if (e.key === "ArrowLeft") mostrarFoto(foto - 1); });
  visor.addEventListener("click", (e) => e.target === visor && visor.close());
  visor.addEventListener("close", () => origen?.focus());

  // Menú móvil (<dialog>: Esc lo cierra y el foco queda dentro mientras está abierto)
  const menu = $(".menu-movil");
  $$(".abrir-menu").forEach((b) => b.addEventListener("click", () => {
    menu.showModal();
    gsap.fromTo(menu, { opacity: 0 }, { opacity: 1, duration: reducido ? 0.2 : 0.35, ease: "power1.out" });
    if (!reducido) gsap.fromTo(menu.querySelectorAll("li, .menu-movil > .boton"), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.05, ease: T.salida, delay: 0.05 });
  }));
  $(".cerrar-menu").addEventListener("click", () => menu.close());
  menu.addEventListener("click", (e) => {
    const a = e.target.closest("a[href^='#']");
    if (!a) return;
    // Se cierra primero (el diálogo devuelve el foco al botón) y después se va a la sección
    e.preventDefault();
    menu.close();
    const destino = $(a.getAttribute("href"));
    destino.scrollIntoView({ behavior: reducido ? "auto" : "smooth" });
    destino.setAttribute("tabindex", "-1");
    destino.focus({ preventScroll: true });
    history.replaceState(null, "", a.getAttribute("href"));
  });

  // Vídeo del mar: se carga al acercarse, se pausa fuera de pantalla y tiene botón
  // de pausa (WCAG 2.2.2). Modo reducido, ahorro de datos o red lenta: solo póster.
  const video = $(".mar-video");
  const pausa = $(".mar-pausa");
  const esMovil = matchMedia("(max-width: 767px)").matches;
  if (esMovil) video.poster = video.dataset.posterMovil;
  const red = navigator.connection;
  const soloPoster = reducido || !!red?.saveData || /2g|3g/.test(red?.effectiveType || "");
  window.aureaProto.video = { soloPoster };
  if (!soloPoster && "IntersectionObserver" in window) {
    let visible = false, pausadoPorVisitante = false;
    const reproducir = () => { if (visible && !pausadoPorVisitante && video.src) video.play().catch(() => {}); };
    const cargar = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      // preload="none" no descarga nada hasta que se pide: al asignar la fuente se
      // fuerza la carga, y se reproduce si ya está a la vista (el orden de los dos
      // observadores no está garantizado)
      video.preload = "auto";
      video.src = esMovil ? video.dataset.movil : video.dataset.escritorio;
      video.load();
      reproducir();
      cargar.disconnect();
    }, { rootMargin: "100% 0px" });
    cargar.observe(video);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? reproducir() : video.pause(); }, { threshold: 0.25 }).observe(video);
    video.addEventListener("loadeddata", reproducir);
    pausa.hidden = false;
    pausa.addEventListener("click", () => {
      pausadoPorVisitante = !video.paused;
      pausadoPorVisitante ? video.pause() : reproducir();
    });
    const etiqueta = () => (pausa.textContent = pausadoPorVisitante ? "Reanudar vídeo" : "Pausar vídeo");
    video.addEventListener("play", etiqueta);
    video.addEventListener("pause", etiqueta);
  }

  // Disparadores de toda la página. Se crean al final de cada construcción,
  // después de las secciones fijadas, para que midan con sus espaciadores.
  const barra = $(".barra");
  const disparadoresDePagina = () => {
    // Barra: aparece tras el hero, se esconde al bajar y vuelve al subir
    ScrollTrigger.create({
      start: () => innerHeight * 0.85,
      end: "max",
      onUpdate: (st) => barra.classList.toggle("visible", st.direction < 0),
      onLeaveBack: () => barra.classList.remove("visible"),
    });
    $$("main > section[id]").forEach((s) => {
      const enlace = $(`.barra nav a[href="#${s.id}"]`);
      if (enlace) ScrollTrigger.create({ trigger: s, start: "top 50%", end: "bottom 50%", onToggle: (st) => enlace.classList.toggle("activo", st.isActive) });
    });
    // Cifras que cuentan; en modo reducido se muestran ya escritas
    if (reducido) return;
    $$("[data-contar]").forEach((el) => {
      const fin = Number(el.dataset.contar);
      const o = { v: 0 };
      el.textContent = "0";
      gsap.to(o, { v: fin, duration: 1.6, ease: "power2.out", onUpdate: () => (el.textContent = Math.round(o.v)), scrollTrigger: { trigger: el, start: "top 90%" } });
    });
  };
  // Las escenas fijadas ocupan la pantalla: la barra se retira mientras duran
  const escenaFijada = (st) => barra.classList.toggle("en-escena", st.isActive);
  // Barras de progreso de Un día: botones que llevan a cada momento (escritorio)
  let irAMomento = null;
  $(".dia-progreso").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) irAMomento?.(Number(b.dataset.i)); });

  // ————— Escenas de scroll (dentro de matchMedia: se revierten solas) —————
  // Se construyen cuando las fuentes ya han cargado (como mucho 1,5 s), para que
  // SplitText mida las líneas con la tipografía definitiva, igual que en el sitio.
  const mm = gsap.matchMedia();
  const limpiezas = []; // escuchas que no son animaciones y matchMedia no revierte sola
  const construir = () => mm.add({ escritorio: "(min-width: 768px)", movil: "(max-width: 767px)" }, (ctx) => {
    const c = ctx.conditions;
    const fundido = (objetivos, trigger, extra = {}) =>
      gsap.fromTo(objetivos, { opacity: 0 }, { opacity: 1, duration: T.medio, stagger: T.stagger.normal, ease: "power1.out", scrollTrigger: { trigger, start: T.aparecer }, ...extra });
    const lineas = (el) => SplitText.create(el, { type: "lines", mask: "lines", aria: "auto" }).lines;
    const tituloSube = (el, trigger = el) => gsap.fromTo(lineas(el), { yPercent: 130 }, { yPercent: 0, duration: T.largo, stagger: T.stagger.normal, ease: T.salida, scrollTrigger: { trigger, start: T.aparecer } });

    // — 1. HERO —
    const heroTl = gsap.timeline({ paused: true, defaults: { ease: T.travesia } });
    const vw = innerWidth, vh = innerHeight;
    heroTl.to(".hero-linea", { scaleX: 1, duration: 1.1, ease: "power2.out" }, 0.3)
      .set(".hero-foto", { clipPath: "inset(49.9% 31% 49.9% 31% round 999px)" }, 1.3)
      .to(".hero-linea", { opacity: 0, duration: 0.2 }, 1.3)
      .fromTo(".hero-foto", { clipPath: "inset(49.9% 31% 49.9% 31% round 999px)" }, { clipPath: "inset(30% 31% 30% 31% round 999px)", duration: 1.1, immediateRender: false }, 1.3)
      .to(".mitad-a", { x: -vw * (c.movil ? 0.2 : 0.24), duration: 1.1 }, 1.3)
      .to(".mitad-b", { x: vw * (c.movil ? 0.2 : 0.24), duration: 1.1 }, 1.3)
      .fromTo(".hero-foto", { clipPath: "inset(30% 31% 30% 31% round 999px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1.4, immediateRender: false }, 2.6)
      .to(".hero-foto img", { scale: 1, duration: 2.2, ease: "power2.out" }, 1.3)
      .to(".hero-nombre span, .hero-pie p", { color: "#f2f0ea", duration: 0.8 }, 2.6)
      .to(".hero-pie .etiqueta", { color: "#c9a66b", duration: 0.8 }, 2.6)
      .call(() => $(".hero").classList.add("oscuro"), null, 2.9)
      .to(".mitad-a, .mitad-b", { x: 0, duration: 1.2 }, 3.4)
      .to(".hero-nombre", { y: c.movil ? -vh * 0.2 : vh * 0.24, scale: c.movil ? 0.8 : 0.62, duration: 1.2 }, 3.4)
      .to(".hero-nav, .hero-pie .boton", { opacity: 1, duration: 0.9, ease: "power2.out", stagger: 0.15 }, 4.1);
    window.aureaProto.heroTl = heroTl;
    if (reducido || window.aureaProto.heroVisto) {
      heroTl.progress(1);
      // En reducido el texto ya está pintado desde el principio; solo la foto entra con un fundido
      if (reducido && !window.aureaProto.heroVisto) gsap.from(".hero-foto", { opacity: 0, duration: 0.6 });
    } else if (!location.hash.includes("quieto")) heroTl.play();
    window.aureaProto.heroVisto = true;
    if (!reducido) {
      gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 } })
        .to(".hero-foto img", { scale: 1.12, yPercent: 6 }, 0)
        .to(".hero-nombre span", { yPercent: -40, opacity: 0.4 }, 0);
    }

    // — 2. MANIFIESTO: la tinta avanza palabra a palabra —
    const palabras = SplitText.create(".manifiesto-texto", { type: "words", wordsClass: "palabra", aria: "auto" }).words;
    gsap.to(palabras, { color: "#141412", stagger: 0.1, ease: "none", scrollTrigger: { trigger: ".manifiesto-texto", start: "top 75%", end: "bottom 45%", scrub: 0.5 } });
    if (reducido) {
      fundido(".arco", ".arcos");
    } else {
      gsap.fromTo(".arco", { clipPath: "inset(0% 50% 0% 50%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: T.largo, stagger: T.stagger.amplio, ease: T.travesia, scrollTrigger: { trigger: ".arcos", start: T.aparecer } });
      gsap.fromTo(".arco img", { scale: 1.3 }, { scale: 1, duration: T.escena, stagger: T.stagger.amplio, ease: T.salida, scrollTrigger: { trigger: ".arcos", start: T.aparecer } });
      gsap.to(".arco:nth-child(2)", { y: -innerHeight * T.paralaje.medio, ease: "none", scrollTrigger: { trigger: ".manifiesto", start: "top bottom", end: "bottom top", scrub: true } });
    }

    // — 3. LLEGADA: formato cine. Escritorio: el escenario es sticky (CSS; la
    // sección mide 2,1 pantallas) y el texto cede la pantalla a la foto. Móvil:
    // título, foto que se abre y texto debajo, sin fijar y sin retirar nada que leer.
    if (reducido) {
      // Se queda en el primer fotograma: la banda de cine con todo el texto
      gsap.set(".llegada-foto img", { scale: 1 });
      fundido(".llegada-escena", ".llegada");
    } else if (c.movil) {
      gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: ".llegada-foto", start: "top 85%", end: "center 45%", scrub: 0.8 } })
        .to(".llegada-foto", { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: T.travesia }, 0)
        .to(".llegada-foto img", { scale: 1, duration: 1 }, 0);
    } else {
      const fraseLineas = lineas(".llegada-frase");
      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: ".llegada", start: "top top", end: "bottom bottom", scrub: 0.3, onToggle: escenaFijada },
      })
        .to(".llegada-foto", { clipPath: "inset(0% 0% 0% 0%)", duration: 3, ease: T.travesia }, 0)
        .to(".llegada-foto img", { scale: 1, duration: 3.6, ease: "power1.out" }, 0)
        .to(".llegada-cabeza", { y: -T.distancia.l, opacity: 0, duration: 1.6, ease: T.entrada }, 0.2)
        .to(".llegada-pie", { y: T.distancia.l, opacity: 0, duration: 1.6, ease: T.entrada }, 0.2)
        .to(".llegada-velo", { opacity: 1, duration: 1.2 }, 2.2)
        .set(".llegada-frase", { opacity: 1 }, 2.6)
        .fromTo(fraseLineas, { yPercent: 130 }, { yPercent: 0, duration: 1, stagger: 0.15, ease: T.salida }, 2.6)
        .to({}, { duration: 0.8 });
    }

    // — 4. HABITACIONES —
    if (reducido) {
      fundido(["#hab-titulo", ".selector", ".comparador"], ".habitaciones");
    } else {
      tituloSube("#hab-titulo");
      gsap.fromTo(".escenario", { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: T.largo, ease: T.travesia, scrollTrigger: { trigger: ".selector", start: T.aparecer } });
      gsap.fromTo(".escenario .capa img", { scale: 1.25 }, { scale: 1, duration: T.escena, ease: T.salida, scrollTrigger: { trigger: ".selector", start: T.aparecer } });
      gsap.fromTo(".pestanas button", { opacity: 0, x: T.distancia.m }, { opacity: 1, x: 0, duration: T.medio, stagger: T.stagger.normal, ease: T.salida, scrollTrigger: { trigger: ".selector", start: T.aparecer } });
      gsap.fromTo(".tira > *", { opacity: 0, y: T.distancia.s }, { opacity: 1, y: 0, duration: T.medio, stagger: T.stagger.fino, ease: T.salida, scrollTrigger: { trigger: ".tira", start: "top 92%" } });
      gsap.fromTo(".comparador tr", { opacity: 0, y: T.distancia.s }, { opacity: 1, y: 0, duration: T.corto, stagger: T.stagger.fino, ease: T.salida, scrollTrigger: { trigger: ".comparador", start: T.aparecer } });
    }

    // — 5. EXPERIENCIAS: una máscara distinta para cada una —
    $$(".exp, .cielo").forEach((art) => {
      const enlace = $(`.exp-indice a[href="#${art.id}"]`);
      ScrollTrigger.create({ trigger: art, start: "top 55%", end: "bottom 55%", onToggle: (st) => enlace?.classList.toggle("activo", st.isActive) });
    });
    if (reducido) {
      $$(".exp").forEach((art) => fundido(art.children, art));
      fundido(".cielo-texto > *", ".cielo");
    } else {
      const textos = (art) => gsap.fromTo(art.querySelectorAll(".exp-texto > *"), { opacity: 0, y: T.distancia.m }, { opacity: 1, y: 0, duration: T.medio, stagger: T.stagger.normal, ease: T.salida, scrollTrigger: { trigger: art, start: T.aparecer } });
      // Termas: persiana que se abre desde el centro
      gsap.fromTo(".persiana", { clipPath: "inset(0% 50% 0% 50%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: T.largo, ease: T.travesia, scrollTrigger: { trigger: "#exp-termas", start: T.aparecer } });
      gsap.fromTo(".persiana img", { scale: 1.3 }, { scale: 1, duration: T.escena, ease: T.salida, scrollTrigger: { trigger: "#exp-termas", start: T.aparecer } });
      textos($("#exp-termas"));
      // Mesa: el arco sube desde abajo; dos fotos a distinta velocidad
      gsap.fromTo(".mesa-fotos .uno", { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: T.largo, ease: T.travesia, scrollTrigger: { trigger: "#exp-mesa", start: T.aparecer } });
      gsap.fromTo(".mesa-fotos .dos", { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: T.largo, delay: 0.25, ease: T.travesia, scrollTrigger: { trigger: "#exp-mesa", start: T.aparecer } });
      gsap.to(".mesa-fotos .uno", { y: -innerHeight * T.paralaje.suave, ease: "none", scrollTrigger: { trigger: "#exp-mesa", start: "top bottom", end: "bottom top", scrub: true } });
      gsap.to(".mesa-fotos .dos", { y: innerHeight * T.paralaje.medio * (c.movil ? 0.4 : 1), ease: "none", scrollTrigger: { trigger: "#exp-mesa", start: "top bottom", end: "bottom top", scrub: true } });
      gsap.fromTo(".menu li", { opacity: 0, x: -T.distancia.m }, { opacity: 1, x: 0, duration: T.medio, stagger: T.stagger.normal, ease: T.salida, scrollTrigger: { trigger: ".menu", start: T.aparecer } });
      textos($("#exp-mesa"));
      // Mar: el vídeo empieza como una ventana con esquinas redondeadas y se abre a
      // sangre con el scroll; después sube el texto y llegan las tres salidas
      gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: ".mar-escena", start: "top 92%", end: "top 25%", scrub: 0.3 } })
        .fromTo(".mar-escena", { clipPath: "inset(8% 8% 8% 8% round 24px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)" }, 0)
        .fromTo(".mar-video", { scale: 1.12 }, { scale: 1 }, 0);
      gsap.fromTo(lineas(".mar-texto .titulo"), { yPercent: 130 }, { yPercent: 0, duration: T.largo, ease: T.salida, scrollTrigger: { trigger: ".mar-escena", start: "top 45%" } });
      gsap.fromTo(".mar-texto .etiqueta, .mar-texto p", { opacity: 0, y: T.distancia.s }, { opacity: 1, y: 0, duration: T.medio, stagger: T.stagger.normal, ease: T.salida, scrollTrigger: { trigger: ".mar-escena", start: "top 45%" } });
      gsap.fromTo(".mar-pequenas figure", { opacity: 0, y: T.distancia.l }, { opacity: 1, y: 0, duration: T.largo, stagger: T.stagger.amplio, ease: T.salida, scrollTrigger: { trigger: ".mar-pequenas", start: T.aparecer } });
      // Cielo: el círculo se abre desde el centro hasta la mitad de la diagonal de la
      // pantalla (cubre las esquinas) mientras la foto se acerca: se entra en la escena.
      // Escenario sticky (CSS); sin pin de GSAP.
      const radio0 = () => Math.min(innerWidth, innerHeight) * (c.movil ? 0.3 : 0.22);
      const radio1 = () => Math.hypot(innerWidth, innerHeight) / 2 + 4;
      const lineasCielo = [...lineas(".cielo-texto .titulo"), ...lineas(".cielo-texto p")];
      // Estado inicial explícito: los tramos que empiezan tarde en una línea de tiempo
      // con scrub no lo aplican por sí solos tras un refresh
      gsap.set(lineasCielo, { yPercent: 130 });
      gsap.set(".cielo-velo, .cielo-texto .etiqueta", { opacity: 0 });
      // Máscara por transformaciones (sin repintar en cada fotograma; con clip-path
      // el p95 por fotograma medido era de 33 ms): un círculo del tamaño de la
      // diagonal crece desde radio0/radio1 hasta 1 y la foto de dentro se
      // contraescala para verse igual. --diam se recalcula en cada refresh.
      const circulo = $(".cielo-foto");
      const medirCielo = () => circulo.style.setProperty("--diam", `${2 * radio1()}px`);
      medirCielo();
      ScrollTrigger.addEventListener("refreshInit", medirCielo);
      limpiezas.push(() => ScrollTrigger.removeEventListener("refreshInit", medirCielo));
      // (gsap.set y no quickSetter: quickSetter no acepta la abreviatura «scale»)
      const fotoCielo = $(".cielo-foto img");
      const apertura = { s: radio0() / radio1(), zoom: 1.25 };
      const pintarCielo = () => { gsap.set(circulo, { scale: apertura.s }); gsap.set(fotoCielo, { scale: apertura.zoom / apertura.s }); };
      pintarCielo();
      // Empieza cuando la escena casi ha llegado arriba: el círculo sigue pequeño al
      // quedar fija y se abre mientras lo está
      gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: ".cielo", start: "top 20%", end: "bottom bottom", scrub: 0.3, invalidateOnRefresh: true } })
        .fromTo(apertura, { s: () => radio0() / radio1(), zoom: 1.25 }, { s: 1, zoom: 1, duration: 6, ease: "power2.inOut", onUpdate: pintarCielo }, 0)
        .fromTo(".cielo-aro", { scale: 1, opacity: 1 }, { scale: 1.7, opacity: 0, duration: 2, ease: "power1.in" }, 0.3)
        .fromTo(".cielo-velo", { opacity: 0 }, { opacity: 1, duration: 2 }, 5)
        .fromTo(".cielo-texto .etiqueta", { opacity: 0, y: T.distancia.s }, { opacity: 1, y: 0, duration: 1.2 }, 5.6)
        .fromTo(lineasCielo, { yPercent: 130 }, { yPercent: 0, duration: 1.6, stagger: 0.25, ease: T.salida }, 5.8)
        .to({}, { duration: 1 });
    }

    // — 6. UN DÍA EN AUREA —
    // Escritorio: escenario sticky (CSS; la sección mide 3 pantallas, media por
    // momento) y GSAP solo traduce el scroll en la secuencia. Sin snap: la página
    // nunca se mueve sola; las barras de progreso llevan a cada momento.
    // Móvil y modo reducido: cinco bloques normales y un reloj fijo en la cabecera.
    const fotosDia = $$(".dia-foto");
    const momentos = $$(".dia-momento");
    const ruedas = $$(".reloj .rueda");
    const barras = $$(".dia-progreso i");
    const reloj = $(".reloj");
    if (c.movil || reducido) {
      const hora = $(".dia-hora");
      const cambiarHora = (texto) => {
        if (hora.textContent === texto) return;
        if (reducido) { hora.textContent = texto; return; }
        gsap.timeline().to(hora, { yPercent: -60, opacity: 0, duration: 0.2, ease: T.entrada, onComplete: () => (hora.textContent = texto) })
          .fromTo(hora, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.35, ease: T.salida });
      };
      $$(".dia-bloque").forEach((b, i) => {
        if (reducido) fundido(b.children, b);
        else {
          gsap.fromTo(b.querySelector(".dia-bloque-foto"), { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: T.largo, ease: T.travesia, scrollTrigger: { trigger: b, start: "top 82%" } });
          gsap.fromTo(b.querySelector(".dia-bloque-foto img"), { scale: 1.2 }, { scale: 1, duration: T.escena, ease: T.salida, scrollTrigger: { trigger: b, start: "top 82%" } });
          gsap.fromTo(b.querySelectorAll(".dia-bloque-texto > *"), { opacity: 0, y: T.distancia.s }, { opacity: 1, y: 0, duration: T.medio, stagger: T.stagger.normal, ease: T.salida, scrollTrigger: { trigger: b, start: "top 60%" } });
        }
        ScrollTrigger.create({ trigger: b, start: "top 55%", end: "bottom 55%", onToggle: (st) => st.isActive && cambiarHora(dia[i].hora) });
      });
    } else {
      gsap.set(fotosDia.slice(1), { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(momentos.slice(1), { opacity: 0 });
      gsap.set(barras[0], { "--p": 1 });
      const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: ".dia", start: "top top", end: "bottom bottom", scrub: 0.3, onToggle: escenaFijada } });
      irAMomento = (i) => scrollTo({ top: tl.scrollTrigger.labelToScroll(`m${i}`), behavior: "smooth" });
      tl.addLabel("m0", 0).to({}, { duration: 0.1 });
      for (let i = 1; i < dia.length; i++) {
        const t = tl.duration();
        tl.to(momentos[i - 1], { opacity: 0, y: -T.distancia.m, duration: 0.5, ease: T.entrada }, t)
          .fromTo(fotosDia[i], { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: T.travesia }, t + 0.1)
          .fromTo(fotosDia[i].querySelector("img"), { scale: 1.2 }, { scale: 1, duration: 1.6, ease: "power1.out" }, t + 0.1)
          .fromTo(fotosDia[i].querySelectorAll(".secundarias img"), { y: T.distancia.l, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: T.salida }, t + 0.7)
          .fromTo(momentos[i], { opacity: 0, y: T.distancia.m }, { opacity: 1, y: 0, duration: 0.7, ease: T.salida }, t + 0.6)
          .to(ruedas, { yPercent: (-100 / dia.length) * i, duration: 0.9, stagger: 0.06, ease: T.travesia }, t + 0.2)
          .to(barras[i], { "--p": 1, duration: 0.9, ease: T.travesia }, t + 0.2)
          .call(() => reloj.setAttribute("aria-label", dia[tl.scrollTrigger.direction > 0 ? i : i - 1].hora), null, t + 0.6);
        tl.addLabel(`m${i}`, t + 1.6).to({}, { duration: 0.1 });
      }
    }
    // La página pasa a noche desde El cielo hasta el final de Un día (creado
    // después de la escena fijada de Un día, para que su final la incluya)
    ScrollTrigger.create({ trigger: "#exp-cielo", start: "top 60%", endTrigger: "#dia", end: "bottom 70%", toggleClass: { targets: document.body, className: "en-noche" } });

    // — 7. GALERÍA: cada foto con su máscara —
    const mascaras = ["inset(100% 0% 0% 0%)", "inset(0% 100% 0% 0%)", "inset(0% 0% 0% 100%)", "inset(50% 50% 50% 50%)", "inset(0% 0% 100% 0%)", "inset(0% 100% 0% 0%)"];
    if (reducido) {
      fundido(fotosGaleria, ".mosaico");
    } else {
      tituloSube("#gal-titulo");
      fotosGaleria.forEach((b, i) => {
        gsap.fromTo(b, { clipPath: mascaras[i % mascaras.length] }, { clipPath: "inset(0% 0% 0% 0%)", duration: T.largo, delay: (i % 3) * 0.12, ease: T.travesia, scrollTrigger: { trigger: b, start: "top 88%" } });
        gsap.fromTo(b.querySelector("img"), { scale: 1.25 }, { scale: 1, duration: T.escena, delay: (i % 3) * 0.12, ease: T.salida, scrollTrigger: { trigger: b, start: "top 88%" }, clearProps: "transform" });
      });
    }

    // — Ubicación: la ruta se dibuja con el scroll —
    const ruta = $(".mapa-ruta");
    const largo = ruta.getTotalLength();
    if (reducido) {
      fundido(".mapa", ".ubicacion");
    } else {
      gsap.fromTo(ruta, { strokeDasharray: largo, strokeDashoffset: largo }, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: ".mapa", start: "top 80%", end: "center 45%", scrub: 0.6 } });
      gsap.fromTo(".mapa-punto", { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.8, ease: "back.out(2.5)", scrollTrigger: { trigger: ".mapa", start: "center 55%" } });
      gsap.fromTo(".mapa-rotulos text, .mapa-sendero", { opacity: 0 }, { opacity: 1, duration: 0.6, stagger: 0.1, scrollTrigger: { trigger: ".mapa", start: "center 55%" } });
      gsap.fromTo(".distancias li", { opacity: 0, x: T.distancia.m }, { opacity: 1, x: 0, duration: T.medio, stagger: T.stagger.normal, ease: T.salida, scrollTrigger: { trigger: ".distancias", start: T.aparecer } });
    }

    // — 8. RESERVAS —
    if (reducido) {
      fundido([".reserva-flujo", ".resumen"], ".reservas");
    } else {
      tituloSube("#res-titulo");
      gsap.fromTo(".reserva-flujo", { opacity: 0, y: T.distancia.m }, { opacity: 1, y: 0, duration: T.largo, ease: T.salida, scrollTrigger: { trigger: ".reserva", start: T.aparecer } });
      gsap.fromTo(".resumen", { opacity: 0, x: T.distancia.l }, { opacity: 1, x: 0, duration: T.largo, delay: 0.15, ease: T.salida, scrollTrigger: { trigger: ".reserva", start: T.aparecer } });
    }

    // — 9. PIE: el nombre se levanta letra a letra —
    if (reducido) {
      fundido([".pie-nombre", ".pie-fila"], ".pie");
    } else {
      const letras = SplitText.create(".pie-nombre", { type: "chars", mask: "chars" }).chars;
      gsap.fromTo(letras, { yPercent: 120 }, { yPercent: 0, duration: T.escena - 0.6, stagger: 0.08, ease: T.salida, scrollTrigger: { trigger: ".pie-nombre", start: "top 95%" } });
      gsap.fromTo(".pie-fila ul", { opacity: 0, y: T.distancia.m }, { opacity: 1, y: 0, duration: T.medio, stagger: T.stagger.normal, ease: T.salida, scrollTrigger: { trigger: ".pie", start: "top 70%" } });
      gsap.fromTo(".pie-foto img", { scale: 1.18 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ".pie", start: "top bottom", end: "bottom bottom", scrub: true } });
    }

    disparadoresDePagina();
    return () => {
      limpiezas.splice(0).forEach((f) => f());
      gsap.set(".cielo-foto, .cielo-foto img", { clearProps: "transform" });
      document.body.classList.remove("en-noche");
      barra.classList.remove("visible", "en-escena");
      irAMomento = null;
    };
  });

  Object.assign(window.aureaProto, { gsap, ScrollTrigger, mm, reducido, triggers: () => ScrollTrigger.getAll().length });
  Promise.race([document.fonts.ready, new Promise((ok) => setTimeout(ok, 1500))]).then(() => {
    construir();
    window.aureaProto.listo = true;
    // Recalcular cuando terminan de cargar las imágenes
    if (document.readyState === "complete") ScrollTrigger.refresh();
    else window.addEventListener("load", () => ScrollTrigger.refresh());
  });
})();
