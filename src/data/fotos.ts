import type { ImageMetadata } from "astro";

import costaAcantilado from "../assets/fotos/costa-acantilado.jpg";
import costaBarca from "../assets/fotos/costa-barca.jpg";
import costaPlayaNegra from "../assets/fotos/costa-playa-negra.jpg";
import llegadaCosta from "../assets/fotos/llegada-costa.jpg";
import materialBasalto from "../assets/fotos/material-basalto.jpg";
import materialCal from "../assets/fotos/material-cal.jpg";
import casaEscalera from "../assets/fotos/casa-escalera.jpg";
import diaPoza from "../assets/fotos/dia-poza.jpg";
import diaOrilla from "../assets/fotos/dia-orilla.jpg";
import diaRocas from "../assets/fotos/dia-rocas.jpg";
import diaDesayuno from "../assets/fotos/dia-desayuno.jpg";
import diaMediodia from "../assets/fotos/dia-mediodia.jpg";
import mesaPescado from "../assets/fotos/mesa-pescado.jpg";
import mesaLimones from "../assets/fotos/mesa-limones.jpg";
import diaAzotea from "../assets/fotos/dia-azotea.jpg";
import diaCopa from "../assets/fotos/dia-copa.jpg";
import diaVentanaOcaso from "../assets/fotos/dia-ventana-ocaso.jpg";
import mesaVino from "../assets/fotos/mesa-vino.jpg";
import mesaPlato from "../assets/fotos/mesa-plato.jpg";
import nocheCielo from "../assets/fotos/noche-cielo.jpg";
import nocheFarol from "../assets/fotos/noche-farol.jpg";
import spaPiscina from "../assets/fotos/spa-piscina.jpg";
import spaTumbonas from "../assets/fotos/spa-tumbonas.jpg";
import expBano from "../assets/fotos/exp-bano.jpg";
import expKayak from "../assets/fotos/exp-kayak.jpg";
import expBarca from "../assets/fotos/exp-barca.jpg";
import expVina from "../assets/fotos/exp-vina.jpg";
import expEstrellas from "../assets/fotos/exp-estrellas.jpg";
import estudioLuz from "../assets/fotos/estudio-luz.jpg";
import miradorVentana from "../assets/fotos/mirador-ventana.jpg";
// Galerías de habitación: cada una de una sola sesión fotográfica (Pexels)
import estudioCama from "../assets/fotos/estudio-cama.jpg";
import estudioPatio from "../assets/fotos/estudio-patio.jpg";
import estudioSofa from "../assets/fotos/estudio-sofa.jpg";
import estudioArmario from "../assets/fotos/estudio-armario.jpg";
import miradorVentanal from "../assets/fotos/mirador-ventanal.jpg";
import miradorAtardecer from "../assets/fotos/mirador-atardecer.jpg";
import miradorBalcon from "../assets/fotos/mirador-balcon.jpg";
import miradorBanera from "../assets/fotos/mirador-banera.jpg";
import terrazaPiscinaPrivada from "../assets/fotos/terraza-piscina-privada.jpg";
import terrazaDormitorio from "../assets/fotos/terraza-dormitorio.jpg";
import terrazaLavabos from "../assets/fotos/terraza-lavabos.jpg";
import terrazaMesaPiscina from "../assets/fotos/terraza-mesa-piscina.jpg";
import terrazaButaca from "../assets/fotos/terraza-butaca.jpg";
import residenciaPiscina from "../assets/fotos/residencia-piscina.jpg";
import residenciaSalonVilla from "../assets/fotos/residencia-salon-villa.jpg";
import residenciaDormitorio from "../assets/fotos/residencia-dormitorio.jpg";
import residenciaTerraza from "../assets/fotos/residencia-terraza.jpg";
import residenciaBanoVilla from "../assets/fotos/residencia-bano-villa.jpg";
import residenciaCopas from "../assets/fotos/residencia-copas.jpg";
import nochePozaEstrellas from "../assets/fotos/noche-poza-estrellas.jpg";

/** Atribución de una fotografía, sin la imagen */
export interface Credito {
  alt: string;
  autor: string;
  /** Usuario del autor en Unsplash o en Pexels */
  usuario: string;
  /** Identificador de la foto en su banco */
  id: string;
  archivo: string;
  /** Banco de procedencia (Unsplash si no se indica) */
  fuente?: "unsplash" | "pexels";
}

export interface Foto extends Credito {
  src: ImageMetadata;
}

