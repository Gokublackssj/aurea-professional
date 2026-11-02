// El mar: el vídeo empieza como una ventana con esquinas redondeadas y se abre
// a todo lo ancho con el scroll mientras la imagen retrocede; después sube el
// texto. En modo reducido, el texto aparece con un fundido.
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { salida } from "./curvas";
import type { Condiciones } from "./index";

export function mar(raiz: HTMLElement, c: Condiciones) {
  const escena = raiz.querySelector<HTMLElement>(".mar-escena")!;
  const video = raiz.querySelector<HTMLElement>(".mar-video")!;
  const texto = raiz.querySelector<HTMLElement>(".mar-texto")!;
  const titulo = texto.querySelector<HTMLElement>(".titulo")!;
  const resto = texto.querySelectorAll<HTMLElement>(".etiqueta, p");

  if (c.reducido) {
    gsap.fromTo(texto.children, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.9, stagger: 0.1, ease: "power1.out", scrollTrigger: { trigger: escena, start: "top 70%" } });
    return;
  }

  gsap
    .timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: escena, start: "top 92%", end: "top 25%", scrub: 0.3 } })
    .fromTo(escena, { clipPath: "inset(8% 8% 8% 8% round 24px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)" }, 0)
    .fromTo(video, { scale: 1.12 }, { scale: 1 }, 0);

  const aparecer = { trigger: escena, start: "top 45%" };
  gsap.fromTo(SplitText.create(titulo, { type: "lines", mask: "lines", aria: "auto" }).lines, { yPercent: 130 }, { yPercent: 0, duration: 1.4, ease: salida, scrollTrigger: aparecer });
  gsap.fromTo(resto, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, ease: salida, scrollTrigger: aparecer });
}
