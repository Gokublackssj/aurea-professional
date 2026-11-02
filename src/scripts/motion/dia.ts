// Un día en Aurea.
// Escritorio con movimiento: el escenario es sticky (CSS; la sección mide tres
// pantallas, media por momento) y GSAP solo traduce el scroll en la secuencia:
// el momento anterior sale, el fondo nuevo se abre de abajo arriba mientras
// retrocede la foto, las fotos pequeñas suben, el reloj rueda y la barra avanza.
// Sin ajuste automático (snap): la página nunca se mueve sola; las barras de
// progreso son botones que llevan a cada momento.
// Móvil y modo reducido: bloques normales; cada uno se revela al llegar
// (fundido en reducido) y el reloj de la cabecera cambia de hora.
import { gsap } from "gsap";
import { salida, travesia } from "./curvas";
import type { Condiciones } from "./index";
import { escenaFijada } from "./escena";

export function dia(raiz: HTMLElement, c: Condiciones) {
  const control = new AbortController();
  const { signal } = control;

  if (c.movil || c.reducido) {
    const hora = raiz.querySelector<HTMLElement>(".dia-hora")!;
    const cambiarHora = (texto: string) => {
      if (hora.textContent === texto) return;
      if (c.reducido) {
        hora.textContent = texto;
        return;
      }
      gsap
        .timeline()
        .to(hora, { yPercent: -60, opacity: 0, duration: 0.2, ease: "power3.in", onComplete: () => void (hora.textContent = texto) })
        .fromTo(hora, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.35, ease: salida });
    };
    raiz.querySelectorAll<HTMLElement>(".dia-bloque").forEach((bloque) => {
      const foto = bloque.querySelector<HTMLElement>(".dia-bloque-foto")!;
      const textos = bloque.querySelectorAll<HTMLElement>(".dia-bloque-texto > *");
      if (c.reducido) {
        gsap.fromTo([foto, ...textos], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.9, stagger: 0.08, ease: "power1.out", scrollTrigger: { trigger: bloque, start: "top 85%" } });
      } else {
        gsap.fromTo(foto, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: travesia, scrollTrigger: { trigger: bloque, start: "top 82%" } });
        gsap.fromTo(foto.querySelector("img"), { scale: 1.2 }, { scale: 1, duration: 2.2, ease: salida, scrollTrigger: { trigger: bloque, start: "top 82%" } });
        gsap.fromTo(textos, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, ease: salida, scrollTrigger: { trigger: bloque, start: "top 60%" } });
      }
      gsap.timeline({ scrollTrigger: { trigger: bloque, start: "top 55%", end: "bottom 55%", onToggle: (st) => st.isActive && cambiarHora(bloque.querySelector(".dia-bloque-hora")!.textContent!.trim()) } });
    });
    return () => control.abort();
  }

  const fotos = [...raiz.querySelectorAll<HTMLElement>(".dia-foto")];
  const momentos = [...raiz.querySelectorAll<HTMLElement>(".dia-momento")];
  const ruedas = [...raiz.querySelectorAll<HTMLElement>(".rueda")];
  const barras = [...raiz.querySelectorAll<HTMLElement>(".dia-progreso i")];
  const n = momentos.length;

  gsap.set(fotos.slice(1), { clipPath: "inset(100% 0% 0% 0%)" });
  gsap.set(momentos.slice(1), { opacity: 0 });
  gsap.set(barras[0], { "--p": 1 });

  const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: raiz, start: "top top", end: "bottom bottom", scrub: 0.3, onToggle: escenaFijada } });
  tl.addLabel("m0", 0).to({}, { duration: 0.1 });
  for (let i = 1; i < n; i++) {
    const t = tl.duration();
    tl.to(momentos[i - 1], { opacity: 0, y: -40, duration: 0.5, ease: "power3.in" }, t)
      .fromTo(fotos[i], { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: travesia }, t + 0.1)
      .fromTo(fotos[i].querySelector(":scope > picture img"), { scale: 1.2 }, { scale: 1, duration: 1.6, ease: "power1.out" }, t + 0.1)
      .fromTo(fotos[i].querySelectorAll(".secundarias img"), { y: 90, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: salida }, t + 0.7)
      .fromTo(momentos[i], { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, ease: salida }, t + 0.6)
      .to(ruedas, { yPercent: (-100 / n) * i, duration: 0.9, stagger: 0.06, ease: travesia }, t + 0.2)
      .to(barras[i], { "--p": 1, duration: 0.9, ease: travesia }, t + 0.2);
    tl.addLabel(`m${i}`, t + 1.6).to({}, { duration: 0.1 });
  }

  // Las barras llevan a cada momento (un desplazamiento suave que pide el visitante)
  raiz.querySelectorAll<HTMLButtonElement>(".dia-progreso button").forEach((b) =>
    b.addEventListener("click", () => window.scrollTo({ top: tl.scrollTrigger!.labelToScroll(`m${b.dataset.i}`), behavior: "smooth" }), { signal }),
  );

  return () => control.abort();
}
