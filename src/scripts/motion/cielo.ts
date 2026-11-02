// El cielo: la foto empieza dentro de un círculo pequeño sobre la noche; el
// círculo se abre desde el centro hasta la mitad de la diagonal de la pantalla
// (cubre las esquinas) mientras la foto se acerca, como entrar en la escena; un
// aro de latón marca el círculo al principio y se disuelve; después se oscurece
// el lado del texto y el texto sube.
// Escenario sticky (CSS). La máscara es por transformaciones: un círculo del
// tamaño de la diagonal que crece de radio0/radio1 a 1, con la foto
// contraescalada dentro; no obliga a repintar en cada fotograma, como sí lo
// haría animar clip-path. En modo reducido: foto a pantalla completa, el texto
// con un fundido.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { salida } from "./curvas";
import type { Condiciones } from "./index";
import { escenaFijada } from "./escena";

export function cielo(raiz: HTMLElement, c: Condiciones) {
  const texto = raiz.querySelector<HTMLElement>(".cielo-texto")!;

  if (c.reducido) {
    gsap.fromTo(texto.children, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.9, stagger: 0.1, ease: "power1.out", scrollTrigger: { trigger: raiz, start: "top 60%" } });
    return;
  }

  const circulo = raiz.querySelector<HTMLElement>(".cielo-foto")!;
  const foto = circulo.querySelector<HTMLElement>("picture")!;
  const aro = raiz.querySelector<HTMLElement>(".cielo-aro")!;
  const velo = raiz.querySelector<HTMLElement>(".cielo-velo")!;
  const etiqueta = texto.querySelector<HTMLElement>(".etiqueta")!;
  // En el párrafo, aria "none": aria-label no está permitido en un <p>, y el
  // texto partido sigue en el DOM en su orden.
  const lineas = [
    ...SplitText.create(texto.querySelector(".titulo")!, { type: "lines", mask: "lines", aria: "auto" }).lines,
    ...SplitText.create(texto.querySelector("p")!, { type: "lines", mask: "lines", aria: "none" }).lines,
  ];

  const radio0 = () => Math.min(window.innerWidth, window.innerHeight) * (c.movil ? 0.3 : 0.22);
  const radio1 = () => Math.hypot(window.innerWidth, window.innerHeight) / 2 + 4;
  const medir = () => circulo.style.setProperty("--diam", `${2 * radio1()}px`);
  medir();
  ScrollTrigger.addEventListener("refreshInit", medir);

  const apertura = { s: radio0() / radio1(), zoom: 1.25 };
  const pintar = () => {
    gsap.set(circulo, { scale: apertura.s });
    gsap.set(foto, { scale: apertura.zoom / apertura.s });
  };
  pintar();
  // Estado inicial explícito: los tramos que empiezan tarde en una línea de
  // tiempo con scrub no lo aplican por sí solos tras un refresh.
  gsap.set(lineas, { yPercent: 130 });
  gsap.set([velo, etiqueta], { opacity: 0 });

  // Empieza cuando la escena casi ha llegado arriba: el círculo sigue pequeño al
  // quedar fija y se abre mientras lo está.
  gsap
    .timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: raiz, start: "top 20%", end: "bottom bottom", scrub: 0.3, invalidateOnRefresh: true, onToggle: escenaFijada } })
    .fromTo(apertura, { s: () => radio0() / radio1(), zoom: 1.25 }, { s: 1, zoom: 1, duration: 6, ease: "power2.inOut", onUpdate: pintar }, 0)
    .fromTo(aro, { scale: 1, opacity: 1 }, { scale: 1.7, opacity: 0, duration: 2, ease: "power1.in" }, 0.3)
    .fromTo(velo, { opacity: 0 }, { opacity: 1, duration: 2 }, 5)
    .fromTo(etiqueta, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.2 }, 5.6)
    .fromTo(lineas, { yPercent: 130 }, { yPercent: 0, duration: 1.6, stagger: 0.25, ease: salida }, 5.8)
    .to({}, { duration: 1 });

  return () => {
    ScrollTrigger.removeEventListener("refreshInit", medir);
    circulo.style.removeProperty("--diam");
  };
}
