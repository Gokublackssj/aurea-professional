// Cabecera fija: arriba del todo, transparente; al bajar se esconde y al subir
// vuelve con fondo. En el inicio, mientras se ve el hero, se queda sobre la foto.
// Solo cambia clases (las transiciones están en CSS y se anulan en modo reducido).
const cabecera = document.querySelector<HTMLElement>("[data-cabecera]");

if (cabecera) {
  let ultimo = window.scrollY;
  let pendiente = false;
  const sobreFoto = cabecera.classList.contains("sobre-foto");

  const actualizar = () => {
    pendiente = false;
    const y = window.scrollY;
    const umbral = sobreFoto ? window.innerHeight * 0.85 : 80;
    const abierto = cabecera.querySelector(".menu.abierto");
    if (abierto) return;
    if (y <= 4) {
      cabecera.classList.remove("con-fondo", "escondida");
    } else if (y > ultimo && y > umbral) {
      cabecera.classList.add("escondida");
    } else if (y < ultimo) {
      cabecera.classList.remove("escondida");
      cabecera.classList.toggle("con-fondo", !sobreFoto || y > window.innerHeight * 0.6);
    }
    ultimo = y;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!pendiente) {
        pendiente = true;
        requestAnimationFrame(actualizar);
      }
    },
    { passive: true },
  );
  actualizar();
}
