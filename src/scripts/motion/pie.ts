// El pie: la última foto retrocede despacio mientras sube y el nombre se
// levanta letra a letra al llegar al final de la página. En modo reducido el
// nombre aparece con un fundido.
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { salida } from "./curvas";
import type { Condiciones } from "./index";

export function pie(raiz: HTMLElement, c: Condiciones) {
  const nombre = raiz.querySelector<HTMLElement>(".pie-nombre")!;
  const foto = raiz.querySelector<HTMLElement>("picture");

  if (c.reducido) {
    gsap.fromTo(nombre, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, ease: "power1.out", scrollTrigger: { trigger: nombre, start: "top 95%" } });
    return;
  }

  const letras = SplitText.create(nombre, { type: "chars", mask: "chars", aria: "none" });
  gsap.fromTo(letras.chars, { yPercent: 120 }, { yPercent: 0, duration: 1.4, stagger: 0.07, ease: salida, scrollTrigger: { trigger: nombre, start: "top 95%" } });
  if (foto) gsap.fromTo(foto, { scale: 1.15 }, { scale: 1, ease: "none", scrollTrigger: { trigger: raiz, start: "top bottom", end: "bottom bottom", scrub: true } });
}
