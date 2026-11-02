# Integración de la propuesta en el sitio principal

Rama `integracion`, desde `main` en 9130771 (la propuesta, `propuesta/`, no se ha
modificado). Cada etapa es un commit que se puede revisar o revertir por separado.

| Commit | Etapa |
|---|---|
| 1601c64 | 1. Fundamentos: paleta clara (marfil, teal, latón), Fraunces y Manrope, cabecera fija que se esconde al bajar, pie y llamada final en noche, mapa recoloreado |
| dfaeefe | 2. Habitaciones: galerías de una sola sesión por habitación (4–6 fotos de Pexels), textos que coinciden con las fotos, explorador con miniaturas y deslizamiento, mosaico y visor en el detalle, créditos de los dos bancos |
| 4cf7992 | 3. Inicio: apertura del hero, manifiesto palabra a palabra con cifras, banda de cine de La llegada, Un día en Aurea con reloj de ruedas |
| a90245c | 4. Experiencias: vídeo del mar (carga diferida, pausa, póster en reducido) y expansión circular del cielo |
| b71a3af | 5. Reservas: demostración en cinco pasos con validación por paso y confirmación marcada como demo |
| 412d162 | 6. Pruebas al día; desborde a 320 px en Habitaciones; clics rápidos en la galería |
| d5c4e30 | 7. Lighthouse: fotos de galería no visibles sin descargar, CLS de Reservas, contraste, aria en párrafos |

## Qué cambia para el visitante

- **Dirección visual.** Fondo marfil con bloques de noche (teal muy oscuro) para el
  pie, la llamada final, el cartel y Un día; latón para las acciones. Titulares en
  Fraunces con eje óptico, texto en Manrope.
- **Movimiento.** Escenas largas con `position: sticky` y GSAP solo para traducir el
  scroll en animación: sin pins, sin ajuste automático, el scroll es siempre el del
  navegador. Modo reducido (sistema o control del pie): fundidos, sin escenas fijas,
  Un día en lista.
- **Habitaciones.** Cada habitación tiene su propia sesión de fotos, así que todas
  las imágenes son del mismo espacio, y los textos describen lo que se ve (estuco
  terracota y palmeras, doble lavabo bajo el arco, villa entre olivos, balcón de
  madera). CTA: «Elegir esta habitación».
- **Reservas.** Fechas → huéspedes → habitación → datos → confirmación. Estancia
  mínima según las políticas, habitaciones deshabilitadas si el grupo no cabe,
  resumen vivo con la hora de la puesta de sol. La confirmación dice que no se ha
  hecho ninguna reserva ni pago y solo abre el correo si el visitante lo pide. Sin
  JavaScript, el formulario completo se envía por mailto como antes.
- **Se conserva todo lo anterior:** políticas, tratamientos, menú, A la carta,
  mapa, puesta de sol, «Siempre incluido», visor, créditos, control de movimiento y
  la hoja de hoy. Ninguna foto se ha borrado del disco.

## Verificación

- `astro check && astro build`: 0 errores, 0 avisos.
- Playwright: 130 pruebas pasan y 2 se omiten (la vista flotante del cartel, que
  solo existe con ratón), en tres proyectos: escritorio 1440, móvil 390 y móvil 320.
  Las pruebas fallan ante cualquier error de consola.
- Sin desbordamiento horizontal a 320 px en ninguna página.
- Lighthouse 13.6 sobre la build (rendimiento / accesibilidad / buenas prácticas /
  SEO):

| Página | Móvil | Escritorio |
|---|---|---|
| Inicio | 98 / 96 / 100 / 66 | 100 / 97 / 100 / 66 |
| Habitaciones | 94 / 97 / 100 / 66 | 100 / 97 / 100 / 66 |
| Experiencias | 91 / 96 / 100 / 66 | 100 / 96 / 100 / 66 |
| Reservas | 98 / 100 / 100 / 66 | 100 / 100 / 100 / 66 |

  - SEO 66 es intencionado: `robots.txt` bloquea el rastreo porque es una demo de un
    negocio ficticio.
  - Lo que queda en accesibilidad son las líneas decorativas de «¿Cuándo llegas?»
    (`aria-hidden`; el título accesible está aparte), que se funden con el scroll
    desde 0,15 de opacidad. Lighthouse las mide en reposo.

## Pendiente

- **La llegada:** la foto `llegada-costa.jpg` muestra un aparcamiento con coches,
  que contradice «pista de picón». Conviene sustituirla.
- **Estilo de algunas fotos de habitación:** la sesión del Estudio es de un hotel
  de Zanzíbar (terracota); la Residencia tiene aire de anuncio inmobiliario; la Suite
  Mirador está hecha con móvil. Son coherentes dentro de cada habitación, no entre
  habitaciones.
- **Catálogo:** diez fotos antiguas de habitación ya no aparecen en ninguna página
  (`estudio-dormitorio`, `estudio-bano`, `mirador-bano`, `mirador-noche`,
  `terraza-mesa`, `terraza-piscina`, `terraza-ducha`, `residencia-salon`,
  `residencia-azotea` y `residencia-bano`). Siguen en `src/assets/fotos/`, en
  `fotos.ts` y en los créditos; no se han borrado. Quitarlas aligeraría la build.
- **Vídeo en móvil:** el HTML anuncia el póster de escritorio y el script lo cambia
  por el de móvil, así que en móvil se descargan los dos pósteres (unos 40 KB de
  más).
- **Integrar en `main`:** la rama `integracion` no se ha fusionado ni publicado.
