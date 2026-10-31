// Aurea · sistema de movimiento del prototipo.
// Un lenguaje compartido (tokens) y una identidad por sección:
//   hero        abertura: línea → píldora → foto a sangre
//   manifiesto  tinta que avanza palabra a palabra; arcos que se abren desde una rendija
//   llegada     formato cine: la banda panorámica se abre en vertical
//   habitaciones barrido diagonal entre habitaciones; ficha y servicios escalonados
//   experiencias persiana, arco, diagonal y círculo; la página cambia a noche
//   un día      reloj que rueda; fondos que se abren de abajo arriba
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
  const escenario = $(".escenario");
  escenario.innerHTML = habitaciones.map((h, i) => `<figure data-slug="${h.slug}" class="${i === 0 ? "actual" : ""}"><img class="foto" src="fotos/${h.fotos[0][0]}.webp" alt="${h.fotos[0][1]}" ${i ? 'loading="lazy"' : ""} /><figcaption class="marca-hab">${h.nombre}</figcaption></figure>`).join("");
  $(".pestanas").innerHTML = habitaciones.map((h, i) => `<button type="button" role="tab" id="tab-${h.slug}" aria-controls="ficha-${h.slug}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}"><span>${h.nombre}</span><span>desde ${euros(h.precio)}</span></button>`).join("");
  $(".ficha").innerHTML = habitaciones
    .map(
      (h, i) => `<div class="ficha-hab ${i === 0 ? "actual" : ""}" id="ficha-${h.slug}" role="tabpanel" aria-labelledby="tab-${h.slug}">
      <p class="entrada">${h.resumen}</p>
      <dl class="datos"><div><dt>Superficie</dt><dd>${h.metros} m²</dd></div><div><dt>Huéspedes</dt><dd>${h.huespedes}</dd></div><div><dt>Desde</dt><dd>${euros(h.precio)}</dd></div></dl>
      <ul class="servicios" aria-label="Servicios">${h.servicios.map((s) => `<li>${s}</li>`).join("")}</ul>
      <p class="suave"><b>En qué se diferencia:</b> ${h.diferencia}</p>
      <div class="miniaturas">${h.fotos.map((f, j) => `<button type="button" aria-pressed="${j === 0}" aria-label="Ver: ${f[1]}" data-foto="${f[0]}" data-alt="${f[1]}"><img class="foto" src="fotos/${f[0]}.webp" alt="" loading="lazy" /></button>`).join("")}</div>
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
  $(".dia-progreso").innerHTML = dia.map(() => "<i></i>").join("");

  // ————— Interacciones (una vez; su animación mira el modo al ocurrir) —————
  // Selector de habitaciones
  // hab: la pestaña elegida (responde al instante); mostrada: la habitación
  // en pantalla, que cambia cuando su foto ya está decodificada.
  let hab = 0, mostrada = 0;
  const figs = $$(".escenario figure");
  const fichas = $$(".ficha-hab");
  const elegirHab = (n, enfocar = false) => {
    const pestanas = $$(".pestanas button");
    if (enfocar) pestanas[n].focus();
    if (n === hab) return;
    hab = n;
    pestanas.forEach((p, i) => { p.setAttribute("aria-selected", String(i === n)); p.tabIndex = i === n ? 0 : -1; });
    $$("[data-col]").forEach((c) => c.classList.toggle("resaltada", Number(c.dataset.col) === n));
    const img = figs[n].querySelector("img");
    (img.decode ? img.decode() : Promise.resolve()).catch(() => {}).then(() => { if (hab === n) mostrarHab(n); });
  };
  const mostrarHab = (n) => {
    if (n === mostrada) return;
    const [vieja, nueva] = [figs[mostrada], figs[n]];
    const [fichaVieja, fichaNueva] = [fichas[mostrada], fichas[n]];
    mostrada = n;
    // Al terminar, retira la anterior salvo que haya vuelto a ser la mostrada
    const retirar = () => { if (figs[mostrada] !== vieja) vieja.classList.remove("actual"); };
    fichaVieja.classList.remove("actual");
    fichaNueva.classList.add("actual");
    nueva.classList.add("actual");
    if (reducido) {
      gsap.fromTo([nueva, fichaNueva], { opacity: 0 }, { opacity: 1, duration: 0.35, onComplete: retirar });
      return;
    }
    figs.forEach((f) => gsap.set(f, { zIndex: f === nueva ? 3 : 2 }));
    gsap.timeline({ onComplete: retirar })
      .fromTo(nueva, { clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)" }, { clipPath: "polygon(-25% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: T.medio, ease: T.travesia }, 0)
      .fromTo(nueva.querySelector("img"), { scale: 1.18, xPercent: 6 }, { scale: 1, xPercent: 0, duration: T.largo, ease: T.salida }, 0)
      .fromTo(nueva.querySelector(".marca-hab"), { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: T.medio, ease: T.salida }, 0.35)
      .fromTo(fichaNueva.children, { opacity: 0, y: T.distancia.s }, { opacity: 1, y: 0, duration: T.medio, stagger: T.stagger.normal, ease: T.salida }, 0.15)
      .fromTo(fichaNueva.querySelectorAll(".servicios li"), { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: T.corto, stagger: T.stagger.fino, ease: "back.out(2)" }, 0.45);
  };
  $(".pestanas").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) elegirHab($$(".pestanas button").indexOf(b)); });
  $(".pestanas").addEventListener("keydown", (e) => {
    const n = habitaciones.length;
    const d = { ArrowRight: hab + 1, ArrowDown: hab + 1, ArrowLeft: hab - 1, ArrowUp: hab - 1, Home: 0, End: n - 1 }[e.key];
    if (d === undefined) return;
    e.preventDefault();
    elegirHab((d + n) % n, true);
  });
  $$("[data-col='0']").forEach((c) => c.classList.add("resaltada"));
  // Miniaturas: cambian la foto protagonista dentro de la misma habitación
  $(".ficha").addEventListener("click", (e) => {
    const b = e.target.closest(".miniaturas button");
    if (!b) return;
    const img = figs[mostrada].querySelector("img");
    b.parentElement.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    const cambiar = () => { img.src = `fotos/${b.dataset.foto}.webp`; img.alt = b.dataset.alt; };
    if (reducido) { cambiar(); return; }
    gsap.timeline().to(img, { opacity: 0, scale: 1.04, duration: 0.25, ease: T.entrada, onComplete: cambiar }).to(img, { opacity: 1, scale: 1, duration: 0.6, ease: T.salida });
  });
  // «Elegir» lleva la habitación a la reserva
  $(".ficha").addEventListener("click", (e) => {
    const a = e.target.closest("[data-elegir]");
    if (!a) return;
    const radio = $(`.opciones-hab input[value="${a.dataset.elegir}"]`);
    if (radio && !radio.disabled) { radio.checked = true; radio.dispatchEvent(new Event("change", { bubbles: true })); }
  });

  // Visor de la galería
  const visor = $(".visor");
  const fotosGaleria = $$(".mosaico [data-ampliar]");
  let foto = 0, origen;
  const mostrarFoto = (i, desde) => {
    foto = (i + fotosGaleria.length) % fotosGaleria.length;
    const src = fotosGaleria[foto].querySelector("img");
    $(".visor-foto").innerHTML = `<img src="${src.getAttribute("src")}" alt="${src.alt}" />`;
    $(".visor-texto").textContent = `${src.alt} · ${foto + 1} de ${fotosGaleria.length}`;
    const img = $(".visor-foto img");
    if (reducido) { gsap.fromTo(img, { opacity: 0 }, { opacity: 1, duration: 0.3 }); return; }
    if (desde) {
      const r = img.getBoundingClientRect();
      gsap.fromTo(img, { x: desde.left + desde.width / 2 - (r.left + r.width / 2), y: desde.top + desde.height / 2 - (r.top + r.height / 2), scale: desde.width / Math.max(r.width, 1), opacity: 0.6 }, { x: 0, y: 0, scale: 1, opacity: 1, duration: T.medio, ease: T.salida });
    } else gsap.fromTo(img, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.5, ease: T.salida });
  };
  fotosGaleria.forEach((b, i) => b.addEventListener("click", () => { origen = b; visor.showModal(); mostrarFoto(i, b.getBoundingClientRect()); }));
  $(".visor-cerrar").addEventListener("click", () => visor.close());
  $(".visor-anterior").addEventListener("click", () => mostrarFoto(foto - 1));
  $(".visor-siguiente").addEventListener("click", () => mostrarFoto(foto + 1));
  visor.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") mostrarFoto(foto + 1); if (e.key === "ArrowLeft") mostrarFoto(foto - 1); });
  visor.addEventListener("click", (e) => e.target === visor && visor.close());
  visor.addEventListener("close", () => origen?.focus());

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

  // ————— Escenas de scroll (dentro de matchMedia: se revierten solas) —————
  const mm = gsap.matchMedia();
  mm.add({ escritorio: "(min-width: 768px)", movil: "(max-width: 767px)" }, (ctx) => {
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

    // — 3. LLEGADA: formato cine. Escritorio: fijada, el texto cede la
    // pantalla a la foto. Móvil: título, foto que se abre y texto debajo,
    // sin fijar y sin retirar nada que haya que leer.
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
        scrollTrigger: { trigger: ".llegada-escena", start: "top top", end: "+=170%", pin: true, pinType: "transform", scrub: 0.8, anticipatePin: 1, onToggle: escenaFijada },
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
      gsap.fromTo(".escenario figure.actual img", { scale: 1.25 }, { scale: 1, duration: T.escena, ease: T.salida, scrollTrigger: { trigger: ".selector", start: T.aparecer } });
      gsap.fromTo(".pestanas button", { opacity: 0, x: T.distancia.m }, { opacity: 1, x: 0, duration: T.medio, stagger: T.stagger.normal, ease: T.salida, scrollTrigger: { trigger: ".selector", start: T.aparecer } });
      gsap.fromTo(".comparador tr", { opacity: 0, y: T.distancia.s }, { opacity: 1, y: 0, duration: T.corto, stagger: T.stagger.fino, ease: T.salida, scrollTrigger: { trigger: ".comparador", start: T.aparecer } });
    }

    // — 5. EXPERIENCIAS: una máscara distinta para cada una —
    $$(".exp").forEach((art) => {
      const enlace = $(`.exp-indice a[href="#${art.id}"]`);
      ScrollTrigger.create({ trigger: art, start: "top 55%", end: "bottom 55%", onToggle: (st) => enlace?.classList.toggle("activo", st.isActive) });
    });
    if (reducido) {
      $$(".exp").forEach((art) => fundido(art.children, art));
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
      // Mar: barrido diagonal y fotos que suben escalonadas
      gsap.fromTo(".mar-grande", { clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)" }, { clipPath: "polygon(0% 0%, 100% 0%, 125% 100%, 0% 100%)", duration: T.largo, ease: T.travesia, scrollTrigger: { trigger: "#exp-mar", start: T.aparecer } });
      gsap.fromTo(".mar-grande img", { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: ".mar-grande", start: "top bottom", end: "bottom top", scrub: true } });
      gsap.fromTo(".mar-pequenas figure", { opacity: 0, y: T.distancia.l }, { opacity: 1, y: 0, duration: T.largo, stagger: T.stagger.amplio, ease: T.salida, scrollTrigger: { trigger: ".mar-pequenas", start: T.aparecer } });
      textos($("#exp-mar"));
      // Cielo: un círculo que se abre, como una lente de telescopio
      gsap.fromTo(".circulo", { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(71% at 50% 50%)", duration: T.escena, ease: T.travesia, scrollTrigger: { trigger: "#exp-cielo", start: T.aparecer } });
      gsap.fromTo(".circulo img", { scale: 1.4, rotate: -8 }, { scale: 1, rotate: 0, duration: T.escena + 0.6, ease: T.salida, scrollTrigger: { trigger: "#exp-cielo", start: T.aparecer } });
      textos($("#exp-cielo"));
    }

    // — 6. UN DÍA EN AUREA: fijada en escritorio, reloj que rueda —
    const fotosDia = $$(".dia-foto");
    const momentos = $$(".dia-momento");
    const ruedas = $$(".reloj .rueda");
    const barras = $$(".dia-progreso i");
    const reloj = $(".reloj");
    if (reducido) gsap.set(fotosDia.slice(1), { opacity: 0 });
    else gsap.set(fotosDia.slice(1), { clipPath: "inset(100% 0% 0% 0%)" });
    gsap.set(momentos.slice(1), { opacity: 0 });
    gsap.set(barras[0], { "--p": 1 });
    if (reducido || c.movil) {
      // Sin fijar: cada momento cambia al llegar a su tramo de scroll, con un fundido
      const n = dia.length;
      ScrollTrigger.create({
        trigger: ".dia", start: "top 60%", end: "bottom 40%",
        onUpdate: (st) => {
          const i = Math.min(n - 1, Math.floor(st.progress * n));
          if (reloj.dataset.i === String(i)) return;
          reloj.dataset.i = String(i);
          reloj.setAttribute("aria-label", dia[i].hora);
          fotosDia.forEach((f, k) => gsap.to(f, reducido ? { opacity: k <= i ? 1 : 0, duration: 0.4, overwrite: true } : { clipPath: k <= i ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)", duration: 0.9, ease: T.travesia, overwrite: true }));
          momentos.forEach((m, k) => gsap.to(m, { opacity: k === i ? 1 : 0, duration: 0.4, overwrite: true }));
          ruedas.forEach((r) => gsap.to(r, { yPercent: (-100 / n) * i, duration: reducido ? 0 : 0.6, ease: T.travesia, overwrite: true }));
          barras.forEach((b, k) => gsap.to(b, { "--p": k <= i ? 1 : 0, duration: 0.4, overwrite: true }));
        },
      });
      if (c.movil && !reducido) gsap.set(".dia-escena", { height: "auto" });
    } else {
      const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: ".dia-escena", start: "top top", end: `+=${(dia.length - 1) * 85}%`, pin: true, pinType: "transform", scrub: 0.8, anticipatePin: 1, onToggle: escenaFijada, snap: { snapTo: "labels", inertia: false, duration: { min: 0.3, max: 0.8 }, delay: 0.1 } } });
      tl.addLabel("m0", 0).to({}, { duration: 0.4 });
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
        tl.addLabel(`m${i}`, t + 1.6).to({}, { duration: 0.5 });
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
      document.body.classList.remove("en-noche");
      barra.classList.remove("visible", "en-escena");
    };
  });

  Object.assign(window.aureaProto, { gsap, ScrollTrigger, mm, reducido, triggers: () => ScrollTrigger.getAll().length });
  // Recalcular cuando terminan de cargar fuentes e imágenes
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
