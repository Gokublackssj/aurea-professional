// Botón «Menú» de pantallas estrechas: abre y cierra la navegación, y la
// cierra con Escape o al pulsar fuera.
const boton = document.querySelector<HTMLButtonElement>(".menu-boton");
const menu = document.getElementById("menu-principal");

if (boton && menu) {
  const fijar = (abierto: boolean) => {
    boton.setAttribute("aria-expanded", String(abierto));
    boton.textContent = abierto ? "Cerrar" : "Menú";
    menu.classList.toggle("abierto", abierto);
  };

  boton.addEventListener("click", () => fijar(boton.getAttribute("aria-expanded") !== "true"));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && boton.getAttribute("aria-expanded") === "true") {
      fijar(false);
      boton.focus();
    }
  });

  document.addEventListener("click", (e) => {
    const destino = e.target as Node;
    if (!menu.contains(destino) && !boton.contains(destino)) fijar(false);
  });
}
