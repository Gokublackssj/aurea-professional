// Manifiesto: las palabras de la escalera empiezan apagadas y se encienden
// una tras otra al ritmo del desplazamiento, como la luz que baja por el
// cabo. Ninguna baja de un 30 % de opacidad: la frase se puede leer siempre.
// Con movimiento completo, además, las líneas avanzan hacia su escalón y los
// dos materiales suben a distinta velocidad. En modo reducido solo se
// encienden las palabras (un cambio de opacidad, no de posición).
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import type { Condiciones } from "./index";

export function manifiesto(raiz: HTMLElement, c: Condiciones) {
  const escalera = raiz.querySelector<HTMLElement>(".escalera")!;
  const palabras = SplitText.create(escalera.querySelectorAll("span"), { type: "words", aria: "auto" });

  gsap.fromTo(
    palabras.words,
    { opacity: 0.3 },
    {
      opacity: 1,
      ease: "none",
      stagger: 0.1,
      scrollTrigger: { trigger: escalera, start: c.escritorio ? "top 78%" : "top 85%", end: c.escritorio ? "bottom 42%" : "bottom 55%", scrub: 0.5 },
    },
  );

  if (c.reducido) return;

  gsap.fromTo(
    escalera.querySelectorAll(":scope > span"),
    { x: (i) => -16 - i * 10 },
    { x: 0, ease: "none", scrollTrigger: { trigger: escalera, start: "top 85%", end: "bottom 45%", scrub: 0.8 } },
  );

  raiz.querySelectorAll<HTMLElement>(".materiales picture").forEach((foto, i) => {
    gsap.fromTo(
      foto,
      { y: c.escritorio ? 70 + i * 50 : 30 },
      { y: c.escritorio ? -50 - i * 40 : -20, ease: "none", scrollTrigger: { trigger: raiz, start: "top bottom", end: "bottom top", scrub: true } },
    );
  });
}
