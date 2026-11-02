# Aurea Professional

Demo conceptual del paquete **Professional**: la web de Aurea, un hotel de lujo
**ficticio** frente al mar. Astro (sitio estático) con animaciones en GSAP. Ni el
hotel ni sus reservas existen: la reserva es una demostración que no guarda datos
ni cobra nada, y así lo dicen el pie de cada página, la confirmación y los créditos.

## Requisitos

- Node.js 22.23.4 o superior.
- Google Chrome instalado (las pruebas lo usan sin descargar navegadores).

## Uso

```sh
npm ci             # instala las dependencias exactas del package-lock (incluidas las de desarrollo)
npm run dev        # servidor de desarrollo en http://localhost:4321/
npm run build      # comprueba tipos (astro check) y construye en dist/
npm run preview    # sirve dist/
npm test           # pruebas en el navegador sobre dist/ (antes, npm run build)
```

`astro dev` genera cada imagen la primera vez que se pide: en frío es mucho más
lento que la build (en móvil, la foto del hero tarda segundos). Para medir carga o
rendimiento, usa `npm run build` y `npm run preview`.

## Páginas

| Ruta | Página |
|---|---|
| `/` | Inicio: hero, manifiesto, La llegada, cartel de habitaciones, Un día en Aurea |
| `/habitaciones/` | Explorador de las cuatro habitaciones y comparación |
| `/habitaciones/<slug>/` | Ficha de cada habitación, con mosaico y visor (`src/data/habitaciones.ts`) |
| `/experiencias/` | Termas, mesa, el mar (vídeo) y el cielo |
| `/reservas/` | Reserva de demostración en cinco pasos (sin servidor; sin JavaScript, abre el correo) |
| `/creditos/` | Autores de las fotografías, el vídeo y las tipografías |

## Estructura

```
src/
  assets/fotos/     fotografías (astro:assets genera AVIF y WebP)
  components/       componentes de página
  data/             contenido: navegación, habitaciones, fotos y créditos
  layouts/          plantilla común (metadatos, Open Graph, noindex)
  lib/              utilidades (ruta() respeta BASE)
  pages/            rutas
  scripts/motion/   motor de animación con GSAP (una escena por data-escena)
  styles/           tokens y estilos base
public/             favicon, robots.txt, imagen para enlaces (og-aurea.jpg), vídeo
tests/              pruebas Playwright (escritorio 1440, móvil 390 y 320 px)
docs/               auditoría inicial y registro de la integración
```

## Identidad

Aurea es un hotel ficticio de 22 llaves en Cabo Lumbre, un cabo de basalto
(también ficticio) orientado a poniente en una isla volcánica del Atlántico.

- Paleta clara: marfil, teal muy oscuro para los bloques de noche y latón para las
  acciones. Tokens en `src/styles/tokens.css`.
- Tipografía: Fraunces (titulares, eje óptico) y Manrope (texto).
- Movimiento: escenas con `position: sticky` y GSAP solo para traducir el scroll;
  sin pins ni ajuste automático. Preferencia «Movimiento» plegada en el pie
  (automático según el sistema, completo o reducido).
- «La hoja de hoy» (`src/scripts/hoja.ts`) calcula la puesta de sol y la luna de
  hoy en el cabo; en Reservas, la puesta de sol del día de llegada.

## Publicación

Sitio estático. Para una ruta de proyecto (p. ej. GitHub Pages en
`https://usuario.github.io/aurea-professional/`) se construye con:

```sh
SITE=https://usuario.github.io BASE=/aurea-professional/ npm run build
```

`.github/workflows/deploy.yml` hace eso en GitHub Actions, solo cuando se lanza a
mano (Actions > Publicar > Run workflow) y con Pages activado en «GitHub Actions».
Cada página lleva `noindex, nofollow`: la demo se comparte por enlace, pero no
aparece en buscadores como si fuera un hotel real.

Los créditos de las fotografías, el vídeo y el código de terceros están en
[CREDITS.md](CREDITS.md).
