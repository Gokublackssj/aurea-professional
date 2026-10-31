# Aurea — Fase 1: auditoría técnica y visual

Fecha: 31 de octubre de 2026 · Punto de partida: commit `5c66865`.

## 1. Arquitectura actual

| Pieza | Estado |
|---|---|
| Framework | Astro 7.4.2, salida estática, TypeScript estricto. 10 rutas (inicio, habitaciones + 4 fichas, experiencias, reservas, créditos, 404). |
| Estilos | CSS propio por componente; tokens en `src/styles/tokens.css` (paleta oscura «basalto/cal/oro»). Sin framework CSS. |
| Tipografía | Bodoni Moda + Jost, servidas localmente con Fontsource. |
| Movimiento | Motor propio sobre GSAP 3.15 (`src/scripts/motion/`): un `gsap.matchMedia()`, 11 escenas por `data-escena`, revelados por `data-revelar`, preferencia Automático/Completo/Reducido, View Transitions entre páginas. |
| Datos | `src/data/` (habitaciones, fotos, sitio, navegación). |
| Pruebas | Playwright, 117 pruebas en 3 tamaños (escritorio, 390 px, 320 px) y 2 modos de movimiento. |
| Dependencias | astro, gsap, 2 fuentes de Fontsource; dev: @astrojs/check, @playwright/test, typescript. Ninguna sobra. |

**Se conserva:** Astro, el motor de movimiento (matchMedia, limpieza, preferencia de movimiento, revelados una sola vez), el sistema de fotos (`Foto.astro`, AVIF/WebP, nombres de transición), los datos y la batería de pruebas.

## 2. Rendimiento medido (build de producción, Chrome real)

Laboratorio con Playwright; móvil con 4G lenta (1,6 Mb/s, 150 ms) y CPU ×4.

| Página | LCP escritorio | LCP móvil | CLS móvil | Peso móvil |
|---|---|---|---|---|
| Inicio | 708 ms | **3 836 ms** ✗ | 0,000 | 875 KB |
| Habitaciones | 516 ms | **2 712 ms** ✗ | **0,077** | 870 KB |
| Experiencias | 492 ms | **4 844 ms** ✗ | 0,006 | 404 KB |
| Reservas | 616 ms | 2 636 ms ✗ | 0,000 | 261 KB |

Causas identificadas:

1. **Contenido principal oculto hasta que arranca JavaScript.** El nombre del hero (inicio) y la cabecera con `data-entrada` (experiencias) empiezan con `visibility: hidden` y esperan al motor (52 KB gzip de GSAP + fuentes). En móvil lento, el LCP llega cuando el motor termina. **Regla nueva:** ningún candidato a LCP empieza oculto; las entradas parten de un estado visible o las hace CSS.
2. **Selector de habitaciones maquetado por JavaScript** (`es-selector` se añade al arrancar): la página cambia de forma después del primer pintado → CLS 0,077. **Regla nueva:** la maquetación final depende de `html.js` (puesta antes del primer pintado), no de clases que añade el motor.
3. Imagen del hero a DPR 3 (1280 px AVIF, ~177 KB) en móvil: aceptable, revisable con `sizes` más ajustado.

INP: no medido todavía (necesita interacción real); se medirá en la fase 7.

## 3. Auditoría visual

| Área | Problema | Prioridad |
|---|---|---|
| Identidad | La paleta oscura funciona en las escenas nocturnas, pero no transmite «naturaleza, arquitectura, tranquilidad»; todo el sitio vive en una sola tonalidad. | Alta |
| Hero | No hay fotografía de la arquitectura del hotel: el hero muestra un acantilado con una caseta. Para una apertura «panorámica del hotel» falta la imagen principal. | Alta |
| Habitaciones | Hay selector, pero **no hay comparación** (diferencias entre habitaciones, tabla comparativa). | Alta |
| Experiencias | «A la carta» es una fila de 7 tarjetas idénticas: el patrón genérico que el brief excluye. | Alta |
| Reservas | Es un formulario que abre el correo. No hay flujo por pasos (fechas → huéspedes → habitación → datos → confirmación), ni estados, ni confirmación de demostración. | Alta |
| Tipografía | Bodoni Moda (didona de alto contraste) se rompe en tamaños pequeños y en pantallas de baja densidad; Jost es correcta pero fría para hospitality. 10 tamaños distintos en el inicio. | Media |
| Movimiento | Tokens parciales (`curvas.ts` tiene curvas y duraciones; no hay distancias, stagger ni intensidades). Los revelados de texto se parecen entre secciones. | Media |
| Un día en Aurea | Concepto sólido; fotos ya coherentes por hora desde la fase anterior. Falta revisar el tratamiento cromático común. | Media |
| Pie | Correcto; el control de movimiento está integrado. | — |

## 4. Auditoría fotográfica (43 fotos)

Leyenda de acción: **C** conservar · **R** reemplazar · **U** reubicar · **T** tratamiento de color.

