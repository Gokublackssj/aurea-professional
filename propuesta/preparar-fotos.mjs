// Genera las fotos del prototipo (WebP optimizado) a partir de src/assets/fotos.
// No se versionan: se regeneran con  node propuesta/preparar-fotos.mjs
import sharp from "sharp";
import { mkdirSync, statSync } from "node:fs";

// nombre → ancho máximo
const fotos = {
  "casa-piscina": 1920,
  "llegada-costa": 2000,
  "material-basalto": 900,
  "material-lino": 900,
  "estudio-dormitorio": 1400, "estudio-bano": 700, "estudio-luz": 700,
  "mirador-ventana": 1400, "mirador-bano": 700, "mirador-noche": 700,
  "terraza-mesa": 1400, "terraza-piscina": 700, "terraza-ducha": 700,
  "residencia-salon": 1400, "residencia-azotea": 700, "residencia-bano": 700,
  "spa-piscina": 1100, "mesa-plato": 900, "mesa-vino": 700, "exp-kayak": 900, "exp-barca": 700, "noche-cielo": 2000,
  "dia-poza": 1600, "dia-orilla": 600, "dia-rocas": 600,
  "dia-desayuno": 600, "dia-mediodia": 1600, "mesa-pescado": 600, "mesa-limones": 600,
  "dia-azotea": 1600, "dia-copa": 600, "dia-ventana-ocaso": 600, "exp-estrellas": 1400, "noche-farol": 600,
  "costa-playa-negra": 900, "casa-escalera": 900, "costa-barca": 900, "exp-bano": 900, "exp-vina": 900, "spa-tumbonas": 900,
  "costa-acantilado": 1920,
};

mkdirSync(new URL("./fotos/", import.meta.url), { recursive: true });
let total = 0;
for (const [nombre, ancho] of Object.entries(fotos)) {
  const destino = new URL(`./fotos/${nombre}.webp`, import.meta.url);
  await sharp(`src/assets/fotos/${nombre}.jpg`).resize({ width: ancho, withoutEnlargement: true }).webp({ quality: 72 }).toFile(destino.pathname.slice(1));
  total += statSync(destino).size;
}
// Fotos nuevas de Pexels (las descarga recursos.mjs en propuesta/fuentes/).
// Las de habitaciones llevan además una miniatura de 320 px para la tira de fotos.
const { fotosPexels } = await import("./recursos-lista.mjs");
let nuevas = 0;
for (const nombre of Object.keys(fotosPexels)) {
  const origen = new URL(`./fuentes/${nombre}.jpg`, import.meta.url).pathname.slice(1);
  const ancho = nombre.startsWith("noche-") ? 700 : 1600;
  for (const [sufijo, w, q] of [["", ancho, 72], ...(nombre.startsWith("noche-") ? [] : [["-mini", 320, 64]])]) {
    const destino = new URL(`./fotos/${nombre}${sufijo}.webp`, import.meta.url);
    await sharp(origen).resize({ width: w, withoutEnlargement: true }).webp({ quality: q }).toFile(destino.pathname.slice(1));
    total += statSync(destino).size;
  }
  nuevas++;
}
console.log(`${Object.keys(fotos).length + nuevas} fotos, ${Math.round(total / 1024)} KB en propuesta/fotos/`);
