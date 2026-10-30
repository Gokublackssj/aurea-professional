// La llegada. En escritorio, la escena se fija una pantalla y el primer panel
// (la costa del cabo) se abre hasta ocuparlo todo: una «lente» con la misma
// foto a pantalla completa pasa de estar recortada al hueco del panel a no
// estarlo. El marco dorado que rodeaba el panel se expande y se disuelve, los
// otros paneles salen hacia la derecha, título y texto se apartan arriba y
// abajo, y sobre la foto ya abierta aparece la frase final.
// En móvil no se fija nada: los paneles se revelan y las fotos respiran.
// En modo reducido, los paneles aparecen con un fundido y nada se fija.
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { salida, travesia } from "./curvas";
import type { Condiciones } from "./index";

export function llegada(raiz: HTMLElement, c: Condiciones) {
  const escena = raiz.querySelector<HTMLElement>(".llegada-escena")!;
  const banda = raiz.querySelector<HTMLElement>(".banda")!;
  const paneles = [...raiz.querySelectorAll<HTMLElement>(".panel")];
  const titulo = raiz.querySelector<HTMLElement>(".llegada-titulo")!;
  const pie = raiz.querySelector<HTMLElement>(".llegada-pie")!;

  if (c.reducido) {
    gsap.fromTo(paneles, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, stagger: 0.12, ease: "power1.out", scrollTrigger: { trigger: banda, start: "top 85%" } });
    return;
  }

  if (c.movil) {
    gsap.fromTo(
      paneles,
      { clipPath: "inset(100% 0% 0% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, stagger: 0.14, ease: travesia, scrollTrigger: { trigger: banda, start: "top 82%" } },
    );
    gsap.fromTo(
      paneles.map((p) => p.querySelector("img")),
      { scale: 1.22 },
      { scale: 1, ease: "none", scrollTrigger: { trigger: banda, start: "top bottom", end: "bottom top", scrub: true } },
    );
    return;
  }

  // La clase cambia la maquetación (pantalla exacta): antes de medir nada.
  raiz.classList.add("es-escena");

  const lente = raiz.querySelector<HTMLElement>(".llegada-lente")!;
  const lenteImagen = lente.querySelector("img")!;
  const velo = raiz.querySelector<HTMLElement>(".llegada-velo")!;
  const marco = raiz.querySelector<HTMLElement>(".llegada-marco")!;
  const frase = raiz.querySelector<HTMLElement>(".llegada-frase")!;
  const tituloPanel = paneles[0].querySelector<HTMLElement>(".panel-titulo");
  const palabras = SplitText.create(frase, { type: "words", mask: "words", aria: "none" });

  // Hueco del primer panel dentro de la escena. El panel nunca se transforma,
  // así que la medida vale esté la escena fijada o no.
  const hueco = () => {
    const e = escena.getBoundingClientRect();
    const p = paneles[0].getBoundingClientRect();
    return { top: p.top - e.top, left: p.left - e.left, right: e.right - p.right, bottom: e.bottom - p.bottom, ancho: p.width, alto: p.height };
  };
  const margenMarco = 14;

  gsap
    .timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: escena, start: "top top", end: "+=240%", pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true },
    })
    .fromTo(
      lente,
      {
        clipPath: () => {
          const h = hueco();
          return `inset(${h.top}px ${h.right}px ${h.bottom}px ${h.left}px)`;
        },
      },
      { clipPath: "inset(0px 0px 0px 0px)", duration: 5, ease: travesia },
      0.6,
    )
    .fromTo(lenteImagen, { scale: 1.2 }, { scale: 1, duration: 6.2, ease: "power1.out" }, 0.6)
    .fromTo(
      marco,
      {
        top: () => hueco().top - margenMarco,
        left: () => hueco().left - margenMarco,
        width: () => hueco().ancho + margenMarco * 2,
        height: () => hueco().alto + margenMarco * 2,
        opacity: 1,
      },
      { top: -40, left: -40, width: () => escena.clientWidth + 80, height: () => escena.clientHeight + 80, opacity: 0, duration: 4.4, ease: travesia },
      0.6,
    )
    .to(tituloPanel, { autoAlpha: 0, duration: 0.8 }, 0.6)
    .to(paneles.slice(1), { xPercent: 150, opacity: 0.15, duration: 3.6, stagger: 0.35, ease: "power2.in" }, 0.8)
    .to(titulo, { y: -150, autoAlpha: 0, duration: 3, ease: "power2.in" }, 0.8)
    .to(pie, { y: 130, autoAlpha: 0, duration: 3, ease: "power2.in" }, 0.8)
    .to(velo, { opacity: 0.45, duration: 2.2 }, 4.4)
    .fromTo(palabras.words, { yPercent: 150 }, { yPercent: 0, duration: 1.8, stagger: 0.28, ease: salida }, 5)
    .to({}, { duration: 1.4 });

  return () => raiz.classList.remove("es-escena");
}
