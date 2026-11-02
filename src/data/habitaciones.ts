import type { ClaveFoto } from "./fotos";

// Las cuatro habitaciones de Aurea: 22 en total. Cada una genera su página de
// detalle en /habitaciones/<slug>/. Precios de muestra, por noche y para dos
// personas, con desayuno y termas incluidos.
// Cada galería sale de una sola sesión fotográfica (un mismo espacio) y los
// textos describen lo que se ve en esas fotos.

export interface FotoHabitacion {
  foto: ClaveFoto;
  /** Rótulo corto sobre la foto; el texto alternativo completo está en fotos.ts */
  pie: string;
  /** Punto de encuadre (object-position) para las fotos verticales */
  foco?: string;
}

export interface Habitacion {
  slug: string;
  nombre: string;
  /** Nombre con artículo, para frases como «Elegir la Suite Mirador» */
  conArticulo: string;
  llaves: number;
  resumen: string;
  vista: string;
  metros: number;
  exterior?: string;
  huespedes: number;
  cama: string;
  bano: string;
  precio: number;
  /** Una frase, a tamaño grande, al abrir la página de detalle */
  entradilla: string;
  descripcion: string[];
  equipamiento: string[];
  /** Cuatro servicios destacados para la ficha del explorador */
  servicios: string[];
  /** En qué se diferencia de las demás, en una frase */
  diferencia: string;
  fotos: FotoHabitacion[];
}