/** Página del autor y de la foto en su banco */
export const enlacesFoto = (f: Credito) =>
  f.fuente === "pexels"
    ? { autor: `https://www.pexels.com/@${f.usuario}/`, foto: `https://www.pexels.com/photo/${f.id}/`, banco: "Pexels" }
    : { autor: `https://unsplash.com/@${f.usuario}`, foto: `https://unsplash.com/photos/${f.id}`, banco: "Unsplash" };

// Unsplash (licencia de Unsplash, comprobada en la página de cada foto el 30 de
// octubre de 2026) y Pexels (licencia de Pexels, comprobada el 31 de octubre de
// 2026). Ninguna muestra un hotel real llamado Aurea: son referencias visuales
// para una demo. Créditos completos en /creditos/ y en propuesta/CREDITOS.md.
export const fotos = {
  costaAcantilado: { src: costaAcantilado, alt: "Acantilado oscuro sobre el mar al caer el sol, con la espuma blanca en la orilla", autor: "Mohammed Imad", usuario: "m_imad", id: "yXXIsTwNsa4", archivo: "costa-acantilado.jpg" },
  costaBarca: { src: costaBarca, alt: "Mar en calma al anochecer, con una línea naranja en el horizonte y una barca lejana", autor: "Mateo Krossler", usuario: "mateokross", id: "6eSX66KO2H4", archivo: "costa-barca.jpg" },
  costaPlayaNegra: { src: costaPlayaNegra, alt: "Playa de arena negra vista desde lo alto, con las olas rompiendo en blanco", autor: "Jose Llamas", usuario: "josilito", id: "Q_gtPPR56K8", archivo: "costa-playa-negra.jpg" },
  llegadaCosta: { src: llegadaCosta, alt: "Costa de roca oscura al amanecer, con el camino sobre el acantilado", autor: "Tropic Alizé", usuario: "tropicalize", id: "JQq2LSqvgaA", archivo: "llegada-costa.jpg" },
  materialBasalto: { src: materialBasalto, alt: "Piedra negra de superficie rugosa, de cerca", autor: "David Jorre", usuario: "davidjorre", id: "oQbLeq4nOek", archivo: "material-basalto.jpg" },
  materialCal: { src: materialCal, alt: "Muro encalado con la luz de la tarde entrando en diagonal", autor: "Bernard Hermant", usuario: "bernardhermant", id: "u7VDgNGb78w", archivo: "material-cal.jpg" },
  casaEscalera: { src: casaEscalera, alt: "Escalones de piedra tallados en el acantilado, bajando hacia el agua", autor: "Peter Burdon", usuario: "peterburdon", id: "fwW0b-4tOnQ", archivo: "casa-escalera.jpg" },
  diaPoza: { src: diaPoza, alt: "Poza de marea con escalera metálica y una ola rompiendo al amanecer", autor: "Oliver Williams", usuario: "oxwilliams", id: "Ib9ulWsL7mg", archivo: "dia-poza.jpg" },
  diaOrilla: { src: diaOrilla, alt: "Bañista entrando en el mar entre rocas con la primera luz", autor: "Elliot Gouy", usuario: "gouyelliot", id: "c353dQSiTEw", archivo: "dia-orilla.jpg" },
  diaRocas: { src: diaRocas, alt: "Rocas en un mar quieto con la luz rosada del alba", autor: "Antje Winkler", usuario: "antjewinkler", id: "EaD8-Ss49TA", archivo: "dia-rocas.jpg" },
  diaDesayuno: { src: diaDesayuno, alt: "Taza humeante sobre una mesa de madera junto a la ventana", autor: "Aimee Giles", usuario: "aim52", id: "u1QfqxhsrXQ", archivo: "dia-desayuno.jpg" },
  diaMediodia: { src: diaMediodia, alt: "Mesa al aire libre frente al mar a mediodía", autor: "Anastasiia Abramtsova", usuario: "lacrimk", id: "dkdBkDGS0AA", archivo: "dia-mediodia.jpg" },
  mesaPescado: { src: mesaPescado, alt: "Pescado a la brasa junto a una ensalada de la huerta", autor: "Facundo Luca", usuario: "faculuca93", id: "-aFSJtctPiA", archivo: "mesa-pescado.jpg" },
  mesaLimones: { src: mesaLimones, alt: "Cuenco de limones sobre una mesa blanca frente al mar", autor: "Arlind Photography", usuario: "arlindphotography", id: "JnR-5JOfLz0", archivo: "mesa-limones.jpg" },
  diaAzotea: { src: diaAzotea, alt: "Terraza en lo alto frente al mar con el sol rozando el horizonte", autor: "Ashraf", usuario: "katatoniaa", id: "AaaDWpZYZxY", archivo: "dia-azotea.jpg" },
  diaCopa: { src: diaCopa, alt: "Copa de vino blanco al atardecer con el mar dorado detrás", autor: "David Salamanca", usuario: "daveslmnca", id: "SSLibz6IBIo", archivo: "dia-copa.jpg" },
  diaVentanaOcaso: { src: diaVentanaOcaso, alt: "El sol poniéndose sobre el mar, visto desde una mesa junto a la ventana", autor: "Romain Gal", usuario: "wamstudio", id: "yw0FRhyWVDw", archivo: "dia-ventana-ocaso.jpg" },
  mesaVino: { src: mesaVino, alt: "Copa de vino blanco y plato sobre mantel blanco, en penumbra", autor: "Tommaso Ubezio", usuario: "tommasoubezio", id: "Upz2cj1Y-qM", archivo: "mesa-vino.jpg" },
  mesaPlato: { src: mesaPlato, alt: "Plato de cerámica negra con pescado, colmenillas y salsa", autor: "Trình Minh Thư", usuario: "imdauphong", id: "a6kYPun9_ao", archivo: "mesa-plato.jpg" },
  nocheCielo: { src: nocheCielo, alt: "La Vía Láctea sobre rocas en el agua", autor: "Luca Baggio", usuario: "luca42", id: "eKU3JGNCCMg", archivo: "noche-cielo.jpg" },
  nocheFarol: { src: nocheFarol, alt: "Farol con velas encendidas sobre la arena al anochecer", autor: "Frames For Your Heart", usuario: "framesforyourheart", id: "fwcO5vZg9Rk", archivo: "noche-farol.jpg" },
  spaPiscina: { src: spaPiscina, alt: "Piscina cubierta bajo un techo de madera iluminado con luz cálida", autor: "Antonio Araujo", usuario: "antonioaaaraujo", id: "AuWDRiprfXg", archivo: "spa-piscina.jpg" },
  spaTumbonas: { src: spaTumbonas, alt: "Tumbonas de madera junto a una piscina cubierta de piedra oscura", autor: "Antonio Araujo", usuario: "antonioaaaraujo", id: "T4fuKGw1ijM", archivo: "spa-tumbonas.jpg" },
  expBano: { src: expBano, alt: "Bañistas en el mar junto a una costa de roca al atardecer", autor: "Kalle Nilsson", usuario: "kallejy", id: "ojoICkCORik", archivo: "exp-bano.jpg" },
  expKayak: { src: expKayak, alt: "Kayak a la entrada de una cueva marina", autor: "Cam Carpenter", usuario: "cam_cameras", id: "0DReGVDnkOI", archivo: "exp-kayak.jpg" },
  expBarca: { src: expBarca, alt: "Barca de pesca sobre el mar en calma a la hora dorada", autor: "Alexander Kluge", usuario: "naii", id: "u7HTdpOiAV0", archivo: "exp-barca.jpg" },
  expVina: { src: expVina, alt: "Viñas protegidas por muros de piedra en tierra volcánica, al caer la tarde", autor: "Bruno da Costa", usuario: "ericpetrozza", id: "BgKym3KDnGU", archivo: "exp-vina.jpg" },
  expEstrellas: { src: expEstrellas, alt: "Una persona con una linterna roja bajo la Vía Láctea", autor: "Akbar Nemati", usuario: "akbarnemati", id: "AwhDNkJlSX4", archivo: "exp-estrellas.jpg" },
  estudioLuz: { src: estudioLuz, alt: "Sol de la mañana sobre la almohada", autor: "Maximilian Bungart", usuario: "hypernature", id: "cY8nJ6_p13c", archivo: "estudio-luz.jpg" },
  miradorVentana: { src: miradorVentana, alt: "Ventanal con cortinas oscuras abierto al mar", autor: "Arthur Charles Pratt", usuario: "cartiyee", id: "YR9CSC9K9Wc", archivo: "mirador-ventana.jpg" },
  // Estudio Jardín: Keegan Checks, una habitación de un hotel boutique en Jambiani
  estudioCama: { src: estudioCama, alt: "Cama con ropa blanca bajo dos cestos tejidos en una pared de estuco terracota", autor: "Keegan Checks", usuario: "keeganjchecks", id: "39836723", archivo: "estudio-cama.jpg", fuente: "pexels" },
  estudioPatio: { src: estudioPatio, alt: "Porche con dos butacas de madera frente al jardín de palmeras", autor: "Keegan Checks", usuario: "keeganjchecks", id: "39836727", archivo: "estudio-patio.jpg", fuente: "pexels" },
  estudioSofa: { src: estudioSofa, alt: "Sofá de madera con cojín bordado junto a una vasija tejida", autor: "Keegan Checks", usuario: "keeganjchecks", id: "39836728", archivo: "estudio-sofa.jpg", fuente: "pexels" },
  estudioArmario: { src: estudioArmario, alt: "Armario abierto de madera y rejilla con albornoces y lámparas colgantes", autor: "Keegan Checks", usuario: "keeganjchecks", id: "39836721", archivo: "estudio-armario.jpg", fuente: "pexels" },
  // Suite Mirador: Rosie C, una habitación frente al mar
  miradorVentanal: { src: miradorVentanal, alt: "Ventanal de suelo a techo abierto al mar turquesa, con la cama delante", autor: "Rosie C", usuario: "rosie-c-94104461", id: "14746021", archivo: "mirador-ventanal.jpg", fuente: "pexels" },
  miradorAtardecer: { src: miradorAtardecer, alt: "El balcón al atardecer, con una botella de vino sobre la mesa", autor: "Rosie C", usuario: "rosie-c-94104461", id: "14746028", archivo: "mirador-atardecer.jpg", fuente: "pexels" },
  miradorBalcon: { src: miradorBalcon, alt: "Mesa redonda con flores en el balcón de madera sobre el mar", autor: "Rosie C", usuario: "rosie-c-94104461", id: "14746029", archivo: "mirador-balcon.jpg", fuente: "pexels" },
  miradorBanera: { src: miradorBanera, alt: "Bañera junto a una ventana estrecha que da al mar", autor: "Rosie C", usuario: "rosie-c-94104461", id: "14746024", archivo: "mirador-banera.jpg", fuente: "pexels" },
  // Suite Terraza: Keegan Checks, otra habitación del mismo hotel, con piscina privada
  terrazaPiscinaPrivada: { src: terrazaPiscinaPrivada, alt: "Piscina privada de agua turquesa en la terraza, con el mar al fondo", autor: "Keegan Checks", usuario: "keeganjchecks", id: "39836720", archivo: "terraza-piscina-privada.jpg", fuente: "pexels" },
  terrazaDormitorio: { src: terrazaDormitorio, alt: "Cama blanca ante un arco de estuco que deja ver el doble lavabo", autor: "Keegan Checks", usuario: "keeganjchecks", id: "39836703", archivo: "terraza-dormitorio.jpg", fuente: "pexels" },
  terrazaLavabos: { src: terrazaLavabos, alt: "Doble lavabo de piedra bajo un arco con dos espejos ovalados", autor: "Keegan Checks", usuario: "keeganjchecks", id: "39836700", archivo: "terraza-lavabos.jpg", fuente: "pexels" },
  terrazaMesaPiscina: { src: terrazaMesaPiscina, alt: "Mesa de madera con cuatro sillas junto al borde de la piscina", autor: "Keegan Checks", usuario: "keeganjchecks", id: "39836726", archivo: "terraza-mesa-piscina.jpg", fuente: "pexels" },
  terrazaButaca: { src: terrazaButaca, alt: "Butaca de madera y cuerda tejida junto a un ventanal con cortinas", autor: "Keegan Checks", usuario: "keeganjchecks", id: "39836711", archivo: "terraza-butaca.jpg", fuente: "pexels" },
  // Residencia Aurea: Ahmet Çötür, una villa con olivos sobre el mar
  residenciaPiscina: { src: residenciaPiscina, alt: "Piscina desbordante con tumbonas entre olivos, sobre el mar", autor: "Ahmet Çötür", usuario: "ahmetcotur", id: "28054897", archivo: "residencia-piscina.jpg", fuente: "pexels" },
  residenciaSalonVilla: { src: residenciaSalonVilla, alt: "Salón amplio y luminoso con sofá naranja y muebles bajos", autor: "Ahmet Çötür", usuario: "ahmetcotur", id: "28054893", archivo: "residencia-salon-villa.jpg", fuente: "pexels" },
  residenciaDormitorio: { src: residenciaDormitorio, alt: "Dormitorio con dos ventanales al mar y cama baja", autor: "Ahmet Çötür", usuario: "ahmetcotur", id: "28054888", archivo: "residencia-dormitorio.jpg", fuente: "pexels" },
  residenciaTerraza: { src: residenciaTerraza, alt: "Terraza con dos tumbonas rojas mirando al mar", autor: "Ahmet Çötür", usuario: "ahmetcotur", id: "28054889", archivo: "residencia-terraza.jpg", fuente: "pexels" },
  residenciaBanoVilla: { src: residenciaBanoVilla, alt: "Baño de tonos arena con doble lavabo y ducha de cristal", autor: "Ahmet Çötür", usuario: "ahmetcotur", id: "28054890", archivo: "residencia-bano-villa.jpg", fuente: "pexels" },
  residenciaCopas: { src: residenciaCopas, alt: "Dos copas de vino sobre una mesa junto a la piscina, con el mar detrás", autor: "Ahmet Çötür", usuario: "ahmetcotur", id: "28054879", archivo: "residencia-copas.jpg", fuente: "pexels" },
  // Un día, 21:30
  nochePozaEstrellas: { src: nochePozaEstrellas, alt: "Una poza entre rocas volcánicas bajo un cielo estrellado", autor: "Daniel Torobekov", usuario: "alohaphotostudio", id: "14237715", archivo: "noche-poza-estrellas.jpg", fuente: "pexels" },
} satisfies Record<string, Foto>;

