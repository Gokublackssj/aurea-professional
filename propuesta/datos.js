// Datos del prototipo (los mismos del sitio, src/data/habitaciones.ts, más
// servicios y diferencias para comparar). Precios de ejemplo.
window.AUREA = {
  habitaciones: [
    {
      slug: "estudio-jardin", nombre: "Estudio Jardín", precio: 420, metros: 42, huespedes: 2, llaves: 11,
      resumen: "Once estudios a ras de jardín, con patio propio y el mar por encima del muro.",
      fotos: [["estudio-dormitorio", "Dormitorio de madera cálida con ropa de lino"], ["estudio-bano", "Bañera exenta junto a una pared de piedra"], ["estudio-luz", "Sol de la mañana sobre la almohada"]],
      servicios: ["Patio privado", "Ducha exterior", "Bañera exenta", "Cafetera de filtro"],
      diferencia: "La más tranquila: a ras de jardín, con patio propio.",
      vista: "Jardín y mar sobre el muro", exterior: "Patio de 18 m²", cama: "180 × 200", bano: "Bañera exenta",
    },
    {
      slug: "suite-mirador", nombre: "Suite Mirador", precio: 610, metros: 58, huespedes: 2, llaves: 6,
      resumen: "La esquina donde el cabo gira hacia el oeste, con el ventanal abierto al poniente.",
      fotos: [["mirador-ventana", "Ventanal de esquina con cortinas oscuras abierto al mar"], ["mirador-bano", "Bañera frente a un arco abierto al mar"], ["mirador-noche", "Cama en penumbra con lámpara de lectura"]],
      servicios: ["Ventanal de 9 m", "Bañera frente al mar", "Cortinas opacas", "Prismáticos"],
      diferencia: "La del atardecer: el sol se pone delante de la cama.",
      vista: "Poniente completo", exterior: "—", cama: "200 × 200", bano: "Bañera frente al mar",
    },
    {
      slug: "suite-terraza", nombre: "Suite Terraza", precio: 890, metros: 74, huespedes: 3, llaves: 4,
      resumen: "Una terraza que es otra habitación, con su propia piscina de agua de mar.",
      fotos: [["terraza-mesa", "Mesa con vino junto a la cama ante el ventanal"], ["terraza-piscina", "Piscina de inmersión en la terraza"], ["terraza-ducha", "Ducha de travertino"]],
      servicios: ["Terraza de 40 m²", "Piscina de inmersión", "Ducha de travertino", "Sofá cama"],
      diferencia: "La única con piscina propia y sitio para tres.",
      vista: "Mar abierto", exterior: "Terraza de 40 m² con piscina", cama: "200 × 200 + sofá cama", bano: "Ducha de travertino",
    },
    {
      slug: "residencia-aurea", nombre: "Residencia Aurea", precio: 1850, metros: 140, huespedes: 4, llaves: 1,
      resumen: "La última planta entera, con una sola llave y la azotea más alta del cabo.",
      fotos: [["residencia-salon", "Salón con ventanales sobre el mar al atardecer"], ["residencia-azotea", "Azotea con sofá corrido alrededor de un fuego"], ["residencia-bano", "Lavabo tallado en piedra"]],
      servicios: ["Dos dormitorios", "Azotea de 90 m²", "Telescopio", "Anfitriona propia"],
      diferencia: "La casa dentro de la casa: dos dormitorios y azotea.",
      vista: "Todo el horizonte", exterior: "Azotea de 90 m²", cama: "Dos de 200 × 200", bano: "Dos, de piedra",
    },
  ],
  // Cada momento: un fondo y dos secundarias de la misma luz y la misma hora.
  dia: [
    { hora: "07:30", titulo: "La poza de marea", texto: "Al pie de los escalones, la marea llena una poza tallada en la roca. Agua quieta a veinte grados, antes que nadie.", fondo: ["dia-poza", "Poza de marea al amanecer"], secundarias: [["dia-orilla", "Bañista entrando en el mar al alba"], ["dia-rocas", "Rocas en el mar quieto con luz rosada"]] },
    { hora: "09:00", titulo: "Desayuno sin reloj", texto: "De nueve a doce, en la habitación o en la terraza: pan de leña, queso de cabra de la ladera y fruta del valle.", fondo: ["material-lino", "Lino con la sombra de la ventana"], secundarias: [["dia-desayuno", "Taza humeante junto a la ventana"], ["estudio-luz", "Sol de la mañana sobre la almohada"]] },
    { hora: "13:30", titulo: "La mesa frente al mar", texto: "Lo que entró por la mañana en la lonja del puerto, servido al aire libre con limones del valle.", fondo: ["dia-mediodia", "Mesa al aire libre frente al mar a mediodía"], secundarias: [["mesa-pescado", "Pescado a la brasa con ensalada"], ["mesa-limones", "Limones sobre una mesa frente al mar"]] },
    { hora: "19:40", titulo: "La hora áurea", texto: "El sol se pone delante de las veintidós habitaciones. La terraza se queda en silencio y la casa apaga sus luces.", fondo: ["dia-azotea", "Terraza en lo alto con el sol en el horizonte"], secundarias: [["dia-copa", "Copa de vino blanco al atardecer"], ["dia-ventana-ocaso", "El sol poniéndose sobre el mar desde una mesa"]] },
    { hora: "21:30", titulo: "El cielo desde la azotea", texto: "Sin una farola en nueve kilómetros. Arriba espera un telescopio y alguien que sabe dónde mirar.", fondo: ["noche-cielo", "La Vía Láctea sobre rocas en el agua"], secundarias: [["exp-estrellas", "Una persona con linterna bajo la Vía Láctea"], ["noche-farol", "Farol con velas sobre la arena"]] },
  ],
};
