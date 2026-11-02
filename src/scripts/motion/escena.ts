// Las escenas sticky ocupan la pantalla entera: mientras duran, la cabecera se
// retira para no tapar la composición (src/scripts/cabecera.ts la devuelve al
// subir). Se usa como onToggle de su ScrollTrigger.
export const escenaFijada = (st: { isActive: boolean }) => {
  document.querySelector<HTMLElement>("[data-cabecera]")?.classList.toggle("en-escena", st.isActive);
};