| Foto | Qué muestra | Dónde | ¿Corresponde? | Acción |
|---|---|---|---|---|
| costaAcantilado | Acantilado oscuro al atardecer (Bali) | Hero; pie de Reservas | Sí como paisaje; no muestra el hotel | **U** → escena de costa; buscar panorámica de arquitectura para el hero |
| costaBarca | Mar al anochecer con barca | Pie | Sí | C |
| costaPlayaNegra | Playa negra desde el aire (Islandia) | Fuera, Experiencias | Sí | C |
| llegadaCosta | Costa de roca al amanecer (La Reunión) | La llegada | Sí | C |
| materialBasalto | Textura de piedra negra | Manifiesto | Textura, sin narrativa propia | C (material) |
| materialLino | Lino con sombra de ventana | Un día 9:00 (fondo) | Sí | C, T |
| materialCal | Muro encalado casi vacío | Manifiesto | Débil como foto | **R** por una foto de arquitectura encalada con luz |
| casaArco | Arco encalado con mar azul (Santorini) | La llegada | Estilo cicládico reconocible, luz azul fría | **R** |
| casaEscalera | Escalones tallados con musgo verde | La llegada, Experiencias | Sí; el verde desentona un poco | C, T |
| casaPiscina | Piscina desbordante al anochecer | Un día (base fija) | Sí | C |
| diaPoza | Poza de marea al amanecer | Un día 7:30 | Sí | C |
| diaOrilla | Bañista entre rocas al alba (Phuket) | Un día 7:30 | Sí | C |
| diaRocas | Rocas en mar quieto, luz rosada | Un día 7:30 | Sí | C |
| diaDesayuno | Taza junto a la ventana | Un día 9:00 | Sí | C |
| diaMediodia | Mesa frente al mar a mediodía | Un día 13:30 | Sí | C |
| mesaPescado | Pescado a la brasa | Un día 13:30 | Sí | C |
| mesaLimones | Limones sobre mesa frente al mar | Un día 13:30 | Sí | C |
| diaAzotea | Terraza al sol bajo | Un día, hora áurea | Sí | C |
| diaCopa | Copa de vino al atardecer | Un día, hora áurea | Sí | C |
| diaVentanaOcaso | Atardecer desde mesa con toldo rojo | Un día, hora áurea | El toldo rojo rompe la paleta | **R** o recorte |
| mesaVino | Copa y plato en penumbra | Experiencias (Mesa) | Sí | C |
| mesaPlato | Plato cenital sobre mantel blanco | Experiencias (Mesa) | Sí; luz distinta al resto | C, T |
| nocheCielo | Vía Láctea sobre rocas | Un día 21:30, Experiencias | Sí | C |
| nocheFarol | Farol con velas sobre arena | Un día 21:30, Experiencias | Correcta, algo decorativa | C |
| spaPiscina | Piscina cubierta, techo de madera | Fuera, Experiencias | Sí | C |
| spaTumbonas | Tumbonas junto a piscina de piedra | Fuera, Experiencias | Sí | C |
| expBano | Bañistas en costa de roca (Malta) | Experiencias | Sí | C |
| expKayak | Kayak en cueva marina | Fuera, Experiencias | Sí | C |
| expBarca | Barca a la hora dorada | Fuera, Experiencias | Sí | C |
| expVina | Viñas en tierra volcánica | Fuera, Experiencias | Sí | C |
| expEstrellas | Persona con linterna bajo la Vía Láctea | Un día 21:30, Experiencias | Sí | C |
| estudioDormitorio | Dormitorio de madera cálida | Estudio Jardín | Sí | C |
| estudioBano | Bañera exenta con palmera | Estudio Jardín | Sí | C |
| estudioLuz | Sol sobre la almohada | Estudio Jardín, Un día 9:00 | Sí | C |
| miradorVentana | Ventanal con cortinas oscuras al mar | Suite Mirador | Sí | C |
| miradorBano | Bañera ante arco al mar turquesa | Suite Mirador | Mar turquesa frío | C, T |
| miradorNoche | Cama en penumbra con lámpara | Suite Mirador | Sí | C |
| terrazaMesa | Vino junto a la cama, césped y cielo gris | Suite Terraza | Luz gris y césped verde: la más débil de las habitaciones | **R** |
| terrazaPiscina | Piscina de inmersión en terraza blanca | Suite Terraza, La llegada | Sí | C |
| terrazaDucha | Ducha de travertino | Suite Terraza | Sí | C |
| residenciaSalon | Salón con ventanales al atardecer | Residencia Aurea | Sí | C |
| residenciaAzotea | Azotea con sofá corrido y fuego | Residencia Aurea | Sí | C |
| residenciaBano | Lavabo de piedra | Residencia Aurea | Sí | C |

Resumen: **35 se conservan**, **5 se reemplazan** (materialCal, casaArco, diaVentanaOcaso, terrazaMesa y una nueva panorámica de arquitectura para el hero), **1 se reubica** (costaAcantilado sale del hero), varias necesitan **tratamiento de color común**.

## 5. Recorrido comercial (Descubrir → Conocer → Imaginar → Comparar → Reservar)

| Etapa | Hoy | Falta |
|---|---|---|
| Descubrir | Hero, manifiesto, llegada | Apertura memorable con la arquitectura del hotel |
| Conocer | Habitaciones (selector + fichas), Experiencias | Servicios por habitación visibles en el selector |
| Imaginar | Un día en Aurea, galerías | Tratamiento fotográfico común |
| Comparar | — | **Comparador de habitaciones** (tabla y diferencias) |
| Reservar | Formulario + correo | **Flujo por pasos con confirmación de demostración** |
