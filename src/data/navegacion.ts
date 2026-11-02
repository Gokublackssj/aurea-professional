// Las páginas principales, en el orden de la navegación. Reservas va aparte,
// como la única acción de la cabecera.
export const navegacion = [
  { destino: "", texto: "Inicio" },
  { destino: "habitaciones", texto: "Habitaciones" },
  { destino: "experiencias", texto: "Experiencias" },
] as const;

// Texto de la acción: es una demostración, no consulta disponibilidad real.
export const reservas = { destino: "reservas", texto: "Preparar mi estancia" } as const;
