// Preferencia de movimiento del visitante: «auto» sigue al sistema operativo
// (prefers-reduced-motion), «completo» y «reducido» lo fuerzan. Se guarda en
// localStorage y se refleja en <html> antes del primer pintado (script en
// línea de Base.astro) como data-preferencia y data-movimiento.
// Cuando cambia, se emite «aurea:movimiento» y el motor reconstruye todo.

export type Preferencia = "auto" | "completo" | "reducido";
export type Modo = "completo" | "reducido";

const CLAVE = "aurea-movimiento";
const sistema = matchMedia("(prefers-reduced-motion: reduce)");
const raiz = document.documentElement;

export function leerPreferencia(): Preferencia {
  try {
    const guardada = localStorage.getItem(CLAVE);
    if (guardada === "completo" || guardada === "reducido" || guardada === "auto") return guardada;
  } catch {
    // Sin almacenamiento (modo privado estricto): se sigue al sistema.
  }
  return "auto";
}

export const modoDe = (p: Preferencia): Modo => (p === "reducido" || (p === "auto" && sistema.matches) ? "reducido" : "completo");

export const modoActual = (): Modo => (raiz.dataset.movimiento === "reducido" ? "reducido" : "completo");

// Se avisa siempre (aunque el modo no cambie): el control de la página
// también necesita reflejar la preferencia elegida.
function aplicar(p: Preferencia) {
  raiz.dataset.preferencia = p;
  raiz.dataset.movimiento = modoDe(p);
  document.dispatchEvent(new CustomEvent("aurea:movimiento", { detail: { preferencia: p, modo: raiz.dataset.movimiento } }));
}

export function guardarPreferencia(p: Preferencia) {
  try {
    if (p === "auto") localStorage.removeItem(CLAVE);
    else localStorage.setItem(CLAVE, p);
  } catch {
    // Se aplica igualmente para esta visita.
  }
  aplicar(p);
}

// Si el visitante sigue al sistema y cambia el ajuste del sistema con la
// página abierta, la web cambia con él.
sistema.addEventListener("change", () => {
  if (leerPreferencia() === "auto") aplicar("auto");
});