export const habitaciones: Habitacion[] = [
  {
    slug: "estudio-jardin",
    nombre: "Estudio Jardín",
    conArticulo: "el Estudio Jardín",
    llaves: 11,
    resumen: "A ras de jardín, con porche propio frente a las palmeras.",
    vista: "El jardín de palmeras",
    metros: 42,
    exterior: "Porche privado de 18 m²",
    huespedes: 2,
    cama: "Cama de 180 × 200",
    bano: "Ducha de lluvia",
    precio: 420,
    entradilla: "Once estudios a ras de jardín: estuco de tierra, madera y fibras tejidas, y un porche que se abre a las palmeras.",
    descripcion: [
      "Once estudios en la planta baja, cada uno con un porche propio que da al jardín de palmeras. Dentro, paredes de estuco de tierra, madera clara y cestos tejidos a mano.",
      "Por la tarde el porche queda a la sombra: dos butacas, una mesa baja y el ruido del mar al otro lado del jardín. Es la habitación más tranquila de la casa.",
    ],
    equipamiento: [
      "Porche privado con dos butacas",
      "Ducha de lluvia",
      "Ropa de cama de algodón lavado",
      "Armario abierto con albornoces",
      "Cafetera de filtro y café de la isla",
      "Sin televisión",
    ],
    servicios: ["Porche al jardín", "Sofá de lectura", "Armario abierto", "Cafetera de filtro"],
    diferencia: "La más tranquila: a ras de jardín, con porche propio.",
    fotos: [
      { foto: "estudioCama", pie: "El dormitorio", foco: "50% 55%" },
      { foto: "estudioPatio", pie: "El porche", foco: "50% 55%" },
      { foto: "estudioSofa", pie: "El rincón de lectura", foco: "45% 55%" },
      { foto: "estudioArmario", pie: "El vestidor", foco: "50% 40%" },
    ],
  },
  {
    slug: "suite-mirador",
    nombre: "Suite Mirador",
    conArticulo: "la Suite Mirador",
    llaves: 6,
    resumen: "Ventanal de suelo a techo, balcón sobre el agua y bañera frente al mar.",
    vista: "El poniente entero",
    metros: 58,
    exterior: "Balcón de madera de 6 m²",
    huespedes: 2,
    cama: "Cama de 200 × 200",
    bano: "Bañera frente al mar",
    precio: 610,
    entradilla: "La esquina que mira al poniente: ventanal de suelo a techo, balcón sobre el agua y bañera frente al mar.",
    descripcion: [
      "Seis suites en la esquina del edificio, donde el cabo mira al oeste. El ventanal de suelo a techo se abre a un balcón de madera sobre el agua, y el sol se pone delante de la cama buena parte del año.",
      "La bañera está junto a una ventana estrecha que da al mar. Las cortinas oscurecen del todo: aquí se duerme hasta tarde o se madruga para ver el agua cambiar de color.",
    ],
    equipamiento: [
      "Ventanal de suelo a techo",
      "Balcón de madera sobre el mar",
      "Bañera con vista al mar",
      "Cortinas opacas",
      "Prismáticos y carta del cielo",
      "Sin televisión",
    ],
    servicios: ["Ventanal al mar", "Balcón de madera", "Bañera con vista", "Cortinas opacas"],
    diferencia: "La del atardecer: el sol se pone delante de la cama.",
    fotos: [
      { foto: "miradorVentanal", pie: "El ventanal", foco: "50% 45%" },
      { foto: "miradorAtardecer", pie: "El balcón al atardecer", foco: "50% 40%" },
      { foto: "miradorBalcon", pie: "El balcón", foco: "50% 55%" },
      { foto: "miradorBanera", pie: "La bañera", foco: "50% 60%" },
    ],
  },
  {
    slug: "suite-terraza",
    nombre: "Suite Terraza",
    conArticulo: "la Suite Terraza",
    llaves: 4,
    resumen: "Terraza con piscina privada y mesa junto al agua.",
    vista: "El jardín y el mar desde la terraza",
    metros: 74,
    exterior: "Terraza de 40 m² con piscina privada",
    huespedes: 3,
    cama: "Cama de 200 × 200 y sofá cama",
    bano: "Doble lavabo de piedra",
    precio: 890,
    entradilla: "Una terraza que es otra habitación, con piscina privada y mesa junto al agua; dentro, un arco de estuco guarda el baño.",
    descripcion: [
      "Cuatro suites con una terraza que es otra habitación: una piscina privada, una mesa de madera junto al agua y sitio para cenar fuera.",
      "Dentro, un arco de estuco separa el dormitorio del baño, con doble lavabo de piedra. Hay un sofá cama para un tercer huésped y una butaca de cuerda junto al ventanal.",
    ],
    equipamiento: [
      "Piscina privada en la terraza",
      "Mesa exterior para cenar",
      "Doble lavabo de piedra bajo el arco",
      "Sofá cama para un tercer huésped",
      "Butaca de lectura",
      "Sin televisión",
    ],
    servicios: ["Piscina privada", "Mesa en la terraza", "Doble lavabo", "Butaca de lectura"],
    diferencia: "La única con piscina propia y sitio para tres.",
    fotos: [
      { foto: "terrazaPiscinaPrivada", pie: "La piscina privada", foco: "50% 60%" },
      { foto: "terrazaDormitorio", pie: "El dormitorio", foco: "50% 50%" },
      { foto: "terrazaLavabos", pie: "El baño", foco: "50% 50%" },
      { foto: "terrazaMesaPiscina", pie: "La mesa junto al agua", foco: "50% 50%" },
      { foto: "terrazaButaca", pie: "El rincón de lectura", foco: "55% 55%" },
    ],
  },
  {
    slug: "residencia-aurea",
    nombre: "Residencia Aurea",
    conArticulo: "la Residencia Aurea",
    llaves: 1,
    resumen: "La casa entera: dos dormitorios, salón y piscina desbordante entre olivos.",
    vista: "Todo el horizonte",
    metros: 140,
    exterior: "Terraza y piscina desbordante entre olivos",
    huespedes: 4,
    cama: "Dos camas de 200 × 200",
    bano: "Dos baños, de piedra",
    precio: 1850,
    entradilla: "La casa entera, con una sola llave: salón abierto, dormitorios con vista al mar y piscina desbordante entre olivos.",
    descripcion: [
      "La única casa independiente de Aurea, en lo alto de la finca, entre olivos. Un salón luminoso, dos dormitorios con ventanales al mar y dos baños.",
      "Fuera, una terraza con tumbonas y una piscina desbordante que parece caer al Atlántico. Incluye una anfitriona propia durante toda la estancia.",
    ],
    equipamiento: [
      "Dos dormitorios con baño propio",
      "Salón de 60 m²",
      "Piscina desbordante privada",
      "Terraza entre olivos",
      "Anfitriona propia",
      "Cena privada en la terraza, una noche",
    ],
    servicios: ["Piscina desbordante", "Salón de 60 m²", "Terraza entre olivos", "Anfitriona propia"],
    diferencia: "La casa dentro de la casa: dos dormitorios y piscina propia.",
    fotos: [
      { foto: "residenciaPiscina", pie: "La piscina desbordante", foco: "50% 60%" },
      { foto: "residenciaSalonVilla", pie: "El salón", foco: "50% 55%" },
      { foto: "residenciaDormitorio", pie: "El dormitorio principal", foco: "50% 55%" },
      { foto: "residenciaTerraza", pie: "La terraza", foco: "50% 60%" },
      { foto: "residenciaBanoVilla", pie: "El baño", foco: "50% 50%" },
      { foto: "residenciaCopas", pie: "Junto a la piscina", foco: "50% 50%" },
    ],
  },
];

export const totalLlaves = habitaciones.reduce((suma, h) => suma + h.llaves, 0);

export const euros = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
