// El camino hasta Aurea, en formato cine. Escritorio: el escenario es sticky
// (CSS, sin pin de GSAP) y la banda panorámica se abre en vertical hasta la
// pantalla completa mientras la foto retrocede; título y texto se apartan y
// sobre la foto ya abierta sube la frase final. GSAP solo traduce el scroll en
// la animación: la página nunca se mueve sola.
// Móvil: la banda se abre al pasar, sin fijar nada y sin retirar texto.
// Modo reducido: se queda en el primer fotograma, con todo el texto, y la
// escena aparece con un fundido.
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { salida, travesia } from "./curvas";
import type { Condiciones } from "./index";
import { escenaFijada } from "./escena";

export function llegada(raiz: HTMLElement, c: Condiciones) {
  const foto = raiz.querySelector<HTMLElement>(".llegada-foto")!;
  const imagen = foto.querySelector("img")!;

  if (c.reducido) {
    gsap.set(imagen, { scale: 1 });
    gsap.fromTo(raiz.querySelector(".llegada-escena"),{ autoAlpha: 0 }, { autoAlpha: 1, duration: 0.9, ease: "power1.out", scrollTrigger: { trigger: raiz, start: "top 82%" } });
    return;
  }

  if (c.movil) {
    gsap
      .timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: foto, start: "top 85%", end: "center 45%", scrub: 0.8 } })
      .to(foto, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: travesia }, 0)
      .fromTo(imagen, { scale: 1.15 }, { scale: 1, duration: 1 }, 0);
    return;
  }

  const cabeza = raiz.querySelector<HTMLElement>(".llegada-cabeza")!;
  const pie = raiz.querySelector<HTMLElement>(".llegada-pie")!;
  const velo = raiz.querySelector<HTMLElement>(".llegada-velo")!;
  const frase = raiz.querySelector<HTMLElement>(".llegada-frase")!;
  const lineas = SplitText.create(frase, { type: "lines", mask: "lines", aria: "none" }).lines;
  // Estado inicial explícito: los tramos que empiezan tarde en una línea con
  // scrub no lo aplican por sí solos tras un refresh.
  gsap.set(lineas, { yPercent: 130 });

  gsap
    .timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: raiz, start: "top top", end: "bottom bottom", scrub: 0.3, onToggle: escenaFijada },
    })
    .to(foto, { clipPath: "inset(0% 0% 0% 0%)", duration: 3, ease: travesia }, 0)
    .fromTo(imagen, { scale: 1.15 }, { scale: 1, duration: 3.6, ease: "power1.out" }, 0)
    .to(cabeza, { y: -90, autoAlpha: 0, duration: 1.6, ease: "power3.in" }, 0.2)
    .to(pie, { y: 90, autoAlpha: 0, duration: 1.6, ease: "power3.in" }, 0.2)
    .to(velo, { opacity: 1, duration: 1.2 }, 2.2)
    .set(frase, { opacity: 1 }, 2.6)
    .fromTo(lineas, { yPercent: 130 }, { yPercent: 0, duration: 1, stagger: 0.15, ease: salida }, 2.6)
    .to({}, { duration: 0.8 });
}
