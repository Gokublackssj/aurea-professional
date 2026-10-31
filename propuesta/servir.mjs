// Servidor local para revisar la propuesta (fase 2), sin dependencias.
// Sirve la raíz del proyecto en http://127.0.0.1:4340/ porque el prototipo
// usa GSAP desde node_modules. Solo lectura (GET/HEAD) y solo en 127.0.0.1.
// Uso, desde la raíz del proyecto:  node propuesta/servir.mjs
import { createServer } from "node:http";
import { createReadStream, statSync } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(fileURLToPath(new URL("..", import.meta.url)));
const puerto = 4340;
const tipos = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".json": "application/json",
};

createServer((peticion, respuesta) => {
  if (peticion.method !== "GET" && peticion.method !== "HEAD") {
    respuesta.writeHead(405).end();
    return;
  }
  let ruta = decodeURIComponent(new URL(peticion.url ?? "/", "http://x").pathname);
  if (ruta.endsWith("/")) ruta += "index.html";
  const archivo = normalize(join(raiz, ruta));
  // Nada fuera del proyecto
  if (archivo !== raiz && !archivo.startsWith(raiz + sep)) {
    respuesta.writeHead(403).end();
    return;
  }
  try {
    const info = statSync(archivo);
    if (!info.isFile()) throw new Error("no es un archivo");
    respuesta.writeHead(200, { "Content-Type": tipos[extname(archivo)] ?? "application/octet-stream", "Content-Length": info.size, "Cache-Control": "no-cache" });
    if (peticion.method === "HEAD") respuesta.end();
    else createReadStream(archivo).pipe(respuesta);
  } catch {
    respuesta.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("No encontrado");
  }
}).listen(puerto, "127.0.0.1", () => {
  console.log(`Propuesta: http://127.0.0.1:${puerto}/propuesta/`);
  console.log(`Movimiento reducido: http://127.0.0.1:${puerto}/propuesta/?movimiento=reducido`);
});
