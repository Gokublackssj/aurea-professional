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

## Después de la integración

Correcciones tras las auditorías (Claude y Codex) y refinamientos pedidos al navegar
por el sitio. Cada uno es un commit con su prueba de regresión.

| Commit | Cambio |
|---|---|
| 4f0f160, e7b5736 | Póster del mar responsivo (un solo póster por pantalla, también sin JavaScript) |
| 84924d3 | La build ya no copia 13 JPEG sin uso; sus créditos siguen en `fotosSinUso` |
| 0c49a2b, 5c8ad55 | Zoom de las fotos solo con puntero que pasa por encima; el de la ficha vuelve a funcionar |
| f529eac | La prueba del vídeo mira fotogramas reales (y quita un destello al llegar al mar) |
| d3de99d | El primer cambio de habitación ya no enseña la nueva antes del barrido |
| 2bd2136 | Con red lenta, el hero y las cabeceras no se ocultan después de verse |
| 022a1e8 | La preferencia de movimiento, plegada en la línea legal del pie |
| 51f0958 | Los nombres del cartel del inicio ya no abren fotos al pasar |
| 806093d | Nueva frase final de La llegada |

Pruebas: 171 en tres proyectos (escritorio 1440, móvil 390 y 320 px), sin omitidas.
Codex propuso en `codex/auditoria-aurea` (506184f) que cada prueba use el tamaño de
su proyecto, un recorrido de navegación móvil y un puerto propio por worktree
(`docs/navegacion-movil.md` en esa rama). Integrado a prueba sobre `integracion`:
un único conflicto, ya resuelto, y 163 pruebas superadas con 14 omitidas por no
corresponder al dispositivo. Pendiente de autorización.

## Pendiente

- **La llegada:** la foto `llegada-costa.jpg` muestra un aparcamiento con coches,
  que contradice «pista de picón». Conviene sustituirla.
- **Estilo de algunas fotos de habitación:** la sesión del Estudio es de un hotel
  de Zanzíbar (terracota); la Residencia tiene aire de anuncio inmobiliario; la Suite
  Mirador está hecha con móvil. Son coherentes dentro de cada habitación, no entre
  habitaciones.
- **Navegación a 320 px:** el aviso «Transition was aborted… Viewport size changed»
  de Chrome no se ha reproducido de forma natural; la cobertura de Codex lo vigila.
- **Con red muy lenta** (el motor tarda más de 4 s) se ve la composición final del
  hero, sin su animación de entrada.
- **Integrar en `main` y publicar:** la rama `integracion` no se ha fusionado ni
  publicado.
