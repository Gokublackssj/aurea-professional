// Puesta de sol, comienzo de la hora áurea y fase de la luna para un lugar y
// un día. Ecuación del amanecer simplificada (error de un par de minutos),
// suficiente para «La hoja de hoy».

const rad = Math.PI / 180;
const JD_UNIX = 2440587.5;
const J2000 = 2451545;

const aJuliano = (ms: number) => ms / 86_400_000 + JD_UNIX;
const deJuliano = (j: number) => (j - JD_UNIX) * 86_400_000;

/**
 * Momento (en ms UTC) en que el sol baja a `altura` grados por la tarde, el
 * día civil `fecha` (año, mes 1-12, día). null si no llega a esa altura.
 */
export function solALaAltura(fecha: { año: number; mes: number; dia: number }, latitud: number, longitud: number, altura: number): number | null {
  const mediodia = Date.UTC(fecha.año, fecha.mes - 1, fecha.dia, 12);
  const n = Math.round(aJuliano(mediodia) - J2000 + 0.0008);
  const jMedio = n - longitud / 360;
  const M = (357.5291 + 0.98560028 * jMedio) % 360;
  const C = 1.9148 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 0.0003 * Math.sin(3 * M * rad);
  const lambda = (M + C + 180 + 102.9372) % 360;
  const transito = J2000 + jMedio + 0.0053 * Math.sin(M * rad) - 0.0069 * Math.sin(2 * lambda * rad);
  const senDelta = Math.sin(lambda * rad) * Math.sin(23.4397 * rad);
  const cosDelta = Math.cos(Math.asin(senDelta));
  const cosOmega = (Math.sin(altura * rad) - Math.sin(latitud * rad) * senDelta) / (Math.cos(latitud * rad) * cosDelta);
  if (cosOmega < -1 || cosOmega > 1) return null;
  const omega = Math.acos(cosOmega) / rad;
  return deJuliano(transito + omega / 360);
}

/** Puesta de sol (borde superior en el horizonte, con refracción). */
export const puestaDeSol = (fecha: { año: number; mes: number; dia: number }, lat: number, lon: number) =>
  solALaAltura(fecha, lat, lon, -0.833);

/** Comienzo de la hora áurea: el sol a 6° sobre el horizonte. */
export const horaAurea = (fecha: { año: number; mes: number; dia: number }, lat: number, lon: number) =>
  solALaAltura(fecha, lat, lon, 6);

/** Fase de la luna: edad (0-1, 0 = nueva) e iluminación (0-1). */
export function luna(ms: number): { edad: number; iluminacion: number; nombre: string } {
  const edad = (((aJuliano(ms) - 2451550.1) / 29.530588853) % 1 + 1) % 1;
  const iluminacion = (1 - Math.cos(2 * Math.PI * edad)) / 2;
  const nombres = ["luna nueva", "luna creciente", "cuarto creciente", "gibosa creciente", "luna llena", "gibosa menguante", "cuarto menguante", "luna menguante"];
  return { edad, iluminacion, nombre: nombres[Math.round(edad * 8) % 8] };
}

/** Año, mes y día civiles de `ms` en la zona horaria dada. */
export function diaCivil(ms: number, zona: string): { año: number; mes: number; dia: number } {
  const partes = new Intl.DateTimeFormat("en-CA", { timeZone: zona, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(ms);
  const valor = (t: string) => Number(partes.find((p) => p.type === t)?.value);
  return { año: valor("year"), mes: valor("month"), dia: valor("day") };
}

/** Hora en formato 24 h en la zona dada, p. ej. "18:42". */
export const hora = (ms: number, zona: string) =>
  new Intl.DateTimeFormat("es-ES", { timeZone: zona, hour: "2-digit", minute: "2-digit", hour12: false }).format(ms);
