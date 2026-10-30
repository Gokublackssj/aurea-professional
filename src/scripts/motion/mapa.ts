// Mapa de Cabo Lumbre (Reservas): al llegar, la carretera se dibuja desde el
// este hasta la casa, el punto de Aurea aparece y los nombres llegan después.
// En modo reducido, el mapa entero aparece con un fundido.
import { gsap } from "gsap";
import { salida, travesia } from "./curvas";
import type { Condiciones } from "./index";

export function mapa(raiz: HTMLElement, c: Condiciones) {
  const scrollTrigger = { trigger: raiz, start: "top 75%" };
  if (c.reducido) {
    gsap.fromTo(raiz, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, ease: "power1.out", scrollTrigger });
    return;
  }
  const carretera = raiz.querySelector<SVGPathElement>(".mapa-carretera")!;
  const largo = carretera.getTotalLength();
  gsap
    .timeline({ scrollTrigger, defaults: { ease: salida } })
    .fromTo(carretera, { strokeDasharray: largo, strokeDashoffset: largo }, { strokeDashoffset: 0, duration: 1.8, ease: travesia }, 0)
    .fromTo(raiz.querySelector(".mapa-sendero"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, 1.3)
    .fromTo(raiz.querySelector(".mapa-aurea"), { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.8, ease: "back.out(2)" }, 1.5)
    .fromTo(raiz.querySelectorAll(".mapa-rotulos text"), { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 }, 1.7);
}
