// Control «Movimiento» del pie (plegado en la línea legal): tres opciones
// (automático, completo, reducido). Al cambiar, se guarda la preferencia y el
// motor se reconstruye. La línea plegada dice cuál está elegida.
import { guardarPreferencia, leerPreferencia, type Preferencia } from "./motion/preferencia";

const opciones = [...document.querySelectorAll<HTMLInputElement>('input[name="movimiento"]')];

const sincronizar = () => {
  const p = leerPreferencia();
  opciones.forEach((o) => (o.checked = o.value === p));
  const actual = document.querySelector<HTMLElement>("[data-movimiento-actual]");
  const elegida = opciones.find((o) => o.checked)?.nextElementSibling?.textContent;
  if (actual && elegida) actual.textContent = elegida;
  const nota = document.querySelector<HTMLElement>("[data-movimiento-nota]");
  if (nota) {
    const reducido = document.documentElement.dataset.movimiento === "reducido";
    nota.textContent =
      p === "auto"
        ? `Sigue a tu sistema: ahora, ${reducido ? "movimiento reducido (solo fundidos)" : "movimiento completo"}.`
        : reducido
          ? "Movimiento reducido: solo fundidos."
          : "Movimiento completo.";
  }
};

opciones.forEach((o) => o.addEventListener("change", () => o.checked && guardarPreferencia(o.value as Preferencia)));
document.addEventListener("aurea:movimiento", sincronizar);
sincronizar();
