import type { ImageMetadata } from "astro";

import costaAcantilado from "../assets/fotos/costa-acantilado.jpg";
import costaBarca from "../assets/fotos/costa-barca.jpg";
import costaPlayaNegra from "../assets/fotos/costa-playa-negra.jpg";
import llegadaCosta from "../assets/fotos/llegada-costa.jpg";
import materialBasalto from "../assets/fotos/material-basalto.jpg";
import materialLino from "../assets/fotos/material-lino.jpg";
import materialCal from "../assets/fotos/material-cal.jpg";
import casaArco from "../assets/fotos/casa-arco.jpg";
import casaEscalera from "../assets/fotos/casa-escalera.jpg";
import casaPiscina from "../assets/fotos/casa-piscina.jpg";
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
import estudioDormitorio from "../assets/fotos/estudio-dormitorio.jpg";
import estudioBano from "../assets/fotos/estudio-bano.jpg";
import estudioLuz from "../assets/fotos/estudio-luz.jpg";
import miradorVentana from "../assets/fotos/mirador-ventana.jpg";
import miradorBano from "../assets/fotos/mirador-bano.jpg";
import miradorNoche from "../assets/fotos/mirador-noche.jpg";
import terrazaMesa from "../assets/fotos/terraza-mesa.jpg";
import terrazaPiscina from "../assets/fotos/terraza-piscina.jpg";
import terrazaDucha from "../assets/fotos/terraza-ducha.jpg";
import residenciaSalon from "../assets/fotos/residencia-salon.jpg";
import residenciaAzotea from "../assets/fotos/residencia-azotea.jpg";
import residenciaBano from "../assets/fotos/residencia-bano.jpg";

export interface Foto {
  src: ImageMetadata;
  alt: string;
  autor: string;
  usuario: string;
  /** Identificador de la foto en Unsplash */
  id: string;
  archivo: string;
}

