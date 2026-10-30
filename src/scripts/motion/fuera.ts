// «Fuera de la habitación»: las fotos reunidas alrededor del título se abren
// al llegar y luego flotan cada una a su ritmo mientras se pasa por la banda
// (data-velocidad), así que el grupo se abre y se cierra con el scroll. En
// modo reducido aparecen con un fundido y se quedan quietas.
import { gsap } from "gsap";
import { travesia } from "./curvas";
import type { Condiciones } from "./index";

export function fuera(raiz: HTMLElement, c: Condiciones) {
  const sueltas = [...raiz.querySelectorAll<HTMLElement>(".suelta")];
  const aparecer = { trigger: raiz, start: "top 75%" };

  if (c.reducido) {
    gsap.fromTo(sueltas, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, stagger: 0.08, ease: "power1.out", scrollTrigger: aparecer });
    return;
  }

  gsap.fromTo(
    sueltas.map((s) => s.querySelector("picture")),
    { clipPath: "inset(100% 0% 0% 0%)" },
    { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, stagger: { each: 0.1, from: "random" }, ease: travesia, scrollTrigger: aparecer },
  );

  sueltas.forEach((s) => {
    const v = parseFloat(s.dataset.velocidad ?? "0.1") * (c.movil ? 0.5 : 1);
    gsap.fromTo(
      s,
      { yPercent: v * 100 },
      { yPercent: -v * 100, ease: "none", scrollTrigger: { trigger: raiz, start: "top bottom", end: "bottom top", scrub: 0.6 } },
    );
  });
}
