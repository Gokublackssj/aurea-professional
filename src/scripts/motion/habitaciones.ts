// Explorador de habitaciones (página Habitaciones). Sin JavaScript, las cuatro
// habitaciones se leen una tras otra. Con él, se convierten en pestañas
// accesibles (role="tablist", flechas, Inicio y Fin): la foto protagonista con
// la galería de la habitación a la izquierda y la ficha a la derecha.
// - Cambiar de habitación: la nueva foto entra desde un lado mientras la
//   anterior se aparta (bordes complementarios, sin hueco), y la ficha y la
//   tira cambian a su ritmo. La habitación queda en la dirección (#slug).
// - Recorrer las fotos de una habitación (miniaturas, flechas, deslizar con el
//   dedo): la foto nueva se decodifica antes de mostrarse, así el escenario
//   nunca queda vacío; después, fundido con un desplazamiento corto.
// En modo reducido, todo son fundidos.
import { gsap } from "gsap";
import { salida, travesia } from "./curvas";
import type { Condiciones } from "./index";

/** Espera a que la imagen esté lista para pintarse (con un límite, para no bloquear). */
const lista = (img: HTMLImageElement) =>
  new Promise<void>((ok) => {
    img.loading = "eager";
    const fin = () => ok();
    const espera = setTimeout(fin, 2500);
    (img.decode ? img.decode() : Promise.resolve()).then(
      () => (clearTimeout(espera), fin()),
      () => (img.complete ? (clearTimeout(espera), fin()) : img.addEventListener("load", () => (clearTimeout(espera), fin()), { once: true })),
    );
  });

