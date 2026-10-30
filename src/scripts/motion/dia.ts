// Un día en Aurea. En escritorio la sección se fija y el día avanza en el
// sitio: cada momento abre su fondo con un barrido de abajo arriba (la foto
// retrocede mientras se abre), el título anterior sale por arriba de su
// máscara y el nuevo entra por abajo, las fotos pequeñas se recortan y se
// revelan, y la barra dorada avanza con el día. Al soltar el desplazamiento,
// la escena se asienta en el momento más cercano.
// En móvil no se fija: se conserva la escena pegajosa nativa y cada título y
// cada foto se revelan al llegar. En modo reducido, títulos y fotos aparecen
// con un fundido y nada se fija.
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { salida, travesia } from "./curvas";
import type { Condiciones } from "./index";

export function dia(raiz: HTMLElement, c: Condiciones) {
  const pasos = [...raiz.querySelectorAll<HTMLElement>(".paso")];
  const titulos = pasos.map((p) => p.querySelector<HTMLElement>("h2, h3")!);
  const fotos = pasos.map((p) => [...p.querySelectorAll<HTMLElement>(".paso-foto")]);

  if (c.reducido) {
    pasos.forEach((_, i) => {
      gsap.fromTo([titulos[i], ...fotos[i]], { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, stagger: 0.12, ease: "power1.out", scrollTrigger: { trigger: titulos[i], start: "top 90%" } });
    });
    return;
  }

  const lineas = titulos.map((t) => SplitText.create(t, { type: "lines", mask: "lines", aria: "auto" }).lines);

  if (c.movil) {
    pasos.forEach((_, i) => {
      gsap.fromTo(lineas[i], { yPercent: 150 }, { yPercent: 0, duration: 1.1, stagger: 0.08, ease: salida, scrollTrigger: { trigger: titulos[i], start: "top 90%" } });
      fotos[i].forEach((foto) =>
        gsap.fromTo(foto, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: travesia, scrollTrigger: { trigger: foto, start: "top 92%" } }),
      );
    });
    return;
  }

  // La clase apila los momentos en una pantalla: antes de crear el pin.
  raiz.classList.add("es-escena");

  const fondos = [...raiz.querySelectorAll<HTMLElement>(".fondo")];
  const rotulos = [...raiz.querySelectorAll<HTMLElement>(".progreso li")];
  const barra = raiz.querySelector<HTMLElement>(".progreso-barra span")!;
  const frases = pasos.map((p) => p.querySelector<HTMLElement>("p")!);
  const momentos = pasos.length - 1;
  const marcas: number[] = [0];

  const marcar = (tiempo: number) => {
    // El último momento cuyo cambio ya ha empezado (su marca menos un margen).
    let activo = -1;
    marcas.forEach((m, i) => {
      if (i > 0 && tiempo >= m - 1.1) activo = i - 1;
    });
    rotulos.forEach((r, i) => r.classList.toggle("activo", i === activo));
  };

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: raiz,
      start: "top top",
      end: `+=${momentos * 90}%`,
      pin: true,
      scrub: 0.8,
      anticipatePin: 1,
      // Al soltar, se asienta en el momento más cercano; sin inercia, para que
      // un gesto rápido no salte el día entero.
      snap: { snapTo: "labels", inertia: false, duration: { min: 0.4, max: 1 }, delay: 0.12, ease: "power1.inOut" },
      // Con la posición de scroll, no con el tiempo de la animación: el scrub va
      // por detrás y el último evento podría dejar el rótulo atrasado.
      onUpdate: (st) => marcar(st.progress * tl.duration()),
    },
  });

  tl.addLabel("momento-0", 0).to({}, { duration: 0.5 });

  for (let i = 1; i <= momentos; i++) {
    const t = tl.duration();
    // Sale el momento anterior: el título sube y desaparece en su máscara.
    tl.to(lineas[i - 1], { yPercent: -150, autoAlpha: 0, duration: 0.6, stagger: 0.05, ease: "power2.in" }, t).to(
      frases[i - 1],
      { autoAlpha: 0, y: -24, duration: 0.5, ease: "power2.in" },
      t,
    );
    if (fotos[i - 1].length) tl.to(fotos[i - 1], { clipPath: "inset(0% 0% 100% 0%)", duration: 0.6, stagger: 0.06, ease: "power2.in" }, t);

    // Barrido del fondo nuevo, de abajo arriba, con la foto retrocediendo.
    tl.fromTo(fondos[i - 1], { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: travesia }, t + 0.1).fromTo(
      fondos[i - 1].querySelector("img"),
      { scale: 1.25 },
      { scale: 1, duration: 1.8, ease: "power1.out" },
      t + 0.1,
    );

    // Entra el momento nuevo.
    tl.fromTo(lineas[i], { yPercent: 150, autoAlpha: 1 }, { yPercent: 0, autoAlpha: 1, duration: 0.9, stagger: 0.08, ease: salida }, t + 0.7)
      .fromTo(frases[i], { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: salida }, t + 0.85)
      .fromTo(fotos[i], { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, stagger: 0.15, ease: travesia }, t + 0.8)
      .to(barra, { scaleX: i / momentos, duration: 1.4, ease: travesia }, t);

    tl.addLabel(`momento-${i}`, t + 1.8);
    marcas.push(t + 1.8);
    tl.to({}, { duration: 0.6 });
  }

  return () => {
    raiz.classList.remove("es-escena");
    rotulos.forEach((r) => r.classList.remove("activo"));
  };
}
