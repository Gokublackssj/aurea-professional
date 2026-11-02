// Motor de movimiento de Aurea. Un solo punto de entrada en todas las páginas:
// registra los plugins, espera a las fuentes (SplitText necesita las líneas
// definitivas) y construye las escenas presentes con un gsap.matchMedia()
// que distingue escritorio y móvil. El modo (completo o reducido) lo decide la
// preferencia del visitante (preferencia.ts): cada escena recibe ese dato y,
// en modo reducido, se limita a fundidos de opacidad, sin desplazamientos,
// zoom ni secciones fijadas.
// Todo lo que crea una escena vive en el contexto de matchMedia y se revierte
// solo; lo demás (eventos, clases) lo deshace la función que devuelve.
// Si el visitante cambia de modo, el motor se reconstruye desde cero.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { modoActual } from "./preferencia";
import { hero } from "./hero";
import { manifiesto } from "./manifiesto";
import { llegada } from "./llegada";
import { dia } from "./dia";
import { cartel } from "./cartel";
import { fuera } from "./fuera";
import { pregunta } from "./pregunta";
import { pie } from "./pie";
import { selectorHabitaciones } from "./habitaciones";
import { galeria } from "./galeria";
import { mapa } from "./mapa";
import { mar } from "./mar";
import { cielo } from "./cielo";
import { revelar } from "./revelar";

export interface Condiciones {
  escritorio: boolean;
  movil: boolean;
  reducido: boolean;
}

/** Una escena crea sus animaciones; si toca algo más (clases, eventos), devuelve cómo deshacerlo. */
export type Escena = (raiz: HTMLElement, c: Condiciones) => void | (() => void);

// En el orden en que aparecen en la página. Ya no hay pins de GSAP: las escenas
// largas son sticky (CSS) y GSAP solo traduce el scroll en animación.
const escenas: Record<string, Escena> = {
  hero,
  manifiesto,
  llegada,
  cartel,
  dia,
  habitaciones: selectorHabitaciones,
  galeria,
  mar,
  cielo,
  mapa,
  fuera,
  pregunta,
  pie,
};

const raizDoc = document.documentElement;

if (!raizDoc.dataset.motor) {
  raizDoc.dataset.motor = "cargando";
  gsap.registerPlugin(ScrollTrigger, SplitText);
  // En móvil, la barra de direcciones cambia el alto de la ventana al
  // desplazarse: no se recalcula nada por eso (evita saltos en los pins).
  ScrollTrigger.config({ ignoreMobileResize: true });

  let mm: gsap.MatchMedia | undefined;

  const construir = () => {
    mm?.revert();
    const reducido = modoActual() === "reducido";
    const presentes = Object.keys(escenas).flatMap((nombre) =>
      [...document.querySelectorAll<HTMLElement>(`[data-escena="${nombre}"]`)].map((raiz) => [nombre, raiz] as const),
    );

    mm = gsap.matchMedia();
    mm.add({ escritorio: "(min-width: 48rem)", movil: "(max-width: 47.99rem)" }, (contexto) => {
      const c: Condiciones = { ...(contexto.conditions as { escritorio: boolean; movil: boolean }), reducido };
      const limpiezas = presentes.map(([nombre, raiz]) => escenas[nombre](raiz, c));
      limpiezas.push(revelar(document.body, c));
      ScrollTrigger.sort();
      return () => limpiezas.forEach((limpiar) => limpiar?.());
    });

    raizDoc.dataset.escenas = presentes.map(([n]) => n).join(" ");
    ScrollTrigger.refresh();
  };

  const fuentes = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]);

  fuentes.then(() => {
    // Si el motor llega tarde (red lenta), el aviso del <head> ya quitó
    // «motion» a los 4 s y se está viendo la composición final: lo que ya está
    // a la vista queda como entrado, para no ocultarlo y volver a animarlo.
    if (!raizDoc.classList.contains("motion")) {
      document.querySelectorAll<HTMLElement>('[data-escena="hero"]').forEach((el) => (el.dataset.entrada = "hecha"));
      document.querySelectorAll<HTMLElement>("[data-entrada], [data-revelar]").forEach((el) => {
        if (el.getBoundingClientRect().top < innerHeight) el.dataset.revelado = "si";
      });
    }
    construir();
    // GSAP ya ha fijado los estados iniciales (los fromTo se aplican al
    // crearse): el CSS que ocultaba la entrada antes del primer pintado sobra.
    raizDoc.classList.remove("motion");
    raizDoc.dataset.motion = "listo";
    raizDoc.dataset.motor = "listo";

    document.addEventListener("aurea:movimiento", construir);

    // Las imágenes diferidas cambian alturas: se recalcula al terminar de cargar.
    if (document.readyState === "complete") ScrollTrigger.refresh();
    else window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });

    // Al volver con «atrás» desde la caché del navegador, se recalculan posiciones.
    window.addEventListener("pageshow", (e) => {
      if (e.persisted) ScrollTrigger.refresh();
    });
  });
}
