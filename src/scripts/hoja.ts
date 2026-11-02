// «La hoja de hoy»: sustituye la frase general por la hora real de la puesta
// de sol y la luna de esta noche en Cabo Lumbre. Sin JavaScript se queda la
// frase general, que sigue siendo cierta.
import { sitio } from "../data/sitio";
import { diaCivil, hora, horaAurea, luna, puestaDeSol } from "../lib/sol";

const { latitud, longitud, zonaHoraria } = sitio;
const ahora = Date.now();
const hoy = diaCivil(ahora, zonaHoraria);

const puesta = puestaDeSol(hoy, latitud, longitud);
const aurea = horaAurea(hoy, latitud, longitud);
const fase = luna(ahora + 4 * 3_600_000);

for (const el of document.querySelectorAll<HTMLElement>("[data-hoja='sol']")) {
  if (puesta === null || aurea === null) continue;
  el.textContent =
    ahora < puesta
      ? `Hoy el sol se pone a las ${hora(puesta, zonaHoraria)}. Desde las ${hora(aurea, zonaHoraria)}, la terraza se queda en silencio y la casa apaga sus luces.`
      : `Hoy el sol se puso a las ${hora(puesta, zonaHoraria)}. Desde las ${hora(aurea, zonaHoraria)}, la terraza se quedó en silencio y la casa apagó sus luces.`;
}

// La hora del momento «hora áurea» (reloj de la escena y bloques): la de hoy
if (aurea !== null) {
  const hhmm = hora(aurea, zonaHoraria).padStart(5, "0");
  for (const el of document.querySelectorAll<HTMLElement>("[data-hoja-hora='aurea']")) el.textContent = hhmm;
  for (const el of document.querySelectorAll<HTMLElement>("[data-hoja-digito]")) el.textContent = hhmm[Number(el.dataset.hojaDigito)] ?? el.textContent;
}

for (const el of document.querySelectorAll<HTMLElement>("[data-hoja='luna']")) {
  const porcentaje = Math.round(fase.iluminacion * 100);
  const cielo = porcentaje < 50 ? "Una noche buena para la Vía Láctea." : "Una noche para mirar la luna con el telescopio.";
  el.textContent = `Sin una farola en nueve kilómetros. Esta noche, ${fase.nombre} con un ${porcentaje} % iluminado. ${cielo}`;
}
