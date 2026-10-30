// Fila horizontal «A la carta»: los botones avanzan o retroceden una columna
// y la barra muestra cuánto se ha recorrido. El desplazamiento es el nativo
// del navegador (rueda, arrastre táctil, teclado).
const fila = document.querySelector<HTMLElement>(".carta-fila");
const barra = document.querySelector<HTMLElement>(".carta-barra span");
const atras = document.querySelector<HTMLButtonElement>("[data-fila='atras']");
const adelante = document.querySelector<HTMLButtonElement>("[data-fila='adelante']");

if (fila && barra && atras && adelante) {
  const paso = () => {
    const primera = fila.querySelector("li");
    return primera ? primera.getBoundingClientRect().width + parseFloat(getComputedStyle(fila).columnGap || "0") : fila.clientWidth;
  };

  const actualizar = () => {
    const recorrido = fila.scrollWidth - fila.clientWidth;
    const avance = recorrido > 0 ? fila.scrollLeft / recorrido : 1;
    const visible = fila.clientWidth / fila.scrollWidth;
    barra.style.setProperty("--avance", `${Math.max(visible, avance) * 100}%`);
    atras.disabled = fila.scrollLeft <= 1;
    adelante.disabled = fila.scrollLeft >= recorrido - 1;
  };

  const suave = (): ScrollBehavior => (matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");
  atras.addEventListener("click", () => fila.scrollBy({ left: -paso(), behavior: suave() }));
  adelante.addEventListener("click", () => fila.scrollBy({ left: paso(), behavior: suave() }));
  fila.addEventListener("scroll", actualizar, { passive: true });
  window.addEventListener("resize", actualizar);
  actualizar();
}