export type ClaveFoto = keyof typeof fotos;

// Fotografías del catálogo que hoy no aparecen en ninguna página. Se conservan
// en src/assets/fotos/ y con su crédito, pero sin import: una imagen importada
// que no se pinta copia su JPEG original en la build.
export const fotosSinUso = {
  materialLino: { alt: "Lino crudo sobre un sofá con la sombra de una ventana", autor: "Efe Kekikciler", usuario: "mutanzom", id: "APy5TV9HrVo", archivo: "material-lino.jpg" },
  casaArco: { alt: "Arco encalado que se abre a una terraza sobre el mar", autor: "Sebastian Frederik Jacobsen", usuario: "hejsfj", id: "1njwyeX3epc", archivo: "casa-arco.jpg" },
  casaPiscina: { alt: "Piscina desbordante al anochecer, con palmeras recortadas contra el cielo naranja", autor: "Tommaso Ubezio", usuario: "tommasoubezio", id: "j2krsItJ_p0", archivo: "casa-piscina.jpg" },
  estudioDormitorio: { alt: "Dormitorio con pared de madera cálida, cama baja y ropa de lino", autor: "Clay Banks", usuario: "claybanks", id: "9MbWyxGzvD0", archivo: "estudio-dormitorio.jpg" },
  estudioBano: { alt: "Bañera exenta de cerámica sobre canto rodado, con una palmera junto a la pared de piedra", autor: "Jared Rice", usuario: "jareddrice", id: "PibraWHb4h8", archivo: "estudio-bano.jpg" },
  miradorBano: { alt: "Bañera frente a un ventanal en arco que da al mar", autor: "Yunshuo Qu", usuario: "yunshuoqu", id: "cKMz8A5Aytg", archivo: "mirador-bano.jpg" },
  miradorNoche: { alt: "Cama en penumbra con una lámpara de lectura encendida", autor: "Jp Valery", usuario: "jpvalery", id: "DE9MM2voqKc", archivo: "mirador-noche.jpg" },
  terrazaMesa: { alt: "Mesa con vino y copas junto a la cama, ante un ventanal sobre el mar", autor: "Antonio Araujo", usuario: "antonioaaaraujo", id: "R1NdTGhd9eM", archivo: "terraza-mesa.jpg" },
  terrazaPiscina: { alt: "Piscina de inmersión en una terraza blanca con tumbonas frente al mar", autor: "Zhen Yao", usuario: "rex_filmer", id: "M2ZYHyE4euA", archivo: "terraza-piscina.jpg" },
  terrazaDucha: { alt: "Ducha de travertino con grifería negra", autor: "Peter Muniz", usuario: "petepxl", id: "BEOIjrLSO2Q", archivo: "terraza-ducha.jpg" },
  residenciaSalon: { alt: "Salón con ventanales de suelo a techo sobre el mar al atardecer", autor: "Polina Kuzovkova", usuario: "p_kuzovkova", id: "zLCTdR6W8N4", archivo: "residencia-salon.jpg" },
  residenciaAzotea: { alt: "Azotea con un sofá corrido alrededor de un fuego, frente al mar", autor: "Pavel Gromov", usuario: "lastmanpaul", id: "FoXrxrpiPJ8", archivo: "residencia-azotea.jpg" },
  residenciaBano: { alt: "Lavabo tallado en piedra clara con grifería negra", autor: "Peter Muniz", usuario: "petepxl", id: "wfMM98Vggn0", archivo: "residencia-bano.jpg" },
} satisfies Record<string, Credito>;
