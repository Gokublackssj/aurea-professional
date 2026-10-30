// Curvas de Aurea: salidas largas y suaves, como la luz que se apaga despacio.
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);

/** Salida larga: arranca decidida y se posa sin rebote. Para entradas. */
export const salida = CustomEase.create("aurea-salida", "M0,0 C0.16,1 0.3,1 1,1");

/** Ida y vuelta pausada: para barridos y cambios de escena. */
export const travesia = CustomEase.create("aurea-travesia", "M0,0 C0.7,0 0.25,1 1,1");

/** Duraciones de la casa, en segundos */
export const tiempo = {
  corto: 0.6,
  medio: 1.1,
  largo: 1.6,
};
