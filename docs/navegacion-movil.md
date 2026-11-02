# Navegación móvil: cobertura de 320 y 390 px

Revisión e implementación desde `5c8ad55`, en `codex/auditoria-aurea`.

## Investigación

El mensaje `Transition was aborted because of invalid state. Viewport size changed`
proviene de Chrome cuando cambia el tamaño de la superficie capturada durante una
View Transition. Se reprodujo el mensaje exacto en Chrome mediante una transición
retenida con una promesa y un cambio deliberado de viewport de 320 × 640 a
390 × 844 antes de liberarla. Este experimento identifica el mecanismo del aborto;
no demuestra un fallo espontáneo de Aurea.

Referencia del navegador: [motivos de aborto en Chromium](https://chromium.googlesource.com/chromium/src/+/bed98a9780b75372c1974d8aa0e48f1433082e2f%5E%21/).

Los tests de menú y movimiento móvil sobrescribían ambos proyectos móviles con
390 px. Otros escenarios imponían 1440 px incluso bajo el nombre `movil-320`.
Estas opciones se aplican al crear el contexto: no se ha demostrado que sean la
causa del aborto durante la navegación. Sí dejaban sin comprobar los tamaños
anunciados por los proyectos.

## Cambios

- Cada test hereda el viewport del proyecto. Un fixture automático rechaza las
  sobrescrituras locales para que no se vuelva a perder cobertura de 320 px.
- Menú y movimiento móvil se prueban en los proyectos de 320 y 390 px. Las escenas
  exclusivas de escritorio se ejecutan solo en escritorio, sin duplicarlas en
  contextos táctiles de 1440 px. Los escenarios comunes conservan los tres tamaños.
- Las expectativas del vídeo, del cielo y del control de movimiento se adaptan al
  viewport real, manteniendo las comprobaciones de su comportamiento.
- Un recorrido de navegación móvil comprueba menú, destinos, historial y regreso
  al inicio, en ambos modos de movimiento. Registra cambios de ancho durante el
  recorrido, además de comprobar el desbordamiento final. El fixture de errores
  de consola permanece intacto.
- `PW_PORT` permite aislar servidores entre worktrees. Playwright ya no reutiliza
  un servidor existente que podría estar sirviendo una build de otra rama.

No se modificó código de la aplicación: no se reprodujo un fallo de navegación
natural que justificase hacerlo. Tampoco se desactivaron View Transitions, se
filtraron errores ni se ampliaron timeouts.

## Reproducción de las comprobaciones

Desde este worktree, en PowerShell:

```powershell
npm ci --no-audit --no-fund
npm run check
npm run build
$env:PW_PORT = '4325'
npx playwright test --workers=4
```

Para insistir en los recorridos a 320 px:

```powershell
$env:PW_PORT = '4324'
npx playwright test tests/estructura.spec.ts tests/navegacion-movil.spec.ts --project=movil-320 --grep 'navegación principal|cada habitación del selector|Elegir esta habitación|conserva el ancho' --repeat-each=5 --workers=2
```

La comprobación repetida pasó 25/25 pruebas sin el error ni cambios transitorios
del ancho. Una ejecución satisfactoria no demuestra la ausencia de un fallo
intermitente; queda la cobertura para detectar y localizar una futura reproducción.

Validación final: Astro check (66 archivos) sin errores, avisos ni hints; build
estática completada con 10 páginas; suite completa con 149 pruebas superadas y
16 omitidas por no corresponder al dispositivo. Las omisiones incluyen las
escenas de escritorio en los proyectos móviles y los recorridos móviles en
escritorio: no son fallos descartados ni reintentos. No se modificó `src/`.
