// Descarga los recursos nuevos del prototipo desde Pexels y prepara el vídeo.
// Fotos → propuesta/fuentes/<nombre>.jpg (luego las optimiza preparar-fotos.mjs)
// Vídeo → propuesta/video/ (recodificado con ffmpeg: sin audio, bucle sin corte)
// No se versionan; la procedencia y la licencia de cada recurso están en CREDITOS.md.
// Uso: node propuesta/recursos.mjs   (ffmpeg en el PATH o en la variable FFMPEG)
import { mkdirSync, existsSync, writeFileSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { homedir } from "node:os";
import sharp from "sharp";
import { fotosPexels } from "./recursos-lista.mjs";

const video = { id: 39798335, nombre: "mar-ocaso" }; // Rahime Gül

const raiz = new URL("./", import.meta.url);
const ruta = (rel) => decodeURIComponent(new URL(rel, raiz).pathname).replace(/^\/([A-Za-z]:)/, "$1");
mkdirSync(ruta("fuentes/"), { recursive: true });
mkdirSync(ruta("video/"), { recursive: true });

const bajar = async (url, destino) => {
  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, redirect: "follow" });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  writeFileSync(destino, Buffer.from(await r.arrayBuffer()));
};

for (const [nombre, id] of Object.entries(fotosPexels)) {
  const destino = ruta(`fuentes/${nombre}.jpg`);
  if (existsSync(destino)) continue;
  await bajar(`https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=2400`, destino);
  console.log("foto", nombre, id);
}

// Vídeo: versión 1920×1080 de Pexels → dos codificaciones propias
const original = ruta(`fuentes/${video.nombre}-original.mp4`);
if (!existsSync(original)) {
  await bajar(`https://www.pexels.com/download/video/${video.id}/?h=1080&w=1920`, original);
  console.log("vídeo original", Math.round(statSync(original).size / 1024), "KB");
}
const ffmpeg = process.env.FFMPEG || (() => {
  try { execFileSync("ffmpeg", ["-version"], { stdio: "ignore" }); return "ffmpeg"; } catch {}
  return `${homedir()}/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe`;
})();
// Bucle sin corte: el último segundo y medio se funde con el principio.
// Mismo tratamiento de color que las fotos (--grado): algo menos de saturación.
const T = 16.0, d = 1.5;
const codificar = (salida, filtroTamano, crf) => {
  const grafo = `[0:v]fps=24,${filtroTamano},eq=saturation=0.86:contrast=1.03:brightness=-0.01,format=yuv420p,split[x][y];` +
    `[x]trim=start=${d}:end=${T},setpts=PTS-STARTPTS[a];[y]trim=start=0:end=${d},setpts=PTS-STARTPTS[b];` +
    `[a][b]xfade=transition=fade:duration=${d}:offset=${T - 2 * d},format=yuv420p[v]`;
  execFileSync(ffmpeg, ["-y", "-loglevel", "error", "-i", original, "-filter_complex", grafo, "-map", "[v]", "-an",
    "-c:v", "libx264", "-preset", "slow", "-crf", String(crf), "-profile:v", "high", "-movflags", "+faststart", salida]);
  console.log("vídeo", salida.split("/").pop(), Math.round(statSync(salida).size / 1024), "KB");
};
codificar(ruta(`video/${video.nombre}-1280.mp4`), "scale=1280:-2", 29);
// Móvil: recorte central 3:4 (la escena es vertical en el teléfono)
codificar(ruta(`video/${video.nombre}-movil.mp4`), "crop=810:1080,scale=540:720", 29);
// Pósteres: un fotograma de cada versión, en WebP
for (const v of ["1280", "movil"]) {
  const png = ruta(`fuentes/${video.nombre}-${v}.png`);
  execFileSync(ffmpeg, ["-y", "-loglevel", "error", "-ss", "2", "-i", ruta(`video/${video.nombre}-${v}.mp4`), "-frames:v", "1", png]);
  await sharp(png).webp({ quality: 74 }).toFile(ruta(`video/${video.nombre}-${v}.webp`));
}
console.log("listo");
