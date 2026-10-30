// Las páginas principales, en el orden de la navegación. Reservas va aparte,
// como la única acción de la cabecera.
export const navegacion = [
  { destino: "", texto: "Inicio" },
  { destino: "habitaciones", texto: "Habitaciones" },
  { destino: "experiencias", texto: "Experiencias" },
] as const;

export const reservas = { destino: "reservas", texto: "Reservas" } as const;