export function selectorHabitaciones(raiz: HTMLElement, c: Condiciones) {
  const pestanas = [...raiz.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const fichas = [...raiz.querySelectorAll<HTMLElement>(".hab")];
  const tablist = raiz.querySelector<HTMLElement>('[role="tablist"]')!;
  const indice = (slug: string) => Math.max(0, fichas.findIndex((f) => f.dataset.slug === slug));
  const partes = (f: HTMLElement) => ({
    foto: f.querySelector<HTMLElement>(".hab-foto")!,
    escena: f.querySelector<HTMLElement>(".hab-escena")!,
    capas: [...f.querySelectorAll<HTMLElement>(".hab-capa")],
    info: f.querySelector<HTMLElement>(".hab-info")!,
    tira: f.querySelector<HTMLElement>(".tira")!,
    minis: [...f.querySelectorAll<HTMLButtonElement>(".tira-fotos button")],
    pie: f.querySelector<HTMLElement>(".hab-rotulo-pie")!,
    contador: f.querySelector<HTMLElement>(".tira-contador")!,
  });

  // Estado de partida: la de la dirección, la que ya estaba elegida o la primera.
  const desdeHash = location.hash.slice(1);
  let actual = indice(raiz.dataset.actual ?? (fichas.some((f) => f.dataset.slug === desdeHash) ? desdeHash : fichas[0].dataset.slug!));

  tablist.hidden = false;
  raiz.classList.add("es-selector");
  fichas.forEach((f, i) => {
    f.setAttribute("role", "tabpanel");
    f.setAttribute("aria-labelledby", pestanas[i].id);
    partes(f).tira.hidden = false;
  });

  const resaltar = () => document.querySelectorAll<HTMLElement>("[data-col]").forEach((celda) => celda.classList.toggle("resaltada", Number(celda.dataset.col) === actual));

  const pintar = () => {
    fichas.forEach((f, i) => {
      const activa = i === actual;
      f.classList.toggle("actual", activa);
      f.inert = !activa;
      pestanas[i].setAttribute("aria-selected", String(activa));
      pestanas[i].tabIndex = activa ? 0 : -1;
    });
    raiz.dataset.actual = fichas[actual].dataset.slug;
    resaltar();
  };
  pintar();

  let transicion: gsap.core.Timeline | undefined;

  // — Fotos dentro de una habitación —
  // Dos índices en la escena: la foto pedida (cambia al momento, para que las
  // flechas encadenen bien con clics rápidos) y la pintada (cambia cuando la
  // imagen ya se ha decodificado). Durante el fundido hay dos capas «actual»:
  // por eso no se deduce el índice de las clases.
  const fotoPedida = (p: ReturnType<typeof partes>) => Number(p.escena.dataset.foto ?? 0);
  const fotoPintada = (p: ReturnType<typeof partes>) => Number(p.escena.dataset.pintada ?? 0);
  const verFoto = (ficha: HTMLElement, i: number) => {
    const p = partes(ficha);
    const n = p.capas.length;
    const hasta = (i + n) % n;
    if (hasta === fotoPedida(p)) return;
    p.escena.dataset.foto = String(hasta);
    const img = p.capas[hasta].querySelector("img")!;
    lista(img).then(() => {
      if (fotoPedida(p) !== hasta) return; // llegó otro clic después: gana el último
      transicion?.progress(1);
      const desde = fotoPintada(p);
      if (desde === hasta) return;
      p.escena.dataset.pintada = String(hasta);
      const sentido = hasta > desde ? 1 : -1;
      const vieja = p.capas[desde];
      const nueva = p.capas[hasta];
      nueva.classList.add("actual");
      gsap.set(nueva, { zIndex: 2 });
      gsap.set(vieja, { zIndex: 1 });
      p.pie.textContent = nueva.dataset.pie ?? "";
      p.contador.textContent = `${hasta + 1} / ${n}`;
      p.minis.forEach((m, k) => m.setAttribute("aria-current", String(k === hasta)));
      const fin = () => {
        vieja.classList.remove("actual");
        gsap.set([vieja, nueva], { clearProps: "zIndex,opacity" });
      };
      transicion = c.reducido
        ? gsap.timeline({ onComplete: fin }).fromTo(nueva, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power1.out" })
        : gsap
            .timeline({ onComplete: fin })
            .fromTo(nueva, { opacity: 0 }, { opacity: 1, duration: 0.55, ease: "power2.out" }, 0)
            .fromTo(img, { xPercent: 3 * sentido }, { xPercent: 0, duration: 0.8, ease: salida }, 0);
    });
  };

  // — Cambio de habitación —
  const elegir = (nuevo: number, enfocar = false) => {
    if (enfocar) pestanas[nuevo].focus();
    if (nuevo === actual) return;
    transicion?.progress(1);
    const antes = partes(fichas[actual]);
    const despues = partes(fichas[nuevo]);
    const anterior = actual;
    const sentido = nuevo > anterior ? 1 : -1;
    const imgNueva = despues.capas[fotoPintada(despues)].querySelector("img")!;
    actual = nuevo;
    pintar();
    history.replaceState(null, "", `#${fichas[nuevo].dataset.slug}`);

    // La ficha que sale sigue visible durante la transición.
    fichas[anterior].classList.add("saliendo");
    const fin = () => {
      fichas[anterior].classList.remove("saliendo");
      gsap.set([antes.foto, antes.escena, antes.info, despues.foto, despues.escena], { clearProps: "opacity,visibility,transform,zIndex,clipPath" });
    };

    lista(imgNueva).then(() => {
      if (actual !== nuevo) return fin();
      if (c.reducido) {
        transicion = gsap
          .timeline({ onComplete: fin })
          .fromTo([despues.foto, despues.info], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: "power1.out" }, 0)
          .to(antes.info, { autoAlpha: 0, duration: 0.25 }, 0);
        return;
      }
      const entra = sentido > 0 ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)";
      const sale = sentido > 0 ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 100%)";
      gsap.set(despues.foto, { zIndex: 2 });
      gsap.set(antes.foto, { zIndex: 1 });
      transicion = gsap
        .timeline({ onComplete: fin, defaults: { ease: salida } })
        .to(antes.info, { autoAlpha: 0, y: -18, duration: 0.35, ease: "power2.in" }, 0)
        .fromTo(despues.escena, { clipPath: entra }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: travesia }, 0)
        .fromTo(antes.escena, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: sale, duration: 0.9, ease: travesia }, 0)
        .fromTo(imgNueva, { xPercent: 8 * sentido, scale: 1.06 }, { xPercent: 0, scale: 1, duration: 1.4 }, 0)
        .fromTo(despues.info.children, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.07 }, 0.25)
        .fromTo(despues.tira.children, { autoAlpha: 0, x: 24 * sentido }, { autoAlpha: 1, x: 0, duration: 0.6, stagger: 0.05 }, 0.3)
        .set(antes.info, { clearProps: "opacity,visibility,transform" });
    });
  };

  const control = new AbortController();
  const { signal } = control;
  pestanas.forEach((p, i) => p.addEventListener("click", () => elegir(i), { signal }));
  tablist.addEventListener(
    "keydown",
    (e) => {
      const n = pestanas.length;
      const destino = { ArrowRight: actual + 1, ArrowDown: actual + 1, ArrowLeft: actual - 1, ArrowUp: actual - 1, Home: 0, End: n - 1 }[e.key];
      if (destino === undefined) return;
      e.preventDefault();
      elegir((destino + n) % n, true);
    },
    { signal },
  );

  fichas.forEach((ficha) => {
    const p = partes(ficha);
    p.minis.forEach((m, i) => m.addEventListener("click", () => verFoto(ficha, i), { signal }));
    ficha.querySelectorAll<HTMLButtonElement>(".tira-paso").forEach((b) =>
      b.addEventListener("click", () => verFoto(ficha, fotoPedida(p) + Number(b.dataset.paso)), { signal }),
    );
    // Deslizar con el dedo sobre la foto: siguiente o anterior (el scroll vertical sigue libre)
    let toque: [number, number] | null = null;
    p.escena.addEventListener("pointerdown", (e) => (toque = e.pointerType === "mouse" ? null : [e.clientX, e.clientY]), { signal });
    p.escena.addEventListener(
      "pointerup",
      (e) => {
        if (!toque) return;
        const [dx, dy] = [e.clientX - toque[0], e.clientY - toque[1]];
        toque = null;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) verFoto(ficha, fotoPedida(p) + (dx < 0 ? 1 : -1));
      },
      { signal },
    );
    p.escena.addEventListener("pointercancel", () => (toque = null), { signal });
  });

  return () => {
    control.abort();
    transicion?.progress(1);
    fichas.forEach((f) => gsap.set([...f.querySelectorAll(".hab-foto, .hab-escena, .hab-capa, .hab-capa img, .hab-info, .hab-info > *, .tira > *")], { clearProps: "all" }));
  };
}
