// Manifiesto: la tinta avanza palabra a palabra con el scroll (de piedra a
// tinta: la frase se lee siempre). Con movimiento completo, además, los dos
// arcos se abren desde una rendija mientras retrocede el zoom, el segundo sube
// a otra velocidad y las cifras cuentan hasta su valor. En modo reducido, la
// tinta también avanza (es un cambio de color, no de posición), los arcos
// aparecen con un fundido y las cifras se muestran ya escritas.
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { travesia } from "./curvas";
import type { Condiciones } from "./index";

export function manifiesto(raiz: HTMLElement, c: Condiciones) {
  const frase = raiz.querySelector<HTMLElement>(".frase")!;
  // aria "none": aria-label no está permitido en un <p>; las palabras siguen
  // en el DOM en su orden y se leen igual.
  const palabras = SplitText.create(frase, { type: "words", wordsClass: "palabra", aria: "none" }).words;
  const arcos = [...raiz.querySelectorAll<HTMLElement>(".arco")];

  gsap.to(palabras, {
    color: "#141412",
    stagger: 0.1,
    ease: "none",
    scrollTrigger: { trigger: frase, start: c.escritorio ? "top 75%" : "top 85%", end: c.escritorio ? "bottom 45%" : "bottom 60%", scrub: 0.5 },
  });

  if (c.reducido) {
    gsap.fromTo(arcos, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.9, stagger: 0.12, ease: "power1.out", scrollTrigger: { trigger: raiz.querySelector(".arcos"), start: "top 85%" } });
    return;
  }

  const aparecer = { trigger: raiz.querySelector(".arcos"), start: "top 82%" };
  gsap.fromTo(arcos, { clipPath: "inset(0% 50% 0% 50%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, stagger: 0.14, ease: travesia, scrollTrigger: aparecer });
  gsap.fromTo(
    arcos.map((a) => a.querySelector("img")),
    { scale: 1.3 },
    { scale: 1, duration: 2.2, stagger: 0.14, ease: "power3.out", scrollTrigger: aparecer },
  );
  gsap.to(arcos[1], { y: () => -window.innerHeight * 0.12 * (c.movil ? 0.5 : 1), ease: "none", scrollTrigger: { trigger: raiz, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });

  // Cifras que cuentan, una vez (lo ya contado no se repite al reconstruir)
  raiz.querySelectorAll<HTMLElement>("[data-contar]").forEach((el) => {
    if (el.dataset.contado === "si") return;
    const fin = Number(el.dataset.contar);
    const valor = { n: 0 };
    el.textContent = "0";
    gsap.to(valor, {
      n: fin,
      duration: 1.6,
      ease: "power2.out",
      onUpdate: () => (el.textContent = String(Math.round(valor.n))),
      onComplete: () => (el.dataset.contado = "si"),
      scrollTrigger: { trigger: el, start: "top 90%" },
    });
  });

  return () => {
    // Si se reconstruye a medias, cada cifra vuelve a su valor real
    raiz.querySelectorAll<HTMLElement>("[data-contar]").forEach((el) => (el.textContent = el.dataset.contar ?? el.textContent));
  };
}
