// Cartel de habitaciones del inicio. Las filas aparecen una tras otra y la
// tira de fotos se revela. En escritorio con ratón y movimiento completo, al
// pasar por una fila aparece la foto de esa habitación junto al cursor y lo
// sigue con un leve retraso; al cambiar de fila, la foto nueva se abre sobre
// la anterior. Sin ratón o en modo reducido no hay vista flotante: la tira de
// fotos ya enseña las cuatro.
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

  const vista = raiz.querySelector<HTMLElement>(".cartel-vista");
  if (!vista || !c.escritorio || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const capas = new Map([...vista.querySelectorAll<HTMLElement>("[data-slug]")].map((el) => [el.dataset.slug!, el]));
  const irX = gsap.quickTo(vista, "x", { duration: 0.6, ease: "power3.out" });
  const irY = gsap.quickTo(vista, "y", { duration: 0.6, ease: "power3.out" });
  let actual: string | undefined;
  let z = 1;
  const control = new AbortController();
  const { signal } = control;

  const mover = (e: PointerEvent) => {
    const caja = raiz.getBoundingClientRect();
    irX(e.clientX - caja.left + 32);
    irY(e.clientY - caja.top - vista.offsetHeight / 2);
  };

  filas.forEach((fila) => {
    fila.addEventListener(
      "pointerenter",
      (e) => {
        const slug = fila.dataset.slug!;
        if (actual === undefined) {
          const caja = raiz.getBoundingClientRect();
          gsap.set(vista, { x: e.clientX - caja.left + 32, y: e.clientY - caja.top - vista.offsetHeight / 2 });
          gsap.to(vista, { autoAlpha: 1, scale: 1, duration: 0.5, ease: salida, overwrite: "auto" });
        }
        if (slug === actual) return;
        actual = slug;
        const capa = capas.get(slug)!;
        gsap.set(capa, { zIndex: ++z, autoAlpha: 1 });
        gsap.fromTo(capa, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: travesia, overwrite: "auto" });
        gsap.fromTo(capa.querySelector("img"), { scale: 1.2 }, { scale: 1, duration: 1, ease: salida, overwrite: "auto" });
      },
      { signal },
    );
  });

  const cuerpo = raiz.querySelector("tbody")!;
  cuerpo.addEventListener("pointermove", mover, { signal });
  cuerpo.addEventListener(
    "pointerleave",
    () => {
      actual = undefined;
      gsap.to(vista, { autoAlpha: 0, scale: 0.92, duration: 0.4, ease: "power2.in", overwrite: "auto" });
    },
    { signal },
  );

  return () => {
    control.abort();
    gsap.killTweensOf([vista, ...capas.values()]);
    gsap.set([vista, ...capas.values()], { clearProps: "all" });
  };
}
