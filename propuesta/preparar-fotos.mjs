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
  "spa-piscina": 1100, "mesa-plato": 900, "mesa-vino": 700, "exp-kayak": 900, "exp-barca": 700, "noche-cielo": 1600,
  "dia-poza": 1600, "dia-orilla": 600, "dia-rocas": 600,
  "dia-desayuno": 600, "dia-mediodia": 1600, "mesa-pescado": 600, "mesa-limones": 600,
  "dia-azotea": 1600, "dia-copa": 600, "dia-ventana-ocaso": 600, "exp-estrellas": 600, "noche-farol": 600,
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
console.log(`${Object.keys(fotos).length} fotos, ${Math.round(total / 1024)} KB en propuesta/fotos/`);
