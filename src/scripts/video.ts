// Vídeo del mar (Experiencias). Se carga al acercarse (preload="none" no
// descarga nada hasta entonces), se reproduce solo cuando se ve y se pausa al
// salir de pantalla. Botón de pausa siempre disponible (WCAG 2.2.2).
// Con movimiento reducido, ahorro de datos o una red lenta: solo el póster.
import { modoActual } from "./motion/preferencia";

const video = document.querySelector<HTMLVideoElement>(".mar-video");
const pausa = document.querySelector<HTMLButtonElement>(".mar-pausa");

if (video && pausa) {
  // El póster lo elige el <picture> de debajo con la misma consulta
  const esMovil = matchMedia("(max-width: 47.99rem)").matches;

  const red = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  const soloPoster = () => modoActual() === "reducido" || !!red?.saveData || /2g|3g/.test(red?.effectiveType ?? "");

  let visible = false;
  let pausadoPorVisitante = false;
  let cargado = false;

  const reproducir = () => {
    if (visible && !pausadoPorVisitante && cargado && !soloPoster()) video.play().catch(() => {});
  };
  const etiqueta = () => (pausa.textContent = pausadoPorVisitante ? "Reanudar vídeo" : "Pausar vídeo");

  const preparar = () => {
    if (soloPoster()) {
      video.pause();
      pausa.hidden = true;
      return;
    }
    pausa.hidden = false;
    reproducir();
  };

  if ("IntersectionObserver" in window) {
    const cerca = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || soloPoster()) return;
        // El orden de los dos observadores no está garantizado: al asignar la
        // fuente se fuerza la carga y se reproduce si ya está a la vista.
        video.preload = "auto";
        video.src = (esMovil ? video.dataset.movil : video.dataset.escritorio) ?? "";
        video.load();
        cargado = true;
        reproducir();
        cerca.disconnect();
      },
      { rootMargin: "100% 0px" },
    );
    cerca.observe(video);
    new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) reproducir();
        else video.pause();
      },
      { threshold: 0.25 },
    ).observe(video);
  }

  video.addEventListener("loadeddata", reproducir);
  video.addEventListener("play", etiqueta);
  video.addEventListener("pause", etiqueta);
  pausa.addEventListener("click", () => {
    pausadoPorVisitante = !video.paused;
    if (pausadoPorVisitante) video.pause();
    else reproducir();
    etiqueta();
  });
  // Si el visitante cambia el modo de movimiento en el pie, se respeta al momento
  document.addEventListener("aurea:movimiento", preparar);
  preparar();
}
