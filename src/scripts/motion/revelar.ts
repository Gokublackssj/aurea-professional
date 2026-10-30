// Revelados comunes a toda la web, declarados en el marcado:
//   data-entrada         cabecera de página: su h1 sube por líneas al cargar,
//                        y los [data-entrada-paso] y [data-entrada-foto] le siguen
//   data-revelar="titulo"  el título sube por líneas desde su máscara
//   data-revelar="foto"    la foto se abre con un barrido y retrocede el zoom
//   data-revelar="texto"   el bloque sube un poco mientras aparece
//   data-revelar="grupo"   los hijos aparecen uno tras otro
//   data-paralaje="0.15"   se desplaza a otra velocidad que la página
// En modo reducido todo se queda en fundidos de opacidad y no hay paralaje.
// Cada revelado ocurre una sola vez: lo ya leído no vuelve a ocultarse.
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { salida, travesia } from "./curvas";
import type { Condiciones } from "./index";

const aparecer = { start: "top 86%", toggleActions: "play none none none" } as const;

export function revelar(raiz: HTMLElement, c: Condiciones) {
  // Cabeceras de página (al cargar, sin scroll)
  raiz.querySelectorAll<HTMLElement>("[data-entrada]").forEach((cabeza) => {
    gsap.set(cabeza, { visibility: "visible" });
    const titulo = cabeza.querySelector<HTMLElement>("h1");
    const pasos = cabeza.querySelectorAll<HTMLElement>("[data-entrada-paso]");
    const fotos = cabeza.querySelectorAll<HTMLElement>("[data-entrada-foto]");
    const tl = gsap.timeline({ defaults: { ease: salida }, delay: 0.1 });
    if (c.reducido) {
      tl.fromTo([titulo, ...pasos, ...fotos], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.9, stagger: 0.12 });
      return;
    }
    if (titulo) {
      const lineas = SplitText.create(titulo, { type: "lines", mask: "lines", aria: "auto" }).lines;
      tl.fromTo(lineas, { yPercent: 130 }, { yPercent: 0, duration: 1.3, stagger: 0.1 }, 0);
    }
    if (pasos.length) tl.fromTo(pasos, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.1 }, 0.35);
    fotos.forEach((foto, i) => {
      tl.fromTo(foto, { clipPath: "inset(18% 12% 18% 12%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: travesia }, 0.2 + i * 0.12);
      const img = foto.querySelector("img") ?? (foto instanceof HTMLImageElement ? foto : null);
      if (img) tl.fromTo(img, { scale: 1.2 }, { scale: 1, duration: 2.2 }, 0.2 + i * 0.12);
    });
  });

  // Revelados al llegar con el scroll
  raiz.querySelectorAll<HTMLElement>("[data-revelar]").forEach((el) => {
    gsap.set(el, { visibility: "visible" });
    const tipo = el.dataset.revelar;
    const scrollTrigger = { trigger: el, ...aparecer };

    if (c.reducido) {
      const objetivos = tipo === "grupo" ? [...el.children] : el;
      gsap.fromTo(objetivos, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.9, stagger: 0.08, ease: "power1.out", scrollTrigger });
      return;
    }

    if (tipo === "titulo") {
      const lineas = SplitText.create(el, { type: "lines", mask: "lines", aria: "auto" }).lines;
      gsap.fromTo(lineas, { yPercent: 130 }, { yPercent: 0, duration: 1.2, stagger: 0.09, ease: salida, scrollTrigger });
    } else if (tipo === "foto") {
      const desde = el.dataset.revelarDesde === "izquierda" ? "inset(0% 100% 0% 0%)" : el.dataset.revelarDesde === "derecha" ? "inset(0% 0% 0% 100%)" : "inset(100% 0% 0% 0%)";
      gsap.fromTo(el, { clipPath: desde }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: travesia, scrollTrigger });
      const img = el instanceof HTMLImageElement ? el : el.querySelector("img");
      if (img && img !== el) gsap.fromTo(img, { scale: 1.18 }, { scale: 1, duration: 2, ease: salida, scrollTrigger });
    } else if (tipo === "grupo") {
      gsap.fromTo(el.children, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.09, ease: salida, scrollTrigger });
    } else {
      gsap.fromTo(el, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: salida, scrollTrigger });
    }
  });

  // Paralaje: solo con movimiento completo
  if (!c.reducido) {
    raiz.querySelectorAll<HTMLElement>("[data-paralaje]").forEach((el) => {
      const fuerza = parseFloat(el.dataset.paralaje ?? "0.1") * (c.movil ? 0.5 : 1);
      gsap.fromTo(
        el,
        { y: () => window.innerHeight * fuerza },
        { y: () => -window.innerHeight * fuerza, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } },
      );
    });
  }
}