// Todas de Unsplash, bajo la licencia de Unsplash (comprobada en la página de
// cada foto el 30 de octubre de 2026). Ninguna muestra un hotel real llamado
// Aurea: son referencias visuales para una demo. Créditos completos en
// CREDITS.md y en /creditos/.
export const fotos = {
  costaAcantilado: { src: costaAcantilado, alt: "Acantilado oscuro sobre el mar al caer el sol, con la espuma blanca en la orilla", autor: "Mohammed Imad", usuario: "m_imad", id: "yXXIsTwNsa4", archivo: "costa-acantilado.jpg" },
  costaBarca: { src: costaBarca, alt: "Mar en calma al anochecer, con una línea naranja en el horizonte y una barca lejana", autor: "Mateo Krossler", usuario: "mateokross", id: "6eSX66KO2H4", archivo: "costa-barca.jpg" },
  costaPlayaNegra: { src: costaPlayaNegra, alt: "Playa de arena negra vista desde lo alto, con las olas rompiendo en blanco", autor: "Jose Llamas", usuario: "josilito", id: "Q_gtPPR56K8", archivo: "costa-playa-negra.jpg" },
  llegadaCosta: { src: llegadaCosta, alt: "Costa de roca oscura al amanecer, con el camino sobre el acantilado", autor: "Tropic Alizé", usuario: "tropicalize", id: "JQq2LSqvgaA", archivo: "llegada-costa.jpg" },
  materialBasalto: { src: materialBasalto, alt: "Piedra negra de superficie rugosa, de cerca", autor: "David Jorre", usuario: "davidjorre", id: "oQbLeq4nOek", archivo: "material-basalto.jpg" },
  materialLino: { src: materialLino, alt: "Lino crudo sobre un sofá con la sombra de una ventana", autor: "Efe Kekikciler", usuario: "mutanzom", id: "APy5TV9HrVo", archivo: "material-lino.jpg" },
  materialCal: { src: materialCal, alt: "Muro encalado con la luz de la tarde entrando en diagonal", autor: "Bernard Hermant", usuario: "bernardhermant", id: "u7VDgNGb78w", archivo: "material-cal.jpg" },
  casaArco: { src: casaArco, alt: "Arco encalado que se abre a una terraza sobre el mar", autor: "Sebastian Frederik Jacobsen", usuario: "hejsfj", id: "1njwyeX3epc", archivo: "casa-arco.jpg" },
  casaEscalera: { src: casaEscalera, alt: "Escalones de piedra tallados en el acantilado, bajando hacia el agua", autor: "Peter Burdon", usuario: "peterburdon", id: "fwW0b-4tOnQ", archivo: "casa-escalera.jpg" },
  casaPiscina: { src: casaPiscina, alt: "Piscina desbordante al anochecer, con palmeras recortadas contra el cielo naranja", autor: "Tommaso Ubezio", usuario: "tommasoubezio", id: "j2krsItJ_p0", archivo: "casa-piscina.jpg" },
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
  estudioDormitorio: { src: estudioDormitorio, alt: "Dormitorio con pared de madera cálida, cama baja y ropa de lino", autor: "Clay Banks", usuario: "claybanks", id: "9MbWyxGzvD0", archivo: "estudio-dormitorio.jpg" },
  estudioBano: { src: estudioBano, alt: "Bañera exenta de cerámica sobre canto rodado, con una palmera junto a la pared de piedra", autor: "Jared Rice", usuario: "jareddrice", id: "PibraWHb4h8", archivo: "estudio-bano.jpg" },
  estudioLuz: { src: estudioLuz, alt: "Sol de la mañana sobre la almohada", autor: "Maximilian Bungart", usuario: "hypernature", id: "cY8nJ6_p13c", archivo: "estudio-luz.jpg" },
  miradorVentana: { src: miradorVentana, alt: "Ventanal con cortinas oscuras abierto al mar", autor: "Arthur Charles Pratt", usuario: "cartiyee", id: "YR9CSC9K9Wc", archivo: "mirador-ventana.jpg" },
  miradorBano: { src: miradorBano, alt: "Bañera frente a un ventanal en arco que da al mar", autor: "Yunshuo Qu", usuario: "yunshuoqu", id: "cKMz8A5Aytg", archivo: "mirador-bano.jpg" },
  miradorNoche: { src: miradorNoche, alt: "Cama en penumbra con una lámpara de lectura encendida", autor: "Jp Valery", usuario: "jpvalery", id: "DE9MM2voqKc", archivo: "mirador-noche.jpg" },
  terrazaMesa: { src: terrazaMesa, alt: "Mesa con vino y copas junto a la cama, ante un ventanal sobre el mar", autor: "Antonio Araujo", usuario: "antonioaaaraujo", id: "R1NdTGhd9eM", archivo: "terraza-mesa.jpg" },
  terrazaPiscina: { src: terrazaPiscina, alt: "Piscina de inmersión en una terraza blanca con tumbonas frente al mar", autor: "Zhen Yao", usuario: "rex_filmer", id: "M2ZYHyE4euA", archivo: "terraza-piscina.jpg" },
  terrazaDucha: { src: terrazaDucha, alt: "Ducha de travertino con grifería negra", autor: "Peter Muniz", usuario: "petepxl", id: "BEOIjrLSO2Q", archivo: "terraza-ducha.jpg" },
  residenciaSalon: { src: residenciaSalon, alt: "Salón con ventanales de suelo a techo sobre el mar al atardecer", autor: "Polina Kuzovkova", usuario: "p_kuzovkova", id: "zLCTdR6W8N4", archivo: "residencia-salon.jpg" },
  residenciaAzotea: { src: residenciaAzotea, alt: "Azotea con un sofá corrido alrededor de un fuego, frente al mar", autor: "Pavel Gromov", usuario: "lastmanpaul", id: "FoXrxrpiPJ8", archivo: "residencia-azotea.jpg" },
  residenciaBano: { src: residenciaBano, alt: "Lavabo tallado en piedra clara con grifería negra", autor: "Peter Muniz", usuario: "petepxl", id: "wfMM98Vggn0", archivo: "residencia-bano.jpg" },
} satisfies Record<string, Foto>;

export type ClaveFoto = keyof typeof fotos;
