/**
 * Ruta interna respetando BASE (p. ej. "/aurea-professional/" al publicar en
 * una ruta de proyecto). Acepta "habitaciones" o "/habitaciones".
 */
export function ruta(destino = ""): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, "");
  const limpio = destino.replace(/^\/+/, "");
  return `${base}/${limpio}`;
}

/** true si `actual` (Astro.url.pathname) está dentro de la sección `destino`. */
export function enSeccion(actual: string, destino: string): boolean {
  const normal = (r: string) => r.replace(/\/+$/, "") || "/";
  const a = normal(actual);
  const d = normal(ruta(destino));
  return d === normal(ruta("")) ? a === d : a === d || a.startsWith(`${d}/`);
}
