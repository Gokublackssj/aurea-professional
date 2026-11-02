// Hero: la línea de latón se dibuja; la foto se abre en una píldora que separa
// el nombre en dos; la píldora crece hasta la pantalla completa mientras el
// nombre pasa a marfil; las dos mitades se reúnen y el nombre baja a su sitio;
// por último aparecen la cabecera y la acción. Se ve una vez por visita.
// Al desplazarse, la foto se acerca y se oscurece, y el nombre se queda atrás.
// Modo reducido: composición final desde el principio; solo la foto entra con
// un fundido y al bajar se oscurece.
import { gsap } from "gsap";
import { travesia } from "./curvas";
import type { Condiciones } from "./index";

export function hero(raiz: HTMLElement, c: Condiciones) {
  const foto = raiz.querySelector<HTMLElement>(".hero-foto")!;
  const imagen = foto.querySelector("img")!;
  const velo = raiz.querySelector<HTMLElement>(".hero-velo")!;
  const linea = raiz.querySelector<HTMLElement>(".hero-linea")!;
  const nombre = raiz.querySelector<HTMLElement>(".hero-nombre")!;
  const [mitadA, mitadB] = [...raiz.querySelectorAll<HTMLElement>(".mitad")];
  const frase = raiz.querySelector<HTMLElement>(".hero-frase")!;
  const etiqueta = raiz.querySelector<HTMLElement>(".hero-etiqueta")!;
  const boton = raiz.querySelector<HTMLElement>(".hero-boton")!;
  const cabecera = document.querySelector<HTMLElement>(".cabecera.sobre-foto");

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const final = { y: c.movil ? -vh * 0.2 : vh * 0.24, scale: c.movil ? 0.8 : 0.62 };
  const marfil = "#f2f0ea";

  // La entrada se ve una vez por visita. Si el motor se reconstruye (cambio de
  // modo, o de escritorio a móvil), el hero se queda en su estado final.
  const yaEntro = raiz.dataset.entrada === "hecha";
  raiz.dataset.entrada = "hecha";

  const estadoFinal = () => {
    gsap.set(foto, { clipPath: "inset(0% 0% 0% 0% round 0px)" });
    gsap.set(imagen, { scale: 1 });
    gsap.set(linea, { scaleX: 0 });
    gsap.set(velo, { opacity: 1 });
    gsap.set([mitadA, mitadB], { x: 0 });
    gsap.set(nombre, { ...final, color: marfil });
    gsap.set(frase, { color: marfil });
    gsap.set(etiqueta, { color: "#c9a66b" });
    gsap.set(boton, { opacity: 1 });
    if (cabecera) gsap.set(cabecera, { autoAlpha: 1 });
  };

  if (c.reducido) {
    estadoFinal();
    if (!yaEntro) gsap.from(foto, { opacity: 0, duration: 0.6 });
    return;
  }

  if (yaEntro) {
    estadoFinal();
  } else {
    // Estado de apertura explícito: el motor quita la clase «motion» (y con
    // ella el estado del CSS) en cuanto construye las escenas.
    gsap.set(foto, { clipPath: "inset(50% 50% 50% 50% round 999px)" });
    gsap.set([velo, boton], { opacity: 0 });
    gsap.set([nombre, frase], { color: "#141412" });
    gsap.set(etiqueta, { color: "#57574f" });
    if (cabecera) gsap.set(cabecera, { autoAlpha: 0 });
    gsap
      .timeline({ defaults: { ease: travesia } })
      .to(linea, { scaleX: 1, duration: 1.1, ease: "power2.out" }, 0.3)
      .to(linea, { opacity: 0, duration: 0.2 }, 1.3)
      .fromTo(foto, { clipPath: "inset(49.9% 31% 49.9% 31% round 999px)" }, { clipPath: "inset(30% 31% 30% 31% round 999px)", duration: 1.1, immediateRender: false }, 1.3)
      .to(mitadA, { x: -vw * (c.movil ? 0.2 : 0.24), duration: 1.1 }, 1.3)
      .to(mitadB, { x: vw * (c.movil ? 0.2 : 0.24), duration: 1.1 }, 1.3)
      .fromTo(imagen, { scale: 1.25 }, { scale: 1, duration: 2.2, ease: "power2.out" }, 1.3)
      .fromTo(foto, { clipPath: "inset(30% 31% 30% 31% round 999px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1.4, immediateRender: false }, 2.6)
      .to([nombre, frase], { color: marfil, duration: 0.8 }, 2.6)
      .to(etiqueta, { color: "#c9a66b", duration: 0.8 }, 2.6)
      .to(velo, { opacity: 1, duration: 0.8 }, 2.9)
      .to([mitadA, mitadB], { x: 0, duration: 1.2 }, 3.4)
      .to(nombre, { ...final, duration: 1.2 }, 3.4)
      .to(boton, { opacity: 1, duration: 0.9, ease: "power2.out" }, 4.1)
      .to(cabecera, { autoAlpha: 1, duration: 0.9, ease: "power2.out" }, 4.2);
  }

  // Al desplazarse: la foto se acerca y el nombre se queda atrás.
  gsap
    .timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: raiz, start: "top top", end: "bottom top", scrub: 0.6 } })
    .to(imagen, { scale: 1.12, yPercent: 6 }, 0)
    .to(mitadA.parentElement, { yPercent: c.escritorio ? -28 : -14 }, 0);

  return () => {
    // Al reconstruir se deja el estado final (no se vuelve a la apertura).
    if (cabecera) gsap.set(cabecera, { clearProps: "visibility,opacity" });
  };
}
