// Cartel de habitaciones del inicio. Las filas aparecen una tras otra y la
// tira de fotos, que enseña las cuatro habitaciones, se revela. Pasar por una
// fila no abre ninguna foto: cada nombre es un enlace a su habitación.
import { gsap } from "gsap";
import { salida, travesia } from "./curvas";
import type { Condiciones } from "./index";

export function cartel(raiz: HTMLElement, c: Condiciones) {
  const filas = [...raiz.querySelectorAll<HTMLTableRowElement>("tbody tr")];
  const tira = [...raiz.querySelectorAll<HTMLElement>(".tira li")];
  const aparecer = { trigger: raiz.querySelector("table"), start: "top 85%" };

  if (c.reducido) {
    gsap.fromTo([...filas, ...tira], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.9, stagger: 0.06, ease: "power1.out", scrollTrigger: aparecer });
    return;
  }

  gsap.fromTo(filas, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.1, ease: salida, scrollTrigger: aparecer });
  gsap.fromTo(
    tira.map((li) => li.querySelector("picture")),
    { clipPath: "inset(100% 0% 0% 0%)" },
    { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, stagger: 0.12, ease: travesia, scrollTrigger: { trigger: raiz.querySelector(".tira"), start: "top 88%" } },
  );
}
