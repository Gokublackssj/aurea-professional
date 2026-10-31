# Recursos del prototipo: procedencia y licencias

Los archivos no se versionan. Se regeneran así:

```
node propuesta/recursos.mjs       # descarga de Pexels + codificación del vídeo (necesita ffmpeg)
node propuesta/preparar-fotos.mjs # WebP optimizados en propuesta/fotos/
```

Las fotografías de `src/assets/fotos/` (Unsplash) son las del sitio; sus créditos están en
`src/data/fotos.ts`. Aquí solo figura lo que se ha añadido en el prototipo.

## Licencia de Pexels

Todo lo nuevo procede de Pexels, bajo la [licencia de Pexels](https://www.pexels.com/license/):

- Uso gratuito, también comercial y en sitios web.
- Atribución no obligatoria; aquí se acredita igualmente.
- No se permite vender copias sin modificar ni redistribuir los archivos en otros bancos de imágenes.

Autor y dimensiones de cada recurso se comprobaron en su página de Pexels el 31-10-2026.

## Fotos de habitaciones: una sesión por galería

| Habitación | Sesión | Fotos (archivo local → id de Pexels) |
|---|---|---|
| Estudio Jardín | [Keegan Checks](https://www.pexels.com/@keeganjchecks/), hotel boutique en Jambiani (Zanzíbar): una habitación | estudio-cama → 39836723 · estudio-patio → 39836727 · estudio-sofa → 39836728 · estudio-armario → 39836721 |
| Suite Terraza | Keegan Checks, misma sesión: otra habitación, con piscina privada | terraza-piscina-privada → 39836720 · terraza-dormitorio → 39836703 · terraza-lavabos → 39836700 · terraza-mesa-piscina → 39836726 · terraza-butaca → 39836711 |
| Suite Mirador | [Rosie C](https://www.pexels.com/@rosie-c-94104461/), una habitación frente al mar (3024×4032, tomadas con móvil) | mirador-ventanal → 14746021 · mirador-atardecer → 14746028 · mirador-balcon → 14746029 · mirador-banera → 14746024 |
| Residencia Aurea | [Ahmet Çötür](https://www.pexels.com/@ahmetcotur/), una villa con olivos sobre el mar (6720×4480) | residencia-piscina → 28054897 · residencia-salon-villa → 28054893 · residencia-dormitorio → 28054888 · residencia-terraza → 28054889 · residencia-bano-villa → 28054890 · residencia-copas → 28054879 |

Página de cada foto: `https://www.pexels.com/photo/<id>/`.

Descartadas por repetir el encuadre de otra foto de la misma galería:

- 39836716 (cama de la Suite Terraza).
- 39836722 (cama del Estudio).
- 14746026 (ventanal de la Suite Mirador).

La 28054886 también se descartó, porque ya no existe en Pexels (404).

Las galerías combinan tres sesiones distintas, pero cada una procede de una sola. El estuco terracota de Zanzíbar se aleja de la paleta marfil y basalto de Aurea. Las fotos de la villa tienen estilo de anuncio inmobiliario y las de Rosie C, calidad de móvil.

## Otra foto nueva

| Uso | Archivo | Autor | Id |
|---|---|---|---|
| Un día, 21:30 (secundaria) | noche-poza-estrellas | [Daniel Torobekov](https://www.pexels.com/@alohaphotostudio/) | [14237715](https://www.pexels.com/photo/14237715/) (2160×3238) |

## Vídeo del mar

| | |
|---|---|
| Clip | [«Serene Ocean Sunset with Vibrant Colors»](https://www.pexels.com/video/serene-ocean-sunset-with-vibrant-colors-39798335/) |
| Autor | [Rahime Gül](https://www.pexels.com/@rahimegul/) |
| Original | 1920×1080, 59,94 fps, 16 s, 18,1 MB |
| Licencia | Pexels (arriba) |
| Tratamiento | ffmpeg 9.0.2 (Gyan, instalado con winget para el usuario, fuera del proyecto) |
| Escritorio | `mar-ocaso-1280.mp4`: 1280×720, 24 fps, H.264, sin audio, 2174 KB |
| Móvil | `mar-ocaso-movil.mp4`: recorte central 3:4, 540×720, 958 KB |

Detalles del tratamiento:

- **Bucle:** el último segundo y medio se funde con el principio, así que el vídeo final dura 14,5 s.
- **Color:** saturación al 86 %, el mismo tratamiento que las fotos.
- **Pósteres:** `mar-ocaso-1280.webp` y `mar-ocaso-movil.webp`, fotogramas del segundo 2.

### Opciones de vídeo descartadas

| Clip | Motivo |
|---|---|
| Pexels 38329622 (umut izgi, la opción 1 del plan) | El casco de un barco con defensas de neumáticos ocupa una esquina todo el tiempo y no hay horizonte |
| Mixkit 11222 y 27196 | La descarga gratuita tiene la «Mixkit Restricted License», solo para uso personal no comercial |
| Pexels 6989126 | Movimiento de dron que empieza en negro (no admite bucle) y un barco en el plano |
| Pexels 32907670, 33433211 y 39321129 | Verticales (2160×3840) |
| Pexels 33952832 (Ahmed) | Válido, pero es textura de agua sin horizonte y dura solo 8 s |

### Nota sobre Unsplash

Se intentó buscar series de habitaciones en Unsplash. Su web deniega el acceso a navegadores automatizados, y no se intentó saltar esa protección. Por eso la búsqueda se hizo en Pexels.
