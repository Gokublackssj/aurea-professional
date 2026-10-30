// La pregunta final: las dos mitades llegan desde lados opuestos y se
// encuentran en el centro mientras la sección entra en pantalla; los botones
// aparecen después. En modo reducido, todo aparece con un fundido.
import { gsap } from "gsap";
import { salida } from "./curvas";
import type { Condiciones } from "./index";

export function pregunta(raiz: HTMLElement, c: Condiciones) {
  const arriba = raiz.querySelector<HTMLElement>(".linea-arriba")!;
  const abajo = raiz.querySelector<HTMLElement>(".linea-abajo")!;
  const respuestas = raiz.querySelector<HTMLElement>(".respuestas")!;

  if (c.reducido) {
    gsap.fromTo([arriba, respuestas, abajo], { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, stagger: 0.12, ease: "power1.out", scrollTrigger: { trigger: raiz, start: "top 70%" } });
    return;
  }

  gsap
    .timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: raiz, start: "top bottom", end: "top 15%", scrub: 0.8 } })
    .fromTo(arriba, { xPercent: -18, opacity: 0.15 }, { xPercent: 0, opacity: 1 }, 0)
    .fromTo(abajo, { xPercent: 18, opacity: 0.15 }, { xPercent: 0, opacity: 1 }, 0);

  gsap.fromTo(
    respuestas.children,
    { autoAlpha: 0, y: 24 },
    { autoAlpha: 1, y: 0, duration: 1, stagger: 0.12, ease: salida, scrollTrigger: { trigger: respuestas, start: "top 80%" } },
  );
}
