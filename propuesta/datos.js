// Datos del prototipo. Precios de ejemplo.
// Cada habitación muestra solo fotos de una misma sesión fotográfica (un mismo
// espacio); `foco` es el punto de encuadre (object-position) para que las
// verticales no se recorten mal. Procedencia y licencias en CREDITOS.md.
window.AUREA = {
  habitaciones: [
    {
      slug: "estudio-jardin", nombre: "Estudio Jardín", precio: 420, metros: 42, huespedes: 2, llaves: 11,
      resumen: "Once estudios a ras de jardín: estuco de tierra, madera y fibras tejidas, y un porche que se abre a las palmeras.",
      fotos: [
        { n: "estudio-cama", alt: "Cama con ropa blanca bajo dos cestos tejidos en una pared de estuco terracota", foco: "50% 55%" },
        { n: "estudio-patio", alt: "Porche con dos butacas de madera frente al jardín de palmeras", foco: "50% 55%" },
        { n: "estudio-sofa", alt: "Sofá de madera con cojín bordado junto a una vasija tejida", foco: "45% 55%" },
        { n: "estudio-armario", alt: "Armario abierto de madera y rejilla con albornoces y lámparas colgantes", foco: "50% 40%" },
      ],
      servicios: ["Porche al jardín", "Sofá de lectura", "Armario abierto", "Cafetera de filtro"],
      diferencia: "La más tranquila: a ras de jardín, con porche propio.",
      vista: "Jardín de palmeras", exterior: "Porche de 18 m²", cama: "180 × 200", bano: "Ducha de lluvia",
    },
    {
      slug: "suite-mirador", nombre: "Suite Mirador", precio: 610, metros: 58, huespedes: 2, llaves: 6,
      resumen: "La esquina que mira al poniente: ventanal de suelo a techo, balcón sobre el agua y bañera frente al mar.",
      fotos: [
        { n: "mirador-ventanal", alt: "Ventanal de suelo a techo abierto al mar turquesa, con la cama delante", foco: "50% 45%" },
        { n: "mirador-atardecer", alt: "El balcón al atardecer, con una botella de vino sobre la mesa", foco: "50% 40%" },
        { n: "mirador-balcon", alt: "Mesa redonda con flores en el balcón de madera sobre el mar", foco: "50% 55%" },
        { n: "mirador-banera", alt: "Bañera junto a una ventana estrecha que da al mar", foco: "50% 60%" },
      ],
      servicios: ["Ventanal al mar", "Balcón de madera", "Bañera con vista", "Cortinas opacas"],
      diferencia: "La del atardecer: el sol se pone delante de la cama.",
      vista: "Poniente completo", exterior: "Balcón de 6 m²", cama: "200 × 200", bano: "Bañera frente al mar",
    },
    {
      slug: "suite-terraza", nombre: "Suite Terraza", precio: 890, metros: 74, huespedes: 3, llaves: 4,
      resumen: "Una terraza que es otra habitación, con piscina privada y mesa junto al agua; dentro, un arco de estuco guarda el baño.",
      fotos: [
        { n: "terraza-piscina-privada", alt: "Piscina privada de agua turquesa en la terraza, con el mar al fondo", foco: "50% 60%" },
        { n: "terraza-dormitorio", alt: "Cama blanca ante un arco de estuco que deja ver el doble lavabo", foco: "50% 50%" },
        { n: "terraza-lavabos", alt: "Doble lavabo de piedra bajo un arco con dos espejos ovalados", foco: "50% 50%" },
        { n: "terraza-mesa-piscina", alt: "Mesa de madera con cuatro sillas junto al borde de la piscina", foco: "50% 50%" },
        { n: "terraza-butaca", alt: "Butaca de madera y cuerda tejida junto a un ventanal con cortinas", foco: "55% 55%" },
      ],
      servicios: ["Piscina privada", "Mesa en la terraza", "Doble lavabo", "Butaca de lectura"],
      diferencia: "La única con piscina propia y sitio para tres.",
      vista: "Jardín y mar", exterior: "Terraza de 40 m² con piscina", cama: "200 × 200 + sofá cama", bano: "Doble lavabo de piedra",
    },
    {
      slug: "residencia-aurea", nombre: "Residencia Aurea", precio: 1850, metros: 140, huespedes: 4, llaves: 1,
      resumen: "La casa entera, con una sola llave: salón abierto, dormitorios con vista al mar y piscina desbordante entre olivos.",
      fotos: [
        { n: "residencia-piscina", alt: "Piscina desbordante con tumbonas entre olivos, sobre el mar", foco: "50% 60%" },
        { n: "residencia-salon-villa", alt: "Salón amplio y luminoso con sofá naranja y muebles bajos", foco: "50% 55%" },
        { n: "residencia-dormitorio", alt: "Dormitorio con dos ventanales al mar y cama baja", foco: "50% 55%" },
        { n: "residencia-terraza", alt: "Terraza con dos tumbonas rojas mirando al mar", foco: "50% 60%" },
        { n: "residencia-bano-villa", alt: "Baño de tonos arena con doble lavabo y ducha de cristal", foco: "50% 50%" },
        { n: "residencia-copas", alt: "Dos copas de vino sobre una mesa junto a la piscina, con el mar detrás", foco: "50% 50%" },
      ],
      servicios: ["Piscina desbordante", "Salón de 60 m²", "Terraza entre olivos", "Anfitriona propia"],
      diferencia: "La casa dentro de la casa: dos dormitorios y piscina propia.",
      vista: "Todo el horizonte", exterior: "Terraza y piscina entre olivos", cama: "Dos de 200 × 200", bano: "Dos, de piedra",
    },
  ],
  // Cada momento: un fondo y dos secundarias de la misma luz y la misma hora.
  dia: [
    { hora: "07:30", titulo: "La poza de marea", texto: "Al pie de los escalones, la marea llena una poza tallada en la roca. Agua quieta a veinte grados, antes que nadie.", fondo: ["dia-poza", "Poza de marea al amanecer"], secundarias: [["dia-orilla", "Bañista entrando en el mar al alba"], ["dia-rocas", "Rocas en el mar quieto con luz rosada"]] },
    { hora: "09:00", titulo: "Desayuno sin reloj", texto: "De nueve a doce, en la habitación o en la terraza: pan de leña, queso de cabra de la ladera y fruta del valle.", fondo: ["mirador-ventana", "Cortinas abiertas a un mar en calma por la mañana"], secundarias: [["dia-desayuno", "Taza humeante junto a la ventana"], ["estudio-luz", "Sol de la mañana sobre la almohada"]] },
    { hora: "13:30", titulo: "La mesa frente al mar", texto: "Lo que entró por la mañana en la lonja del puerto, servido al aire libre con limones del valle.", fondo: ["dia-mediodia", "Mesa al aire libre frente al mar a mediodía"], secundarias: [["mesa-pescado", "Pescado a la brasa con ensalada"], ["mesa-limones", "Limones sobre una mesa frente al mar"]] },
    { hora: "19:40", titulo: "La hora áurea", texto: "El sol se pone delante de las veintidós habitaciones. La terraza se queda en silencio y la casa apaga sus luces.", fondo: ["dia-azotea", "Terraza en lo alto con el sol en el horizonte"], secundarias: [["dia-copa", "Copa de vino blanco al atardecer"], ["dia-ventana-ocaso", "El sol poniéndose sobre el mar desde una mesa"]] },
    // 21:30 ya no repite la foto de «El cielo» (noche-cielo): fondo y secundarias propios
    { hora: "21:30", titulo: "El cielo desde la azotea", texto: "Sin una farola en nueve kilómetros. Arriba espera un telescopio y alguien que sabe dónde mirar.", fondo: ["exp-estrellas", "Una persona con linterna bajo la Vía Láctea"], secundarias: [["noche-poza-estrellas", "Una poza entre rocas volcánicas bajo un cielo estrellado"], ["noche-farol", "Farol con velas sobre la arena"]] },
  ],
};
