// Hero: la foto se abre desde una franja horizontal mientras retrocede el
// zoom, la línea dorada se dibuja, «Aurea» sube letra a letra desde su
// máscara, la frase llega por líneas y la navegación aparece al final.
// Al desplazarse, la foto se acerca y se apaga, y el nombre se queda atrás.
// Modo reducido: la foto ya está; nombre, frase y navegación aparecen con un
// fundido, y al bajar la foto solo se apaga.
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { salida, travesia } from "./curvas";
import type { Condiciones } from "./index";

export function hero(raiz: HTMLElement, c: Condiciones) {
  const foto = raiz.querySelector<HTMLElement>(".hero-foto")!;
  const imagen = foto.querySelector("img")!;
  const picture = foto.querySelector("picture")!;
  const velo = raiz.querySelector<HTMLElement>(".hero-velo")!;
  const linea = raiz.querySelector<HTMLElement>(".hero-linea")!;
  const nombre = raiz.querySelector<HTMLElement>(".hero-nombre")!;
  const nombreTexto = raiz.querySelector<HTMLElement>(".hero-nombre-texto")!;
  const fila = raiz.querySelector<HTMLElement>(".hero-fila")!;
  const frase = raiz.querySelector<HTMLElement>(".hero-frase")!;
  const boton = fila.querySelector<HTMLElement>(".boton")!;
  const cabecera = document.querySelector<HTMLElement>(".cabecera.sobre-foto");
  const enlaces = document.querySelectorAll<HTMLElement>(".cabecera.sobre-foto .menu li, .cabecera.sobre-foto .menu-boton");

  // Lo que el CSS ocultaba antes del primer pintado pasa a manos de GSAP.
  gsap.set([nombre, fila, cabecera], { visibility: "visible" });

  // La entrada se ve una vez por visita. Si el motor se reconstruye (cambio de
  // modo, o de escritorio a móvil al girar o redimensionar), el hero ya está
  // en su sitio y solo se vuelve a crear su reacción al scroll.
  const yaEntro = raiz.dataset.entrada === "hecha";
  raiz.dataset.entrada = "hecha";

  if (c.reducido) {
    gsap.set([foto, linea], { clearProps: "clipPath,transform" });
    if (!yaEntro) {
      gsap
        .timeline({ defaults: { ease: "power1.out" } })
        .fromTo(nombre, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2 }, 0.1)
        .fromTo([fila, ...enlaces], { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, stagger: 0.06 }, 0.4);
    }
    gsap.fromTo(velo, { opacity: 0 }, { opacity: 0.6, ease: "none", scrollTrigger: { trigger: raiz, start: "top top", end: "bottom top", scrub: true } });
    return;
  }

  if (!yaEntro) {
    const letras = SplitText.create(nombreTexto, { type: "chars", mask: "chars", aria: "auto" });
    const lineas = SplitText.create(frase, { type: "lines", mask: "lines", aria: "auto" });

    gsap
      .timeline({ defaults: { ease: salida } })
      .fromTo(foto, { clipPath: c.escritorio ? "inset(44% 9% 44% 9%)" : "inset(40% 6% 40% 6%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.8, ease: travesia }, 0)
      .fromTo(imagen, { scale: 1.32 }, { scale: 1, duration: 2.6 }, 0)
      .fromTo(linea, { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: travesia }, 0.75)
      .fromTo(letras.chars, { yPercent: 130 }, { yPercent: 0, duration: 1.5, stagger: 0.075 }, 0.95)
      .fromTo(lineas.lines, { yPercent: 150 }, { yPercent: 0, duration: 1.1, stagger: 0.09 }, 1.35)
      .fromTo(boton, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.9 }, 1.55)
      .fromTo(enlaces, { autoAlpha: 0, y: -14 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.07 }, 1.6);
  }

  // Al desplazarse: la foto se acerca, se apaga y el nombre se queda atrás.
  gsap
    .timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: raiz, start: "top top", end: "bottom top", scrub: 0.6 } })
    .fromTo(picture, { scale: 1 }, { scale: c.escritorio ? 1.22 : 1.14 }, 0)
    .fromTo(velo, { opacity: 0 }, { opacity: 0.72 }, 0)
    .fromTo(nombre, { yPercent: 0 }, { yPercent: c.escritorio ? -38 : -20 }, 0)
    .fromTo(fila, { y: 0 }, { y: c.escritorio ? -40 : -20 }, 0);
}
