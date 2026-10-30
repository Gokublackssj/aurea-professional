// Control «Movimiento» del pie: tres opciones (automático, completo,
// reducido). Al cambiar, se guarda la preferencia y el motor se reconstruye.
import { guardarPreferencia, leerPreferencia, type Preferencia } from "./motion/preferencia";

const opciones = [...document.querySelectorAll<HTMLInputElement>('input[name="movimiento"]')];

const sincronizar = () => {
  const p = leerPreferencia();
  opciones.forEach((o) => (o.checked = o.value === p));
  const nota = document.querySelector<HTMLElement>("[data-movimiento-nota]");
  if (nota) {
    nota.textContent =
      document.documentElement.dataset.movimiento === "reducido"
        ? "Ahora: movimiento reducido, solo fundidos."
        : "Ahora: movimiento completo.";
  }
};

opciones.forEach((o) => o.addEventListener("change", () => o.checked && guardarPreferencia(o.value as Preferencia)));
document.addEventListener("aurea:movimiento", sincronizar);
sincronizar();
