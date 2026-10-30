// Selector de habitaciones (página Habitaciones). Sin JavaScript, las cuatro
// habitaciones se leen una tras otra. Con él, se convierten en pestañas
// accesibles (role="tablist", flechas, Inicio y Fin): una foto protagonista a
// la izquierda y la ficha a la derecha.
// Al elegir otra habitación, su foto se abre sobre la anterior con un barrido
// mientras retrocede el zoom, la ficha anterior se retira y la nueva entra
// escalonada, y las miniaturas se revelan. En modo reducido es un fundido
// cruzado. La habitación elegida queda en la dirección (#slug), y su foto
// comparte nombre de transición con la portada de su página de detalle.
import { gsap } from "gsap";
import { salida, travesia } from "./curvas";
import type { Condiciones } from "./index";

export function selectorHabitaciones(raiz: HTMLElement, c: Condiciones) {
  const pestanas = [...raiz.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const fichas = [...raiz.querySelectorAll<HTMLElement>(".hab")];
  const lista = raiz.querySelector<HTMLElement>('[role="tablist"]')!;
  const indice = (slug: string) => Math.max(0, fichas.findIndex((f) => f.dataset.slug === slug));
  const partes = (f: HTMLElement) => ({
    foto: f.querySelector<HTMLElement>(".hab-foto")!,
    info: f.querySelector<HTMLElement>(".hab-info")!,
    miniaturas: [...f.querySelectorAll<HTMLElement>(".hab-miniaturas picture")],
  });

  // Estado de partida: la de la dirección, la que ya estaba elegida o la primera.
  const desdeHash = location.hash.slice(1);
  let actual = indice(raiz.dataset.actual ?? (fichas.some((f) => f.dataset.slug === desdeHash) ? desdeHash : fichas[0].dataset.slug!));

  lista.hidden = false;
  raiz.classList.add("es-selector");
  fichas.forEach((f, i) => {
    f.setAttribute("role", "tabpanel");
    f.setAttribute("aria-labelledby", pestanas[i].id);
  });

  const pintar = () => {
    fichas.forEach((f, i) => {
      const activa = i === actual;
      f.classList.toggle("actual", activa);
      f.inert = !activa;
      pestanas[i].setAttribute("aria-selected", String(activa));
      pestanas[i].tabIndex = activa ? 0 : -1;
    });
    raiz.dataset.actual = fichas[actual].dataset.slug;
  };
  pintar();

  let transicion: gsap.core.Timeline | undefined;

  const elegir = (nuevo: number, enfocar = false) => {
    if (enfocar) pestanas[nuevo].focus();
    if (nuevo === actual) return;
    transicion?.progress(1);
    const antes = partes(fichas[actual]);
    const despues = partes(fichas[nuevo]);
    const anterior = actual;
    actual = nuevo;
    pintar();
    history.replaceState(null, "", `#${fichas[nuevo].dataset.slug}`);

    // La ficha que sale sigue visible durante la transición.
    fichas[anterior].classList.add("saliendo");
    const fin = () => fichas[anterior].classList.remove("saliendo");

    if (c.reducido) {
      transicion = gsap
        .timeline({ onComplete: fin })
        .fromTo([despues.foto, despues.info], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: "power1.out" }, 0)
        .to(antes.info, { autoAlpha: 0, duration: 0.25 }, 0)
        .set(antes.info, { clearProps: "opacity,visibility" });
      return;
    }

    gsap.set(despues.foto, { zIndex: 2 });
    gsap.set(antes.foto, { zIndex: 1 });
    transicion = gsap
      .timeline({ onComplete: fin, defaults: { ease: salida } })
      .to(antes.info, { autoAlpha: 0, y: -18, duration: 0.35, ease: "power2.in" }, 0)
      .fromTo(despues.foto, { clipPath: "inset(0% 0% 0% 100%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: travesia }, 0)
      .fromTo(despues.foto.querySelector("img"), { scale: 1.16 }, { scale: 1, duration: 1.5 }, 0)
      .fromTo(despues.info.children, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.07 }, 0.3)
      .fromTo(despues.miniaturas, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, stagger: 0.1, ease: travesia }, 0.5)
      .set([antes.info, antes.foto], { clearProps: "opacity,visibility,transform,zIndex" });
  };

  const control = new AbortController();
  const { signal } = control;
  pestanas.forEach((p, i) => p.addEventListener("click", () => elegir(i), { signal }));
  lista.addEventListener(
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

  return () => {
    control.abort();
    transicion?.progress(1);
    fichas.forEach((f) => gsap.set([...f.querySelectorAll(".hab-foto, .hab-foto img, .hab-info, .hab-info > *, .hab-miniaturas picture")], { clearProps: "all" }));
  };
}
