// Visor de fotos (páginas de habitación). Cada foto con [data-ampliar] abre un
// <dialog> con la misma imagen a pantalla completa: se cierra con Escape, con
// el botón o pulsando fuera, se recorren las fotos con las flechas y el foco
// vuelve a la foto de origen. Con movimiento completo, la imagen crece desde
// la posición de la miniatura; en modo reducido, un fundido.
import { gsap } from "gsap";
import { salida } from "./curvas";
import type { Condiciones } from "./index";

export function galeria(raiz: HTMLElement, c: Condiciones) {
  const disparadores = [...raiz.querySelectorAll<HTMLButtonElement>("[data-ampliar]")];
  const visor = document.querySelector<HTMLDialogElement>("dialog.visor");
  if (!visor || !disparadores.length) return;
  const marco = visor.querySelector<HTMLElement>(".visor-foto")!;
  const pie = visor.querySelector<HTMLElement>(".visor-pie")!;
  let actual = 0;
  let origen: HTMLButtonElement | undefined;

  const mostrar = (i: number, desde?: DOMRect) => {
    actual = (i + disparadores.length) % disparadores.length;
    const fuente = disparadores[actual].querySelector("picture")!;
    const copia = fuente.cloneNode(true) as HTMLElement;
    const img = copia.querySelector("img")!;
    img.sizes = "100vw";
    img.loading = "eager";
    img.removeAttribute("style");
    copia.querySelectorAll("source").forEach((s) => s.setAttribute("sizes", "100vw"));
    marco.replaceChildren(copia);
    pie.textContent = `${img.alt} · ${actual + 1} de ${disparadores.length}`;

    if (c.reducido) {
      gsap.fromTo(marco, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
      return;
    }
    if (desde) {
      // Crece desde la miniatura: se calcula la escala y el desplazamiento inversos.
      const destino = marco.getBoundingClientRect();
      gsap.fromTo(
        marco,
        {
          x: desde.left + desde.width / 2 - (destino.left + destino.width / 2),
          y: desde.top + desde.height / 2 - (destino.top + destino.height / 2),
          scale: Math.min(desde.width / destino.width, desde.height / destino.height),
          autoAlpha: 0.6,
        },
        { x: 0, y: 0, scale: 1, autoAlpha: 1, duration: 0.8, ease: salida },
      );
    } else {
      gsap.fromTo(marco, { autoAlpha: 0, x: 30 }, { autoAlpha: 1, x: 0, duration: 0.5, ease: salida });
    }
  };

  const control = new AbortController();
  const { signal } = control;
  disparadores.forEach((d, i) =>
    d.addEventListener(
      "click",
      () => {
        origen = d;
        visor.showModal();
        mostrar(i, d.getBoundingClientRect());
      },
      { signal },
    ),
  );
  visor.querySelector(".visor-cerrar")!.addEventListener("click", () => visor.close(), { signal });
  visor.querySelector(".visor-anterior")!.addEventListener("click", () => mostrar(actual - 1), { signal });
  visor.querySelector(".visor-siguiente")!.addEventListener("click", () => mostrar(actual + 1), { signal });
  visor.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "ArrowRight") mostrar(actual + 1);
      if (e.key === "ArrowLeft") mostrar(actual - 1);
    },
    { signal },
  );
  // Pulsar fuera de la foto (en el fondo del diálogo) cierra.
  visor.addEventListener("click", (e) => e.target === visor && visor.close(), { signal });
  visor.addEventListener("close", () => origen?.focus(), { signal });

  return () => {
    control.abort();
    if (visor.open) visor.close();
  };
}
