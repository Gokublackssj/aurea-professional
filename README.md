# Aurea Professional

Demo conceptual del paquete **Professional**: la web de Aurea, un hotel de lujo
ficticio frente al mar. Astro (sitio estático) con animaciones en GSAP.

## Requisitos

- Node.js 22.23.4 o superior.
- Google Chrome instalado (las pruebas lo usan sin descargar navegadores).

## Uso

```sh
npm install        # instala las dependencias exactas del package-lock
npm run dev        # servidor de desarrollo en http://localhost:4321/
npm run build      # comprueba tipos (astro check) y construye en dist/
npm run preview    # sirve dist/
npm test           # pruebas en el navegador (requiere npm run build antes)
```

## Páginas

| Ruta | Página |
|---|---|
| `/` | Inicio |
| `/habitaciones/` | Habitaciones |
| `/habitaciones/<slug>/` | Detalle de cada habitación (`src/data/habitaciones.ts`) |
| `/experiencias/` | Experiencias |
| `/reservas/` | Reservas (el formulario abre el correo; no hay servidor) |
| `/creditos/` | Autores de las fotografías y tipografías |

## Estructura

```
src/
  assets/fotos/     fotografías (se optimizan con astro:assets)
  components/       componentes de página
  data/             contenido: navegación, habitaciones…
  layouts/          plantilla común
  lib/              utilidades (ruta() respeta BASE)
  pages/            rutas
  scripts/motion/   animaciones con GSAP (desde la fase 2)
  styles/           tokens y estilos base
tests/              pruebas Playwright
```

## Fases

0. Estructura del proyecto
1. Páginas completas, sin animación ← actual
2. Infraestructura de animaciones
3. Hero y microinteracciones
4. Escenas cinematográficas de scroll
5. Habitaciones, galería y transiciones
6. Optimización y pruebas

## Identidad

Aurea es un hotel ficticio de 22 llaves en Cabo Lumbre, un cabo de basalto
(también ficticio) orientado a poniente en una isla volcánica del Atlántico. El
nombre viene de la hora áurea: el sol se pone delante de todas las habitaciones.

- Paleta: basalto (`#100E0C`), cal (`#EBE8E2`) y el oro de la hora áurea
  (`#D9A24E`, solo en la acción principal). Tokens en `src/styles/tokens.css`.
- Tipografía: Bodoni Moda para mostrar, Jost para leer.
- «La hoja de hoy» (`src/scripts/hoja.ts`) calcula la puesta de sol y la luna
  de hoy en el cabo; en Reservas, la puesta de sol del día de llegada.

Los créditos de las fotografías están en [CREDITS.md](CREDITS.md).
