import type { ClaveFoto } from "./fotos";

// Las cuatro habitaciones de Aurea: 22 llaves en total. Cada una genera su
// página de detalle en /habitaciones/<slug>/. Precios de muestra, por noche y
// para dos personas, con desayuno y termas incluidos.
export interface Habitacion {
  slug: string;
  nombre: string;
  /** Nombre con artículo, para frases como «Reservar la Suite Mirador» */
  conArticulo: string;
  llaves: number;
  resumen: string;
  vista: string;
  metros: number;
  exterior?: string;
  huespedes: number;
  cama: string;
  precio: number;
  /** Una frase, a tamaño grande, al abrir la página de detalle */
  entradilla: string;
  descripcion: string[];
  equipamiento: string[];
  fotos: [ClaveFoto, ClaveFoto, ClaveFoto];
}

export const habitaciones: Habitacion[] = [
  {
    slug: "estudio-jardin",
    nombre: "Estudio Jardín",
    conArticulo: "el Estudio Jardín",
    llaves: 11,
    resumen: "En la planta baja, con patio propio entre muros de cal.",
    vista: "El jardín de tabaibas y el mar por encima del muro",
    metros: 42,
    exterior: "Patio privado de 18 m² con ducha exterior",
    huespedes: 2,
    cama: "Cama de 180 × 200",
    precio: 420,
    entradilla: "Once estudios a ras de jardín, con un patio propio y el mar por encima del muro.",
    descripcion: [
      "Once estudios en la planta baja, abiertos a un patio propio donde crecen tabaibas y un olivo. El mar asoma por encima del muro de piedra seca, a la altura de los ojos cuando estás tumbado.",
      "Por la tarde el sol entra rasante y recorre la pared de madera de tea de un extremo a otro. Es la habitación que mejor enseña cómo cambia la luz en el cabo a lo largo del día.",
    ],
    equipamiento: [
      "Bañera exenta y ducha de lluvia",
      "Ropa de cama de lino lavado",
      "Ducha exterior en el patio",
      "Cafetera de filtro y café de la isla",
      "Altavoz y discos de la casa",
      "Sin televisión",
    ],
    fotos: ["estudioDormitorio", "estudioBano", "estudioLuz"],
  },
  {
    slug: "suite-mirador",
    nombre: "Suite Mirador",
    conArticulo: "la Suite Mirador",
    llaves: 6,
    resumen: "Ventanal de esquina sobre el poniente, con bañera frente al mar.",
    vista: "El poniente entero, de la punta del cabo a la cala",
    metros: 58,
    huespedes: 2,
    cama: "Cama de 200 × 200",
    precio: 610,
    entradilla: "La esquina donde el cabo gira hacia el oeste, con el ventanal abierto al poniente.",
    descripcion: [
      "Seis suites en la esquina del edificio, donde el cabo gira hacia el oeste. El ventanal ocupa dos paredes y el sol se pone justo delante de la cama durante la mayor parte del año.",
      "La bañera está frente a un arco abierto al mar. Las cortinas son de lino grueso y oscurecen del todo: aquí se duerme hasta tarde o se madruga para ver el agua cambiar de color.",
    ],
    equipamiento: [
      "Ventanal de esquina de 9 metros",
      "Bañera frente al mar",
      "Cortinas opacas de lino",
      "Prismáticos y carta del cielo",
      "Minibar de productores de la isla",
      "Sin televisión",
    ],
    fotos: ["miradorVentana", "miradorBano", "miradorNoche"],
  },
  {
    slug: "suite-terraza",
    nombre: "Suite Terraza",
    conArticulo: "la Suite Terraza",
    llaves: 4,
    resumen: "Terraza de 40 m² con piscina de inmersión de agua de mar templada.",
    vista: "El mar abierto desde la terraza, sin nada delante",
    metros: 74,
    exterior: "Terraza de 40 m² con piscina de inmersión",
    huespedes: 3,
    cama: "Cama de 200 × 200 y sofá cama",
    precio: 890,
    entradilla: "Una terraza que es otra habitación, con su propia piscina de agua de mar.",
    descripcion: [
      "Cuatro suites en la primera planta con una terraza que es otra habitación: tumbonas, una mesa para cenar fuera y una piscina de inmersión de agua de mar, templada a 30 grados todo el año.",
      "El baño es de travertino, con ducha abierta y luz cenital. Desde la cama se ve la línea del horizonte sin ningún obstáculo.",
    ],
    equipamiento: [
      "Piscina de inmersión de agua de mar a 30 °C",
      "Ducha de travertino con luz cenital",
      "Mesa exterior para cenar en la terraza",
      "Sofá cama para un tercer huésped",
      "Minibar de productores de la isla",
      "Sin televisión",
    ],
    fotos: ["terrazaMesa", "terrazaPiscina", "terrazaDucha"],
  },
  {
    slug: "residencia-aurea",
    nombre: "Residencia Aurea",
    conArticulo: "la Residencia Aurea",
    llaves: 1,
    resumen: "El ático entero: dos dormitorios, salón y azotea con telescopio.",
    vista: "Todo el horizonte, de norte a sur",
    metros: 140,
    exterior: "Azotea privada de 90 m²",
    huespedes: 4,
    cama: "Dos camas de 200 × 200",
    precio: 1850,
    entradilla: "La última planta entera, con una sola llave y la azotea más alta del cabo.",
    descripcion: [
      "La última planta de la casa, con una sola llave. Dos dormitorios, un salón con ventanal de suelo a techo sobre el agua y un baño de piedra tallada.",
      "Por una escalera interior se sube a la azotea, de 90 metros cuadrados, con un telescopio y tumbonas para mirar el cielo. Incluye una anfitriona propia durante toda la estancia.",
    ],
    equipamiento: [
      "Dos dormitorios con baño propio",
      "Salón con ventanal de suelo a techo",
      "Azotea de 90 m² con telescopio",
      "Anfitriona propia",
      "Cena privada en la azotea, una noche",
      "Sin televisión",
    ],
    fotos: ["residenciaSalon", "residenciaAzotea", "residenciaBano"],
  },
];

export const totalLlaves = habitaciones.reduce((suma, h) => suma + h.llaves, 0);

export const euros = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
