import _ from 'underscore';
import Smiley from './images/emoji.svg';
import AnimalsAndNature from './images/emojiCategoryIcons/plant.svg';
import FoodAndDrink from './images/emojiCategoryIcons/hamburger.svg';
import TravelAndPlaces from './images/emojiCategoryIcons/plane.svg';
import Activities from './images/emojiCategoryIcons/soccer-ball.svg';
import Objects from './images/emojiCategoryIcons/light-bulb.svg';
import Symbols from './images/emojiCategoryIcons/peace-sign.svg';
import Flags from './images/emojiCategoryIcons/flag.svg';
import FrequentlyUsed from './images/history.svg';

const skinTones = [
    {
        code: '🖐',
        skinTone: -1,
    },
    {
        code: '🖐🏻',
        skinTone: 0,
    },
    {
        code: '🖐🏼',
        skinTone: 1,
    },
    {
        code: '🖐🏽',
        skinTone: 2,
    },
    {
        code: '🖐🏾',
        skinTone: 3,
    },
    {
        code: '🖐🏿',
        skinTone: 4,
    },
];

const emojis = [
    {
        code: 'smileysAndEmotion',
        icon: Smiley,
        header: true,
    },
    {
        code: '😀',
        name: {
            en: 'grinning',
            es: 'sonriendo',
        },
        keywords: {
            en: ['face', 'grin', 'grinning face'],
            es: ['cara', 'divertido', 'feliz', 'sonrisa', 'cara sonriendo'],
        },
    },
    {
        code: '😃',
        name: {
            en: 'smiley',
            es: 'sonriente',
        },
        keywords: {
            en: ['face', 'mouth', 'open', 'smile', 'grinning face with big eyes'],
            es: ['cara', 'divertido', 'risa', 'sonriendo', 'cara sonriendo con ojos grandes'],
        },
    },
    {
        code: '😄',
        name: {
            en: 'smile',
            es: 'sonrisa',
        },
        keywords: {
            en: ['eye', 'face', 'mouth', 'open', 'smile', 'grinning face with smiling eyes'],
            es: ['abierta', 'cara', 'ojo', 'sonrisa', 'cara sonriendo con ojos sonrientes'],
        },
    },
    {
        code: '😁',
        name: {
            en: 'grin',
            es: 'sonrisa_burlona',
        },
        keywords: {
            en: ['eye', 'face', 'grin', 'smile', 'beaming face with smiling eyes'],
            es: ['cara', 'ojo', 'risa', 'sonrisa', 'cara radiante con ojos sonrientes'],
        },
    },
    {
        code: '😆',
        name: {
            en: 'laughing',
            es: 'risa',
        },
        keywords: {
            en: ['face', 'laugh', 'mouth', 'satisfied', 'smile', 'grinning squinting face'],
            es: ['abierta', 'boca', 'cara', 'risa', 'cara sonriendo con los ojos cerrados'],
        },
    },
    {
        code: '😅',
        name: {
            en: 'sweat_smile',
            es: 'sonrisa_con_sudor',
        },
        keywords: {
            en: ['cold', 'face', 'open', 'smile', 'sweat', 'grinning face with sweat'],
            es: ['cara', 'frío', 'risa', 'sudor', 'cara sonriendo con sudor frío'],
        },
    },
    {
        code: '🤣',
        name: {
            en: 'rolling_on_the_floor_laughing',
            es: 'muriéndose_de_risa',
        },
        keywords: {
            en: ['face', 'floor', 'laugh', 'rofl', 'rolling', 'rotfl', 'rolling on the floor laughing'],
            es: ['cara', 'carcajada', 'ojos cerrados', 'risa', 'cara revolviéndose de la risa'],
        },
    },
    {
        code: '😂',
        name: {
            en: 'joy',
            es: 'alegría',
        },
        keywords: {
            en: ['face', 'joy', 'laugh', 'tear', 'face with tears of joy'],
            es: ['cara', 'felicidad', 'lágrima', 'risa', 'cara llorando de risa'],
        },
    },
    {
        code: '🙂',
        name: {
            en: 'slightly_smiling_face',
            es: 'cara_ligeramente_sonriente',
        },
        keywords: {
            en: ['face', 'smile', 'slightly smiling face'],
            es: ['cara', 'sonrisa', 'cara sonriendo ligeramente'],
        },
    },
    {
        code: '🙃',
        name: {
            en: 'upside_down_face',
            es: 'cara_boca_arriba',
        },
        keywords: {
            en: ['face', 'upside-down'],
            es: ['cara', 'revés', 'cara al revés'],
        },
    },
    {
        code: '😉',
        name: {
            en: 'wink',
            es: 'guiño',
        },
        keywords: {
            en: ['face', 'wink', 'winking face'],
            es: ['cara', 'guiño', 'cara guiñando el ojo'],
        },
    },
    {
        code: '😊',
        name: {
            en: 'blush',
            es: 'sonrojo',
        },
        keywords: {
            en: ['blush', 'eye', 'face', 'smile', 'smiling face with smiling eyes'],
            es: ['cara', 'ojo', 'rubor', 'sonrisa', 'cara feliz con ojos sonrientes'],
        },
    },
    {
        code: '😇',
        name: {
            en: 'innocent',
            es: 'inocente',
        },
        keywords: {
            en: ['angel', 'face', 'fantasy', 'halo', 'innocent', 'smiling face with halo'],
            es: ['ángel', 'cara', 'halo', 'sonrisa', 'cara sonriendo con aureola'],
        },
    },
    {
        code: '🥰',
        name: {
            en: 'smiling_face_with_3_hearts',
            es: 'cara_sonriendo_con_corazones',
        },
        keywords: {
            en: ['adore', 'crush', 'hearts', 'in love', 'smiling face with hearts'],
            es: ['adorar', 'amor', 'corazones', 'enamorada', 'enamorado', 'cara sonriendo con corazones'],
        },
    },
    {
        code: '😍',
        name: {
            en: 'heart_eyes',
            es: 'ojos_de_corazón',
        },
        keywords: {
            en: ['eye', 'face', 'love', 'smile', 'smiling face with heart-eyes'],
            es: ['amor', 'cara', 'corazón', 'sonrisa', 'cara sonriendo con ojos de corazón'],
        },
    },
    {
        code: '🤩',
        name: {
            en: 'star-struck',
            es: 'ojos_estrella',
        },
        keywords: {
            en: ['eyes', 'face', 'grinning', 'star', 'star-struck'],
            es: ['cara', 'estrellas', 'sonrisa', 'cara sonriendo con estrellas'],
        },
    },
    {
        code: '😘',
        name: {
            en: 'kissing_heart',
            es: 'beso_de_corazón',
        },
        keywords: {
            en: ['face', 'kiss', 'face blowing a kiss'],
            es: ['beso', 'cara', 'cara lanzando un beso'],
        },
    },
    {
        code: '😗',
        name: {
            en: 'kissing',
            es: 'besos',
        },
        keywords: {
            en: ['face', 'kiss', 'kissing face'],
            es: ['beso', 'cara', 'cara besando'],
        },
    },
    {
        code: '☺️',
        name: {
            en: 'relaxed',
            es: 'relajado',
        },
        keywords: {
            en: ['face', 'outlined', 'relaxed', 'smile', 'smiling face'],
            es: ['cara', 'contorno', 'relajado', 'sonrisa', 'cara sonriente'],
        },
    },
    {
        code: '😚',
        name: {
            en: 'kissing_closed_eyes',
            es: 'beso_con_ojos_cerrados',
        },
        keywords: {
            en: ['closed', 'eye', 'face', 'kiss', 'kissing face with closed eyes'],
            es: ['beso', 'cara', 'cerrado', 'ojo', 'cara besando con los ojos cerrados'],
        },
    },
    {
        code: '😙',
        name: {
            en: 'kissing_smiling_eyes',
            es: 'besando_con_ojos_sonrientes',
        },
        keywords: {
            en: ['eye', 'face', 'kiss', 'smile', 'kissing face with smiling eyes'],
            es: ['beso', 'cara', 'ojo', 'sonrisa', 'cara besando con ojos sonrientes'],
        },
    },
    {
        code: '🥲',
        name: {
            en: 'smiling_face_with_tear',
            es: 'cara_sonriente_con_lágrima',
        },
        keywords: {
            en: ['grateful', 'proud', 'relieved', 'smiling', 'tear', 'touched', 'smiling face with tear'],
            es: ['agradecido', 'aliviado', 'emocionado', 'lágrima', 'orgulloso', 'sonrisa', 'cara sonriente con lágrima'],
        },
    },
    {
        code: '😋',
        name: {
            en: 'yum',
            es: 'sabroso',
        },
        keywords: {
            en: ['delicious', 'face', 'savouring', 'smile', 'yum', 'face savoring food'],
            es: ['cara', 'delicioso', 'hambre', 'rico', 'cara saboreando comida'],
        },
    },
    {
        code: '😛',
        name: {
            en: 'stuck_out_tongue',
            es: 'lengua_fuera',
        },
        keywords: {
            en: ['face', 'tongue', 'face with tongue'],
            es: ['cara', 'lengua', 'cara sacando la lengua'],
        },
    },
    {
        code: '😜',
        name: {
            en: 'stuck_out_tongue_winking_eye',
            es: 'lengua_fuera_con_guiño_de_ojos',
        },
        keywords: {
            en: ['eye', 'face', 'joke', 'tongue', 'wink', 'winking face with tongue'],
            es: ['cara', 'guiño', 'lengua', 'ojo', 'cara sacando la lengua y guiñando un ojo'],
        },
    },
    {
        code: '🤪',
        name: {
            en: 'zany_face',
            es: 'cara_loco',
        },
        keywords: {
            en: ['eye', 'goofy', 'large', 'small', 'zany face'],
            es: ['grande', 'ojo', 'pequeño', 'cara de loco'],
        },
    },
    {
        code: '😝',
        name: {
            en: 'stuck_out_tongue_closed_eyes',
            es: 'lengua_fuera_con_ojos_cerrados',
        },
        keywords: {
            en: ['eye', 'face', 'horrible', 'taste', 'tongue', 'squinting face with tongue'],
            es: ['cara', 'lengua', 'ojo', 'sabor', 'cara con ojos cerrados y lengua fuera'],
        },
    },
    {
        code: '🤑',
        name: {
            en: 'money_mouth_face',
            es: 'cara_con_dinero_en_la_boca',
        },
        keywords: {
            en: ['face', 'money', 'mouth', 'money-mouth face'],
            es: ['boca', 'cara', 'dinero', 'cara con lengua de dinero'],
        },
    },
    {
        code: '🤗',
        name: {
            en: 'hugging_face',
            es: 'cara_abrazando',
        },
        keywords: {
            en: ['face', 'hug', 'hugging', 'open hands', 'smiling face', 'smiling face with open hands'],
            es: ['abrazo', 'cara', 'sonrisa', 'cara con manos abrazando'],
        },
    },
    {
        code: '🤭',
        name: {
            en: 'face_with_hand_over_mouth',
            es: 'cara_con_mano_sobre_boca',
        },
        keywords: {
            en: ['whoops', 'face with hand over mouth'],
            es: ['ostras', 'uy', 'vaya', 'cara con mano sobre la boca'],
        },
    },
    {
        code: '🤫',
        name: {
            en: 'shushing_face',
            es: 'calla',
        },
        keywords: {
            en: ['quiet', 'shush', 'shushing face'],
            es: ['callado', 'silencio', 'cara pidiendo silencio'],
        },
    },
    {
        code: '🤔',
        name: {
            en: 'thinking_face',
            es: 'cara_pensativa',
        },
        keywords: {
            en: ['face', 'thinking'],
            es: ['cara', 'duda', 'pensando', 'cara pensativa'],
        },
    },
    {
        code: '🤐',
        name: {
            en: 'zipper_mouth_face',
            es: 'cara_con_boca_de_cremallera',
        },
        keywords: {
            en: ['face', 'mouth', 'zipper', 'zipper-mouth face'],
            es: ['boca', 'cara', 'cremallera', 'cara con la boca cerrada con cremallera'],
        },
    },
    {
        code: '🤨',
        name: {
            en: 'face_with_raised_eyebrow',
            es: 'cara_con_ceja_levantada',
        },
        keywords: {
            en: ['distrust', 'skeptic', 'face with raised eyebrow'],
            es: ['desconfiado', 'escéptico', 'cara con ceja alzada'],
        },
    },
    {
        code: '😐',
        name: {
            en: 'neutral_face',
            es: 'cara_neutra',
        },
        keywords: {
            en: ['deadpan', 'face', 'meh', 'neutral'],
            es: ['cara', 'inexpresivo', 'neutral'],
        },
    },
    {
        code: '😑',
        name: {
            en: 'expressionless',
            es: 'inexpresivo',
        },
        keywords: {
            en: ['expressionless', 'face', 'inexpressive', 'meh', 'unexpressive'],
            es: ['cara', 'inexpresión', 'inexpresiva', 'inexpresivo', 'cara sin expresión'],
        },
    },
    {
        code: '😶',
        name: {
            en: 'no_mouth',
            es: 'prohibido_hablar',
        },
        keywords: {
            en: ['face', 'mouth', 'quiet', 'silent', 'face without mouth'],
            es: ['boca', 'callado', 'cara', 'silencio', 'cara sin boca'],
        },
    },
    {
        code: '😶‍🌫️',
        name: {
            en: 'face_in_clouds',
            es: 'prohibido_hablar',
        },
        keywords: {
            en: ['absentminded', 'face in the fog', 'head in clouds', 'face in clouds'],
            es: ['atontado', 'cara', 'despistado', 'distraído', 'nubes', 'parra', 'cara en las nubes'],
        },
    },
    {
        code: '😏',
        name: {
            en: 'smirk',
            es: 'sonrisita',
        },
        keywords: {
            en: ['face', 'smirk', 'smirking face'],
            es: ['cara', 'listillo', 'superioridad', 'cara sonriendo con superioridad'],
        },
    },
    {
        code: '😒',
        name: {
            en: 'unamused',
            es: 'no_interesado',
        },
        keywords: {
            en: ['face', 'unamused', 'unhappy'],
            es: ['cara', 'insatisfacción', 'rechazo', 'cara de desaprobación'],
        },
    },
    {
        code: '🙄',
        name: {
            en: 'face_with_rolling_eyes',
            es: 'cara_con_ojos_en_blanco',
        },
        keywords: {
            en: ['eyeroll', 'eyes', 'face', 'rolling', 'face with rolling eyes'],
            es: ['cara', 'frustración', 'ojos', 'vueltos', 'cara con ojos en blanco'],
        },
    },
    {
        code: '😬',
        name: {
            en: 'grimacing',
            es: 'muecas',
        },
        keywords: {
            en: ['face', 'grimace', 'grimacing face'],
            es: ['cara', 'mueca', 'cara haciendo una mueca'],
        },
    },
    {
        code: '😮‍💨',
        name: {
            en: 'face_exhaling',
            es: 'boca_abierta',
        },
        keywords: {
            en: ['exhale', 'gasp', 'groan', 'relief', 'whisper', 'whistle', 'face exhaling'],
            es: ['cara', 'exhalar', 'resoplido', 'respirar', 'silbato', 'silbido', 'cara exhalando'],
        },
    },
    {
        code: '🤥',
        name: {
            en: 'lying_face',
            es: 'cara_de_mentiroso',
        },
        keywords: {
            en: ['face', 'lie', 'pinocchio', 'lying face'],
            es: ['cara', 'mentiroso', 'nariz', 'pinocho', 'cara de mentiroso'],
        },
    },
    {
        code: '😌',
        name: {
            en: 'relieved',
            es: 'aliviado',
        },
        keywords: {
            en: ['face', 'relieved'],
            es: ['aliviado', 'cara', 'cara de alivio'],
        },
    },
    {
        code: '😔',
        name: {
            en: 'pensive',
            es: 'pensativo',
        },
        keywords: {
            en: ['dejected', 'face', 'pensive'],
            es: ['alicaído', 'cara', 'desanimado', 'pensativo', 'cara desanimada'],
        },
    },
    {
        code: '😪',
        name: {
            en: 'sleepy',
            es: 'soñoliento',
        },
        keywords: {
            en: ['face', 'good night', 'sleep', 'sleepy face'],
            es: ['cara', 'dormir', 'sueño', 'cara de sueño'],
        },
    },
    {
        code: '🤤',
        name: {
            en: 'drooling_face',
            es: 'cara-babeando',
        },
        keywords: {
            en: ['drooling', 'face'],
            es: ['baba', 'babeando', 'cara'],
        },
    },
    {
        code: '😴',
        name: {
            en: 'sleeping',
            es: 'durmiendo',
        },
        keywords: {
            en: ['face', 'good night', 'sleep', 'ZZZ', 'sleeping face'],
            es: ['cara', 'dormido', 'sueño', 'zzz', 'cara durmiendo'],
        },
    },
    {
        code: '😷',
        name: {
            en: 'mask',
            es: 'máscara',
        },
        keywords: {
            en: ['cold', 'doctor', 'face', 'mask', 'sick', 'face with medical mask'],
            es: ['cara', 'enfermo', 'malo', 'máscara', 'cara con mascarilla médica'],
        },
    },
    {
        code: '🤒',
        name: {
            en: 'face_with_thermometer',
            es: 'cara_con_termómetro',
        },
        keywords: {
            en: ['face', 'ill', 'sick', 'thermometer', 'face with thermometer'],
            es: ['cara', 'enfermo', 'malo', 'termómetro', 'cara con termómetro'],
        },
    },
    {
        code: '🤕',
        name: {
            en: 'face_with_head_bandage',
            es: 'cara_con_la_cabeza_vendada',
        },
        keywords: {
            en: ['bandage', 'face', 'hurt', 'injury', 'face with head-bandage'],
            es: ['cara', 'dolor', 'herida', 'venda', 'cara con la cabeza vendada'],
        },
    },
    {
        code: '🤢',
        name: {
            en: 'nauseated_face',
            es: 'cara_de_asco',
        },
        keywords: {
            en: ['face', 'nauseated', 'vomit'],
            es: ['cara', 'náuseas', 'vomitar', 'cara de náuseas'],
        },
    },
    {
        code: '🤮',
        name: {
            en: 'face_vomiting',
            es: 'cara_vomitando',
        },
        keywords: {
            en: ['puke', 'sick', 'vomit', 'face vomiting'],
            es: ['enfermo', 'malo', 'vomitar', 'cara vomitando'],
        },
    },
    {
        code: '🤧',
        name: {
            en: 'sneezing_face',
            es: 'cara_estornudando',
        },
        keywords: {
            en: ['face', 'gesundheit', 'sneeze', 'sneezing face'],
            es: ['cara', 'estornudar', 'estornudo', 'pañuelo', 'cara estornudando'],
        },
    },
    {
        code: '🥵',
        name: {
            en: 'hot_face',
            es: 'cara_con_calor',
        },
        keywords: {
            en: ['feverish', 'heat stroke', 'hot', 'red-faced', 'sweating', 'hot face'],
            es: ['calor', 'cara roja', 'fiebre', 'golpe de calor', 'sudor', 'cara con calor'],
        },
    },
    {
        code: '🥶',
        name: {
            en: 'cold_face',
            es: 'cara_con_frío',
        },
        keywords: {
            en: ['blue-faced', 'cold', 'freezing', 'frostbite', 'icicles', 'cold face'],
            es: ['cara congelada', 'congelado', 'frío', 'helado', 'cara con frío'],
        },
    },
    {
        code: '🥴',
        name: {
            en: 'woozy_face',
            es: 'cara_de_grogui',
        },
        keywords: {
            en: ['dizzy', 'intoxicated', 'tipsy', 'uneven eyes', 'wavy mouth', 'woozy face'],
            es: ['atontado', 'entonado', 'grogui', 'intoxicado', 'mareado', 'cara de grogui'],
        },
    },
    {
        code: '😵',
        name: {
            en: 'dizzy_face',
            es: 'cara_de_mareo',
        },
        keywords: {
            en: ['crossed-out eyes', 'dead', 'face', 'knocked out', 'face with crossed-out eyes'],
            es: ['cara', 'mareo', 'cara mareada'],
        },
    },
    {
        code: '😵‍💫',
        name: {
            en: 'face_with_spiral_eyes',
            es: 'cara_de_mareo',
        },
        keywords: {
            en: ['dizzy', 'hypnotized', 'spiral', 'trouble', 'whoa', 'face with spiral eyes'],
            es: ['alucinado', 'desmayado', 'hipnotizado', 'locura', 'mareado', 'problema', 'cara con ojos de espiral'],
        },
    },
    {
        code: '🤯',
        name: {
            en: 'exploding_head',
            es: 'cabeza_explotando',
        },
        keywords: {
            en: ['mind blown', 'shocked', 'exploding head'],
            es: ['cabeza', 'explosión', 'cabeza explotando'],
        },
    },
    {
        code: '🤠',
        name: {
            en: 'face_with_cowboy_hat',
            es: 'cara_con_sombrero_vaquero',
        },
        keywords: {
            en: ['cowboy', 'cowgirl', 'face', 'hat'],
            es: ['cara', 'sombrero', 'vaquera', 'vaquero', 'cara con sombrero de vaquero'],
        },
    },
    {
        code: '🥳',
        name: {
            en: 'partying_face',
            es: 'cara_de_fiesta',
        },
        keywords: {
            en: ['celebration', 'hat', 'horn', 'party', 'partying face'],
            es: ['capirote', 'celebración', 'fiesta', 'gorro', 'matasuegras', 'cara de fiesta'],
        },
    },
    {
        code: '🥸',
        name: {
            en: 'disguised_face',
            es: 'cara_disfrazada',
        },
        keywords: {
            en: ['disguise', 'face', 'glasses', 'incognito', 'nose', 'disguised face'],
            es: ['careta', 'disfraz', 'disimulo', 'gafas', 'incógnito', 'nariz', 'cara disfrazada'],
        },
    },
    {
        code: '😎',
        name: {
            en: 'sunglasses',
            es: 'gafas_de_sol',
        },
        keywords: {
            en: ['bright', 'cool', 'face', 'sun', 'sunglasses', 'smiling face with sunglasses'],
            es: ['cara', 'gafas', 'guay', 'sol', 'cara sonriendo con gafas de sol'],
        },
    },
    {
        code: '🤓',
        name: {
            en: 'nerd_face',
            es: 'cara_de_nerd',
        },
        keywords: {
            en: ['face', 'geek', 'nerd'],
            es: ['cara', 'empollón', 'friki', 'friqui', 'cara de empollón'],
        },
    },
    {
        code: '🧐',
        name: {
            en: 'face_with_monocle',
            es: 'cara_con_monóculo',
        },
        keywords: {
            en: ['face', 'monocle', 'stuffy', 'face with monocle'],
            es: ['aristocrático', 'estirado', 'cara con monóculo'],
        },
    },
    {
        code: '😕',
        name: {
            en: 'confused',
            es: 'desconcertado',
        },
        keywords: {
            en: ['confused', 'face', 'meh'],
            es: ['cara', 'confuso', 'cara de confusión'],
        },
    },
    {
        code: '😟',
        name: {
            en: 'worried',
            es: 'preocupado',
        },
        keywords: {
            en: ['face', 'worried'],
            es: ['cara', 'preocupación', 'preocupado', 'cara preocupada'],
        },
    },
    {
        code: '🙁',
        name: {
            en: 'slightly_frowning_face',
            es: 'cara_con_el_ceño_ligeramente_fruncido',
        },
        keywords: {
            en: ['face', 'frown', 'slightly frowning face'],
            es: ['cara', 'ceño', 'fruncido', 'cara con el ceño ligeramente fruncido'],
        },
    },
    {
        code: '☹️',
        name: {
            en: 'white_frowning_face',
            es: 'cara_blanca_ceñuda',
        },
        keywords: {
            en: ['face', 'frown', 'frowning face'],
            es: ['cara', 'ceño', 'fruncido', 'cara con el ceño fruncido'],
        },
    },
    {
        code: '😮',
        name: {
            en: 'open_mouth',
            es: 'boca_abierta',
        },
        keywords: {
            en: ['face', 'mouth', 'open', 'sympathy', 'face with open mouth'],
            es: ['boca', 'cara', 'cara con la boca abierta'],
        },
    },
    {
        code: '😯',
        name: {
            en: 'hushed',
            es: 'silencioso',
        },
        keywords: {
            en: ['face', 'hushed', 'stunned', 'surprised'],
            es: ['alucinado', 'cara', 'estupefacto', 'sorprendido', 'cara estupefacta'],
        },
    },
    {
        code: '😲',
        name: {
            en: 'astonished',
            es: 'asombrado',
        },
        keywords: {
            en: ['astonished', 'face', 'shocked', 'totally'],
            es: ['alucinado', 'asombrado', 'cara', 'pasmado', 'cara asombrada'],
        },
    },
    {
        code: '😳',
        name: {
            en: 'flushed',
            es: 'sonrojado',
        },
        keywords: {
            en: ['dazed', 'face', 'flushed'],
            es: ['cara', 'colorado', 'sonrojado', 'cara sonrojada'],
        },
    },
    {
        code: '🥺',
        name: {
            en: 'pleading_face',
            es: 'cara_de_por_favor',
        },
        keywords: {
            en: ['begging', 'mercy', 'puppy eyes', 'pleading face'],
            es: ['implorar', 'ojos adorables', 'piedad', 'por favor', 'cara suplicante'],
        },
    },
    {
        code: '😦',
        name: {
            en: 'frowning',
            es: 'ceñudo',
        },
        keywords: {
            en: ['face', 'frown', 'mouth', 'open', 'frowning face with open mouth'],
            es: ['boca abierta', 'cara', 'ceño fruncido con boca abierta', 'cara con el ceño fruncido y la boca abierta'],
        },
    },
    {
        code: '😧',
        name: {
            en: 'anguished',
            es: 'angustiado',
        },
        keywords: {
            en: ['anguished', 'face'],
            es: ['angustia', 'angustiado', 'cara', 'cara angustiada'],
        },
    },
    {
        code: '😨',
        name: {
            en: 'fearful',
            es: 'temeroso',
        },
        keywords: {
            en: ['face', 'fear', 'fearful', 'scared'],
            es: ['asustado', 'cara', 'miedo', 'miedoso', 'cara asustada'],
        },
    },
    {
        code: '😰',
        name: {
            en: 'cold_sweat',
            es: 'sudor_frío',
        },
        keywords: {
            en: ['blue', 'cold', 'face', 'rushed', 'sweat', 'anxious face with sweat'],
            es: ['ansiedad', 'cara', 'frío', 'sudor', 'cara con ansiedad y sudor'],
        },
    },
    {
        code: '😥',
        name: {
            en: 'disappointed_relieved',
            es: 'decepcionado_aliviado',
        },
        keywords: {
            en: ['disappointed', 'face', 'relieved', 'whew', 'sad but relieved face'],
            es: ['aliviado', 'cara', 'decepcionado', 'menos mal', 'cara triste pero aliviada'],
        },
    },
    {
        code: '😢',
        name: {
            en: 'cry',
            es: 'lloros',
        },
        keywords: {
            en: ['cry', 'face', 'sad', 'tear', 'crying face'],
            es: ['cara', 'lágrima', 'llorar', 'triste', 'cara llorando'],
        },
    },
    {
        code: '😭',
        name: {
            en: 'sob',
            es: 'sollozo',
        },
        keywords: {
            en: ['cry', 'face', 'sad', 'sob', 'tear', 'loudly crying face'],
            es: ['cara', 'lágrima', 'llorar', 'triste', 'cara llorando fuerte'],
        },
    },
    {
        code: '😱',
        name: {
            en: 'scream',
            es: 'grito',
        },
        keywords: {
            en: ['face', 'fear', 'munch', 'scared', 'scream', 'face screaming in fear'],
            es: ['asustado', 'cara', 'miedo', 'pánico', 'cara gritando de miedo'],
        },
    },
    {
        code: '😖',
        name: {
            en: 'confounded',
            es: 'aturdido',
        },
        keywords: {
            en: ['confounded', 'face'],
            es: ['cara', 'frustrado', 'cara de frustración'],
        },
    },
    {
        code: '😣',
        name: {
            en: 'persevere',
            es: 'tenacidad',
        },
        keywords: {
            en: ['face', 'persevere', 'persevering face'],
            es: ['cara', 'desesperación', 'frustración', 'cara desesperada'],
        },
    },
    {
        code: '😞',
        name: {
            en: 'disappointed',
            es: 'decepcionado',
        },
        keywords: {
            en: ['disappointed', 'face'],
            es: ['cara', 'decepción', 'decepcionado', 'cara decepcionada'],
        },
    },
    {
        code: '😓',
        name: {
            en: 'sweat',
            es: 'sudor',
        },
        keywords: {
            en: ['cold', 'face', 'sweat', 'downcast face with sweat'],
            es: ['cara', 'frío', 'sudor', 'cara con sudor frío'],
        },
    },
    {
        code: '😩',
        name: {
            en: 'weary',
            es: 'cansado',
        },
        keywords: {
            en: ['face', 'tired', 'weary'],
            es: ['agotado', 'cansado', 'cara', 'cara agotada'],
        },
    },
    {
        code: '😫',
        name: {
            en: 'tired_face',
            es: 'cara_cansada',
        },
        keywords: {
            en: ['face', 'tired'],
            es: ['cansado', 'cara', 'cara cansada'],
        },
    },
    {
        code: '🥱',
        name: {
            en: 'yawning_face',
            es: 'cara_de_bostezo',
        },
        keywords: {
            en: ['bored', 'tired', 'yawn', 'yawning face'],
            es: ['aburrido', 'bostezo', 'cansado', 'dormido', 'sueño', 'cara de bostezo'],
        },
    },
    {
        code: '😤',
        name: {
            en: 'triumph',
            es: 'triunfo',
        },
        keywords: {
            en: ['face', 'triumph', 'won', 'face with steam from nose'],
            es: ['cabreo', 'cara', 'enfado', 'cara resoplando'],
        },
    },
    {
        code: '😡',
        name: {
            en: 'rage',
            es: 'rabia',
        },
        keywords: {
            en: ['angry', 'enraged', 'face', 'mad', 'pouting', 'rage', 'red'],
            es: ['cabreo', 'cara', 'enfadado', 'furia', 'cara cabreada'],
        },
    },
    {
        code: '😠',
        name: {
            en: 'angry',
            es: 'enfado',
        },
        keywords: {
            en: ['anger', 'angry', 'face', 'mad'],
            es: ['cara', 'enfadado', 'histérico', 'cara enfadada'],
        },
    },
    {
        code: '🤬',
        name: {
            en: 'face_with_symbols_on_mouth',
            es: 'cara_con_símbolos_en_boca',
        },
        keywords: {
            en: ['swearing', 'face with symbols on mouth'],
            es: ['maldecir', 'palabrota', 'símbolo', 'cara con símbolos en la boca'],
        },
    },
    {
        code: '😈',
        name: {
            en: 'smiling_imp',
            es: 'diablillo_sonriente',
        },
        keywords: {
            en: ['face', 'fairy tale', 'fantasy', 'horns', 'smile', 'smiling face with horns'],
            es: ['cara', 'cuernos', 'demonio', 'sonrisa', 'cara sonriendo con cuernos'],
        },
    },
    {
        code: '👿',
        name: {
            en: 'imp',
            es: 'diablillo',
        },
        keywords: {
            en: ['demon', 'devil', 'face', 'fantasy', 'imp', 'angry face with horns'],
            es: ['cara', 'cuernos', 'demonio', 'diablo', 'cara enfadada con cuernos'],
        },
    },
    {
        code: '💀',
        name: {
            en: 'skull',
            es: 'calavera',
        },
        keywords: {
            en: ['death', 'face', 'fairy tale', 'monster', 'skull'],
            es: ['cara', 'cuento', 'monstruo', 'muerte', 'calavera'],
        },
    },
    {
        code: '☠️',
        name: {
            en: 'skull_and_crossbones',
            es: 'calavera_y_tibias_cruzadas',
        },
        keywords: {
            en: ['crossbones', 'death', 'face', 'monster', 'skull', 'skull and crossbones'],
            es: ['calavera', 'cara', 'huesos', 'muerte', 'calavera y huesos cruzados'],
        },
    },
    {
        code: '💩',
        name: {
            en: 'hankey',
            es: 'zurullo',
        },
        keywords: {
            en: ['dung', 'face', 'monster', 'poo', 'poop', 'pile of poo'],
            es: ['caca', 'cómic', 'mierda', 'mojón', 'caca con ojos'],
        },
    },
    {
        code: '🤡',
        name: {
            en: 'clown_face',
            es: 'cara_payaso',
        },
        keywords: {
            en: ['clown', 'face'],
            es: ['cara', 'payaso', 'cara de payaso'],
        },
    },
    {
        code: '👹',
        name: {
            en: 'japanese_ogre',
            es: 'ogro_japonés',
        },
        keywords: {
            en: ['creature', 'face', 'fairy tale', 'fantasy', 'monster', 'ogre'],
            es: ['cara', 'cuento', 'cuernos', 'sonrisa', 'demonio japonés oni'],
        },
    },
    {
        code: '👺',
        name: {
            en: 'japanese_goblin',
            es: 'duende_japonés',
        },
        keywords: {
            en: ['creature', 'face', 'fairy tale', 'fantasy', 'monster', 'goblin'],
            es: ['cara', 'cuento', 'fantasía', 'monstruo', 'tengu', 'demonio japonés tengu'],
        },
    },
    {
        code: '👻',
        name: {
            en: 'ghost',
            es: 'fantasma',
        },
        keywords: {
            en: ['creature', 'face', 'fairy tale', 'fantasy', 'monster', 'ghost'],
            es: ['cara', 'criatura', 'cuento', 'monstruo', 'fantasma'],
        },
    },
    {
        code: '👽',
        name: {
            en: 'alien',
            es: 'extraterrestre',
        },
        keywords: {
            en: ['creature', 'extraterrestrial', 'face', 'fantasy', 'ufo', 'alien'],
            es: ['alien', 'cara', 'criatura', 'extraterrestre', 'ovni', 'alienígena'],
        },
    },
    {
        code: '👾',
        name: {
            en: 'space_invader',
            es: 'invasor_del_espacio',
        },
        keywords: {
            en: ['alien', 'creature', 'extraterrestrial', 'face', 'monster', 'ufo'],
            es: ['alien', 'cara', 'criatura', 'extraterrestre', 'ovni', 'monstruo alienígena'],
        },
    },
    {
        code: '🤖',
        name: {
            en: 'robot_face',
            es: 'cara_de_robot',
        },
        keywords: {
            en: ['face', 'monster', 'robot'],
            es: ['cara', 'monstruo', 'robot'],
        },
    },
    {
        code: '😺',
        name: {
            en: 'smiley_cat',
            es: 'gato_sonriente',
        },
        keywords: {
            en: ['cat', 'face', 'grinning', 'mouth', 'open', 'smile'],
            es: ['cara', 'feliz', 'gato alegre', 'gato feliz', 'sonrisa', 'gato sonriendo'],
        },
    },
    {
        code: '😸',
        name: {
            en: 'smile_cat',
            es: 'gato_sonrisa',
        },
        keywords: {
            en: ['cat', 'eye', 'face', 'grin', 'smile', 'grinning cat with smiling eyes'],
            es: ['cara', 'gato', 'ojos', 'sonriente', 'sonrisa', 'gato sonriendo con ojos sonrientes'],
        },
    },
    {
        code: '😹',
        name: {
            en: 'joy_cat',
            es: 'gato_alegre',
        },
        keywords: {
            en: ['cat', 'face', 'joy', 'tear', 'cat with tears of joy'],
            es: ['cara', 'gato', 'lágrima', 'risa', 'gato llorando de risa'],
        },
    },
    {
        code: '😻',
        name: {
            en: 'heart_eyes_cat',
            es: 'gato_con_ojos_de_corazón',
        },
        keywords: {
            en: ['cat', 'eye', 'face', 'heart', 'love', 'smile', 'smiling cat with heart-eyes'],
            es: ['cara', 'corazón', 'enamorado', 'gato', 'gato sonriendo con ojos de corazón'],
        },
    },
    {
        code: '😼',
        name: {
            en: 'smirk_cat',
            es: 'gato_con_sonrisa_de_satisfacción',
        },
        keywords: {
            en: ['cat', 'face', 'ironic', 'smile', 'wry', 'cat with wry smile'],
            es: ['cara', 'gato', 'irónico', 'sonrisa', 'gato haciendo una mueca'],
        },
    },
    {
        code: '😽',
        name: {
            en: 'kissing_cat',
            es: 'gato_besando',
        },
        keywords: {
            en: ['cat', 'eye', 'face', 'kiss', 'kissing cat'],
            es: ['beso', 'cara', 'cariñoso', 'gato', 'gato besando'],
        },
    },
    {
        code: '🙀',
        name: {
            en: 'scream_cat',
            es: 'gato_gritando',
        },
        keywords: {
            en: ['cat', 'face', 'oh', 'surprised', 'weary'],
            es: ['cara', 'gato', 'pánico', 'preocupación', 'sorpresa', 'gato asustado'],
        },
    },
    {
        code: '😿',
        name: {
            en: 'crying_cat_face',
            es: 'cara_de_gato_lloroso',
        },
        keywords: {
            en: ['cat', 'cry', 'face', 'sad', 'tear', 'crying cat'],
            es: ['cara', 'gato', 'lágrima', 'pena', 'triste', 'gato llorando'],
        },
    },
    {
        code: '😾',
        name: {
            en: 'pouting_cat',
            es: 'gato_enfadado',
        },
        keywords: {
            en: ['cat', 'face', 'pouting'],
            es: ['cara', 'enfadado', 'gato'],
        },
    },
    {
        code: '🙈',
        name: {
            en: 'see_no_evil',
            es: 'mono_ojos_tapados',
        },
        keywords: {
            en: ['evil', 'face', 'forbidden', 'monkey', 'see', 'see-no-evil monkey'],
            es: ['cara', 'mal', 'mono', 'prohibido', 'mono con los ojos tapados'],
        },
    },
    {
        code: '🙉',
        name: {
            en: 'hear_no_evil',
            es: 'mono_sordo',
        },
        keywords: {
            en: ['evil', 'face', 'forbidden', 'hear', 'monkey', 'hear-no-evil monkey'],
            es: ['cara', 'mal', 'mono', 'prohibido', 'mono con los oídos tapados'],
        },
    },
    {
        code: '🙊',
        name: {
            en: 'speak_no_evil',
            es: 'no_decir_nada',
        },
        keywords: {
            en: ['evil', 'face', 'forbidden', 'monkey', 'speak', 'speak-no-evil monkey'],
            es: ['cara', 'mal', 'mono', 'prohibido', 'mono con la boca tapada'],
        },
    },
    {
        code: '💌',
        name: {
            en: 'love_letter',
            es: 'carta_de_amor',
        },
        keywords: {
            en: ['heart', 'letter', 'love', 'mail'],
            es: ['amor', 'carta', 'corazón', 'correo', 'carta de amor'],
        },
    },
    {
        code: '💘',
        name: {
            en: 'cupid',
            es: 'cupido',
        },
        keywords: {
            en: ['arrow', 'cupid', 'heart with arrow'],
            es: ['amor', 'corazón', 'emoción', 'flecha', 'corazón con flecha'],
        },
    },
    {
        code: '💝',
        name: {
            en: 'gift_heart',
            es: 'corazón_de_regalo',
        },
        keywords: {
            en: ['ribbon', 'valentine', 'heart with ribbon'],
            es: ['corazón', 'emoción', 'lazo', 'san valentín', 'corazón con lazo'],
        },
    },
    {
        code: '💖',
        name: {
            en: 'sparkling_heart',
            es: 'corazón_refulgente',
        },
        keywords: {
            en: ['excited', 'sparkle', 'sparkling heart'],
            es: ['amor', 'brillante', 'emoción', 'corazón brillante'],
        },
    },
    {
        code: '💗',
        name: {
            en: 'heartpulse',
            es: 'ritmo_cardíaco',
        },
        keywords: {
            en: ['excited', 'growing', 'nervous', 'pulse', 'growing heart'],
            es: ['corazón', 'creciente', 'emocionado', 'latido', 'nervioso'],
        },
    },
    {
        code: '💓',
        name: {
            en: 'heartbeat',
            es: 'latido',
        },
        keywords: {
            en: ['beating', 'heartbeat', 'pulsating', 'beating heart'],
            es: ['amor', 'corazón', 'emoción', 'latido', 'corazón latiendo'],
        },
    },
    {
        code: '💞',
        name: {
            en: 'revolving_hearts',
            es: 'corazones_girando',
        },
        keywords: {
            en: ['revolving', 'revolving hearts'],
            es: ['corazón', 'giratorio', 'corazones giratorios'],
        },
    },
    {
        code: '💕',
        name: {
            en: 'two_hearts',
            es: 'dos_corazones',
        },
        keywords: {
            en: ['love', 'two hearts'],
            es: ['amantes', 'amor', 'corazón', 'dos corazones'],
        },
    },
    {
        code: '💟',
        name: {
            en: 'heart_decoration',
            es: 'corazón_decorativo',
        },
        keywords: {
            en: ['heart', 'heart decoration'],
            es: ['corazón', 'adorno de corazón'],
        },
    },
    {
        code: '❣️',
        name: {
            en: 'heavy_heart_exclamation_mark_ornament',
            es: 'signo_de_exclamación_en_forma_de_corazón_grueso',
        },
        keywords: {
            en: ['exclamation', 'mark', 'punctuation', 'heart exclamation'],
            es: ['corazón', 'exclamación', 'puntuación', 'exclamación de corazón'],
        },
    },
    {
        code: '💔',
        name: {
            en: 'broken_heart',
            es: 'corazón_partido',
        },
        keywords: {
            en: ['break', 'broken', 'broken heart'],
            es: ['corazón', 'emoción', 'partido', 'roto'],
        },
    },
    {
        code: '❤️‍🔥',
        name: {
            en: 'heart_on_fire',
            es: 'corazón',
        },
        keywords: {
            en: ['burn', 'heart', 'love', 'lust', 'sacred heart', 'heart on fire'],
            es: ['amor', 'corazón', 'fuego', 'llamas', 'lujuria', 'pasión', 'corazón en llamas'],
        },
    },
    {
        code: '❤️‍🩹',
        name: {
            en: 'mending_heart',
            es: 'corazón',
        },
        keywords: {
            en: ['healthier', 'improving', 'mending', 'recovering', 'recuperating', 'well', 'mending heart'],
            es: ['bien', 'cura', 'mejor', 'mejora', 'recuperación', 'salud', 'corazón curándose'],
        },
    },
    {
        code: '❤️',
        name: {
            en: 'heart',
            es: 'corazón',
        },
        keywords: {
            en: ['heart', 'red heart'],
            es: ['corazón', 'emoción', 'rojo'],
        },
    },
    {
        code: '🧡',
        name: {
            en: 'orange_heart',
            es: 'corazón_naranja',
        },
        keywords: {
            en: ['orange', 'orange heart'],
            es: ['corazón', 'emoción', 'naranja'],
        },
    },
    {
        code: '💛',
        name: {
            en: 'yellow_heart',
            es: 'corazón_amarillo',
        },
        keywords: {
            en: ['yellow', 'yellow heart'],
            es: ['amarillo', 'corazón', 'emoción'],
        },
    },
    {
        code: '💚',
        name: {
            en: 'green_heart',
            es: 'corazón_verde',
        },
        keywords: {
            en: ['green', 'green heart'],
            es: ['corazón', 'emoción', 'verde'],
        },
    },
    {
        code: '💙',
        name: {
            en: 'blue_heart',
            es: 'corazón_azul',
        },
        keywords: {
            en: ['blue', 'blue heart'],
            es: ['azul', 'corazón', 'emoción'],
        },
    },
    {
        code: '💜',
        name: {
            en: 'purple_heart',
            es: 'corazón_púrpura',
        },
        keywords: {
            en: ['purple', 'purple heart'],
            es: ['corazón', 'emoción', 'morado'],
        },
    },
    {
        code: '🤎',
        name: {
            en: 'brown_heart',
            es: 'corazón_marrón',
        },
        keywords: {
            en: ['brown', 'heart'],
            es: ['corazón', 'emoción', 'marrón'],
        },
    },
    {
        code: '🖤',
        name: {
            en: 'black_heart',
            es: 'corazón_negro',
        },
        keywords: {
            en: ['black', 'evil', 'wicked', 'black heart'],
            es: ['corazón', 'negro'],
        },
    },
    {
        code: '🤍',
        name: {
            en: 'white_heart',
            es: 'corazón_blanco',
        },
        keywords: {
            en: ['heart', 'white'],
            es: ['blanco', 'corazón', 'emoción'],
        },
    },
    {
        code: '💋',
        name: {
            en: 'kiss',
            es: 'beso',
        },
        keywords: {
            en: ['kiss', 'lips', 'kiss mark'],
            es: ['beso', 'labios', 'romance', 'marca de beso'],
        },
    },
    {
        code: '💯',
        name: {
            en: '100',
            es: '100',
        },
        keywords: {
            en: ['100', 'full', 'hundred', 'score', 'hundred points'],
            es: ['100', 'pleno', 'puntos', 'cien puntos'],
        },
    },
    {
        code: '💢',
        name: {
            en: 'anger',
            es: 'ira',
        },
        keywords: {
            en: ['angry', 'comic', 'mad', 'anger symbol'],
            es: ['cómic', 'enfadado', 'enfado', 'símbolo de enfado'],
        },
    },
    {
        code: '💥',
        name: {
            en: 'boom',
            es: 'bum',
        },
        keywords: {
            en: ['boom', 'comic', 'collision'],
            es: ['cómic', 'colisión'],
        },
    },
    {
        code: '💫',
        name: {
            en: 'dizzy',
            es: 'mareado',
        },
        keywords: {
            en: ['comic', 'star', 'dizzy'],
            es: ['cómic', 'emoción', 'estrella', 'mareo', 'símbolo de mareo'],
        },
    },
    {
        code: '💦',
        name: {
            en: 'sweat_drops',
            es: 'gotas_de_sudor',
        },
        keywords: {
            en: ['comic', 'splashing', 'sweat', 'sweat droplets'],
            es: ['cómic', 'emoción', 'sudor', 'gotas de sudor'],
        },
    },
    {
        code: '💨',
        name: {
            en: 'dash',
            es: 'guión',
        },
        keywords: {
            en: ['comic', 'dash', 'running', 'dashing away'],
            es: ['carrera', 'cómic', 'correr', 'humo', 'salir corriendo'],
        },
    },
    {
        code: '🕳️',
        name: {
            en: 'hole',
            es: 'agujero',
        },
        keywords: {
            en: ['hole'],
            es: ['orificio', 'agujero'],
        },
    },
    {
        code: '💬',
        name: {
            en: 'speech_balloon',
            es: 'bocadillo_de_diálogo',
        },
        keywords: {
            en: ['balloon', 'bubble', 'comic', 'dialog', 'speech'],
            es: ['bocadillo', 'cómic', 'conversación', 'diálogo', 'bocadillo de diálogo'],
        },
    },
    {
        code: '👁️‍🗨️',
        name: {
            en: 'eye-in-speech-bubble',
            es: 'ojo-en-globo-de-texto',
        },
        keywords: {
            en: ['balloon', 'bubble', 'eye', 'speech', 'witness', 'eye in speech bubble'],
            es: ['bocadillo de texto', 'ojo', 'testigo', 'ojo en bocadillo de texto'],
        },
    },
    {
        code: '🗨️',
        name: {
            en: 'left_speech_bubble',
            es: 'bocadillo_a_la_izquierda',
        },
        keywords: {
            en: ['balloon', 'bubble', 'dialog', 'speech', 'left speech bubble'],
            es: ['bocadillo', 'burbuja', 'conversación', 'diálogo', 'bocadillo de diálogo por la izquierda'],
        },
    },
    {
        code: '🗯️',
        name: {
            en: 'right_anger_bubble',
            es: 'bocadillo_para_palabras_de_enfado',
        },
        keywords: {
            en: ['angry', 'balloon', 'bubble', 'mad', 'right anger bubble'],
            es: ['bocadillo', 'cabreo', 'enfado', 'rabia', 'bocadillo de enfado por la derecha'],
        },
    },
    {
        code: '💭',
        name: {
            en: 'thought_balloon',
            es: 'bocadillo_para_pensamientos',
        },
        keywords: {
            en: ['balloon', 'bubble', 'comic', 'thought'],
            es: ['bocadillo', 'burbuja', 'cómic', 'pensamiento', 'bocadillo de pensamiento'],
        },
    },
    {
        code: '💤',
        name: {
            en: 'zzz',
            es: 'zzz',
        },
        keywords: {
            en: ['comic', 'good night', 'sleep', 'ZZZ'],
            es: ['cómic', 'dormir', 'sueño', 'zzz', 'símbolo de sueño'],
        },
    },
    {
        code: '👋',
        name: {
            en: 'wave',
            es: 'hola',
        },
        keywords: {
            en: ['hand', 'wave', 'waving'],
            es: ['agitar', 'mano', 'saludar', 'saludo', 'mano saludando'],
        },
        types: ['👋🏻', '👋🏼', '👋🏽', '👋🏾', '👋🏿'],
    },
    {
        code: '🤚',
        name: {
            en: 'raised_back_of_hand',
            es: 'palma_de_mano_levantada',
        },
        keywords: {
            en: ['backhand', 'raised', 'raised back of hand'],
            es: ['dorso', 'levantado', 'mano', 'dorso de la mano'],
        },
        types: ['🤚🏻', '🤚🏼', '🤚🏽', '🤚🏾', '🤚🏿'],
    },
    {
        code: '🖐️',
        name: {
            en: 'raised_hand_with_fingers_splayed',
            es: 'mano_levantada_con_los_dedos_extendidos',
        },
        keywords: {
            en: ['finger', 'hand', 'splayed', 'hand with fingers splayed'],
            es: ['abierta', 'dedo', 'mano'],
        },
        types: ['🖐🏻', '🖐🏼', '🖐🏽', '🖐🏾', '🖐🏿'],
    },
    {
        code: '✋',
        name: {
            en: 'hand',
            es: 'mano',
        },
        keywords: {
            en: ['hand', 'high 5', 'high five', 'raised hand'],
            es: ['choca esos cinco', 'levantada', 'mano'],
        },
        types: ['✋🏻', '✋🏼', '✋🏽', '✋🏾', '✋🏿'],
    },
    {
        code: '🖖',
        name: {
            en: 'spock-hand',
            es: 'saludo_de_spock',
        },
        keywords: {
            en: ['finger', 'hand', 'spock', 'vulcan', 'vulcan salute'],
            es: ['mano', 'saludo', 'spock', 'vulcano'],
        },
        types: ['🖖🏻', '🖖🏼', '🖖🏽', '🖖🏾', '🖖🏿'],
    },
    {
        code: '👌',
        name: {
            en: 'ok_hand',
            es: 'mano_con_signo_de_aprobación',
        },
        keywords: {
            en: ['hand', 'OK'],
            es: ['aprobación', 'mano', 'ok', 'señal de aprobación con la mano'],
        },
        types: ['👌🏻', '👌🏼', '👌🏽', '👌🏾', '👌🏿'],
    },
    {
        code: '🤌',
        name: {
            en: 'pinched_fingers',
            es: 'dedos_juntos_apuntando_hacia_arriba',
        },
        keywords: {
            en: ['fingers', 'hand gesture', 'interrogation', 'pinched', 'sarcastic'],
            es: ['dedos', 'gesto', 'italia', 'italiano', 'mano', 'sarcasmo', 'dedos juntos apuntando hacia arriba'],
        },
        types: ['🤌🏻', '🤌🏼', '🤌🏽', '🤌🏾', '🤌🏿'],
    },
    {
        code: '🤏',
        name: {
            en: 'pinching_hand',
            es: 'mano_pellizcando',
        },
        keywords: {
            en: ['small amount', 'pinching hand'],
            es: ['pellizco', 'poco', 'poquito', 'mano pellizcando'],
        },
        types: ['🤏🏻', '🤏🏼', '🤏🏽', '🤏🏾', '🤏🏿'],
    },
    {
        code: '✌️',
        name: {
            en: 'v',
            es: 'v',
        },
        keywords: {
            en: ['hand', 'v', 'victory'],
            es: ['mano', 'señal de victoria', 'victoria', 'mano con señal de victoria'],
        },
        types: ['✌🏻', '✌🏼', '✌🏽', '✌🏾', '✌🏿'],
    },
    {
        code: '🤞',
        name: {
            en: 'crossed_fingers',
            es: 'dedos_cruzados',
        },
        keywords: {
            en: ['cross', 'finger', 'hand', 'luck', 'crossed fingers'],
            es: ['cruzar', 'dedos', 'mano', 'suerte', 'dedos cruzados'],
        },
        types: ['🤞🏻', '🤞🏼', '🤞🏽', '🤞🏾', '🤞🏿'],
    },
    {
        code: '🤟',
        name: {
            en: 'i_love_you_hand_sign',
            es: 'te_amo_en_lenguaje_de_señas',
        },
        keywords: {
            en: ['hand', 'ILY', 'love-you gesture'],
            es: ['mano', 'quiero', 'gesto de te quiero'],
        },
        types: ['🤟🏻', '🤟🏼', '🤟🏽', '🤟🏾', '🤟🏿'],
    },
    {
        code: '🤘',
        name: {
            en: 'the_horns',
            es: 'los_cuernos',
        },
        keywords: {
            en: ['finger', 'hand', 'horns', 'rock-on', 'sign of the horns'],
            es: ['cuernos', 'dedo', 'mano', 'rock', 'mano haciendo el signo de cuernos'],
        },
        types: ['🤘🏻', '🤘🏼', '🤘🏽', '🤘🏾', '🤘🏿'],
    },
    {
        code: '🤙',
        name: {
            en: 'call_me_hand',
            es: 'mano_llámame',
        },
        keywords: {
            en: ['call', 'hand', 'hang loose', 'Shaka', 'call me hand'],
            es: ['llamar', 'mano', 'meñique', 'pulgar', 'mano haciendo el gesto de llamar'],
        },
        types: ['🤙🏻', '🤙🏼', '🤙🏽', '🤙🏾', '🤙🏿'],
    },
    {
        code: '👈',
        name: {
            en: 'point_left',
            es: 'apuntando_hacia_la_izquierda',
        },
        keywords: {
            en: ['backhand', 'finger', 'hand', 'index', 'point', 'backhand index pointing left'],
            es: ['dedo', 'índice', 'izquierda', 'mano', 'dorso de mano con índice a la izquierda'],
        },
        types: ['👈🏻', '👈🏼', '👈🏽', '👈🏾', '👈🏿'],
    },
    {
        code: '👉',
        name: {
            en: 'point_right',
            es: 'apuntando_hacia_la_derecha',
        },
        keywords: {
            en: ['backhand', 'finger', 'hand', 'index', 'point', 'backhand index pointing right'],
            es: ['dedo', 'derecha', 'índice', 'mano', 'dorso de mano con índice a la derecha'],
        },
        types: ['👉🏻', '👉🏼', '👉🏽', '👉🏾', '👉🏿'],
    },
    {
        code: '👆',
        name: {
            en: 'point_up_2',
            es: 'apuntando_hacia_arriba_2',
        },
        keywords: {
            en: ['backhand', 'finger', 'hand', 'point', 'up', 'backhand index pointing up'],
            es: ['apuntar', 'arriba', 'dedo', 'mano', 'dorso de mano con índice hacia arriba'],
        },
        types: ['👆🏻', '👆🏼', '👆🏽', '👆🏾', '👆🏿'],
    },
    {
        code: '🖕',
        name: {
            en: 'middle_finger',
            es: 'dedo_corazón',
        },
        keywords: {
            en: ['finger', 'hand', 'middle finger'],
            es: ['corazón', 'dedo', 'mano', 'peineta', 'dedo corazón hacia arriba'],
        },
        types: ['🖕🏻', '🖕🏼', '🖕🏽', '🖕🏾', '🖕🏿'],
    },
    {
        code: '👇',
        name: {
            en: 'point_down',
            es: 'apuntando_hacia_abajo',
        },
        keywords: {
            en: ['backhand', 'down', 'finger', 'hand', 'point', 'backhand index pointing down'],
            es: ['abajo', 'apuntar', 'dedo', 'mano', 'dorso de mano con índice hacia abajo'],
        },
        types: ['👇🏻', '👇🏼', '👇🏽', '👇🏾', '👇🏿'],
    },
    {
        code: '☝️',
        name: {
            en: 'point_up',
            es: 'apuntando_hacia_arriba',
        },
        keywords: {
            en: ['finger', 'hand', 'index', 'point', 'up', 'index pointing up'],
            es: ['apuntar', 'arriba', 'dedo', 'mano', 'dedo índice hacia arriba'],
        },
        types: ['☝🏻', '☝🏼', '☝🏽', '☝🏾', '☝🏿'],
    },
    {
        code: '👍',
        name: {
            en: '+1',
            es: '+1',
        },
        keywords: {
            en: ['hand', 'thumb', 'up', '+1', 'thumbs up'],
            es: ['arriba', 'mano', 'pulgar', 'señal', 'pulgar hacia arriba'],
        },
        types: ['👍🏻', '👍🏼', '👍🏽', '👍🏾', '👍🏿'],
    },
    {
        code: '👎',
        name: {
            en: '-1',
            es: '-1',
        },
        keywords: {
            en: ['down', 'hand', 'thumb', '-1', 'thumbs down'],
            es: ['abajo', 'mano', 'pulgar', 'señal', 'pulgar hacia abajo'],
        },
        types: ['👎🏻', '👎🏼', '👎🏽', '👎🏾', '👎🏿'],
    },
    {
        code: '✊',
        name: {
            en: 'fist',
            es: 'puño',
        },
        keywords: {
            en: ['clenched', 'fist', 'hand', 'punch', 'raised fist'],
            es: ['cerrado', 'mano', 'puñetazo', 'puño', 'puño en alto'],
        },
        types: ['✊🏻', '✊🏼', '✊🏽', '✊🏾', '✊🏿'],
    },
    {
        code: '👊',
        name: {
            en: 'facepunch',
            es: 'puñetazo',
        },
        keywords: {
            en: ['clenched', 'fist', 'hand', 'punch', 'oncoming fist'],
            es: ['puñetazo', 'puño', 'puño cerrado'],
        },
        types: ['👊🏻', '👊🏼', '👊🏽', '👊🏾', '👊🏿'],
    },
    {
        code: '🤛',
        name: {
            en: 'left-facing_fist',
            es: 'puño-hacia-izquierda',
        },
        keywords: {
            en: ['fist', 'leftwards', 'left-facing fist'],
            es: ['izquierda', 'puño', 'puño hacia la izquierda'],
        },
        types: ['🤛🏻', '🤛🏼', '🤛🏽', '🤛🏾', '🤛🏿'],
    },
    {
        code: '🤜',
        name: {
            en: 'right-facing_fist',
            es: 'puño_hacia_la_derecha',
        },
        keywords: {
            en: ['fist', 'rightwards', 'right-facing fist'],
            es: ['derecha', 'puño', 'puño hacia la derecha'],
        },
        types: ['🤜🏻', '🤜🏼', '🤜🏽', '🤜🏾', '🤜🏿'],
    },
    {
        code: '👏',
        name: {
            en: 'clap',
            es: 'aplauso',
        },
        keywords: {
            en: ['clap', 'hand', 'clapping hands'],
            es: ['aplaudir', 'manos', 'palmas', 'señal', 'manos aplaudiendo'],
        },
        types: ['👏🏻', '👏🏼', '👏🏽', '👏🏾', '👏🏿'],
    },
    {
        code: '🙌',
        name: {
            en: 'raised_hands',
            es: 'manos_levantadas',
        },
        keywords: {
            en: ['celebration', 'gesture', 'hand', 'hooray', 'raised', 'raising hands'],
            es: ['celebración', 'gesto', 'hurra', 'mano', 'manos levantadas celebrando'],
        },
        types: ['🙌🏻', '🙌🏼', '🙌🏽', '🙌🏾', '🙌🏿'],
    },
    {
        code: '👐',
        name: {
            en: 'open_hands',
            es: 'manos_abiertas',
        },
        keywords: {
            en: ['hand', 'open', 'open hands'],
            es: ['abiertas', 'manos'],
        },
        types: ['👐🏻', '👐🏼', '👐🏽', '👐🏾', '👐🏿'],
    },
    {
        code: '🤲',
        name: {
            en: 'palms_up_together',
            es: 'palmas_hacia_arriba_juntas',
        },
        keywords: {
            en: ['prayer', 'palms up together'],
            es: ['oración', 'palmas hacia arriba juntas'],
        },
        types: ['🤲🏻', '🤲🏼', '🤲🏽', '🤲🏾', '🤲🏿'],
    },
    {
        code: '🤝',
        name: {
            en: 'handshake',
            es: 'apretón-manos',
        },
        keywords: {
            en: ['agreement', 'hand', 'meeting', 'shake', 'handshake'],
            es: ['acuerdo', 'apretón', 'manos', 'apretón de manos'],
        },
        types: [
            '🤝🏻',
            '🤝🏼',
            '🤝🏽',
            '🤝🏾',
            '🤝🏿',
            '🫱🏻‍🫲🏼',
            '🫱🏻‍🫲🏽',
            '🫱🏻‍🫲🏾',
            '🫱🏻‍🫲🏿',
            '🫱🏼‍🫲🏻',
            '🫱🏼‍🫲🏽',
            '🫱🏼‍🫲🏾',
            '🫱🏼‍🫲🏿',
            '🫱🏽‍🫲🏻',
            '🫱🏽‍🫲🏼',
            '🫱🏽‍🫲🏾',
            '🫱🏽‍🫲🏿',
            '🫱🏾‍🫲🏻',
            '🫱🏾‍🫲🏼',
            '🫱🏾‍🫲🏽',
            '🫱🏾‍🫲🏿',
            '🫱🏿‍🫲🏻',
            '🫱🏿‍🫲🏼',
            '🫱🏿‍🫲🏽',
            '🫱🏿‍🫲🏾',
        ],
    },
    {
        code: '🙏',
        name: {
            en: 'pray',
            es: 'rezo',
        },
        keywords: {
            en: ['ask', 'hand', 'high 5', 'high five', 'please', 'pray', 'thanks', 'folded hands'],
            es: ['gracias', 'mano', 'oración', 'orar', 'por favor', 'rezar', 'manos en oración'],
        },
        types: ['🙏🏻', '🙏🏼', '🙏🏽', '🙏🏾', '🙏🏿'],
    },
    {
        code: '✍️',
        name: {
            en: 'writing_hand',
            es: 'mano_escribiendo',
        },
        keywords: {
            en: ['hand', 'write', 'writing hand'],
            es: ['escribir', 'lápiz', 'mano', 'mano escribiendo'],
        },
        types: ['✍🏻', '✍🏼', '✍🏽', '✍🏾', '✍🏿'],
    },
    {
        code: '💅',
        name: {
            en: 'nail_care',
            es: 'cuidado_de_las_uñas',
        },
        keywords: {
            en: ['care', 'cosmetics', 'manicure', 'nail', 'polish'],
            es: ['cosmética', 'esmalte', 'manicura', 'uñas', 'pintarse las uñas'],
        },
        types: ['💅🏻', '💅🏼', '💅🏽', '💅🏾', '💅🏿'],
    },
    {
        code: '🤳',
        name: {
            en: 'selfie',
            es: 'selfi',
        },
        keywords: {
            en: ['camera', 'phone', 'selfie'],
            es: ['autofoto', 'cámara', 'selfie', 'teléfono', 'selfi'],
        },
        types: ['🤳🏻', '🤳🏼', '🤳🏽', '🤳🏾', '🤳🏿'],
    },
    {
        code: '💪',
        name: {
            en: 'muscle',
            es: 'músculo',
        },
        keywords: {
            en: ['biceps', 'comic', 'flex', 'muscle', 'flexed biceps'],
            es: ['bíceps', 'cómic', 'flexionado', 'fuerte', 'músculo'],
        },
        types: ['💪🏻', '💪🏼', '💪🏽', '💪🏾', '💪🏿'],
    },
    {
        code: '🦾',
        name: {
            en: 'mechanical_arm',
            es: 'brazo_mecánico',
        },
        keywords: {
            en: ['accessibility', 'prosthetic', 'mechanical arm'],
            es: ['accesibilidad', 'ortopedia', 'prótesis', 'brazo mecánico'],
        },
    },
    {
        code: '🦿',
        name: {
            en: 'mechanical_leg',
            es: 'pierna_mecánica',
        },
        keywords: {
            en: ['accessibility', 'prosthetic', 'mechanical leg'],
            es: ['accesibilidad', 'ortopedia', 'prótesis', 'pierna mecánica'],
        },
    },
    {
        code: '🦵',
        name: {
            en: 'leg',
            es: 'pierna',
        },
        keywords: {
            en: ['kick', 'limb', 'leg'],
            es: ['extremidad', 'patada', 'pierna'],
        },
        types: ['🦵🏻', '🦵🏼', '🦵🏽', '🦵🏾', '🦵🏿'],
    },
    {
        code: '🦶',
        name: {
            en: 'foot',
            es: 'pie_humano',
        },
        keywords: {
            en: ['kick', 'stomp', 'foot'],
            es: ['patada', 'pisotón', 'pie'],
        },
        types: ['🦶🏻', '🦶🏼', '🦶🏽', '🦶🏾', '🦶🏿'],
    },
    {
        code: '👂',
        name: {
            en: 'ear',
            es: 'oreja',
        },
        keywords: {
            en: ['body', 'ear'],
            es: ['cuerpo', 'oreja'],
        },
        types: ['👂🏻', '👂🏼', '👂🏽', '👂🏾', '👂🏿'],
    },
    {
        code: '🦻',
        name: {
            en: 'ear_with_hearing_aid',
            es: 'oreja_con_audifono',
        },
        keywords: {
            en: ['accessibility', 'hard of hearing', 'ear with hearing aid'],
            es: ['accesibilidad', 'audífono', 'prótesis auditiva', 'sordo', 'oreja con audífono'],
        },
        types: ['🦻🏻', '🦻🏼', '🦻🏽', '🦻🏾', '🦻🏿'],
    },
    {
        code: '👃',
        name: {
            en: 'nose',
            es: 'nariz',
        },
        keywords: {
            en: ['body', 'nose'],
            es: ['cuerpo', 'nariz'],
        },
        types: ['👃🏻', '👃🏼', '👃🏽', '👃🏾', '👃🏿'],
    },
    {
        code: '🧠',
        name: {
            en: 'brain',
            es: 'cerebro',
        },
        keywords: {
            en: ['intelligent', 'brain'],
            es: ['inteligente', 'cerebro'],
        },
    },
    {
        code: '🫀',
        name: {
            en: 'anatomical_heart',
            es: 'corazón_humano',
        },
        keywords: {
            en: ['anatomical', 'cardiology', 'heart', 'organ', 'pulse'],
            es: ['cardiología', 'corazón', 'latido', 'órgano', 'pulso', 'anatomía', 'corazón humano'],
        },
    },
    {
        code: '🫁',
        name: {
            en: 'lungs',
            es: 'pulmones',
        },
        keywords: {
            en: ['breath', 'exhalation', 'inhalation', 'organ', 'respiration', 'lungs'],
            es: ['exhalar', 'inhalar', 'órgano', 'respiración', 'respirar', 'pulmones'],
        },
    },
    {
        code: '🦷',
        name: {
            en: 'tooth',
            es: 'diente',
        },
        keywords: {
            en: ['dentist', 'tooth'],
            es: ['dentista', 'molar', 'muela', 'diente'],
        },
    },
    {
        code: '🦴',
        name: {
            en: 'bone',
            es: 'hueso',
        },
        keywords: {
            en: ['skeleton', 'bone'],
            es: ['esqueleto', 'hueso'],
        },
    },
    {
        code: '👀',
        name: {
            en: 'eyes',
            es: 'ojos',
        },
        keywords: {
            en: ['eye', 'face', 'eyes'],
            es: ['cara', 'ojos'],
        },
    },
    {
        code: '👁️',
        name: {
            en: 'eye',
            es: 'ojo',
        },
        keywords: {
            en: ['body', 'eye'],
            es: ['cuerpo', 'ojo'],
        },
    },
    {
        code: '👅',
        name: {
            en: 'tongue',
            es: 'lengua',
        },
        keywords: {
            en: ['body', 'tongue'],
            es: ['cuerpo', 'lengua'],
        },
    },
    {
        code: '👄',
        name: {
            en: 'lips',
            es: 'labios',
        },
        keywords: {
            en: ['lips', 'mouth'],
            es: ['labios', 'boca'],
        },
    },
    {
        code: '👶',
        name: {
            en: 'baby',
            es: 'bebé',
        },
        keywords: {
            en: ['young', 'baby'],
            es: ['joven', 'niño', 'bebé'],
        },
        types: ['👶🏻', '👶🏼', '👶🏽', '👶🏾', '👶🏿'],
    },
    {
        code: '🧒',
        name: {
            en: 'child',
            es: 'niño',
        },
        keywords: {
            en: ['gender-neutral', 'unspecified gender', 'young', 'child'],
            es: ['crío', 'género', 'joven', 'neutro', 'infante'],
        },
        types: ['🧒🏻', '🧒🏼', '🧒🏽', '🧒🏾', '🧒🏿'],
    },
    {
        code: '👦',
        name: {
            en: 'boy',
            es: 'chico',
        },
        keywords: {
            en: ['young', 'boy'],
            es: ['joven', 'niño'],
        },
        types: ['👦🏻', '👦🏼', '👦🏽', '👦🏾', '👦🏿'],
    },
    {
        code: '👧',
        name: {
            en: 'girl',
            es: 'niña',
        },
        keywords: {
            en: ['Virgo', 'young', 'zodiac', 'girl'],
            es: ['chica', 'joven', 'niña'],
        },
        types: ['👧🏻', '👧🏼', '👧🏽', '👧🏾', '👧🏿'],
    },
    {
        code: '🧑',
        name: {
            en: 'adult',
            es: 'adulto',
        },
        keywords: {
            en: ['adult', 'gender-neutral', 'unspecified gender', 'person'],
            es: ['género', 'neutro', 'persona adulta'],
        },
        types: ['🧑🏻', '🧑🏼', '🧑🏽', '🧑🏾', '🧑🏿'],
    },
    {
        code: '👱',
        name: {
            en: 'person_with_blond_hair',
            es: 'persona_rubia',
        },
        keywords: {
            en: ['blond', 'blond-haired person', 'hair', 'person: blond hair'],
            es: ['rubia', 'rubias', 'rubio', 'rubios', 'persona adulta rubia'],
        },
        types: ['👱🏻', '👱🏼', '👱🏽', '👱🏾', '👱🏿'],
    },
    {
        code: '👨',
        name: {
            en: 'man',
            es: 'hombre',
        },
        keywords: {
            en: ['adult', 'man'],
            es: ['adulto', 'hombre'],
        },
        types: ['👨🏻', '👨🏼', '👨🏽', '👨🏾', '👨🏿'],
    },
    {
        code: '🧔',
        name: {
            en: 'bearded_person',
            es: 'persona_barba',
        },
        keywords: {
            en: ['beard', 'person', 'person: beard'],
            es: ['barbas', 'barbudo', 'persona', 'persona con barba'],
        },
        types: ['🧔🏻', '🧔🏼', '🧔🏽', '🧔🏾', '🧔🏿'],
    },
    {
        code: '🧔‍♂️',
        name: {
            en: 'man_with_beard',
            es: 'persona_barba',
        },
        keywords: {
            en: ['beard', 'man', 'man: beard'],
            es: ['barba', 'hombre', 'hombre: barba'],
        },
        types: ['🧔🏻‍♂️', '🧔🏼‍♂️', '🧔🏽‍♂️', '🧔🏾‍♂️', '🧔🏿‍♂️'],
    },
    {
        code: '🧔‍♀️',
        name: {
            en: 'woman_with_beard',
            es: 'persona_barba',
        },
        keywords: {
            en: ['beard', 'woman', 'woman: beard'],
            es: ['barba', 'mujer', 'mujer: barba'],
        },
        types: ['🧔🏻‍♀️', '🧔🏼‍♀️', '🧔🏽‍♀️', '🧔🏾‍♀️', '🧔🏿‍♀️'],
    },
    {
        code: '👨‍🦰',
        name: {
            en: 'red_haired_man',
            es: 'hombre_pelirrojo',
        },
        keywords: {
            en: ['adult', 'man', 'red hair'],
            es: ['adulto', 'hombre', 'pelo pelirrojo'],
        },
        types: ['👨🏻‍🦰', '👨🏼‍🦰', '👨🏽‍🦰', '👨🏾‍🦰', '👨🏿‍🦰'],
    },
    {
        code: '👨‍🦱',
        name: {
            en: 'curly_haired_man',
            es: 'hombre_con_pelo_rizado',
        },
        keywords: {
            en: ['adult', 'curly hair', 'man'],
            es: ['adulto', 'hombre', 'pelo rizado'],
        },
        types: ['👨🏻‍🦱', '👨🏼‍🦱', '👨🏽‍🦱', '👨🏾‍🦱', '👨🏿‍🦱'],
    },
    {
        code: '👨‍🦳',
        name: {
            en: 'white_haired_man',
            es: 'hombre_con_pelo_blanco',
        },
        keywords: {
            en: ['adult', 'man', 'white hair'],
            es: ['adulto', 'hombre', 'pelo blanco'],
        },
        types: ['👨🏻‍🦳', '👨🏼‍🦳', '👨🏽‍🦳', '👨🏾‍🦳', '👨🏿‍🦳'],
    },
    {
        code: '👨‍🦲',
        name: {
            en: 'bald_man',
            es: 'hombre_calvo',
        },
        keywords: {
            en: ['adult', 'bald', 'man'],
            es: ['adulto', 'hombre', 'sin pelo'],
        },
        types: ['👨🏻‍🦲', '👨🏼‍🦲', '👨🏽‍🦲', '👨🏾‍🦲', '👨🏿‍🦲'],
    },
    {
        code: '👩',
        name: {
            en: 'woman',
            es: 'mujer',
        },
        keywords: {
            en: ['adult', 'woman'],
            es: ['adulta', 'mujer'],
        },
        types: ['👩🏻', '👩🏼', '👩🏽', '👩🏾', '👩🏿'],
    },
    {
        code: '👩‍🦰',
        name: {
            en: 'red_haired_woman',
            es: 'mujer_pelirroja',
        },
        keywords: {
            en: ['adult', 'red hair', 'woman'],
            es: ['adulta', 'mujer', 'pelo pelirrojo'],
        },
        types: ['👩🏻‍🦰', '👩🏼‍🦰', '👩🏽‍🦰', '👩🏾‍🦰', '👩🏿‍🦰'],
    },
    {
        code: '🧑‍🦰',
        name: {
            en: 'red_haired_person',
            es: 'persona_pelirroja',
        },
        keywords: {
            en: ['adult', 'gender-neutral', 'person', 'red hair', 'unspecified gender'],
            es: ['género', 'neutro', 'pelo pelirrojo', 'persona adulta'],
        },
        types: ['🧑🏻‍🦰', '🧑🏼‍🦰', '🧑🏽‍🦰', '🧑🏾‍🦰', '🧑🏿‍🦰'],
    },
    {
        code: '👩‍🦱',
        name: {
            en: 'curly_haired_woman',
            es: 'mujer_de_pelo_rizado',
        },
        keywords: {
            en: ['adult', 'curly hair', 'woman'],
            es: ['adulta', 'mujer', 'pelo rizado'],
        },
        types: ['👩🏻‍🦱', '👩🏼‍🦱', '👩🏽‍🦱', '👩🏾‍🦱', '👩🏿‍🦱'],
    },
    {
        code: '🧑‍🦱',
        name: {
            en: 'curly_haired_person',
            es: 'persona_con_pelo_rizado',
        },
        keywords: {
            en: ['adult', 'curly hair', 'gender-neutral', 'person', 'unspecified gender'],
            es: ['género', 'neutro', 'pelo rizado', 'persona adulta'],
        },
        types: ['🧑🏻‍🦱', '🧑🏼‍🦱', '🧑🏽‍🦱', '🧑🏾‍🦱', '🧑🏿‍🦱'],
    },
    {
        code: '👩‍🦳',
        name: {
            en: 'white_haired_woman',
            es: 'mujer_con_pelo_blanco',
        },
        keywords: {
            en: ['adult', 'white hair', 'woman'],
            es: ['adulta', 'mujer', 'pelo blanco'],
        },
        types: ['👩🏻‍🦳', '👩🏼‍🦳', '👩🏽‍🦳', '👩🏾‍🦳', '👩🏿‍🦳'],
    },
    {
        code: '🧑‍🦳',
        name: {
            en: 'white_haired_person',
            es: 'persona_con_pelo_blanco',
        },
        keywords: {
            en: ['adult', 'gender-neutral', 'person', 'unspecified gender', 'white hair'],
            es: ['género', 'neutro', 'pelo blanco', 'persona adulta'],
        },
        types: ['🧑🏻‍🦳', '🧑🏼‍🦳', '🧑🏽‍🦳', '🧑🏾‍🦳', '🧑🏿‍🦳'],
    },
    {
        code: '👩‍🦲',
        name: {
            en: 'bald_woman',
            es: 'mujer_calva',
        },
        keywords: {
            en: ['adult', 'bald', 'woman'],
            es: ['adulta', 'mujer', 'sin pelo'],
        },
        types: ['👩🏻‍🦲', '👩🏼‍🦲', '👩🏽‍🦲', '👩🏾‍🦲', '👩🏿‍🦲'],
    },
    {
        code: '🧑‍🦲',
        name: {
            en: 'bald_person',
            es: 'persona_calva',
        },
        keywords: {
            en: ['adult', 'bald', 'gender-neutral', 'person', 'unspecified gender'],
            es: ['género', 'neutro', 'persona adulta', 'sin pelo'],
        },
        types: ['🧑🏻‍🦲', '🧑🏼‍🦲', '🧑🏽‍🦲', '🧑🏾‍🦲', '🧑🏿‍🦲'],
    },
    {
        code: '👱‍♀️',
        name: {
            en: 'blond-haired-woman',
            es: 'mujer-pelo-rubio',
        },
        keywords: {
            en: ['blond-haired woman', 'blonde', 'hair', 'woman', 'woman: blond hair'],
            es: ['mujer', 'rubia', 'rubiales'],
        },
        types: ['👱🏻‍♀️', '👱🏼‍♀️', '👱🏽‍♀️', '👱🏾‍♀️', '👱🏿‍♀️'],
    },
    {
        code: '👱‍♂️',
        name: {
            en: 'blond-haired-man',
            es: 'hombre-pelo-rubio',
        },
        keywords: {
            en: ['blond', 'blond-haired man', 'hair', 'man', 'man: blond hair'],
            es: ['hombre', 'rubiales', 'rubio'],
        },
        types: ['👱🏻‍♂️', '👱🏼‍♂️', '👱🏽‍♂️', '👱🏾‍♂️', '👱🏿‍♂️'],
    },
    {
        code: '🧓',
        name: {
            en: 'older_adult',
            es: 'adulto_mayor',
        },
        keywords: {
            en: ['adult', 'gender-neutral', 'old', 'unspecified gender', 'older person'],
            es: ['adulto', 'género neutro', 'género no especificado', 'maduro', 'mayor', 'persona mayor'],
        },
        types: ['🧓🏻', '🧓🏼', '🧓🏽', '🧓🏾', '🧓🏿'],
    },
    {
        code: '👴',
        name: {
            en: 'older_man',
            es: 'hombre_mayor',
        },
        keywords: {
            en: ['adult', 'man', 'old'],
            es: ['hombre', 'mayor', 'anciano'],
        },
        types: ['👴🏻', '👴🏼', '👴🏽', '👴🏾', '👴🏿'],
    },
    {
        code: '👵',
        name: {
            en: 'older_woman',
            es: 'mujer_mayor',
        },
        keywords: {
            en: ['adult', 'old', 'woman'],
            es: ['mayor', 'mujer', 'anciana'],
        },
        types: ['👵🏻', '👵🏼', '👵🏽', '👵🏾', '👵🏿'],
    },
    {
        code: '🙍',
        name: {
            en: 'person_frowning',
            es: 'persona_con_el_ceño_fruncido',
        },
        keywords: {
            en: ['frown', 'gesture', 'person frowning'],
            es: ['ceño', 'fruncido', 'gesto', 'persona', 'persona frunciendo el ceño'],
        },
        types: ['🙍🏻', '🙍🏼', '🙍🏽', '🙍🏾', '🙍🏿'],
    },
    {
        code: '🙍‍♂️',
        name: {
            en: 'man-frowning',
            es: 'hombre_con_ceño_fruncido',
        },
        keywords: {
            en: ['frowning', 'gesture', 'man'],
            es: ['ceño', 'fruncido', 'gesto', 'hombre', 'hombre frunciendo el ceño'],
        },
        types: ['🙍🏻‍♂️', '🙍🏼‍♂️', '🙍🏽‍♂️', '🙍🏾‍♂️', '🙍🏿‍♂️'],
    },
    {
        code: '🙍‍♀️',
        name: {
            en: 'woman-frowning',
            es: 'mujer_con_ceño_fruncido',
        },
        keywords: {
            en: ['frowning', 'gesture', 'woman'],
            es: ['ceño', 'fruncido', 'gesto', 'mujer', 'mujer frunciendo el ceño'],
        },
        types: ['🙍🏻‍♀️', '🙍🏼‍♀️', '🙍🏽‍♀️', '🙍🏾‍♀️', '🙍🏿‍♀️'],
    },
    {
        code: '🙎',
        name: {
            en: 'person_with_pouting_face',
            es: 'persona_haciendo_pucheros',
        },
        keywords: {
            en: ['gesture', 'pouting', 'person pouting'],
            es: ['gesto', 'persona', 'pucheros', 'persona haciendo pucheros'],
        },
        types: ['🙎🏻', '🙎🏼', '🙎🏽', '🙎🏾', '🙎🏿'],
    },
    {
        code: '🙎‍♂️',
        name: {
            en: 'man-pouting',
            es: 'hombre_enfadado',
        },
        keywords: {
            en: ['gesture', 'man', 'pouting'],
            es: ['gesto', 'hombre', 'pucheros', 'hombre haciendo pucheros'],
        },
        types: ['🙎🏻‍♂️', '🙎🏼‍♂️', '🙎🏽‍♂️', '🙎🏾‍♂️', '🙎🏿‍♂️'],
    },
    {
        code: '🙎‍♀️',
        name: {
            en: 'woman-pouting',
            es: 'mujer_enfadada',
        },
        keywords: {
            en: ['gesture', 'pouting', 'woman'],
            es: ['gesto', 'mujer', 'pucheros', 'mujer haciendo pucheros'],
        },
        types: ['🙎🏻‍♀️', '🙎🏼‍♀️', '🙎🏽‍♀️', '🙎🏾‍♀️', '🙎🏿‍♀️'],
    },
    {
        code: '🙅',
        name: {
            en: 'no_good',
            es: 'prohibido',
        },
        keywords: {
            en: ['forbidden', 'gesture', 'hand', 'prohibited', 'person gesturing NO'],
            es: ['gesto', 'mano', 'no', 'prohibido', 'persona haciendo el gesto de "no"'],
        },
        types: ['🙅🏻', '🙅🏼', '🙅🏽', '🙅🏾', '🙅🏿'],
    },
    {
        code: '🙅‍♂️',
        name: {
            en: 'man-gesturing-no',
            es: 'hombre_gesticulando_no',
        },
        keywords: {
            en: ['forbidden', 'gesture', 'hand', 'man', 'prohibited', 'man gesturing NO'],
            es: ['gesto', 'hombre', 'mano', 'prohibido', 'hombre haciendo el gesto de "no"'],
        },
        types: ['🙅🏻‍♂️', '🙅🏼‍♂️', '🙅🏽‍♂️', '🙅🏾‍♂️', '🙅🏿‍♂️'],
    },
    {
        code: '🙅‍♀️',
        name: {
            en: 'woman-gesturing-no',
            es: 'mujer_gesticulando_no',
        },
        keywords: {
            en: ['forbidden', 'gesture', 'hand', 'prohibited', 'woman', 'woman gesturing NO'],
            es: ['gesto', 'mano', 'mujer', 'prohibido', 'mujer haciendo el gesto de "no"'],
        },
        types: ['🙅🏻‍♀️', '🙅🏼‍♀️', '🙅🏽‍♀️', '🙅🏾‍♀️', '🙅🏿‍♀️'],
    },
    {
        code: '🙆',
        name: {
            en: 'ok_woman',
            es: 'mujer_con_signo_de_aprobación',
        },
        keywords: {
            en: ['gesture', 'hand', 'OK', 'person gesturing OK'],
            es: ['gesto', 'mano', 'OK', 'vale', 'persona haciendo el gesto de "de acuerdo"'],
        },
        types: ['🙆🏻', '🙆🏼', '🙆🏽', '🙆🏾', '🙆🏿'],
    },
    {
        code: '🙆‍♂️',
        name: {
            en: 'man-gesturing-ok',
            es: 'hombre_gesticulando_sí',
        },
        keywords: {
            en: ['gesture', 'hand', 'man', 'OK', 'man gesturing OK'],
            es: ['gesto', 'mano', 'OK', 'vale', 'hombre haciendo el gesto de "de acuerdo"'],
        },
        types: ['🙆🏻‍♂️', '🙆🏼‍♂️', '🙆🏽‍♂️', '🙆🏾‍♂️', '🙆🏿‍♂️'],
    },
    {
        code: '🙆‍♀️',
        name: {
            en: 'woman-gesturing-ok',
            es: 'mujer_gesticulando_sí',
        },
        keywords: {
            en: ['gesture', 'hand', 'OK', 'woman', 'woman gesturing OK'],
            es: ['gesto', 'mano', 'OK', 'vale', 'mujer haciendo el gesto de "de acuerdo"'],
        },
        types: ['🙆🏻‍♀️', '🙆🏼‍♀️', '🙆🏽‍♀️', '🙆🏾‍♀️', '🙆🏿‍♀️'],
    },
    {
        code: '💁',
        name: {
            en: 'information_desk_person',
            es: 'recepcionista_de_información',
        },
        keywords: {
            en: ['hand', 'help', 'information', 'sassy', 'tipping', 'person tipping hand'],
            es: ['información', 'mano', 'mostrador', 'persona', 'persona de mostrador de información'],
        },
        types: ['💁🏻', '💁🏼', '💁🏽', '💁🏾', '💁🏿'],
    },
    {
        code: '💁‍♂️',
        name: {
            en: 'man-tipping-hand',
            es: 'hombre_con_palma_hacia_arriba',
        },
        keywords: {
            en: ['man', 'sassy', 'tipping hand', 'man tipping hand'],
            es: ['hombre', 'información', 'mano', 'mostrador', 'empleado de mostrador de información'],
        },
        types: ['💁🏻‍♂️', '💁🏼‍♂️', '💁🏽‍♂️', '💁🏾‍♂️', '💁🏿‍♂️'],
    },
    {
        code: '💁‍♀️',
        name: {
            en: 'woman-tipping-hand',
            es: 'mujer_con_palma_hacia_arriba',
        },
        keywords: {
            en: ['sassy', 'tipping hand', 'woman', 'woman tipping hand'],
            es: ['información', 'mano', 'mostrador', 'mujer', 'empleada de mostrador de información'],
        },
        types: ['💁🏻‍♀️', '💁🏼‍♀️', '💁🏽‍♀️', '💁🏾‍♀️', '💁🏿‍♀️'],
    },
    {
        code: '🙋',
        name: {
            en: 'raising_hand',
            es: 'levantando_la_mano',
        },
        keywords: {
            en: ['gesture', 'hand', 'happy', 'raised', 'person raising hand'],
            es: ['feliz', 'gesto', 'levantar', 'mano', 'persona con la mano levantada'],
        },
        types: ['🙋🏻', '🙋🏼', '🙋🏽', '🙋🏾', '🙋🏿'],
    },
    {
        code: '🙋‍♂️',
        name: {
            en: 'man-raising-hand',
            es: 'hombre_levantando_mano',
        },
        keywords: {
            en: ['gesture', 'man', 'raising hand', 'man raising hand'],
            es: ['gesto', 'hombre', 'levantar', 'mano', 'hombre con la mano levantada'],
        },
        types: ['🙋🏻‍♂️', '🙋🏼‍♂️', '🙋🏽‍♂️', '🙋🏾‍♂️', '🙋🏿‍♂️'],
    },
    {
        code: '🙋‍♀️',
        name: {
            en: 'woman-raising-hand',
            es: 'mujer_levantando_mano',
        },
        keywords: {
            en: ['gesture', 'raising hand', 'woman', 'woman raising hand'],
            es: ['gesto', 'levantar', 'mano', 'mujer', 'mujer con la mano levantada'],
        },
        types: ['🙋🏻‍♀️', '🙋🏼‍♀️', '🙋🏽‍♀️', '🙋🏾‍♀️', '🙋🏿‍♀️'],
    },
    {
        code: '🧏',
        name: {
            en: 'deaf_person',
            es: 'persona_sorda',
        },
        keywords: {
            en: ['accessibility', 'deaf', 'ear', 'hear', 'deaf person'],
            es: ['accesibilidad', 'escuchar', 'oído', 'oír', 'sordera', 'persona sorda'],
        },
        types: ['🧏🏻', '🧏🏼', '🧏🏽', '🧏🏾', '🧏🏿'],
    },
    {
        code: '🧏‍♂️',
        name: {
            en: 'deaf_man',
            es: 'hombre_sordo',
        },
        keywords: {
            en: ['deaf', 'man'],
            es: ['hombre', 'sordera', 'sordo'],
        },
        types: ['🧏🏻‍♂️', '🧏🏼‍♂️', '🧏🏽‍♂️', '🧏🏾‍♂️', '🧏🏿‍♂️'],
    },
    {
        code: '🧏‍♀️',
        name: {
            en: 'deaf_woman',
            es: 'mujer_sorda',
        },
        keywords: {
            en: ['deaf', 'woman'],
            es: ['mujer', 'sorda', 'sordera'],
        },
        types: ['🧏🏻‍♀️', '🧏🏼‍♀️', '🧏🏽‍♀️', '🧏🏾‍♀️', '🧏🏿‍♀️'],
    },
    {
        code: '🙇',
        name: {
            en: 'bow',
            es: 'reverencia',
        },
        keywords: {
            en: ['apology', 'bow', 'gesture', 'sorry', 'person bowing'],
            es: ['disculpa', 'gesto', 'perdón', 'reverencia', 'persona haciendo una reverencia'],
        },
        types: ['🙇🏻', '🙇🏼', '🙇🏽', '🙇🏾', '🙇🏿'],
    },
    {
        code: '🙇‍♂️',
        name: {
            en: 'man-bowing',
            es: 'hombre_reverencia',
        },
        keywords: {
            en: ['apology', 'bowing', 'favor', 'gesture', 'man', 'sorry'],
            es: ['disculpa', 'gesto', 'perdón', 'reverencia', 'hombre haciendo una reverencia'],
        },
        types: ['🙇🏻‍♂️', '🙇🏼‍♂️', '🙇🏽‍♂️', '🙇🏾‍♂️', '🙇🏿‍♂️'],
    },
    {
        code: '🙇‍♀️',
        name: {
            en: 'woman-bowing',
            es: 'mujer_reverencia',
        },
        keywords: {
            en: ['apology', 'bowing', 'favor', 'gesture', 'sorry', 'woman'],
            es: ['disculpa', 'gesto', 'perdón', 'reverencia', 'mujer haciendo una reverencia'],
        },
        types: ['🙇🏻‍♀️', '🙇🏼‍♀️', '🙇🏽‍♀️', '🙇🏾‍♀️', '🙇🏿‍♀️'],
    },
    {
        code: '🤦',
        name: {
            en: 'face_palm',
            es: 'mano_en_la_cara',
        },
        keywords: {
            en: ['disbelief', 'exasperation', 'face', 'palm', 'person facepalming'],
            es: ['facepalm', 'frente', 'incredulidad', 'mano', 'persona con la mano en la frente'],
        },
        types: ['🤦🏻', '🤦🏼', '🤦🏽', '🤦🏾', '🤦🏿'],
    },
    {
        code: '🤦‍♂️',
        name: {
            en: 'man-facepalming',
            es: 'hombre_mano_en_la_cara',
        },
        keywords: {
            en: ['disbelief', 'exasperation', 'facepalm', 'man', 'man facepalming'],
            es: ['facepalm', 'frente', 'incredulidad', 'mano', 'hombre con la mano en la frente'],
        },
        types: ['🤦🏻‍♂️', '🤦🏼‍♂️', '🤦🏽‍♂️', '🤦🏾‍♂️', '🤦🏿‍♂️'],
    },
    {
        code: '🤦‍♀️',
        name: {
            en: 'woman-facepalming',
            es: 'mujer_mano_en_la_cara',
        },
        keywords: {
            en: ['disbelief', 'exasperation', 'facepalm', 'woman', 'woman facepalming'],
            es: ['facepalm', 'frente', 'incredulidad', 'mano', 'mujer con la mano en la frente'],
        },
        types: ['🤦🏻‍♀️', '🤦🏼‍♀️', '🤦🏽‍♀️', '🤦🏾‍♀️', '🤦🏿‍♀️'],
    },
    {
        code: '🤷',
        name: {
            en: 'shrug',
            es: 'encoger_los_hombros',
        },
        keywords: {
            en: ['doubt', 'ignorance', 'indifference', 'shrug', 'person shrugging'],
            es: ['duda', 'encogerse', 'hombros', 'indiferencia', 'persona encogida de hombros'],
        },
        types: ['🤷🏻', '🤷🏼', '🤷🏽', '🤷🏾', '🤷🏿'],
    },
    {
        code: '🤷‍♂️',
        name: {
            en: 'man-shrugging',
            es: 'hombre_encogiéndose_de_hombros',
        },
        keywords: {
            en: ['doubt', 'ignorance', 'indifference', 'man', 'shrug', 'man shrugging'],
            es: ['duda', 'encogerse', 'hombros', 'indiferencia', 'hombre encogido de hombros'],
        },
        types: ['🤷🏻‍♂️', '🤷🏼‍♂️', '🤷🏽‍♂️', '🤷🏾‍♂️', '🤷🏿‍♂️'],
    },
    {
        code: '🤷‍♀️',
        name: {
            en: 'woman-shrugging',
            es: 'mujer_encogiéndose_de_hombros',
        },
        keywords: {
            en: ['doubt', 'ignorance', 'indifference', 'shrug', 'woman', 'woman shrugging'],
            es: ['duda', 'encogerse', 'hombros', 'indiferencia', 'mujer encogida de hombros'],
        },
        types: ['🤷🏻‍♀️', '🤷🏼‍♀️', '🤷🏽‍♀️', '🤷🏾‍♀️', '🤷🏿‍♀️'],
    },
    {
        code: '🧑‍⚕️',
        name: {
            en: 'health_worker',
            es: 'profesional_sanitario',
        },
        keywords: {
            en: ['doctor', 'healthcare', 'nurse', 'therapist', 'health worker'],
            es: ['doctor', 'enfermero', 'médico', 'salud', 'terapeuta', 'profesional sanitario'],
        },
        types: ['🧑🏻‍⚕️', '🧑🏼‍⚕️', '🧑🏽‍⚕️', '🧑🏾‍⚕️', '🧑🏿‍⚕️'],
    },
    {
        code: '👨‍⚕️',
        name: {
            en: 'male-doctor',
            es: 'doctor',
        },
        keywords: {
            en: ['doctor', 'healthcare', 'man', 'nurse', 'therapist', 'man health worker'],
            es: ['doctor', 'enfermero', 'médico', 'sanitario', 'terapeuta hombre', 'profesional sanitario hombre'],
        },
        types: ['👨🏻‍⚕️', '👨🏼‍⚕️', '👨🏽‍⚕️', '👨🏾‍⚕️', '👨🏿‍⚕️'],
    },
    {
        code: '👩‍⚕️',
        name: {
            en: 'female-doctor',
            es: 'doctora',
        },
        keywords: {
            en: ['doctor', 'healthcare', 'nurse', 'therapist', 'woman', 'woman health worker'],
            es: ['doctora', 'enfermera', 'médica', 'sanitaria', 'terapeuta mujer', 'profesional sanitario mujer'],
        },
        types: ['👩🏻‍⚕️', '👩🏼‍⚕️', '👩🏽‍⚕️', '👩🏾‍⚕️', '👩🏿‍⚕️'],
    },
    {
        code: '🧑‍🎓',
        name: {
            en: 'student',
            es: 'estudiante',
        },
        keywords: {
            en: ['graduate', 'student'],
            es: ['graduado', 'licenciado', 'universitario', 'estudiante'],
        },
        types: ['🧑🏻‍🎓', '🧑🏼‍🎓', '🧑🏽‍🎓', '🧑🏾‍🎓', '🧑🏿‍🎓'],
    },
    {
        code: '👨‍🎓',
        name: {
            en: 'male-student',
            es: 'alumno',
        },
        keywords: {
            en: ['graduate', 'man', 'student'],
            es: ['estudiante', 'graduado', 'hombre', 'licenciado', 'universitario'],
        },
        types: ['👨🏻‍🎓', '👨🏼‍🎓', '👨🏽‍🎓', '👨🏾‍🎓', '👨🏿‍🎓'],
    },
    {
        code: '👩‍🎓',
        name: {
            en: 'female-student',
            es: 'alumna',
        },
        keywords: {
            en: ['graduate', 'student', 'woman'],
            es: ['estudiante', 'graduada', 'licenciada', 'mujer', 'universitaria'],
        },
        types: ['👩🏻‍🎓', '👩🏼‍🎓', '👩🏽‍🎓', '👩🏾‍🎓', '👩🏿‍🎓'],
    },
    {
        code: '🧑‍🏫',
        name: {
            en: 'teacher',
            es: 'docente',
        },
        keywords: {
            en: ['instructor', 'professor', 'teacher'],
            es: ['educador', 'enseñanza', 'instructor', 'maestro', 'profesor', 'docente'],
        },
        types: ['🧑🏻‍🏫', '🧑🏼‍🏫', '🧑🏽‍🏫', '🧑🏾‍🏫', '🧑🏿‍🏫'],
    },
    {
        code: '👨‍🏫',
        name: {
            en: 'male-teacher',
            es: 'profesor',
        },
        keywords: {
            en: ['instructor', 'man', 'professor', 'teacher'],
            es: ['educador', 'hombre', 'instructor', 'maestro', 'profesor', 'docente hombre'],
        },
        types: ['👨🏻‍🏫', '👨🏼‍🏫', '👨🏽‍🏫', '👨🏾‍🏫', '👨🏿‍🏫'],
    },
    {
        code: '👩‍🏫',
        name: {
            en: 'female-teacher',
            es: 'profesora',
        },
        keywords: {
            en: ['instructor', 'professor', 'teacher', 'woman'],
            es: ['educadora', 'instructora', 'maestra', 'mujer', 'profesora', 'docente mujer'],
        },
        types: ['👩🏻‍🏫', '👩🏼‍🏫', '👩🏽‍🏫', '👩🏾‍🏫', '👩🏿‍🏫'],
    },
    {
        code: '🧑‍⚖️',
        name: {
            en: 'judge',
            es: 'persona_juez',
        },
        keywords: {
            en: ['justice', 'scales', 'judge'],
            es: ['juez', 'juicio', 'magistrado', 'fiscal'],
        },
        types: ['🧑🏻‍⚖️', '🧑🏼‍⚖️', '🧑🏽‍⚖️', '🧑🏾‍⚖️', '🧑🏿‍⚖️'],
    },
    {
        code: '👨‍⚖️',
        name: {
            en: 'male-judge',
            es: 'juez',
        },
        keywords: {
            en: ['judge', 'justice', 'man', 'scales'],
            es: ['hombre', 'juez', 'justicia', 'magistrado', 'fiscal hombre'],
        },
        types: ['👨🏻‍⚖️', '👨🏼‍⚖️', '👨🏽‍⚖️', '👨🏾‍⚖️', '👨🏿‍⚖️'],
    },
    {
        code: '👩‍⚖️',
        name: {
            en: 'female-judge',
            es: 'jueza',
        },
        keywords: {
            en: ['judge', 'justice', 'scales', 'woman'],
            es: ['jueza', 'justicia', 'magistrada', 'mujer', 'fiscal mujer'],
        },
        types: ['👩🏻‍⚖️', '👩🏼‍⚖️', '👩🏽‍⚖️', '👩🏾‍⚖️', '👩🏿‍⚖️'],
    },
    {
        code: '🧑‍🌾',
        name: {
            en: 'farmer',
            es: 'persona_agricultora',
        },
        keywords: {
            en: ['gardener', 'rancher', 'farmer'],
            es: ['agricultor', 'cultivador', 'granjero', 'jardinero', 'labrador', 'profesional de la agricultura'],
        },
        types: ['🧑🏻‍🌾', '🧑🏼‍🌾', '🧑🏽‍🌾', '🧑🏾‍🌾', '🧑🏿‍🌾'],
    },
    {
        code: '👨‍🌾',
        name: {
            en: 'male-farmer',
            es: 'agricultor',
        },
        keywords: {
            en: ['farmer', 'gardener', 'man', 'rancher'],
            es: ['agricultor', 'campo', 'granjero', 'hombre', 'labrador', 'profesional de la agricultura hombre'],
        },
        types: ['👨🏻‍🌾', '👨🏼‍🌾', '👨🏽‍🌾', '👨🏾‍🌾', '👨🏿‍🌾'],
    },
    {
        code: '👩‍🌾',
        name: {
            en: 'female-farmer',
            es: 'agricultora',
        },
        keywords: {
            en: ['farmer', 'gardener', 'rancher', 'woman'],
            es: ['agricultora', 'campo', 'granjera', 'labradora', 'mujer', 'profesional de la agricultura mujer'],
        },
        types: ['👩🏻‍🌾', '👩🏼‍🌾', '👩🏽‍🌾', '👩🏾‍🌾', '👩🏿‍🌾'],
    },
    {
        code: '🧑‍🍳',
        name: {
            en: 'cook',
            es: 'persona_cocinera',
        },
        keywords: {
            en: ['chef', 'cook'],
            es: ['cocinero', 'cocinillas', 'guisandero', 'pinche', 'chef'],
        },
        types: ['🧑🏻‍🍳', '🧑🏼‍🍳', '🧑🏽‍🍳', '🧑🏾‍🍳', '🧑🏿‍🍳'],
    },
    {
        code: '👨‍🍳',
        name: {
            en: 'male-cook',
            es: 'cocinero',
        },
        keywords: {
            en: ['chef', 'cook', 'man'],
            es: ['chef', 'cocinero', 'hombre', 'pinche'],
        },
        types: ['👨🏻‍🍳', '👨🏼‍🍳', '👨🏽‍🍳', '👨🏾‍🍳', '👨🏿‍🍳'],
    },
    {
        code: '👩‍🍳',
        name: {
            en: 'female-cook',
            es: 'cocinera',
        },
        keywords: {
            en: ['chef', 'cook', 'woman'],
            es: ['chef', 'cocinera', 'mujer', 'pinche'],
        },
        types: ['👩🏻‍🍳', '👩🏼‍🍳', '👩🏽‍🍳', '👩🏾‍🍳', '👩🏿‍🍳'],
    },
    {
        code: '🧑‍🔧',
        name: {
            en: 'mechanic',
            es: 'persona_mecánica',
        },
        keywords: {
            en: ['electrician', 'plumber', 'tradesperson', 'mechanic'],
            es: ['electricista', 'fontanero', 'mecánico', 'operario', 'técnico', 'profesional de la mecánica'],
        },
        types: ['🧑🏻‍🔧', '🧑🏼‍🔧', '🧑🏽‍🔧', '🧑🏾‍🔧', '🧑🏿‍🔧'],
    },
    {
        code: '👨‍🔧',
        name: {
            en: 'male-mechanic',
            es: 'mecánico',
        },
        keywords: {
            en: ['electrician', 'man', 'mechanic', 'plumber', 'tradesperson'],
            es: ['electricista', 'fontanero', 'hombre', 'mecánico', 'operario', 'profesional de la mecánica hombre'],
        },
        types: ['👨🏻‍🔧', '👨🏼‍🔧', '👨🏽‍🔧', '👨🏾‍🔧', '👨🏿‍🔧'],
    },
    {
        code: '👩‍🔧',
        name: {
            en: 'female-mechanic',
            es: 'mecánica',
        },
        keywords: {
            en: ['electrician', 'mechanic', 'plumber', 'tradesperson', 'woman'],
            es: ['electricista', 'fontanera', 'mecánica', 'mujer', 'operaria', 'profesional de la mecánica mujer'],
        },
        types: ['👩🏻‍🔧', '👩🏼‍🔧', '👩🏽‍🔧', '👩🏾‍🔧', '👩🏿‍🔧'],
    },
    {
        code: '🧑‍🏭',
        name: {
            en: 'factory_worker',
            es: 'profesional_industrial',
        },
        keywords: {
            en: ['assembly', 'factory', 'industrial', 'worker'],
            es: ['fábrica', 'montaje', 'obrero', 'operario', 'trabajador', 'profesional industrial'],
        },
        types: ['🧑🏻‍🏭', '🧑🏼‍🏭', '🧑🏽‍🏭', '🧑🏾‍🏭', '🧑🏿‍🏭'],
    },
    {
        code: '👨‍🏭',
        name: {
            en: 'male-factory-worker',
            es: 'trabajador',
        },
        keywords: {
            en: ['assembly', 'factory', 'industrial', 'man', 'worker'],
            es: ['fábrica', 'montaje', 'obrero', 'operario', 'trabajador', 'profesional industrial hombre'],
        },
        types: ['👨🏻‍🏭', '👨🏼‍🏭', '👨🏽‍🏭', '👨🏾‍🏭', '👨🏿‍🏭'],
    },
    {
        code: '👩‍🏭',
        name: {
            en: 'female-factory-worker',
            es: 'trabajadora',
        },
        keywords: {
            en: ['assembly', 'factory', 'industrial', 'woman', 'worker'],
            es: ['fábrica', 'montaje', 'obrera', 'operaria', 'trabajadora', 'profesional industrial mujer'],
        },
        types: ['👩🏻‍🏭', '👩🏼‍🏭', '👩🏽‍🏭', '👩🏾‍🏭', '👩🏿‍🏭'],
    },
    {
        code: '🧑‍💼',
        name: {
            en: 'office_worker',
            es: 'oficinista',
        },
        keywords: {
            en: ['architect', 'business', 'manager', 'white-collar', 'office worker'],
            es: ['arquitecto', 'director', 'ejecutivo', 'empresa', 'oficinista'],
        },
        types: ['🧑🏻‍💼', '🧑🏼‍💼', '🧑🏽‍💼', '🧑🏾‍💼', '🧑🏿‍💼'],
    },
    {
        code: '👨‍💼',
        name: {
            en: 'male-office-worker',
            es: 'oficinista_hombre',
        },
        keywords: {
            en: ['architect', 'business', 'man', 'manager', 'white-collar', 'man office worker'],
            es: ['director', 'ejecutivo', 'empresa', 'hombre', 'oficina', 'oficinista'],
        },
        types: ['👨🏻‍💼', '👨🏼‍💼', '👨🏽‍💼', '👨🏾‍💼', '👨🏿‍💼'],
    },
    {
        code: '👩‍💼',
        name: {
            en: 'female-office-worker',
            es: 'oficinista_mujer',
        },
        keywords: {
            en: ['architect', 'business', 'manager', 'white-collar', 'woman', 'woman office worker'],
            es: ['directora', 'ejecutiva', 'empresa', 'mujer', 'oficina', 'oficinista'],
        },
        types: ['👩🏻‍💼', '👩🏼‍💼', '👩🏽‍💼', '👩🏾‍💼', '👩🏿‍💼'],
    },
    {
        code: '🧑‍🔬',
        name: {
            en: 'scientist',
            es: 'persona_científica',
        },
        keywords: {
            en: ['biologist', 'chemist', 'engineer', 'physicist', 'scientist'],
            es: ['biólogo', 'científico', 'físico', 'investigador', 'químico', 'profesional de la ciencia'],
        },
        types: ['🧑🏻‍🔬', '🧑🏼‍🔬', '🧑🏽‍🔬', '🧑🏾‍🔬', '🧑🏿‍🔬'],
    },
    {
        code: '👨‍🔬',
        name: {
            en: 'male-scientist',
            es: 'científico',
        },
        keywords: {
            en: ['biologist', 'chemist', 'engineer', 'man', 'physicist', 'scientist'],
            es: ['biólogo', 'científico', 'físico', 'hombre', 'químico', 'profesional de la ciencia hombre'],
        },
        types: ['👨🏻‍🔬', '👨🏼‍🔬', '👨🏽‍🔬', '👨🏾‍🔬', '👨🏿‍🔬'],
    },
    {
        code: '👩‍🔬',
        name: {
            en: 'female-scientist',
            es: 'científica',
        },
        keywords: {
            en: ['biologist', 'chemist', 'engineer', 'physicist', 'scientist', 'woman'],
            es: ['bióloga', 'científica', 'física', 'mujer', 'química', 'profesional de la ciencia mujer'],
        },
        types: ['👩🏻‍🔬', '👩🏼‍🔬', '👩🏽‍🔬', '👩🏾‍🔬', '👩🏿‍🔬'],
    },
    {
        code: '🧑‍💻',
        name: {
            en: 'technologist',
            es: 'persona_tecnóloga',
        },
        keywords: {
            en: ['coder', 'developer', 'inventor', 'software', 'technologist'],
            es: ['desarrollador', 'informático', 'programador', 'software', 'tecnólogo', 'profesional de la tecnología'],
        },
        types: ['🧑🏻‍💻', '🧑🏼‍💻', '🧑🏽‍💻', '🧑🏾‍💻', '🧑🏿‍💻'],
    },
    {
        code: '👨‍💻',
        name: {
            en: 'male-technologist',
            es: 'tecnólogo',
        },
        keywords: {
            en: ['coder', 'developer', 'inventor', 'man', 'software', 'technologist'],
            es: ['desarrollador', 'hombre', 'informático', 'programador', 'tecnólogo', 'profesional de la tecnología hombre'],
        },
        types: ['👨🏻‍💻', '👨🏼‍💻', '👨🏽‍💻', '👨🏾‍💻', '👨🏿‍💻'],
    },
    {
        code: '👩‍💻',
        name: {
            en: 'female-technologist',
            es: 'tecnóloga',
        },
        keywords: {
            en: ['coder', 'developer', 'inventor', 'software', 'technologist', 'woman'],
            es: ['desarrolladora', 'informática', 'mujer', 'programadora', 'tecnóloga', 'profesional de la tecnología mujer'],
        },
        types: ['👩🏻‍💻', '👩🏼‍💻', '👩🏽‍💻', '👩🏾‍💻', '👩🏿‍💻'],
    },
    {
        code: '🧑‍🎤',
        name: {
            en: 'singer',
            es: 'cantante',
        },
        keywords: {
            en: ['actor', 'entertainer', 'rock', 'star', 'singer'],
            es: ['artista', 'estrella', 'rock', 'cantante'],
        },
        types: ['🧑🏻‍🎤', '🧑🏼‍🎤', '🧑🏽‍🎤', '🧑🏾‍🎤', '🧑🏿‍🎤'],
    },
    {
        code: '👨‍🎤',
        name: {
            en: 'male-singer',
            es: 'cantante_hombre',
        },
        keywords: {
            en: ['actor', 'entertainer', 'man', 'rock', 'singer', 'star'],
            es: ['artista', 'estrella', 'hombre', 'rock', 'cantante hombre'],
        },
        types: ['👨🏻‍🎤', '👨🏼‍🎤', '👨🏽‍🎤', '👨🏾‍🎤', '👨🏿‍🎤'],
    },
    {
        code: '👩‍🎤',
        name: {
            en: 'female-singer',
            es: 'cantante_mujer',
        },
        keywords: {
            en: ['actor', 'entertainer', 'rock', 'singer', 'star', 'woman'],
            es: ['artista', 'estrella', 'mujer', 'rock', 'cantante mujer'],
        },
        types: ['👩🏻‍🎤', '👩🏼‍🎤', '👩🏽‍🎤', '👩🏾‍🎤', '👩🏿‍🎤'],
    },
    {
        code: '🧑‍🎨',
        name: {
            en: 'artist',
            es: 'artista',
        },
        keywords: {
            en: ['palette', 'artist'],
            es: ['paleta', 'pintor', 'pinturas', 'artista'],
        },
        types: ['🧑🏻‍🎨', '🧑🏼‍🎨', '🧑🏽‍🎨', '🧑🏾‍🎨', '🧑🏿‍🎨'],
    },
    {
        code: '👨‍🎨',
        name: {
            en: 'male-artist',
            es: 'artista_hombre',
        },
        keywords: {
            en: ['artist', 'man', 'palette'],
            es: ['hombre', 'paleta', 'pintor', 'pinturas', 'artista hombre'],
        },
        types: ['👨🏻‍🎨', '👨🏼‍🎨', '👨🏽‍🎨', '👨🏾‍🎨', '👨🏿‍🎨'],
    },
    {
        code: '👩‍🎨',
        name: {
            en: 'female-artist',
            es: 'artista_mujer',
        },
        keywords: {
            en: ['artist', 'palette', 'woman'],
            es: ['mujer', 'paleta', 'pintora', 'pinturas', 'artista mujer'],
        },
        types: ['👩🏻‍🎨', '👩🏼‍🎨', '👩🏽‍🎨', '👩🏾‍🎨', '👩🏿‍🎨'],
    },
    {
        code: '🧑‍✈️',
        name: {
            en: 'pilot',
            es: 'piloto',
        },
        keywords: {
            en: ['plane', 'pilot'],
            es: ['avión', 'capitán', 'vuelo', 'piloto'],
        },
        types: ['🧑🏻‍✈️', '🧑🏼‍✈️', '🧑🏽‍✈️', '🧑🏾‍✈️', '🧑🏿‍✈️'],
    },
    {
        code: '👨‍✈️',
        name: {
            en: 'male-pilot',
            es: 'piloto_hombre',
        },
        keywords: {
            en: ['man', 'pilot', 'plane'],
            es: ['avión', 'capitán', 'hombre', 'piloto', 'vuelo'],
        },
        types: ['👨🏻‍✈️', '👨🏼‍✈️', '👨🏽‍✈️', '👨🏾‍✈️', '👨🏿‍✈️'],
    },
    {
        code: '👩‍✈️',
        name: {
            en: 'female-pilot',
            es: 'piloto_mujer',
        },
        keywords: {
            en: ['pilot', 'plane', 'woman'],
            es: ['avión', 'capitana', 'mujer', 'piloto', 'vuelo'],
        },
        types: ['👩🏻‍✈️', '👩🏼‍✈️', '👩🏽‍✈️', '👩🏾‍✈️', '👩🏿‍✈️'],
    },
    {
        code: '🧑‍🚀',
        name: {
            en: 'astronaut',
            es: 'astronauta',
        },
        keywords: {
            en: ['rocket', 'astronaut'],
            es: ['cohete', 'espacio', 'astronauta'],
        },
        types: ['🧑🏻‍🚀', '🧑🏼‍🚀', '🧑🏽‍🚀', '🧑🏾‍🚀', '🧑🏿‍🚀'],
    },
    {
        code: '👨‍🚀',
        name: {
            en: 'male-astronaut',
            es: 'astronauta_hombre',
        },
        keywords: {
            en: ['astronaut', 'man', 'rocket'],
            es: ['astronauta', 'cohete', 'espacio', 'hombre'],
        },
        types: ['👨🏻‍🚀', '👨🏼‍🚀', '👨🏽‍🚀', '👨🏾‍🚀', '👨🏿‍🚀'],
    },
    {
        code: '👩‍🚀',
        name: {
            en: 'female-astronaut',
            es: 'astronauta_mujer',
        },
        keywords: {
            en: ['astronaut', 'rocket', 'woman'],
            es: ['astronauta', 'cohete', 'espacio', 'mujer'],
        },
        types: ['👩🏻‍🚀', '👩🏼‍🚀', '👩🏽‍🚀', '👩🏾‍🚀', '👩🏿‍🚀'],
    },
    {
        code: '🧑‍🚒',
        name: {
            en: 'firefighter',
            es: 'persona_bombero',
        },
        keywords: {
            en: ['firetruck', 'firefighter'],
            es: ['camión', 'manguera', 'bombero'],
        },
        types: ['🧑🏻‍🚒', '🧑🏼‍🚒', '🧑🏽‍🚒', '🧑🏾‍🚒', '🧑🏿‍🚒'],
    },
    {
        code: '👨‍🚒',
        name: {
            en: 'male-firefighter',
            es: 'bombero',
        },
        keywords: {
            en: ['firefighter', 'firetruck', 'man'],
            es: ['apagafuegos', 'bombero', 'camión', 'manguera', 'bombero hombre'],
        },
        types: ['👨🏻‍🚒', '👨🏼‍🚒', '👨🏽‍🚒', '👨🏾‍🚒', '👨🏿‍🚒'],
    },
    {
        code: '👩‍🚒',
        name: {
            en: 'female-firefighter',
            es: 'bombera',
        },
        keywords: {
            en: ['firefighter', 'firetruck', 'woman'],
            es: ['apagafuegos', 'bombera mujera', 'camión', 'manguera', 'bombera'],
        },
        types: ['👩🏻‍🚒', '👩🏼‍🚒', '👩🏽‍🚒', '👩🏾‍🚒', '👩🏿‍🚒'],
    },
    {
        code: '👮',
        name: {
            en: 'cop',
            es: 'policía',
        },
        keywords: {
            en: ['cop', 'officer', 'police'],
            es: ['agente', 'personas', 'policía', 'agente de policía'],
        },
        types: ['👮🏻', '👮🏼', '👮🏽', '👮🏾', '👮🏿'],
    },
    {
        code: '👮‍♂️',
        name: {
            en: 'male-police-officer',
            es: 'policía_hombre',
        },
        keywords: {
            en: ['cop', 'man', 'officer', 'police'],
            es: ['agente', 'hombre', 'poli', 'policía', 'agente de policía hombre'],
        },
        types: ['👮🏻‍♂️', '👮🏼‍♂️', '👮🏽‍♂️', '👮🏾‍♂️', '👮🏿‍♂️'],
    },
    {
        code: '👮‍♀️',
        name: {
            en: 'female-police-officer',
            es: 'policía_mujer',
        },
        keywords: {
            en: ['cop', 'officer', 'police', 'woman'],
            es: ['agente', 'mujer', 'poli', 'policía', 'agente de policía mujer'],
        },
        types: ['👮🏻‍♀️', '👮🏼‍♀️', '👮🏽‍♀️', '👮🏾‍♀️', '👮🏿‍♀️'],
    },
    {
        code: '🕵️',
        name: {
            en: 'sleuth_or_spy',
            es: 'sabueso_o_espía',
        },
        keywords: {
            en: ['sleuth', 'spy', 'detective'],
            es: ['cara', 'espía', 'detective'],
        },
        types: ['🕵🏻', '🕵🏼', '🕵🏽', '🕵🏾', '🕵🏿'],
    },
    {
        code: '🕵️‍♂️',
        name: {
            en: 'male-detective',
            es: 'detective_hombre',
        },
        keywords: {
            en: ['detective', 'man', 'sleuth', 'spy'],
            es: ['agente', 'detective', 'espía', 'hombre', 'investigador'],
        },
        types: ['🕵🏻‍♂️', '🕵🏼‍♂️', '🕵🏽‍♂️', '🕵🏾‍♂️', '🕵🏿‍♂️'],
    },
    {
        code: '🕵️‍♀️',
        name: {
            en: 'female-detective',
            es: 'detective_mujer',
        },
        keywords: {
            en: ['detective', 'sleuth', 'spy', 'woman'],
            es: ['agente', 'detective', 'espía', 'investigadora', 'mujer'],
        },
        types: ['🕵🏻‍♀️', '🕵🏼‍♀️', '🕵🏽‍♀️', '🕵🏾‍♀️', '🕵🏿‍♀️'],
    },
    {
        code: '💂',
        name: {
            en: 'guardsman',
            es: 'guardia',
        },
        keywords: {
            en: ['guard'],
            es: ['guardia real británica', 'guardia'],
        },
        types: ['💂🏻', '💂🏼', '💂🏽', '💂🏾', '💂🏿'],
    },
    {
        code: '💂‍♂️',
        name: {
            en: 'male-guard',
            es: 'guardia_hombre',
        },
        keywords: {
            en: ['guard', 'man'],
            es: ['guardia', 'hombre', 'vigilante'],
        },
        types: ['💂🏻‍♂️', '💂🏼‍♂️', '💂🏽‍♂️', '💂🏾‍♂️', '💂🏿‍♂️'],
    },
    {
        code: '💂‍♀️',
        name: {
            en: 'female-guard',
            es: 'guardia_mujer',
        },
        keywords: {
            en: ['guard', 'woman'],
            es: ['guardia', 'mujer', 'vigilante'],
        },
        types: ['💂🏻‍♀️', '💂🏼‍♀️', '💂🏽‍♀️', '💂🏾‍♀️', '💂🏿‍♀️'],
    },
    {
        code: '🥷',
        name: {
            en: 'ninja',
            es: 'ninja',
        },
        keywords: {
            en: ['fighter', 'hidden', 'stealth', 'ninja'],
            es: ['furtivo', 'guerrero', 'luchador', 'oculto', 'sigilo', 'ninja'],
        },
        types: ['🥷🏻', '🥷🏼', '🥷🏽', '🥷🏾', '🥷🏿'],
    },
    {
        code: '👷',
        name: {
            en: 'construction_worker',
            es: 'obrero_de_la_construcción',
        },
        keywords: {
            en: ['construction', 'hat', 'worker'],
            es: ['casco', 'construcción', 'obrero', 'trabajador', 'profesional de la construcción'],
        },
        types: ['👷🏻', '👷🏼', '👷🏽', '👷🏾', '👷🏿'],
    },
    {
        code: '👷‍♂️',
        name: {
            en: 'male-construction-worker',
            es: 'obrero',
        },
        keywords: {
            en: ['construction', 'man', 'worker'],
            es: ['albañil', 'construcción', 'hombre', 'obrero', 'trabajador', 'profesional de la construcción hombre'],
        },
        types: ['👷🏻‍♂️', '👷🏼‍♂️', '👷🏽‍♂️', '👷🏾‍♂️', '👷🏿‍♂️'],
    },
    {
        code: '👷‍♀️',
        name: {
            en: 'female-construction-worker',
            es: 'obrera',
        },
        keywords: {
            en: ['construction', 'woman', 'worker'],
            es: ['albañila', 'construcción', 'mujer', 'obrera', 'trabajadora', 'profesional de la construcción mujer'],
        },
        types: ['👷🏻‍♀️', '👷🏼‍♀️', '👷🏽‍♀️', '👷🏾‍♀️', '👷🏿‍♀️'],
    },
    {
        code: '🤴',
        name: {
            en: 'prince',
            es: 'príncipe',
        },
        keywords: {
            en: ['prince'],
            es: ['corona', 'príncipe'],
        },
        types: ['🤴🏻', '🤴🏼', '🤴🏽', '🤴🏾', '🤴🏿'],
    },
    {
        code: '👸',
        name: {
            en: 'princess',
            es: 'princesa',
        },
        keywords: {
            en: ['fairy tale', 'fantasy', 'princess'],
            es: ['cuento', 'fantasía', 'hadas', 'princesa'],
        },
        types: ['👸🏻', '👸🏼', '👸🏽', '👸🏾', '👸🏿'],
    },
    {
        code: '👳',
        name: {
            en: 'man_with_turban',
            es: 'hombre_con_turbante',
        },
        keywords: {
            en: ['turban', 'person wearing turban'],
            es: ['turbante', 'persona con turbante'],
        },
        types: ['👳🏻', '👳🏼', '👳🏽', '👳🏾', '👳🏿'],
    },
    {
        code: '👳‍♂️',
        name: {
            en: 'man-wearing-turban',
            es: 'hombre_que_lleva_turbante',
        },
        keywords: {
            en: ['man', 'turban', 'man wearing turban'],
            es: ['hombre', 'turbante', 'hombre con turbante'],
        },
        types: ['👳🏻‍♂️', '👳🏼‍♂️', '👳🏽‍♂️', '👳🏾‍♂️', '👳🏿‍♂️'],
    },
    {
        code: '👳‍♀️',
        name: {
            en: 'woman-wearing-turban',
            es: 'mujer_que_lleva_turbante',
        },
        keywords: {
            en: ['turban', 'woman', 'woman wearing turban'],
            es: ['mujer', 'turbante', 'mujer con turbante'],
        },
        types: ['👳🏻‍♀️', '👳🏼‍♀️', '👳🏽‍♀️', '👳🏾‍♀️', '👳🏿‍♀️'],
    },
    {
        code: '👲',
        name: {
            en: 'man_with_gua_pi_mao',
            es: 'hombre_con_gorro_chino',
        },
        keywords: {
            en: ['cap', 'gua pi mao', 'hat', 'person', 'skullcap', 'person with skullcap'],
            es: ['gorro', 'gua', 'mao', 'persona', 'gua pi mao', 'persona con gorro chino'],
        },
        types: ['👲🏻', '👲🏼', '👲🏽', '👲🏾', '👲🏿'],
    },
    {
        code: '🧕',
        name: {
            en: 'person_with_headscarf',
            es: 'persona_con_velo',
        },
        keywords: {
            en: ['headscarf', 'hijab', 'mantilla', 'tichel', 'woman with headscarf'],
            es: ['hiyab', 'pañuelo', 'mujer con hiyab'],
        },
        types: ['🧕🏻', '🧕🏼', '🧕🏽', '🧕🏾', '🧕🏿'],
    },
    {
        code: '🤵',
        name: {
            en: 'person_in_tuxedo',
            es: 'persona_en_esmoquin',
        },
        keywords: {
            en: ['groom', 'person', 'tuxedo', 'person in tuxedo'],
            es: ['esmoquin', 'novio', 'persona', 'persona con esmoquin'],
        },
        types: ['🤵🏻', '🤵🏼', '🤵🏽', '🤵🏾', '🤵🏿'],
    },
    {
        code: '🤵‍♂️',
        name: {
            en: 'man_in_tuxedo',
            es: 'hombre_con_esmoquin',
        },
        keywords: {
            en: ['man', 'tuxedo', 'man in tuxedo'],
            es: ['esmoquin', 'hombre', 'hombre con esmoquin'],
        },
        types: ['🤵🏻‍♂️', '🤵🏼‍♂️', '🤵🏽‍♂️', '🤵🏾‍♂️', '🤵🏿‍♂️'],
    },
    {
        code: '🤵‍♀️',
        name: {
            en: 'woman_in_tuxedo',
            es: 'mujer_con_esmoquin',
        },
        keywords: {
            en: ['tuxedo', 'woman', 'woman in tuxedo'],
            es: ['esmoquin', 'mujer', 'mujer con esmoquin'],
        },
        types: ['🤵🏻‍♀️', '🤵🏼‍♀️', '🤵🏽‍♀️', '🤵🏾‍♀️', '🤵🏿‍♀️'],
    },
    {
        code: '👰',
        name: {
            en: 'bride_with_veil',
            es: 'novia_con_velo',
        },
        keywords: {
            en: ['bride', 'person', 'veil', 'wedding', 'person with veil'],
            es: ['boda', 'novia', 'persona', 'velo', 'persona con velo'],
        },
        types: ['👰🏻', '👰🏼', '👰🏽', '👰🏾', '👰🏿'],
    },
    {
        code: '👰‍♂️',
        name: {
            en: 'man_with_veil',
            es: 'hombre_con_velo',
        },
        keywords: {
            en: ['man', 'veil', 'man with veil'],
            es: ['boda', 'hombre', 'novio', 'velo', 'hombre con velo'],
        },
        types: ['👰🏻‍♂️', '👰🏼‍♂️', '👰🏽‍♂️', '👰🏾‍♂️', '👰🏿‍♂️'],
    },
    {
        code: '👰‍♀️',
        name: {
            en: 'woman_with_veil',
            es: 'mujer_con_velo',
        },
        keywords: {
            en: ['veil', 'woman', 'woman with veil'],
            es: ['boda', 'mujer', 'novia', 'velo', 'mujer con velo'],
        },
        types: ['👰🏻‍♀️', '👰🏼‍♀️', '👰🏽‍♀️', '👰🏾‍♀️', '👰🏿‍♀️'],
    },
    {
        code: '🤰',
        name: {
            en: 'pregnant_woman',
            es: 'embarazada',
        },
        keywords: {
            en: ['pregnant', 'woman'],
            es: ['embarazada', 'mujer'],
        },
        types: ['🤰🏻', '🤰🏼', '🤰🏽', '🤰🏾', '🤰🏿'],
    },
    {
        code: '🤱',
        name: {
            en: 'breast-feeding',
            es: 'amamantar',
        },
        keywords: {
            en: ['baby', 'breast', 'nursing', 'breast-feeding'],
            es: ['amamantar', 'bebé', 'dar pecho', 'pecho', 'lactancia materna'],
        },
        types: ['🤱🏻', '🤱🏼', '🤱🏽', '🤱🏾', '🤱🏿'],
    },
    {
        code: '👩‍🍼',
        name: {
            en: 'woman_feeding_baby',
            es: 'mujer_alimentando_a_bebé',
        },
        keywords: {
            en: ['baby', 'feeding', 'nursing', 'woman'],
            es: ['alimentar', 'amamantar', 'bebé', 'lactancia', 'mujer', 'mujer alimentando a bebé'],
        },
        types: ['👩🏻‍🍼', '👩🏼‍🍼', '👩🏽‍🍼', '👩🏾‍🍼', '👩🏿‍🍼'],
    },
    {
        code: '👨‍🍼',
        name: {
            en: 'man_feeding_baby',
            es: 'hombre_alimentando_a_bebé',
        },
        keywords: {
            en: ['baby', 'feeding', 'man', 'nursing'],
            es: ['alimentar', 'amamantar', 'bebé', 'hombre', 'lactancia', 'hombre alimentando a bebé'],
        },
        types: ['👨🏻‍🍼', '👨🏼‍🍼', '👨🏽‍🍼', '👨🏾‍🍼', '👨🏿‍🍼'],
    },
    {
        code: '🧑‍🍼',
        name: {
            en: 'person_feeding_baby',
            es: 'persona_alimentando_a_bebé',
        },
        keywords: {
            en: ['baby', 'feeding', 'nursing', 'person'],
            es: ['alimentar', 'amamantar', 'bebé', 'lactancia', 'persona', 'persona alimentando a bebé'],
        },
        types: ['🧑🏻‍🍼', '🧑🏼‍🍼', '🧑🏽‍🍼', '🧑🏾‍🍼', '🧑🏿‍🍼'],
    },
    {
        code: '👼',
        name: {
            en: 'angel',
            es: 'ángel',
        },
        keywords: {
            en: ['angel', 'baby', 'face', 'fairy tale', 'fantasy'],
            es: ['ángel', 'bebé', 'cara', 'cuento'],
        },
        types: ['👼🏻', '👼🏼', '👼🏽', '👼🏾', '👼🏿'],
    },
    {
        code: '🎅',
        name: {
            en: 'santa',
            es: 'santa_claus',
        },
        keywords: {
            en: ['celebration', 'Christmas', 'claus', 'father', 'santa', 'Santa Claus'],
            es: ['celebración', 'claus', 'Navidad', 'papá noel', 'Papá Noel', 'santa'],
        },
        types: ['🎅🏻', '🎅🏼', '🎅🏽', '🎅🏾', '🎅🏿'],
    },
    {
        code: '🤶',
        name: {
            en: 'mrs_claus',
            es: 'sra_claus',
        },
        keywords: {
            en: ['celebration', 'Christmas', 'claus', 'mother', 'Mrs.', 'Mrs. Claus'],
            es: ['abuela', 'mamá', 'Navidad', 'noel', 'Mamá Noel'],
        },
        types: ['🤶🏻', '🤶🏼', '🤶🏽', '🤶🏾', '🤶🏿'],
    },
    {
        code: '🧑‍🎄',
        name: {
            en: 'mx_claus',
            es: 'mx_claus',
        },
        keywords: {
            en: ['claus', 'christmas', 'mx claus'],
            es: ['claus', 'christmas', 'mx claus'],
        },
    },
    {
        code: '🦸',
        name: {
            en: 'superhero',
            es: 'personaje_de_superhéroe',
        },
        keywords: {
            en: ['good', 'hero', 'heroine', 'superpower', 'superhero'],
            es: ['bien', 'héroe', 'heroína', 'superhéroe', 'superheroína', 'superpoder', 'personaje de superhéroe'],
        },
        types: ['🦸🏻', '🦸🏼', '🦸🏽', '🦸🏾', '🦸🏿'],
    },
    {
        code: '🦸‍♂️',
        name: {
            en: 'male_superhero',
            es: 'superhéroe',
        },
        keywords: {
            en: ['good', 'hero', 'man', 'superpower', 'man superhero'],
            es: ['bueno', 'héroe', 'hombre', 'superhombre', 'superpoder', 'superhéroe'],
        },
        types: ['🦸🏻‍♂️', '🦸🏼‍♂️', '🦸🏽‍♂️', '🦸🏾‍♂️', '🦸🏿‍♂️'],
    },
    {
        code: '🦸‍♀️',
        name: {
            en: 'female_superhero',
            es: 'superheroína',
        },
        keywords: {
            en: ['good', 'hero', 'heroine', 'superpower', 'woman', 'woman superhero'],
            es: ['héroe', 'heroína', 'mujer', 'superhéroe', 'superpoder', 'superheroína'],
        },
        types: ['🦸🏻‍♀️', '🦸🏼‍♀️', '🦸🏽‍♀️', '🦸🏾‍♀️', '🦸🏿‍♀️'],
    },
    {
        code: '🦹',
        name: {
            en: 'supervillain',
            es: 'personaje_de_supervillano',
        },
        keywords: {
            en: ['criminal', 'evil', 'superpower', 'villain', 'supervillain'],
            es: ['mal', 'superpoder', 'supervillana', 'supervillano', 'villana', 'villano', 'personaje de supervillano'],
        },
        types: ['🦹🏻', '🦹🏼', '🦹🏽', '🦹🏾', '🦹🏿'],
    },
    {
        code: '🦹‍♂️',
        name: {
            en: 'male_supervillain',
            es: 'supervillano',
        },
        keywords: {
            en: ['criminal', 'evil', 'man', 'superpower', 'villain', 'man supervillain'],
            es: ['hombre', 'mal', 'malvado', 'villano', 'supervillano'],
        },
        types: ['🦹🏻‍♂️', '🦹🏼‍♂️', '🦹🏽‍♂️', '🦹🏾‍♂️', '🦹🏿‍♂️'],
    },
    {
        code: '🦹‍♀️',
        name: {
            en: 'female_supervillain',
            es: 'supervillana',
        },
        keywords: {
            en: ['criminal', 'evil', 'superpower', 'villain', 'woman', 'woman supervillain'],
            es: ['mal', 'malvada', 'mujer', 'villana', 'supervillana'],
        },
        types: ['🦹🏻‍♀️', '🦹🏼‍♀️', '🦹🏽‍♀️', '🦹🏾‍♀️', '🦹🏿‍♀️'],
    },
    {
        code: '🧙',
        name: {
            en: 'mage',
            es: 'brujo',
        },
        keywords: {
            en: ['sorcerer', 'sorceress', 'witch', 'wizard', 'mage'],
            es: ['bruja', 'brujo', 'hechicera', 'hechicero', 'persona maga'],
        },
        types: ['🧙🏻', '🧙🏼', '🧙🏽', '🧙🏾', '🧙🏿'],
    },
    {
        code: '🧙‍♂️',
        name: {
            en: 'male_mage',
            es: 'mago',
        },
        keywords: {
            en: ['sorcerer', 'wizard', 'man mage'],
            es: ['brujo', 'hechicero', 'mago'],
        },
        types: ['🧙🏻‍♂️', '🧙🏼‍♂️', '🧙🏽‍♂️', '🧙🏾‍♂️', '🧙🏿‍♂️'],
    },
    {
        code: '🧙‍♀️',
        name: {
            en: 'female_mage',
            es: 'maga',
        },
        keywords: {
            en: ['sorceress', 'witch', 'woman mage'],
            es: ['bruja', 'hechicera', 'maga'],
        },
        types: ['🧙🏻‍♀️', '🧙🏼‍♀️', '🧙🏽‍♀️', '🧙🏾‍♀️', '🧙🏿‍♀️'],
    },
    {
        code: '🧚',
        name: {
            en: 'fairy',
            es: 'hada',
        },
        keywords: {
            en: ['Oberon', 'Puck', 'Titania', 'fairy'],
            es: ['campanilla', 'oberón', 'puck', 'titania', 'hada'],
        },
        types: ['🧚🏻', '🧚🏼', '🧚🏽', '🧚🏾', '🧚🏿'],
    },
    {
        code: '🧚‍♂️',
        name: {
            en: 'male_fairy',
            es: 'hada_macho',
        },
        keywords: {
            en: ['Oberon', 'Puck', 'man fairy'],
            es: ['hada', 'oberón', 'puck', 'hada hombre'],
        },
        types: ['🧚🏻‍♂️', '🧚🏼‍♂️', '🧚🏽‍♂️', '🧚🏾‍♂️', '🧚🏿‍♂️'],
    },
    {
        code: '🧚‍♀️',
        name: {
            en: 'female_fairy',
            es: 'hada_hembra',
        },
        keywords: {
            en: ['Titania', 'woman fairy'],
            es: ['campanilla', 'hada', 'titania', 'hada mujer'],
        },
        types: ['🧚🏻‍♀️', '🧚🏼‍♀️', '🧚🏽‍♀️', '🧚🏾‍♀️', '🧚🏿‍♀️'],
    },
    {
        code: '🧛',
        name: {
            en: 'vampire',
            es: 'vampiro',
        },
        keywords: {
            en: ['Dracula', 'undead', 'vampire'],
            es: ['drácula', 'muerto viviente', 'no muerto', 'vampiro'],
        },
        types: ['🧛🏻', '🧛🏼', '🧛🏽', '🧛🏾', '🧛🏿'],
    },
    {
        code: '🧛‍♂️',
        name: {
            en: 'male_vampire',
            es: 'vampiro_macho',
        },
        keywords: {
            en: ['Dracula', 'undead', 'man vampire'],
            es: ['drácula', 'muerto viviente', 'no muerto', 'vampiro hombre'],
        },
        types: ['🧛🏻‍♂️', '🧛🏼‍♂️', '🧛🏽‍♂️', '🧛🏾‍♂️', '🧛🏿‍♂️'],
    },
    {
        code: '🧛‍♀️',
        name: {
            en: 'female_vampire',
            es: 'vampira',
        },
        keywords: {
            en: ['undead', 'woman vampire'],
            es: ['muerta viviente', 'no muerta', 'vampiresa'],
        },
        types: ['🧛🏻‍♀️', '🧛🏼‍♀️', '🧛🏽‍♀️', '🧛🏾‍♀️', '🧛🏿‍♀️'],
    },
    {
        code: '🧜',
        name: {
            en: 'merperson',
            es: 'sirena-tritón',
        },
        keywords: {
            en: ['mermaid', 'merman', 'merwoman', 'merperson'],
            es: ['sirena', 'tritón', 'persona sirena'],
        },
        types: ['🧜🏻', '🧜🏼', '🧜🏽', '🧜🏾', '🧜🏿'],
    },
    {
        code: '🧜‍♂️',
        name: {
            en: 'merman',
            es: 'tritón',
        },
        keywords: {
            en: ['Triton', 'merman'],
            es: ['sirena', 'tritón', 'sirena hombre'],
        },
        types: ['🧜🏻‍♂️', '🧜🏼‍♂️', '🧜🏽‍♂️', '🧜🏾‍♂️', '🧜🏿‍♂️'],
    },
    {
        code: '🧜‍♀️',
        name: {
            en: 'mermaid',
            es: 'sirena',
        },
        keywords: {
            en: ['merwoman', 'mermaid'],
            es: ['sirena'],
        },
        types: ['🧜🏻‍♀️', '🧜🏼‍♀️', '🧜🏽‍♀️', '🧜🏾‍♀️', '🧜🏿‍♀️'],
    },
    {
        code: '🧝',
        name: {
            en: 'elf',
            es: 'elfo',
        },
        keywords: {
            en: ['magical', 'elf'],
            es: ['mágico', 'elfo'],
        },
        types: ['🧝🏻', '🧝🏼', '🧝🏽', '🧝🏾', '🧝🏿'],
    },
    {
        code: '🧝‍♂️',
        name: {
            en: 'male_elf',
            es: 'elfo_macho',
        },
        keywords: {
            en: ['magical', 'man elf'],
            es: ['elfo', 'mágico', 'elfo hombre'],
        },
        types: ['🧝🏻‍♂️', '🧝🏼‍♂️', '🧝🏽‍♂️', '🧝🏾‍♂️', '🧝🏿‍♂️'],
    },
    {
        code: '🧝‍♀️',
        name: {
            en: 'female_elf',
            es: 'elfa',
        },
        keywords: {
            en: ['magical', 'woman elf'],
            es: ['mágico', 'mujer', 'elfa'],
        },
        types: ['🧝🏻‍♀️', '🧝🏼‍♀️', '🧝🏽‍♀️', '🧝🏾‍♀️', '🧝🏿‍♀️'],
    },
    {
        code: '🧞',
        name: {
            en: 'genie',
            es: 'genio',
        },
        keywords: {
            en: ['djinn', 'genie'],
            es: ['lámpara', 'genio'],
        },
    },
    {
        code: '🧞‍♂️',
        name: {
            en: 'male_genie',
            es: 'genio_de_la_lámpara',
        },
        keywords: {
            en: ['djinn', 'man genie'],
            es: ['djinn', 'genio', 'lámpara', 'genio hombre'],
        },
    },
    {
        code: '🧞‍♀️',
        name: {
            en: 'female_genie',
            es: 'genia_de_la_lámpara',
        },
        keywords: {
            en: ['djinn', 'woman genie'],
            es: ['genio', 'lámpara', 'genio mujer'],
        },
    },
    {
        code: '🧟',
        name: {
            en: 'zombie',
            es: 'zombi',
        },
        keywords: {
            en: ['undead', 'walking dead', 'zombie'],
            es: ['muerto viviente', 'no muerto', 'zombi'],
        },
    },
    {
        code: '🧟‍♂️',
        name: {
            en: 'male_zombie',
            es: 'zombi_macho',
        },
        keywords: {
            en: ['undead', 'walking dead', 'man zombie'],
            es: ['caminante', 'muerto viviente', 'no muerto', 'zombi hombre'],
        },
    },
    {
        code: '🧟‍♀️',
        name: {
            en: 'female_zombie',
            es: 'zombi_hembra',
        },
        keywords: {
            en: ['undead', 'walking dead', 'woman zombie'],
            es: ['caminante', 'muerta viviente', 'no muerta', 'zombi mujer'],
        },
    },
    {
        code: '💆',
        name: {
            en: 'massage',
            es: 'masaje',
        },
        keywords: {
            en: ['face', 'massage', 'salon', 'person getting massage'],
            es: ['cara', 'facial', 'masaje', 'salón', 'persona recibiendo masaje'],
        },
        types: ['💆🏻', '💆🏼', '💆🏽', '💆🏾', '💆🏿'],
    },
    {
        code: '💆‍♂️',
        name: {
            en: 'man-getting-massage',
            es: 'hombre_dándose_un_masaje',
        },
        keywords: {
            en: ['face', 'man', 'massage', 'man getting massage'],
            es: ['cara', 'facial', 'masaje', 'salón', 'hombre recibiendo masaje'],
        },
        types: ['💆🏻‍♂️', '💆🏼‍♂️', '💆🏽‍♂️', '💆🏾‍♂️', '💆🏿‍♂️'],
    },
    {
        code: '💆‍♀️',
        name: {
            en: 'woman-getting-massage',
            es: 'mujer_dándose_un_masaje',
        },
        keywords: {
            en: ['face', 'massage', 'woman', 'woman getting massage'],
            es: ['cara', 'facial', 'masaje', 'salón', 'mujer recibiendo masaje'],
        },
        types: ['💆🏻‍♀️', '💆🏼‍♀️', '💆🏽‍♀️', '💆🏾‍♀️', '💆🏿‍♀️'],
    },
    {
        code: '💇',
        name: {
            en: 'haircut',
            es: 'corte_de_pelo',
        },
        keywords: {
            en: ['barber', 'beauty', 'haircut', 'parlor', 'person getting haircut'],
            es: ['belleza', 'corte', 'pelo', 'peluquero', 'persona cortándose el pelo'],
        },
        types: ['💇🏻', '💇🏼', '💇🏽', '💇🏾', '💇🏿'],
    },
    {
        code: '💇‍♂️',
        name: {
            en: 'man-getting-haircut',
            es: 'hombre_cortándose_el_pelo',
        },
        keywords: {
            en: ['haircut', 'man', 'man getting haircut'],
            es: ['belleza', 'corte', 'pelo', 'peluquero', 'hombre cortándose el pelo'],
        },
        types: ['💇🏻‍♂️', '💇🏼‍♂️', '💇🏽‍♂️', '💇🏾‍♂️', '💇🏿‍♂️'],
    },
    {
        code: '💇‍♀️',
        name: {
            en: 'woman-getting-haircut',
            es: 'mujer_cortándose_el_pelo',
        },
        keywords: {
            en: ['haircut', 'woman', 'woman getting haircut'],
            es: ['belleza', 'corte', 'pelo', 'peluquero', 'mujer cortándose el pelo'],
        },
        types: ['💇🏻‍♀️', '💇🏼‍♀️', '💇🏽‍♀️', '💇🏾‍♀️', '💇🏿‍♀️'],
    },
    {
        code: '🚶',
        name: {
            en: 'walking',
            es: 'caminando',
        },
        keywords: {
            en: ['hike', 'walk', 'walking', 'person walking'],
            es: ['andar', 'caminando', 'caminar', 'persona caminando'],
        },
        types: ['🚶🏻', '🚶🏼', '🚶🏽', '🚶🏾', '🚶🏿'],
    },
    {
        code: '🚶‍♂️',
        name: {
            en: 'man-walking',
            es: 'hombre_caminando',
        },
        keywords: {
            en: ['hike', 'man', 'walk', 'man walking'],
            es: ['andar', 'caminata', 'hombre', 'marcha', 'hombre caminando'],
        },
        types: ['🚶🏻‍♂️', '🚶🏼‍♂️', '🚶🏽‍♂️', '🚶🏾‍♂️', '🚶🏿‍♂️'],
    },
    {
        code: '🚶‍♀️',
        name: {
            en: 'woman-walking',
            es: 'mujer_caminando',
        },
        keywords: {
            en: ['hike', 'walk', 'woman', 'woman walking'],
            es: ['andar', 'caminata', 'marcha', 'mujer', 'mujer caminando'],
        },
        types: ['🚶🏻‍♀️', '🚶🏼‍♀️', '🚶🏽‍♀️', '🚶🏾‍♀️', '🚶🏿‍♀️'],
    },
    {
        code: '🧍',
        name: {
            en: 'standing_person',
            es: 'persona_de_pie',
        },
        keywords: {
            en: ['stand', 'standing', 'person standing'],
            es: ['de pie', 'levantada', 'levantado', 'levantarse', 'persona de pie'],
        },
        types: ['🧍🏻', '🧍🏼', '🧍🏽', '🧍🏾', '🧍🏿'],
    },
    {
        code: '🧍‍♂️',
        name: {
            en: 'man_standing',
            es: 'hombre_de_pie',
        },
        keywords: {
            en: ['man', 'standing'],
            es: ['de pie', 'hombre', 'levantado', 'levantarse', 'hombre de pie'],
        },
        types: ['🧍🏻‍♂️', '🧍🏼‍♂️', '🧍🏽‍♂️', '🧍🏾‍♂️', '🧍🏿‍♂️'],
    },
    {
        code: '🧍‍♀️',
        name: {
            en: 'woman_standing',
            es: 'mujer_de_pie',
        },
        keywords: {
            en: ['standing', 'woman'],
            es: ['de pie', 'levantada', 'levantarse', 'mujer', 'mujer de pie'],
        },
        types: ['🧍🏻‍♀️', '🧍🏼‍♀️', '🧍🏽‍♀️', '🧍🏾‍♀️', '🧍🏿‍♀️'],
    },
    {
        code: '🧎',
        name: {
            en: 'kneeling_person',
            es: 'persona_de_rodillas',
        },
        keywords: {
            en: ['kneel', 'kneeling', 'person kneeling'],
            es: ['arrodillada', 'arrodillado', 'arrodillarse', 'de rodillas', 'persona de rodillas'],
        },
        types: ['🧎🏻', '🧎🏼', '🧎🏽', '🧎🏾', '🧎🏿'],
    },
    {
        code: '🧎‍♂️',
        name: {
            en: 'man_kneeling',
            es: 'hombre_de_rodillas',
        },
        keywords: {
            en: ['kneeling', 'man'],
            es: ['arrodillado', 'arrodillarse', 'de rodillas', 'hombre', 'hombre de rodillas'],
        },
        types: ['🧎🏻‍♂️', '🧎🏼‍♂️', '🧎🏽‍♂️', '🧎🏾‍♂️', '🧎🏿‍♂️'],
    },
    {
        code: '🧎‍♀️',
        name: {
            en: 'woman_kneeling',
            es: 'mujer_de_rodillas',
        },
        keywords: {
            en: ['kneeling', 'woman'],
            es: ['arrodillada', 'arrodillarse', 'de rodillas', 'mujer', 'mujer de rodillas'],
        },
        types: ['🧎🏻‍♀️', '🧎🏼‍♀️', '🧎🏽‍♀️', '🧎🏾‍♀️', '🧎🏿‍♀️'],
    },
    {
        code: '🧑‍🦯',
        name: {
            en: 'person_with_probing_cane',
            es: 'persona_con_bastón',
        },
        keywords: {
            en: ['accessibility', 'blind', 'person with white cane'],
            es: ['accesibilidad', 'ciego', 'invidente', 'persona con bastón'],
        },
        types: ['🧑🏻‍🦯', '🧑🏼‍🦯', '🧑🏽‍🦯', '🧑🏾‍🦯', '🧑🏿‍🦯'],
    },
    {
        code: '👨‍🦯',
        name: {
            en: 'man_with_probing_cane',
            es: 'hombre_con_bastón',
        },
        keywords: {
            en: ['accessibility', 'blind', 'man', 'man with white cane'],
            es: ['accesibilidad', 'bastón', 'ciego', 'hombre', 'invidente', 'hombre con bastón'],
        },
        types: ['👨🏻‍🦯', '👨🏼‍🦯', '👨🏽‍🦯', '👨🏾‍🦯', '👨🏿‍🦯'],
    },
    {
        code: '👩‍🦯',
        name: {
            en: 'woman_with_probing_cane',
            es: 'mujer_con_bastón',
        },
        keywords: {
            en: ['accessibility', 'blind', 'woman', 'woman with white cane'],
            es: ['accesibilidad', 'bastón', 'ciega', 'invidente', 'mujer', 'mujer con bastón'],
        },
        types: ['👩🏻‍🦯', '👩🏼‍🦯', '👩🏽‍🦯', '👩🏾‍🦯', '👩🏿‍🦯'],
    },
    {
        code: '🧑‍🦼',
        name: {
            en: 'person_in_motorized_wheelchair',
            es: 'persona_en_silla_de_ruedas_eléctrica',
        },
        keywords: {
            en: ['accessibility', 'wheelchair', 'person in motorized wheelchair'],
            es: ['accesibilidad', 'silla de ruedas', 'persona en silla de ruedas eléctrica'],
        },
        types: ['🧑🏻‍🦼', '🧑🏼‍🦼', '🧑🏽‍🦼', '🧑🏾‍🦼', '🧑🏿‍🦼'],
    },
    {
        code: '👨‍🦼',
        name: {
            en: 'man_in_motorized_wheelchair',
            es: 'hombre_en_silla_de_ruedas_eléctrica',
        },
        keywords: {
            en: ['accessibility', 'man', 'wheelchair', 'man in motorized wheelchair'],
            es: ['accesibilidad', 'hombre', 'silla de ruedas', 'hombre en silla de ruedas eléctrica'],
        },
        types: ['👨🏻‍🦼', '👨🏼‍🦼', '👨🏽‍🦼', '👨🏾‍🦼', '👨🏿‍🦼'],
    },
    {
        code: '👩‍🦼',
        name: {
            en: 'woman_in_motorized_wheelchair',
            es: 'mujer_en_silla_de_ruedas_eléctrica',
        },
        keywords: {
            en: ['accessibility', 'wheelchair', 'woman', 'woman in motorized wheelchair'],
            es: ['accesibilidad', 'mujer', 'silla de ruedas', 'mujer en silla de ruedas eléctrica'],
        },
        types: ['👩🏻‍🦼', '👩🏼‍🦼', '👩🏽‍🦼', '👩🏾‍🦼', '👩🏿‍🦼'],
    },
    {
        code: '🧑‍🦽',
        name: {
            en: 'person_in_manual_wheelchair',
            es: 'persona_en_silla_de_ruedas_manual',
        },
        keywords: {
            en: ['accessibility', 'wheelchair', 'person in manual wheelchair'],
            es: ['accesibilidad', 'silla de ruedas', 'persona en silla de ruedas manual'],
        },
        types: ['🧑🏻‍🦽', '🧑🏼‍🦽', '🧑🏽‍🦽', '🧑🏾‍🦽', '🧑🏿‍🦽'],
    },
    {
        code: '👨‍🦽',
        name: {
            en: 'man_in_manual_wheelchair',
            es: 'hombre_en_silla_de_ruedas_manual',
        },
        keywords: {
            en: ['accessibility', 'man', 'wheelchair', 'man in manual wheelchair'],
            es: ['accesibilidad', 'hombre', 'silla de ruedas', 'hombre en silla de ruedas manual'],
        },
        types: ['👨🏻‍🦽', '👨🏼‍🦽', '👨🏽‍🦽', '👨🏾‍🦽', '👨🏿‍🦽'],
    },
    {
        code: '👩‍🦽',
        name: {
            en: 'woman_in_manual_wheelchair',
            es: 'mujer_en_silla_de_ruedas_manual',
        },
        keywords: {
            en: ['accessibility', 'wheelchair', 'woman', 'woman in manual wheelchair'],
            es: ['accesibilidad', 'mujer', 'silla de ruedas', 'mujer en silla de ruedas manual'],
        },
        types: ['👩🏻‍🦽', '👩🏼‍🦽', '👩🏽‍🦽', '👩🏾‍🦽', '👩🏿‍🦽'],
    },
    {
        code: '🏃',
        name: {
            en: 'runner',
            es: 'corredor',
        },
        keywords: {
            en: ['running', 'marathon  person running'],
            es: ['carrera', 'deporte', 'maratón  persona corriendo'],
        },
        types: ['🏃🏻', '🏃🏼', '🏃🏽', '🏃🏾', '🏃🏿'],
    },
    {
        code: '🏃‍♂️',
        name: {
            en: 'man-running',
            es: 'hombre_corriendo',
        },
        keywords: {
            en: ['man', 'racing', 'running', 'marathon'],
            es: ['carrera', 'correr', 'hombre', 'hombre corriendo  maratón'],
        },
        types: ['🏃🏻‍♂️', '🏃🏼‍♂️', '🏃🏽‍♂️', '🏃🏾‍♂️', '🏃🏿‍♂️'],
    },
    {
        code: '🏃‍♀️',
        name: {
            en: 'woman-running',
            es: 'mujer_corriendo',
        },
        keywords: {
            en: ['racing', 'running', 'woman', 'marathon'],
            es: ['carrera', 'correr', 'mujer', 'maratón', 'mujer corriendo'],
        },
        types: ['🏃🏻‍♀️', '🏃🏼‍♀️', '🏃🏽‍♀️', '🏃🏾‍♀️', '🏃🏿‍♀️'],
    },
    {
        code: '💃',
        name: {
            en: 'dancer',
            es: 'bailarín',
        },
        keywords: {
            en: ['dance', 'dancing', 'woman'],
            es: ['bailar', 'mujer', 'mujer bailando'],
        },
        types: ['💃🏻', '💃🏼', '💃🏽', '💃🏾', '💃🏿'],
    },
    {
        code: '🕺',
        name: {
            en: 'man_dancing',
            es: 'hombre_bailando',
        },
        keywords: {
            en: ['dance', 'dancing', 'man'],
            es: ['bailar', 'hombre', 'hombre bailando'],
        },
        types: ['🕺🏻', '🕺🏼', '🕺🏽', '🕺🏾', '🕺🏿'],
    },
    {
        code: '🕴️',
        name: {
            en: 'man_in_business_suit_levitating',
            es: 'hombre_de_negocios_levitando',
        },
        keywords: {
            en: ['business', 'person', 'suit', 'person in suit levitating'],
            es: ['levitar', 'negocios', 'persona', 'traje', 'persona trajeada levitando'],
        },
        types: ['🕴🏻', '🕴🏼', '🕴🏽', '🕴🏾', '🕴🏿'],
    },
    {
        code: '👯',
        name: {
            en: 'dancers',
            es: 'bailarines',
        },
        keywords: {
            en: ['bunny ear', 'dancer', 'partying', 'people with bunny ears'],
            es: ['bailar', 'fiesta', 'orejas de conejo', 'personas', 'personas con orejas de conejo'],
        },
    },
    {
        code: '👯‍♂️',
        name: {
            en: 'man-with-bunny-ears-partying',
            es: 'hombre_con_orejas_de_conejo',
        },
        keywords: {
            en: ['bunny ear', 'dancer', 'men', 'partying', 'men with bunny ears'],
            es: ['bailar', 'fiesta', 'hombre', 'orejas de conejo', 'hombres con orejas de conejo'],
        },
    },
    {
        code: '👯‍♀️',
        name: {
            en: 'woman-with-bunny-ears-partying',
            es: 'mujer_con_orejas_de_conejo',
        },
        keywords: {
            en: ['bunny ear', 'dancer', 'partying', 'women', 'women with bunny ears'],
            es: ['bailar', 'fiesta', 'mujer', 'orejas de conejo', 'mujeres con orejas de conejo'],
        },
    },
    {
        code: '🧖',
        name: {
            en: 'person_in_steamy_room',
            es: 'persona_en_sauna',
        },
        keywords: {
            en: ['sauna', 'steam room', 'person in steamy room'],
            es: ['sauna', 'vapor', 'persona en una sauna'],
        },
        types: ['🧖🏻', '🧖🏼', '🧖🏽', '🧖🏾', '🧖🏿'],
    },
    {
        code: '🧖‍♂️',
        name: {
            en: 'man_in_steamy_room',
            es: 'hombre_en_sauna',
        },
        keywords: {
            en: ['sauna', 'steam room', 'man in steamy room'],
            es: ['sauna', 'vapor', 'hombre en una sauna'],
        },
        types: ['🧖🏻‍♂️', '🧖🏼‍♂️', '🧖🏽‍♂️', '🧖🏾‍♂️', '🧖🏿‍♂️'],
    },
    {
        code: '🧖‍♀️',
        name: {
            en: 'woman_in_steamy_room',
            es: 'mujer_en_sauna',
        },
        keywords: {
            en: ['sauna', 'steam room', 'woman in steamy room'],
            es: ['sauna', 'vapor', 'mujer en una sauna'],
        },
        types: ['🧖🏻‍♀️', '🧖🏼‍♀️', '🧖🏽‍♀️', '🧖🏾‍♀️', '🧖🏿‍♀️'],
    },
    {
        code: '🧗',
        name: {
            en: 'person_climbing',
            es: 'persona_escalando',
        },
        keywords: {
            en: ['climber', 'person climbing'],
            es: ['alpinista', 'escalador', 'persona escalando'],
        },
        types: ['🧗🏻', '🧗🏼', '🧗🏽', '🧗🏾', '🧗🏿'],
    },
    {
        code: '🧗‍♂️',
        name: {
            en: 'man_climbing',
            es: 'hombre_escalando',
        },
        keywords: {
            en: ['climber', 'man climbing'],
            es: ['alpinista', 'escalador', 'hombre escalando'],
        },
        types: ['🧗🏻‍♂️', '🧗🏼‍♂️', '🧗🏽‍♂️', '🧗🏾‍♂️', '🧗🏿‍♂️'],
    },
    {
        code: '🧗‍♀️',
        name: {
            en: 'woman_climbing',
            es: 'mujer_escalando',
        },
        keywords: {
            en: ['climber', 'woman climbing'],
            es: ['alpinista', 'escaladora', 'mujer escalando'],
        },
        types: ['🧗🏻‍♀️', '🧗🏼‍♀️', '🧗🏽‍♀️', '🧗🏾‍♀️', '🧗🏿‍♀️'],
    },
    {
        code: '🤺',
        name: {
            en: 'fencer',
            es: 'esgrimista',
        },
        keywords: {
            en: ['fencer', 'fencing', 'sword', 'person fencing'],
            es: ['esgrima', 'esgrimista', 'espada', 'persona haciendo esgrima'],
        },
    },
    {
        code: '🏇',
        name: {
            en: 'horse_racing',
            es: 'carrera_de_caballos',
        },
        keywords: {
            en: ['horse', 'jockey', 'racehorse', 'racing'],
            es: ['caballo', 'caballo de carreras', 'carreras', 'jinete', 'carrera de caballos'],
        },
        types: ['🏇🏻', '🏇🏼', '🏇🏽', '🏇🏾', '🏇🏿'],
    },
    {
        code: '⛷️',
        name: {
            en: 'skier',
            es: 'esquiador',
        },
        keywords: {
            en: ['ski', 'snow', 'skier'],
            es: ['esquí', 'esquiador', 'nieve', 'persona esquiando'],
        },
    },
    {
        code: '🏂',
        name: {
            en: 'snowboarder',
            es: 'practicante_de_snowboard',
        },
        keywords: {
            en: ['ski', 'snow', 'snowboard', 'snowboarder'],
            es: ['nieve', 'snowboard', 'practicante de snowboard'],
        },
        types: ['🏂🏻', '🏂🏼', '🏂🏽', '🏂🏾', '🏂🏿'],
    },
    {
        code: '🏌️',
        name: {
            en: 'golfer',
            es: 'golfista',
        },
        keywords: {
            en: ['ball', 'golf', 'person golfing'],
            es: ['golf', 'golfista', 'pelota', 'persona jugando al golf'],
        },
        types: ['🏌🏻', '🏌🏼', '🏌🏽', '🏌🏾', '🏌🏿'],
    },
    {
        code: '🏌️‍♂️',
        name: {
            en: 'man-golfing',
            es: 'hombre_jugando_golf',
        },
        keywords: {
            en: ['golf', 'man', 'man golfing'],
            es: ['golf', 'hombre', 'jugador', 'hombre jugando al golf'],
        },
        types: ['🏌🏻‍♂️', '🏌🏼‍♂️', '🏌🏽‍♂️', '🏌🏾‍♂️', '🏌🏿‍♂️'],
    },
    {
        code: '🏌️‍♀️',
        name: {
            en: 'woman-golfing',
            es: 'mujer_jugando_golf',
        },
        keywords: {
            en: ['golf', 'woman', 'woman golfing'],
            es: ['golf', 'jugadora', 'mujer', 'mujer jugando al golf'],
        },
        types: ['🏌🏻‍♀️', '🏌🏼‍♀️', '🏌🏽‍♀️', '🏌🏾‍♀️', '🏌🏿‍♀️'],
    },
    {
        code: '🏄',
        name: {
            en: 'surfer',
            es: 'surfista',
        },
        keywords: {
            en: ['surfing', 'person surfing'],
            es: ['surf', 'persona haciendo surf', 'surfear'],
        },
        types: ['🏄🏻', '🏄🏼', '🏄🏽', '🏄🏾', '🏄🏿'],
    },
    {
        code: '🏄‍♂️',
        name: {
            en: 'man-surfing',
            es: 'hombre_surfeando',
        },
        keywords: {
            en: ['man', 'surfing'],
            es: ['hombre', 'surf', 'surfero', 'surfista', 'hombre haciendo surf'],
        },
        types: ['🏄🏻‍♂️', '🏄🏼‍♂️', '🏄🏽‍♂️', '🏄🏾‍♂️', '🏄🏿‍♂️'],
    },
    {
        code: '🏄‍♀️',
        name: {
            en: 'woman-surfing',
            es: 'mujer_haciendo_surf',
        },
        keywords: {
            en: ['surfing', 'woman'],
            es: ['mujer', 'surf', 'surfera', 'surfista', 'mujer haciendo surf'],
        },
        types: ['🏄🏻‍♀️', '🏄🏼‍♀️', '🏄🏽‍♀️', '🏄🏾‍♀️', '🏄🏿‍♀️'],
    },
    {
        code: '🚣',
        name: {
            en: 'rowboat',
            es: 'bote_de_remos',
        },
        keywords: {
            en: ['boat', 'rowboat', 'person rowing boat'],
            es: ['barca', 'bote', 'remo', 'persona remando en un bote'],
        },
        types: ['🚣🏻', '🚣🏼', '🚣🏽', '🚣🏾', '🚣🏿'],
    },
    {
        code: '🚣‍♂️',
        name: {
            en: 'man-rowing-boat',
            es: 'hombre_remando_barca',
        },
        keywords: {
            en: ['boat', 'man', 'rowboat', 'man rowing boat'],
            es: ['barca', 'bote', 'hombre', 'remo', 'hombre remando en un bote'],
        },
        types: ['🚣🏻‍♂️', '🚣🏼‍♂️', '🚣🏽‍♂️', '🚣🏾‍♂️', '🚣🏿‍♂️'],
    },
    {
        code: '🚣‍♀️',
        name: {
            en: 'woman-rowing-boat',
            es: 'mujer_remando_barca',
        },
        keywords: {
            en: ['boat', 'rowboat', 'woman', 'woman rowing boat'],
            es: ['barca', 'bote', 'mujer', 'remo', 'mujer remando en un bote'],
        },
        types: ['🚣🏻‍♀️', '🚣🏼‍♀️', '🚣🏽‍♀️', '🚣🏾‍♀️', '🚣🏿‍♀️'],
    },
    {
        code: '🏊',
        name: {
            en: 'swimmer',
            es: 'nadador',
        },
        keywords: {
            en: ['swim', 'person swimming'],
            es: ['nadar', 'natación', 'persona nadando'],
        },
        types: ['🏊🏻', '🏊🏼', '🏊🏽', '🏊🏾', '🏊🏿'],
    },
    {
        code: '🏊‍♂️',
        name: {
            en: 'man-swimming',
            es: 'hombre_nadando',
        },
        keywords: {
            en: ['man', 'swim', 'man swimming'],
            es: ['hombre', 'nadar', 'hombre nadando'],
        },
        types: ['🏊🏻‍♂️', '🏊🏼‍♂️', '🏊🏽‍♂️', '🏊🏾‍♂️', '🏊🏿‍♂️'],
    },
    {
        code: '🏊‍♀️',
        name: {
            en: 'woman-swimming',
            es: 'mujer_nadando',
        },
        keywords: {
            en: ['swim', 'woman', 'woman swimming'],
            es: ['mujer', 'nadar', 'mujer nadando'],
        },
        types: ['🏊🏻‍♀️', '🏊🏼‍♀️', '🏊🏽‍♀️', '🏊🏾‍♀️', '🏊🏿‍♀️'],
    },
    {
        code: '⛹️',
        name: {
            en: 'person_with_ball',
            es: 'persona_con_una_pelota',
        },
        keywords: {
            en: ['ball', 'person bouncing ball'],
            es: ['balón', 'botar', 'pelota', 'persona botando un balón'],
        },
        types: ['⛹🏻', '⛹🏼', '⛹🏽', '⛹🏾', '⛹🏿'],
    },
    {
        code: '⛹️‍♂️',
        name: {
            en: 'man-bouncing-ball',
            es: 'hombre_botando_balón',
        },
        keywords: {
            en: ['ball', 'man', 'man bouncing ball'],
            es: ['balón', 'botar', 'hombre', 'pelota', 'hombre botando un balón'],
        },
        types: ['⛹🏻‍♂️', '⛹🏼‍♂️', '⛹🏽‍♂️', '⛹🏾‍♂️', '⛹🏿‍♂️'],
    },
    {
        code: '⛹️‍♀️',
        name: {
            en: 'woman-bouncing-ball',
            es: 'mujer_botando_balón',
        },
        keywords: {
            en: ['ball', 'woman', 'woman bouncing ball'],
            es: ['balón', 'botar', 'mujer', 'pelota', 'mujer botando un balón'],
        },
        types: ['⛹🏻‍♀️', '⛹🏼‍♀️', '⛹🏽‍♀️', '⛹🏾‍♀️', '⛹🏿‍♀️'],
    },
    {
        code: '🏋️',
        name: {
            en: 'weight_lifter',
            es: 'levantador_de_peso',
        },
        keywords: {
            en: ['lifter', 'weight', 'person lifting weights'],
            es: ['halterofilia', 'levantador', 'pesas', 'peso', 'persona levantando pesas'],
        },
        types: ['🏋🏻', '🏋🏼', '🏋🏽', '🏋🏾', '🏋🏿'],
    },
    {
        code: '🏋️‍♂️',
        name: {
            en: 'man-lifting-weights',
            es: 'hombre_levantando_pesas',
        },
        keywords: {
            en: ['man', 'weight lifter', 'man lifting weights'],
            es: ['halterofilia', 'hombre', 'levantador de pesas', 'pesas', 'hombre levantando pesas'],
        },
        types: ['🏋🏻‍♂️', '🏋🏼‍♂️', '🏋🏽‍♂️', '🏋🏾‍♂️', '🏋🏿‍♂️'],
    },
    {
        code: '🏋️‍♀️',
        name: {
            en: 'woman-lifting-weights',
            es: 'mujer_levantando_pesas',
        },
        keywords: {
            en: ['weight lifter', 'woman', 'woman lifting weights'],
            es: ['halterofilia', 'levantadora de pesas', 'mujer', 'pesas', 'mujer levantando pesas'],
        },
        types: ['🏋🏻‍♀️', '🏋🏼‍♀️', '🏋🏽‍♀️', '🏋🏾‍♀️', '🏋🏿‍♀️'],
    },
    {
        code: '🚴',
        name: {
            en: 'bicyclist',
            es: 'ciclista',
        },
        keywords: {
            en: ['bicycle', 'biking', 'cyclist', 'person biking'],
            es: ['bicicleta', 'ciclismo', 'ciclista', 'persona en bicicleta'],
        },
        types: ['🚴🏻', '🚴🏼', '🚴🏽', '🚴🏾', '🚴🏿'],
    },
    {
        code: '🚴‍♂️',
        name: {
            en: 'man-biking',
            es: 'hombre_en_bici',
        },
        keywords: {
            en: ['bicycle', 'biking', 'cyclist', 'man'],
            es: ['bicicleta', 'ciclismo', 'ciclista', 'hombre', 'hombre en bicicleta'],
        },
        types: ['🚴🏻‍♂️', '🚴🏼‍♂️', '🚴🏽‍♂️', '🚴🏾‍♂️', '🚴🏿‍♂️'],
    },
    {
        code: '🚴‍♀️',
        name: {
            en: 'woman-biking',
            es: 'mujer_en_bici',
        },
        keywords: {
            en: ['bicycle', 'biking', 'cyclist', 'woman'],
            es: ['bicicleta', 'ciclismo', 'ciclista', 'mujer', 'mujer en bicicleta'],
        },
        types: ['🚴🏻‍♀️', '🚴🏼‍♀️', '🚴🏽‍♀️', '🚴🏾‍♀️', '🚴🏿‍♀️'],
    },
    {
        code: '🚵',
        name: {
            en: 'mountain_bicyclist',
            es: 'ciclista_de_montaña',
        },
        keywords: {
            en: ['bicycle', 'bicyclist', 'bike', 'cyclist', 'mountain', 'person mountain biking'],
            es: ['bicicleta', 'ciclista', 'montaña', 'mountain bike', 'persona en bicicleta de montaña'],
        },
        types: ['🚵🏻', '🚵🏼', '🚵🏽', '🚵🏾', '🚵🏿'],
    },
    {
        code: '🚵‍♂️',
        name: {
            en: 'man-mountain-biking',
            es: 'hombre_bici_montaña',
        },
        keywords: {
            en: ['bicycle', 'bike', 'cyclist', 'man', 'mountain', 'man mountain biking'],
            es: ['bicicleta', 'ciclista', 'montaña', 'mountain bike', 'hombre en bicicleta de montaña'],
        },
        types: ['🚵🏻‍♂️', '🚵🏼‍♂️', '🚵🏽‍♂️', '🚵🏾‍♂️', '🚵🏿‍♂️'],
    },
    {
        code: '🚵‍♀️',
        name: {
            en: 'woman-mountain-biking',
            es: 'mujer_bici_montaña',
        },
        keywords: {
            en: ['bicycle', 'bike', 'biking', 'cyclist', 'mountain', 'woman'],
            es: ['bicicleta', 'ciclista', 'montaña', 'mountain bike', 'mujer en bicicleta de montaña'],
        },
        types: ['🚵🏻‍♀️', '🚵🏼‍♀️', '🚵🏽‍♀️', '🚵🏾‍♀️', '🚵🏿‍♀️'],
    },
    {
        code: '🤸',
        name: {
            en: 'person_doing_cartwheel',
            es: 'persona_dando_volteretas',
        },
        keywords: {
            en: ['cartwheel', 'gymnastics', 'person cartwheeling'],
            es: ['acrobacia', 'gimnasia', 'pirueta', 'rueda', 'voltereta', 'persona haciendo voltereta lateral'],
        },
        types: ['🤸🏻', '🤸🏼', '🤸🏽', '🤸🏾', '🤸🏿'],
    },
    {
        code: '🤸‍♂️',
        name: {
            en: 'man-cartwheeling',
            es: 'hombre_dando_volteretas',
        },
        keywords: {
            en: ['cartwheel', 'gymnastics', 'man', 'man cartwheeling'],
            es: ['deporte', 'gimnasia', 'hombre', 'rueda', 'voltereta', 'hombre dando una voltereta lateral'],
        },
        types: ['🤸🏻‍♂️', '🤸🏼‍♂️', '🤸🏽‍♂️', '🤸🏾‍♂️', '🤸🏿‍♂️'],
    },
    {
        code: '🤸‍♀️',
        name: {
            en: 'woman-cartwheeling',
            es: 'mujer_dando_volteretas',
        },
        keywords: {
            en: ['cartwheel', 'gymnastics', 'woman', 'woman cartwheeling'],
            es: ['deporte', 'gimnasia', 'mujer', 'rueda', 'voltereta', 'mujer dando una voltereta lateral'],
        },
        types: ['🤸🏻‍♀️', '🤸🏼‍♀️', '🤸🏽‍♀️', '🤸🏾‍♀️', '🤸🏿‍♀️'],
    },
    {
        code: '🤼',
        name: {
            en: 'wrestlers',
            es: 'luchadores',
        },
        keywords: {
            en: ['wrestle', 'wrestler', 'people wrestling'],
            es: ['lucha', 'luchador', 'personas luchando'],
        },
    },
    {
        code: '🤼‍♂️',
        name: {
            en: 'man-wrestling',
            es: 'hombre_lucha_libre',
        },
        keywords: {
            en: ['men', 'wrestle', 'men wrestling'],
            es: ['deporte', 'hombre', 'lucha', 'luchador', 'hombres luchando'],
        },
    },
    {
        code: '🤼‍♀️',
        name: {
            en: 'woman-wrestling',
            es: 'mujer_lucha_libre',
        },
        keywords: {
            en: ['women', 'wrestle', 'women wrestling'],
            es: ['deporte', 'lucha', 'luchadora', 'mujer', 'mujeres luchando'],
        },
    },
    {
        code: '🤽',
        name: {
            en: 'water_polo',
            es: 'waterpolo',
        },
        keywords: {
            en: ['polo', 'water', 'person playing water polo'],
            es: ['waterpolista', 'waterpolo', 'persona jugando al waterpolo'],
        },
        types: ['🤽🏻', '🤽🏼', '🤽🏽', '🤽🏾', '🤽🏿'],
    },
    {
        code: '🤽‍♂️',
        name: {
            en: 'man-playing-water-polo',
            es: 'hombre_jugando_waterpolo',
        },
        keywords: {
            en: ['man', 'water polo', 'man playing water polo'],
            es: ['agua', 'deporte', 'waterpolista', 'waterpolo', 'hombre jugando al waterpolo'],
        },
        types: ['🤽🏻‍♂️', '🤽🏼‍♂️', '🤽🏽‍♂️', '🤽🏾‍♂️', '🤽🏿‍♂️'],
    },
    {
        code: '🤽‍♀️',
        name: {
            en: 'woman-playing-water-polo',
            es: 'mujer_jugando_waterpolo',
        },
        keywords: {
            en: ['water polo', 'woman', 'woman playing water polo'],
            es: ['agua', 'deporte', 'waterpolista', 'waterpolo', 'mujer jugando al waterpolo'],
        },
        types: ['🤽🏻‍♀️', '🤽🏼‍♀️', '🤽🏽‍♀️', '🤽🏾‍♀️', '🤽🏿‍♀️'],
    },
    {
        code: '🤾',
        name: {
            en: 'handball',
            es: 'balonmano',
        },
        keywords: {
            en: ['ball', 'handball', 'person playing handball'],
            es: ['balonmanista', 'balonmano', 'persona jugando al balonmano'],
        },
        types: ['🤾🏻', '🤾🏼', '🤾🏽', '🤾🏾', '🤾🏿'],
    },
    {
        code: '🤾‍♂️',
        name: {
            en: 'man-playing-handball',
            es: 'hombre_jugando_balonmano',
        },
        keywords: {
            en: ['handball', 'man', 'man playing handball'],
            es: ['balonmanista', 'balonmano', 'deporte', 'hombre', 'hombre jugando al balonmano'],
        },
        types: ['🤾🏻‍♂️', '🤾🏼‍♂️', '🤾🏽‍♂️', '🤾🏾‍♂️', '🤾🏿‍♂️'],
    },
    {
        code: '🤾‍♀️',
        name: {
            en: 'woman-playing-handball',
            es: 'mujer_jugando_balonmano',
        },
        keywords: {
            en: ['handball', 'woman', 'woman playing handball'],
            es: ['balonmanista', 'balonmano', 'deporte', 'mujer', 'mujer jugando al balonmano'],
        },
        types: ['🤾🏻‍♀️', '🤾🏼‍♀️', '🤾🏽‍♀️', '🤾🏾‍♀️', '🤾🏿‍♀️'],
    },
    {
        code: '🤹',
        name: {
            en: 'juggling',
            es: 'malabarismo',
        },
        keywords: {
            en: ['balance', 'juggle', 'multitask', 'skill', 'person juggling'],
            es: ['equilibrio', 'malabares', 'malabarismo', 'malabarista', 'persona haciendo malabares'],
        },
        types: ['🤹🏻', '🤹🏼', '🤹🏽', '🤹🏾', '🤹🏿'],
    },
    {
        code: '🤹‍♂️',
        name: {
            en: 'man-juggling',
            es: 'malabarista_hombre',
        },
        keywords: {
            en: ['juggling', 'man', 'multitask'],
            es: ['hombre', 'malabares', 'malabarismo', 'malabarista', 'hombre haciendo malabares'],
        },
        types: ['🤹🏻‍♂️', '🤹🏼‍♂️', '🤹🏽‍♂️', '🤹🏾‍♂️', '🤹🏿‍♂️'],
    },
    {
        code: '🤹‍♀️',
        name: {
            en: 'woman-juggling',
            es: 'malabarista_mujer',
        },
        keywords: {
            en: ['juggling', 'multitask', 'woman'],
            es: ['malabares', 'malabarismo', 'malabarista', 'mujer', 'mujer haciendo malabares'],
        },
        types: ['🤹🏻‍♀️', '🤹🏼‍♀️', '🤹🏽‍♀️', '🤹🏾‍♀️', '🤹🏿‍♀️'],
    },
    {
        code: '🧘',
        name: {
            en: 'person_in_lotus_position',
            es: 'persona_en_postura_loto',
        },
        keywords: {
            en: ['meditation', 'yoga', 'person in lotus position'],
            es: ['meditación', 'yoga', 'persona en posición de loto'],
        },
        types: ['🧘🏻', '🧘🏼', '🧘🏽', '🧘🏾', '🧘🏿'],
    },
    {
        code: '🧘‍♂️',
        name: {
            en: 'man_in_lotus_position',
            es: 'hombre_en_postura_loto',
        },
        keywords: {
            en: ['meditation', 'yoga', 'man in lotus position'],
            es: ['meditación', 'yoga', 'hombre en posición de loto'],
        },
        types: ['🧘🏻‍♂️', '🧘🏼‍♂️', '🧘🏽‍♂️', '🧘🏾‍♂️', '🧘🏿‍♂️'],
    },
    {
        code: '🧘‍♀️',
        name: {
            en: 'woman_in_lotus_position',
            es: 'mujer_en_postura_loto',
        },
        keywords: {
            en: ['meditation', 'yoga', 'woman in lotus position'],
            es: ['meditación', 'yoga', 'mujer en posición de loto'],
        },
        types: ['🧘🏻‍♀️', '🧘🏼‍♀️', '🧘🏽‍♀️', '🧘🏾‍♀️', '🧘🏿‍♀️'],
    },
    {
        code: '🛀',
        name: {
            en: 'bath',
            es: 'bañera',
        },
        keywords: {
            en: ['bath', 'bathtub', 'person taking bath'],
            es: ['bañera', 'baño', 'persona', 'persona en la bañera'],
        },
        types: ['🛀🏻', '🛀🏼', '🛀🏽', '🛀🏾', '🛀🏿'],
    },
    {
        code: '🛌',
        name: {
            en: 'sleeping_accommodation',
            es: 'lugar_para_dormir',
        },
        keywords: {
            en: ['good night', 'hotel', 'sleep', 'person in bed'],
            es: ['dormir', 'hotel', 'persona en la cama'],
        },
        types: ['🛌🏻', '🛌🏼', '🛌🏽', '🛌🏾', '🛌🏿'],
    },
    {
        code: '🧑‍🤝‍🧑',
        name: {
            en: 'people_holding_hands',
            es: 'dos_personas_dándose_la_mano',
        },
        keywords: {
            en: ['couple', 'hand', 'hold', 'holding hands', 'person', 'people holding hands'],
            es: ['mano', 'pareja', 'persona', 'dos personas de la mano'],
        },
        types: ['🧑🏻‍🤝‍🧑🏻', '🧑🏻‍🤝‍🧑🏼', '🧑🏻‍🤝‍🧑🏽', '🧑🏻‍🤝‍🧑🏾', '🧑🏻‍🤝‍🧑🏿', '🧑🏼‍🤝‍🧑🏻', '🧑🏼‍🤝‍🧑🏼', '🧑🏼‍🤝‍🧑🏽', '🧑🏼‍🤝‍🧑🏾', '🧑🏼‍🤝‍🧑🏿', '🧑🏽‍🤝‍🧑🏻', '🧑🏽‍🤝‍🧑🏼', '🧑🏽‍🤝‍🧑🏽', '🧑🏽‍🤝‍🧑🏾', '🧑🏽‍🤝‍🧑🏿', '🧑🏾‍🤝‍🧑🏻', '🧑🏾‍🤝‍🧑🏼', '🧑🏾‍🤝‍🧑🏽', '🧑🏾‍🤝‍🧑🏾', '🧑🏾‍🤝‍🧑🏿', '🧑🏿‍🤝‍🧑🏻', '🧑🏿‍🤝‍🧑🏼', '🧑🏿‍🤝‍🧑🏽', '🧑🏿‍🤝‍🧑🏾', '🧑🏿‍🤝‍🧑🏿'],
    },
    {
        code: '👭',
        name: {
            en: 'two_women_holding_hands',
            es: 'dos_mujeres_de_la_mano',
        },
        keywords: {
            en: ['couple', 'hand', 'holding hands', 'women', 'women holding hands'],
            es: ['lesbianas', 'mujeres', 'novias', 'pareja', 'mujeres de la mano'],
        },
        types: ['👩🏻‍🤝‍👩🏼', '👩🏻‍🤝‍👩🏽', '👩🏻‍🤝‍👩🏾', '👩🏻‍🤝‍👩🏿', '👩🏼‍🤝‍👩🏻', '👩🏼‍🤝‍👩🏽', '👩🏼‍🤝‍👩🏾', '👩🏼‍🤝‍👩🏿', '👩🏽‍🤝‍👩🏻', '👩🏽‍🤝‍👩🏼', '👩🏽‍🤝‍👩🏾', '👩🏽‍🤝‍👩🏿', '👩🏾‍🤝‍👩🏻', '👩🏾‍🤝‍👩🏼', '👩🏾‍🤝‍👩🏽', '👩🏾‍🤝‍👩🏿', '👩🏿‍🤝‍👩🏻', '👩🏿‍🤝‍👩🏼', '👩🏿‍🤝‍👩🏽', '👩🏿‍🤝‍👩🏾', '👭🏻', '👭🏼', '👭🏽', '👭🏾', '👭🏿'],
    },
    {
        code: '👫',
        name: {
            en: 'man_and_woman_holding_hands',
            es: 'hombre_y_mujer_de_la_mano',
        },
        keywords: {
            en: ['couple', 'hand', 'hold', 'holding hands', 'man', 'woman', 'woman and man holding hands'],
            es: ['hombre', 'hombre y mujer de la mano', 'mujer', 'novios', 'pareja', 'mujer y hombre de la mano'],
        },
        types: ['👩🏻‍🤝‍👨🏼', '👩🏻‍🤝‍👨🏽', '👩🏻‍🤝‍👨🏾', '👩🏻‍🤝‍👨🏿', '👩🏼‍🤝‍👨🏻', '👩🏼‍🤝‍👨🏽', '👩🏼‍🤝‍👨🏾', '👩🏼‍🤝‍👨🏿', '👩🏽‍🤝‍👨🏻', '👩🏽‍🤝‍👨🏼', '👩🏽‍🤝‍👨🏾', '👩🏽‍🤝‍👨🏿', '👩🏾‍🤝‍👨🏻', '👩🏾‍🤝‍👨🏼', '👩🏾‍🤝‍👨🏽', '👩🏾‍🤝‍👨🏿', '👩🏿‍🤝‍👨🏻', '👩🏿‍🤝‍👨🏼', '👩🏿‍🤝‍👨🏽', '👩🏿‍🤝‍👨🏾', '👫🏻', '👫🏼', '👫🏽', '👫🏾', '👫🏿'],
    },
    {
        code: '👬',
        name: {
            en: 'two_men_holding_hands',
            es: 'dos_hombres_de_la_mano',
        },
        keywords: {
            en: ['couple', 'Gemini', 'holding hands', 'man', 'men', 'twins', 'zodiac', 'men holding hands'],
            es: ['gays', 'hombres', 'novios', 'pareja', 'hombres de la mano'],
        },
        types: ['👨🏻‍🤝‍👨🏼', '👨🏻‍🤝‍👨🏽', '👨🏻‍🤝‍👨🏾', '👨🏻‍🤝‍👨🏿', '👨🏼‍🤝‍👨🏻', '👨🏼‍🤝‍👨🏽', '👨🏼‍🤝‍👨🏾', '👨🏼‍🤝‍👨🏿', '👨🏽‍🤝‍👨🏻', '👨🏽‍🤝‍👨🏼', '👨🏽‍🤝‍👨🏾', '👨🏽‍🤝‍👨🏿', '👨🏾‍🤝‍👨🏻', '👨🏾‍🤝‍👨🏼', '👨🏾‍🤝‍👨🏽', '👨🏾‍🤝‍👨🏿', '👨🏿‍🤝‍👨🏻', '👨🏿‍🤝‍👨🏼', '👨🏿‍🤝‍👨🏽', '👨🏿‍🤝‍👨🏾', '👬🏻', '👬🏼', '👬🏽', '👬🏾', '👬🏿'],
    },
    {
        code: '💏',
        name: {
            en: 'couplekiss',
            es: 'pareja_besándose',
        },
        keywords: {
            en: ['couple', 'kiss'],
            es: ['personas', 'romance', 'beso'],
        },
        types: ['💏🏻', '💏🏼', '💏🏽', '💏🏾', '💏🏿'],
    },
    {
        code: '👩‍❤️‍💋‍👨',
        name: {
            en: 'woman-kiss-man',
            es: 'mujer_beso_hombre',
        },
        keywords: {
            en: ['couple', 'kiss', 'man', 'woman'],
            es: ['beso', 'hombre', 'mujer', 'personas', 'romance'],
        },
        types: ['👩🏻‍❤️‍💋‍👨🏻', '👩🏻‍❤️‍💋‍👨🏼', '👩🏻‍❤️‍💋‍👨🏽', '👩🏻‍❤️‍💋‍👨🏾', '👩🏻‍❤️‍💋‍👨🏿', '👩🏼‍❤️‍💋‍👨🏻', '👩🏼‍❤️‍💋‍👨🏼', '👩🏼‍❤️‍💋‍👨🏽', '👩🏼‍❤️‍💋‍👨🏾', '👩🏼‍❤️‍💋‍👨🏿', '👩🏽‍❤️‍💋‍👨🏻', '👩🏽‍❤️‍💋‍👨🏼', '👩🏽‍❤️‍💋‍👨🏽', '👩🏽‍❤️‍💋‍👨🏾', '👩🏽‍❤️‍💋‍👨🏿', '👩🏾‍❤️‍💋‍👨🏻', '👩🏾‍❤️‍💋‍👨🏼', '👩🏾‍❤️‍💋‍👨🏽', '👩🏾‍❤️‍💋‍👨🏾', '👩🏾‍❤️‍💋‍👨🏿', '👩🏿‍❤️‍💋‍👨🏻', '👩🏿‍❤️‍💋‍👨🏼', '👩🏿‍❤️‍💋‍👨🏽', '👩🏿‍❤️‍💋‍👨🏾', '👩🏿‍❤️‍💋‍👨🏿'],
    },
    {
        code: '👨‍❤️‍💋‍👨',
        name: {
            en: 'man-kiss-man',
            es: 'hombre_beso_hombre',
        },
        keywords: {
            en: ['couple', 'kiss', 'man'],
            es: ['beso', 'hombre', 'personas', 'romance'],
        },
        types: ['👨🏻‍❤️‍💋‍👨🏻', '👨🏻‍❤️‍💋‍👨🏼', '👨🏻‍❤️‍💋‍👨🏽', '👨🏻‍❤️‍💋‍👨🏾', '👨🏻‍❤️‍💋‍👨🏿', '👨🏼‍❤️‍💋‍👨🏻', '👨🏼‍❤️‍💋‍👨🏼', '👨🏼‍❤️‍💋‍👨🏽', '👨🏼‍❤️‍💋‍👨🏾', '👨🏼‍❤️‍💋‍👨🏿', '👨🏽‍❤️‍💋‍👨🏻', '👨🏽‍❤️‍💋‍👨🏼', '👨🏽‍❤️‍💋‍👨🏽', '👨🏽‍❤️‍💋‍👨🏾', '👨🏽‍❤️‍💋‍👨🏿', '👨🏾‍❤️‍💋‍👨🏻', '👨🏾‍❤️‍💋‍👨🏼', '👨🏾‍❤️‍💋‍👨🏽', '👨🏾‍❤️‍💋‍👨🏾', '👨🏾‍❤️‍💋‍👨🏿', '👨🏿‍❤️‍💋‍👨🏻', '👨🏿‍❤️‍💋‍👨🏼', '👨🏿‍❤️‍💋‍👨🏽', '👨🏿‍❤️‍💋‍👨🏾', '👨🏿‍❤️‍💋‍👨🏿'],
    },
    {
        code: '👩‍❤️‍💋‍👩',
        name: {
            en: 'woman-kiss-woman',
            es: 'mujer_beso_mujer',
        },
        keywords: {
            en: ['couple', 'kiss', 'woman'],
            es: ['beso', 'mujer', 'personas', 'romance'],
        },
        types: ['👩🏻‍❤️‍💋‍👩🏻', '👩🏻‍❤️‍💋‍👩🏼', '👩🏻‍❤️‍💋‍👩🏽', '👩🏻‍❤️‍💋‍👩🏾', '👩🏻‍❤️‍💋‍👩🏿', '👩🏼‍❤️‍💋‍👩🏻', '👩🏼‍❤️‍💋‍👩🏼', '👩🏼‍❤️‍💋‍👩🏽', '👩🏼‍❤️‍💋‍👩🏾', '👩🏼‍❤️‍💋‍👩🏿', '👩🏽‍❤️‍💋‍👩🏻', '👩🏽‍❤️‍💋‍👩🏼', '👩🏽‍❤️‍💋‍👩🏽', '👩🏽‍❤️‍💋‍👩🏾', '👩🏽‍❤️‍💋‍👩🏿', '👩🏾‍❤️‍💋‍👩🏻', '👩🏾‍❤️‍💋‍👩🏼', '👩🏾‍❤️‍💋‍👩🏽', '👩🏾‍❤️‍💋‍👩🏾', '👩🏾‍❤️‍💋‍👩🏿', '👩🏿‍❤️‍💋‍👩🏻', '👩🏿‍❤️‍💋‍👩🏼', '👩🏿‍❤️‍💋‍👩🏽', '👩🏿‍❤️‍💋‍👩🏾', '👩🏿‍❤️‍💋‍👩🏿'],
    },
    {
        code: '💑',
        name: {
            en: 'couple_with_heart',
            es: 'pareja_con_corazón',
        },
        keywords: {
            en: ['couple', 'love', 'couple with heart'],
            es: ['amor', 'pareja', 'pareja enamorada  personas enamoradas'],
        },
        types: ['💑🏻', '💑🏼', '💑🏽', '💑🏾', '💑🏿'],
    },
    {
        code: '👩‍❤️‍👨',
        name: {
            en: 'woman-heart-man',
            es: 'mujer_corazón_hombre',
        },
        keywords: {
            en: ['couple', 'couple with heart', 'love', 'man', 'woman'],
            es: ['amor', 'hombre', 'mujer', 'pareja', 'pareja enamorada', 'personas enamoradas'],
        },
        types: ['👩🏻‍❤️‍👨🏻', '👩🏻‍❤️‍👨🏼', '👩🏻‍❤️‍👨🏽', '👩🏻‍❤️‍👨🏾', '👩🏻‍❤️‍👨🏿', '👩🏼‍❤️‍👨🏻', '👩🏼‍❤️‍👨🏼', '👩🏼‍❤️‍👨🏽', '👩🏼‍❤️‍👨🏾', '👩🏼‍❤️‍👨🏿', '👩🏽‍❤️‍👨🏻', '👩🏽‍❤️‍👨🏼', '👩🏽‍❤️‍👨🏽', '👩🏽‍❤️‍👨🏾', '👩🏽‍❤️‍👨🏿', '👩🏾‍❤️‍👨🏻', '👩🏾‍❤️‍👨🏼', '👩🏾‍❤️‍👨🏽', '👩🏾‍❤️‍👨🏾', '👩🏾‍❤️‍👨🏿', '👩🏿‍❤️‍👨🏻', '👩🏿‍❤️‍👨🏼', '👩🏿‍❤️‍👨🏽', '👩🏿‍❤️‍👨🏾', '👩🏿‍❤️‍👨🏿'],
    },
    {
        code: '👨‍❤️‍👨',
        name: {
            en: 'man-heart-man',
            es: 'hombre_corazón_hombre',
        },
        keywords: {
            en: ['couple', 'couple with heart', 'love', 'man'],
            es: ['amor', 'hombre', 'pareja', 'pareja enamorada', 'personas enamoradas'],
        },
        types: ['👨🏻‍❤️‍👨🏻', '👨🏻‍❤️‍👨🏼', '👨🏻‍❤️‍👨🏽', '👨🏻‍❤️‍👨🏾', '👨🏻‍❤️‍👨🏿', '👨🏼‍❤️‍👨🏻', '👨🏼‍❤️‍👨🏼', '👨🏼‍❤️‍👨🏽', '👨🏼‍❤️‍👨🏾', '👨🏼‍❤️‍👨🏿', '👨🏽‍❤️‍👨🏻', '👨🏽‍❤️‍👨🏼', '👨🏽‍❤️‍👨🏽', '👨🏽‍❤️‍👨🏾', '👨🏽‍❤️‍👨🏿', '👨🏾‍❤️‍👨🏻', '👨🏾‍❤️‍👨🏼', '👨🏾‍❤️‍👨🏽', '👨🏾‍❤️‍👨🏾', '👨🏾‍❤️‍👨🏿', '👨🏿‍❤️‍👨🏻', '👨🏿‍❤️‍👨🏼', '👨🏿‍❤️‍👨🏽', '👨🏿‍❤️‍👨🏾', '👨🏿‍❤️‍👨🏿'],
    },
    {
        code: '👩‍❤️‍👩',
        name: {
            en: 'woman-heart-woman',
            es: 'mujer_corazón_mujer',
        },
        keywords: {
            en: ['couple', 'couple with heart', 'love', 'woman'],
            es: ['amor', 'mujer', 'pareja', 'pareja enamorada', 'personas enamoradas'],
        },
        types: ['👩🏻‍❤️‍👩🏻', '👩🏻‍❤️‍👩🏼', '👩🏻‍❤️‍👩🏽', '👩🏻‍❤️‍👩🏾', '👩🏻‍❤️‍👩🏿', '👩🏼‍❤️‍👩🏻', '👩🏼‍❤️‍👩🏼', '👩🏼‍❤️‍👩🏽', '👩🏼‍❤️‍👩🏾', '👩🏼‍❤️‍👩🏿', '👩🏽‍❤️‍👩🏻', '👩🏽‍❤️‍👩🏼', '👩🏽‍❤️‍👩🏽', '👩🏽‍❤️‍👩🏾', '👩🏽‍❤️‍👩🏿', '👩🏾‍❤️‍👩🏻', '👩🏾‍❤️‍👩🏼', '👩🏾‍❤️‍👩🏽', '👩🏾‍❤️‍👩🏾', '👩🏾‍❤️‍👩🏿', '👩🏿‍❤️‍👩🏻', '👩🏿‍❤️‍👩🏼', '👩🏿‍❤️‍👩🏽', '👩🏿‍❤️‍👩🏾', '👩🏿‍❤️‍👩🏿'],
    },
    {
        code: '👪',
        name: {
            en: 'family',
            es: 'familia',
        },
        keywords: {
            en: ['family'],
            es: ['familia'],
        },
    },
    {
        code: '👨‍👩‍👦',
        name: {
            en: 'man-woman-boy',
            es: 'hombre_mujer_niño',
        },
        keywords: {
            en: ['boy', 'family', 'man', 'woman'],
            es: ['familia', 'hombre', 'mujer', 'niño'],
        },
    },
    {
        code: '👨‍👩‍👧',
        name: {
            en: 'man-woman-girl',
            es: 'hombre_mujer_niña',
        },
        keywords: {
            en: ['family', 'girl', 'man', 'woman'],
            es: ['familia', 'hombre', 'mujer', 'niña'],
        },
    },
    {
        code: '👨‍👩‍👧‍👦',
        name: {
            en: 'man-woman-girl-boy',
            es: 'hombre_mujer_niña_niño',
        },
        keywords: {
            en: ['boy', 'family', 'girl', 'man', 'woman'],
            es: ['familia', 'hombre', 'mujer', 'niña', 'niño'],
        },
    },
    {
        code: '👨‍👩‍👦‍👦',
        name: {
            en: 'man-woman-boy-boy',
            es: 'hombre_mujer_niño_niño',
        },
        keywords: {
            en: ['boy', 'family', 'man', 'woman'],
            es: ['familia', 'hombre', 'mujer', 'niño'],
        },
    },
    {
        code: '👨‍👩‍👧‍👧',
        name: {
            en: 'man-woman-girl-girl',
            es: 'hombre_mujer_niña_niña',
        },
        keywords: {
            en: ['family', 'girl', 'man', 'woman'],
            es: ['familia', 'hombre', 'mujer', 'niña'],
        },
    },
    {
        code: '👨‍👨‍👦',
        name: {
            en: 'man-man-boy',
            es: 'hombre_hombre_niño',
        },
        keywords: {
            en: ['boy', 'family', 'man'],
            es: ['familia', 'hombre', 'niño'],
        },
    },
    {
        code: '👨‍👨‍👧',
        name: {
            en: 'man-man-girl',
            es: 'hombre_hombre_niña',
        },
        keywords: {
            en: ['family', 'girl', 'man'],
            es: ['familia', 'hombre', 'niña'],
        },
    },
    {
        code: '👨‍👨‍👧‍👦',
        name: {
            en: 'man-man-girl-boy',
            es: 'hombre_hombre_niña_niño',
        },
        keywords: {
            en: ['boy', 'family', 'girl', 'man'],
            es: ['familia', 'hombre', 'niña', 'niño'],
        },
    },
    {
        code: '👨‍👨‍👦‍👦',
        name: {
            en: 'man-man-boy-boy',
            es: 'hombre_hombre_niño_niño',
        },
        keywords: {
            en: ['boy', 'family', 'man'],
            es: ['familia', 'hombre', 'niño'],
        },
    },
    {
        code: '👨‍👨‍👧‍👧',
        name: {
            en: 'man-man-girl-girl',
            es: 'hombre_hombre_niña_niña',
        },
        keywords: {
            en: ['family', 'girl', 'man'],
            es: ['familia', 'hombre', 'niña'],
        },
    },
    {
        code: '👩‍👩‍👦',
        name: {
            en: 'woman-woman-boy',
            es: 'mujer_mujer_niño',
        },
        keywords: {
            en: ['boy', 'family', 'woman'],
            es: ['familia', 'mujer', 'niño'],
        },
    },
    {
        code: '👩‍👩‍👧',
        name: {
            en: 'woman-woman-girl',
            es: 'mujer_mujer_niña',
        },
        keywords: {
            en: ['family', 'girl', 'woman'],
            es: ['familia', 'mujer', 'niña'],
        },
    },
    {
        code: '👩‍👩‍👧‍👦',
        name: {
            en: 'woman-woman-girl-boy',
            es: 'mujer_mujer_niña_niño',
        },
        keywords: {
            en: ['boy', 'family', 'girl', 'woman'],
            es: ['familia', 'mujer', 'niña', 'niño'],
        },
    },
    {
        code: '👩‍👩‍👦‍👦',
        name: {
            en: 'woman-woman-boy-boy',
            es: 'mujer_mujer_niño_niño',
        },
        keywords: {
            en: ['boy', 'family', 'woman'],
            es: ['familia', 'mujer', 'niño'],
        },
    },
    {
        code: '👩‍👩‍👧‍👧',
        name: {
            en: 'woman-woman-girl-girl',
            es: 'mujer_mujer_niña_niña',
        },
        keywords: {
            en: ['family', 'girl', 'woman'],
            es: ['familia', 'mujer', 'niña'],
        },
    },
    {
        code: '👨‍👦',
        name: {
            en: 'man-boy',
            es: 'hombre_niño',
        },
        keywords: {
            en: ['boy', 'family', 'man'],
            es: ['familia', 'hombre', 'niño'],
        },
    },
    {
        code: '👨‍👦‍👦',
        name: {
            en: 'man-boy-boy',
            es: 'hombre_niño_niño',
        },
        keywords: {
            en: ['boy', 'family', 'man'],
            es: ['familia', 'hombre', 'niño'],
        },
    },
    {
        code: '👨‍👧',
        name: {
            en: 'man-girl',
            es: 'hombre_niña',
        },
        keywords: {
            en: ['family', 'girl', 'man'],
            es: ['familia', 'hombre', 'niña'],
        },
    },
    {
        code: '👨‍👧‍👦',
        name: {
            en: 'man-girl-boy',
            es: 'hombre_niño_niña',
        },
        keywords: {
            en: ['boy', 'family', 'girl', 'man'],
            es: ['familia', 'hombre', 'niña', 'niño'],
        },
    },
    {
        code: '👨‍👧‍👧',
        name: {
            en: 'man-girl-girl',
            es: 'hombre_niña_niña',
        },
        keywords: {
            en: ['family', 'girl', 'man'],
            es: ['familia', 'hombre', 'niña'],
        },
    },
    {
        code: '👩‍👦',
        name: {
            en: 'woman-boy',
            es: 'mujer_niño',
        },
        keywords: {
            en: ['boy', 'family', 'woman'],
            es: ['familia', 'mujer', 'niño'],
        },
    },
    {
        code: '👩‍👦‍👦',
        name: {
            en: 'woman-boy-boy',
            es: 'mujer_niño_niño',
        },
        keywords: {
            en: ['boy', 'family', 'woman'],
            es: ['familia', 'mujer', 'niño'],
        },
    },
    {
        code: '👩‍👧',
        name: {
            en: 'woman-girl',
            es: 'mujer_niña',
        },
        keywords: {
            en: ['family', 'girl', 'woman'],
            es: ['familia', 'mujer', 'niña'],
        },
    },
    {
        code: '👩‍👧‍👦',
        name: {
            en: 'woman-girl-boy',
            es: 'mujer_niña_niño',
        },
        keywords: {
            en: ['boy', 'family', 'girl', 'woman'],
            es: ['familia', 'mujer', 'niña', 'niño'],
        },
    },
    {
        code: '👩‍👧‍👧',
        name: {
            en: 'woman-girl-girl',
            es: 'mujer_niña_niña',
        },
        keywords: {
            en: ['family', 'girl', 'woman'],
            es: ['familia', 'mujer', 'niña'],
        },
    },
    {
        code: '🗣️',
        name: {
            en: 'speaking_head_in_silhouette',
            es: 'silueta_de_cabeza_parlante',
        },
        keywords: {
            en: ['face', 'head', 'silhouette', 'speak', 'speaking'],
            es: ['cabeza', 'cara', 'hablar', 'silueta', 'cabeza parlante'],
        },
    },
    {
        code: '👤',
        name: {
            en: 'bust_in_silhouette',
            es: 'silueta_de_busto',
        },
        keywords: {
            en: ['bust', 'silhouette', 'bust in silhouette'],
            es: ['busto', 'silueta', 'silueta de busto'],
        },
    },
    {
        code: '👥',
        name: {
            en: 'busts_in_silhouette',
            es: 'siluetas_de_bustos',
        },
        keywords: {
            en: ['bust', 'silhouette', 'busts in silhouette'],
            es: ['bustos', 'siluetas', 'dos siluetas de bustos'],
        },
    },
    {
        code: '🫂',
        name: {
            en: 'people_hugging',
            es: 'personas_abrazándose',
        },
        keywords: {
            en: ['goodbye', 'hello', 'hug', 'thanks', 'people hugging'],
            es: ['abrazo', 'adiós', 'despedida', 'gracias', 'saludo', 'personas abrazándose'],
        },
    },
    {
        code: '👣',
        name: {
            en: 'footprints',
            es: 'huellas',
        },
        keywords: {
            en: ['clothing', 'footprint', 'print', 'footprints'],
            es: ['huellas', 'pies', 'huellas de pies'],
        },
    },
    {
        code: 'animalsAndNature',
        icon: AnimalsAndNature,
        header: true,
    },
    {
        code: '🐵',
        name: {
            en: 'monkey_face',
            es: 'cara_de_mono',
        },
        keywords: {
            en: ['face', 'monkey'],
            es: ['cara', 'mono', 'cara de mono'],
        },
    },
    {
        code: '🐒',
        name: {
            en: 'monkey',
            es: 'mono',
        },
        keywords: {
            en: ['monkey'],
            es: ['macaco', 'simio', 'mono'],
        },
    },
    {
        code: '🦍',
        name: {
            en: 'gorilla',
            es: 'gorila',
        },
        keywords: {
            en: ['gorilla'],
            es: ['primate', 'simio', 'gorila'],
        },
    },
    {
        code: '🦧',
        name: {
            en: 'orangutan',
            es: 'orangután',
        },
        keywords: {
            en: ['ape', 'orangutan'],
            es: ['mono', 'primate', 'simio', 'orangután'],
        },
    },
    {
        code: '🐶',
        name: {
            en: 'dog',
            es: 'perro',
        },
        keywords: {
            en: ['dog', 'face', 'pet'],
            es: ['cara', 'mascota', 'perro', 'cara de perro'],
        },
    },
    {
        code: '🐕',
        name: {
            en: 'dog2',
            es: 'perro2',
        },
        keywords: {
            en: ['pet', 'dog'],
            es: ['cachorro', 'perrete', 'perrito', 'perro'],
        },
    },
    {
        code: '🦮',
        name: {
            en: 'guide_dog',
            es: 'perro_guía',
        },
        keywords: {
            en: ['accessibility', 'blind', 'guide', 'guide dog'],
            es: ['accesibilidad', 'ciego', 'guía', 'invidente', 'lazarillo', 'perro guía'],
        },
    },
    {
        code: '🐕‍🦺',
        name: {
            en: 'service_dog',
            es: 'perro_de_servicio',
        },
        keywords: {
            en: ['accessibility', 'assistance', 'dog', 'service'],
            es: ['accesibilidad', 'apoyo', 'asistencia', 'perro', 'servicio', 'perro de servicio'],
        },
    },
    {
        code: '🐩',
        name: {
            en: 'poodle',
            es: 'caniche',
        },
        keywords: {
            en: ['dog', 'poodle'],
            es: ['perrito', 'perro', 'caniche'],
        },
    },
    {
        code: '🐺',
        name: {
            en: 'wolf',
            es: 'lobo',
        },
        keywords: {
            en: ['face', 'wolf'],
            es: ['cara', 'lobo'],
        },
    },
    {
        code: '🦊',
        name: {
            en: 'fox_face',
            es: 'cara_zorro',
        },
        keywords: {
            en: ['face', 'fox'],
            es: ['cara', 'zorro'],
        },
    },
    {
        code: '🦝',
        name: {
            en: 'raccoon',
            es: 'mapache',
        },
        keywords: {
            en: ['curious', 'sly', 'raccoon'],
            es: ['astuto', 'curioso', 'ladino', 'maquillaje', 'ojeras', 'mapache'],
        },
    },
    {
        code: '🐱',
        name: {
            en: 'cat',
            es: 'gato',
        },
        keywords: {
            en: ['cat', 'face', 'pet'],
            es: ['cara', 'gato', 'mascota', 'cara de gato'],
        },
    },
    {
        code: '🐈',
        name: {
            en: 'cat2',
            es: 'gato2',
        },
        keywords: {
            en: ['pet', 'cat'],
            es: ['gatete', 'minino', 'gato'],
        },
    },
    {
        code: '🐈‍⬛',
        name: {
            en: 'black_cat',
            es: 'gato_negro',
        },
        keywords: {
            en: ['black', 'cat', 'unlucky'],
            es: ['gato', 'mala suerte', 'negro'],
        },
    },
    {
        code: '🦁',
        name: {
            en: 'lion_face',
            es: 'cara_de_león',
        },
        keywords: {
            en: ['face', 'Leo', 'zodiac', 'lion'],
            es: ['cara', 'leo', 'zodiaco', 'león'],
        },
    },
    {
        code: '🐯',
        name: {
            en: 'tiger',
            es: 'tigre',
        },
        keywords: {
            en: ['face', 'tiger'],
            es: ['cara', 'tigre', 'cara de tigre'],
        },
    },
    {
        code: '🐅',
        name: {
            en: 'tiger2',
            es: 'tigre2',
        },
        keywords: {
            en: ['tiger'],
            es: ['felino', 'tigre'],
        },
    },
    {
        code: '🐆',
        name: {
            en: 'leopard',
            es: 'leopardo',
        },
        keywords: {
            en: ['leopard'],
            es: ['felino', 'leopardo'],
        },
    },
    {
        code: '🐴',
        name: {
            en: 'horse',
            es: 'caballo',
        },
        keywords: {
            en: ['face', 'horse'],
            es: ['caballo', 'cara', 'cara de caballo'],
        },
    },
    {
        code: '🐎',
        name: {
            en: 'racehorse',
            es: 'caballo_de_carreras',
        },
        keywords: {
            en: ['equestrian', 'racehorse', 'racing', 'horse'],
            es: ['caballo de carreras', 'ecuestre', 'caballo', 'carreras de caballos'],
        },
    },
    {
        code: '🦄',
        name: {
            en: 'unicorn_face',
            es: 'cara_de_unicornio',
        },
        keywords: {
            en: ['face', 'unicorn'],
            es: ['cara', 'unicornio'],
        },
    },
    {
        code: '🦓',
        name: {
            en: 'zebra_face',
            es: 'cara_zebra',
        },
        keywords: {
            en: ['stripe', 'zebra'],
            es: ['raya', 'cebra'],
        },
    },
    {
        code: '🦌',
        name: {
            en: 'deer',
            es: 'ciervo',
        },
        keywords: {
            en: ['deer'],
            es: ['bambi  cervatillo  ciervo'],
        },
    },
    {
        code: '🦬',
        name: {
            en: 'bison',
            es: 'bisonte',
        },
        keywords: {
            en: ['buffalo', 'herd', 'wisent', 'bison'],
            es: ['búfalo', 'cíbolo', 'bisonte'],
        },
    },
    {
        code: '🐮',
        name: {
            en: 'cow',
            es: 'vaca',
        },
        keywords: {
            en: ['cow', 'face'],
            es: ['cara', 'vaca', 'cara de vaca'],
        },
    },
    {
        code: '🐂',
        name: {
            en: 'ox',
            es: 'buey',
        },
        keywords: {
            en: ['bull', 'Taurus', 'zodiac', 'ox'],
            es: ['cabestro', 'tauro', 'zodiaco', 'buey'],
        },
    },
    {
        code: '🐃',
        name: {
            en: 'water_buffalo',
            es: 'búfalo_de_agua',
        },
        keywords: {
            en: ['buffalo', 'water'],
            es: ['agua', 'búfalo', 'búfalo de agua'],
        },
    },
    {
        code: '🐄',
        name: {
            en: 'cow2',
            es: 'vaca2',
        },
        keywords: {
            en: ['cow'],
            es: ['bovino', 'res', 'vaca'],
        },
    },
    {
        code: '🐷',
        name: {
            en: 'pig',
            es: 'cerdo',
        },
        keywords: {
            en: ['face', 'pig'],
            es: ['cara', 'cerdo', 'gorrino', 'cara de cerdo'],
        },
    },
    {
        code: '🐖',
        name: {
            en: 'pig2',
            es: 'cerdo2',
        },
        keywords: {
            en: ['sow', 'pig'],
            es: ['cochino', 'gorrino', 'puerco', 'cerdo'],
        },
    },
    {
        code: '🐗',
        name: {
            en: 'boar',
            es: 'jabalí',
        },
        keywords: {
            en: ['pig', 'boar'],
            es: ['cerdo salvaje', 'jabalí'],
        },
    },
    {
        code: '🐽',
        name: {
            en: 'pig_nose',
            es: 'hocico_de_cerdo',
        },
        keywords: {
            en: ['face', 'nose', 'pig'],
            es: ['cara', 'cerdo', 'morro', 'nariz', 'nariz de cerdo'],
        },
    },
    {
        code: '🐏',
        name: {
            en: 'ram',
            es: 'carnero',
        },
        keywords: {
            en: ['Aries', 'male', 'sheep', 'zodiac', 'ram'],
            es: ['aries', 'morueco', 'zodiaco', 'carnero'],
        },
    },
    {
        code: '🐑',
        name: {
            en: 'sheep',
            es: 'oveja',
        },
        keywords: {
            en: ['female', 'sheep', 'ewe'],
            es: ['borrego', 'cordero', 'ovino', 'oveja'],
        },
    },
    {
        code: '🐐',
        name: {
            en: 'goat',
            es: 'cabra',
        },
        keywords: {
            en: ['Capricorn', 'zodiac', 'goat'],
            es: ['capricornio', 'caprino', 'chivo', 'zodiaco', 'cabra'],
        },
    },
    {
        code: '🐪',
        name: {
            en: 'dromedary_camel',
            es: 'dromedario_camello',
        },
        keywords: {
            en: ['dromedary', 'hump', 'camel'],
            es: ['camello', 'desierto', 'joroba', 'dromedario'],
        },
    },
    {
        code: '🐫',
        name: {
            en: 'camel',
            es: 'camello',
        },
        keywords: {
            en: ['bactrian', 'camel', 'hump', 'two-hump camel'],
            es: ['bactriano', 'desierto', 'dromedario', 'jorobas', 'camello'],
        },
    },
    {
        code: '🦙',
        name: {
            en: 'llama',
            es: 'llama',
        },
        keywords: {
            en: ['alpaca', 'guanaco', 'vicuña', 'wool', 'llama'],
            es: ['alpaca', 'guanaco', 'lana', 'vicuña', 'llama'],
        },
    },
    {
        code: '🦒',
        name: {
            en: 'giraffe_face',
            es: 'cara_jirafa',
        },
        keywords: {
            en: ['spots', 'giraffe'],
            es: ['manchas', 'jirafa'],
        },
    },
    {
        code: '🐘',
        name: {
            en: 'elephant',
            es: 'elefante',
        },
        keywords: {
            en: ['elephant'],
            es: ['paquidermo', 'elefante'],
        },
    },
    {
        code: '🦣',
        name: {
            en: 'mammoth',
            es: 'mamut',
        },
        keywords: {
            en: ['extinction', 'large', 'tusk', 'woolly', 'mammoth'],
            es: ['colmillo', 'extinguido', 'lanudo', 'mamut'],
        },
    },
    {
        code: '🦏',
        name: {
            en: 'rhinoceros',
            es: 'rinoceronte',
        },
        keywords: {
            en: ['rhinoceros'],
            es: ['paquidermo', 'rinoceronte'],
        },
    },
    {
        code: '🦛',
        name: {
            en: 'hippopotamus',
            es: 'hipopótamo',
        },
        keywords: {
            en: ['hippo', 'hippopotamus'],
            es: ['paquidermo', 'hipopótamo'],
        },
    },
    {
        code: '🐭',
        name: {
            en: 'mouse',
            es: 'ratón',
        },
        keywords: {
            en: ['face', 'mouse'],
            es: ['cara', 'ratón', 'cara de ratón'],
        },
    },
    {
        code: '🐁',
        name: {
            en: 'mouse2',
            es: 'mouse2',
        },
        keywords: {
            en: ['mouse'],
            es: ['roedor', 'ratón'],
        },
    },
    {
        code: '🐀',
        name: {
            en: 'rat',
            es: 'rata',
        },
        keywords: {
            en: ['rat'],
            es: ['roedor', 'rata'],
        },
    },
    {
        code: '🐹',
        name: {
            en: 'hamster',
            es: 'hámster',
        },
        keywords: {
            en: ['face', 'pet', 'hamster'],
            es: ['cara', 'mascota', 'hámster'],
        },
    },
    {
        code: '🐰',
        name: {
            en: 'rabbit',
            es: 'conejo',
        },
        keywords: {
            en: ['bunny', 'face', 'pet', 'rabbit'],
            es: ['cara', 'conejo', 'mascota', 'cara de conejo'],
        },
    },
    {
        code: '🐇',
        name: {
            en: 'rabbit2',
            es: 'conejo2',
        },
        keywords: {
            en: ['bunny', 'pet', 'rabbit'],
            es: ['conejito', 'gazapo', 'conejo'],
        },
    },
    {
        code: '🐿️',
        name: {
            en: 'chipmunk',
            es: 'ardilla',
        },
        keywords: {
            en: ['squirrel', 'chipmunk'],
            es: ['ardilla'],
        },
    },
    {
        code: '🦫',
        name: {
            en: 'beaver',
            es: 'castor',
        },
        keywords: {
            en: ['dam', 'beaver'],
            es: ['roedor', 'castor'],
        },
    },
    {
        code: '🦔',
        name: {
            en: 'hedgehog',
            es: 'erizo',
        },
        keywords: {
            en: ['spiny', 'hedgehog'],
            es: ['espinas', 'púas', 'erizo'],
        },
    },
    {
        code: '🦇',
        name: {
            en: 'bat',
            es: 'murciélago',
        },
        keywords: {
            en: ['vampire', 'bat'],
            es: ['vampiro', 'murciélago'],
        },
    },
    {
        code: '🐻',
        name: {
            en: 'bear',
            es: 'oso',
        },
        keywords: {
            en: ['face', 'bear'],
            es: ['cara', 'oso'],
        },
    },
    {
        code: '🐻‍❄️',
        name: {
            en: 'polar_bear',
            es: 'oso_polar',
        },
        keywords: {
            en: ['arctic', 'bear', 'white', 'polar bear'],
            es: ['ártico', 'blanco', 'oso', 'polar'],
        },
    },
    {
        code: '🐨',
        name: {
            en: 'koala',
            es: 'coala',
        },
        keywords: {
            en: ['face', 'marsupial', 'koala'],
            es: ['cara', 'marsupial', 'koala'],
        },
    },
    {
        code: '🐼',
        name: {
            en: 'panda_face',
            es: 'cara_de_panda',
        },
        keywords: {
            en: ['face', 'panda'],
            es: ['cara', 'oso panda', 'panda'],
        },
    },
    {
        code: '🦥',
        name: {
            en: 'sloth',
            es: 'perezoso',
        },
        keywords: {
            en: ['lazy', 'slow', 'sloth'],
            es: ['gandul', 'lento', 'vago', 'perezoso'],
        },
    },
    {
        code: '🦦',
        name: {
            en: 'otter',
            es: 'nutria',
        },
        keywords: {
            en: ['fishing', 'playful', 'otter'],
            es: ['bromista', 'juguetón', 'pesca', 'nutria'],
        },
    },
    {
        code: '🦨',
        name: {
            en: 'skunk',
            es: 'mofeta',
        },
        keywords: {
            en: ['stink', 'skunk'],
            es: ['apestar', 'hedor', 'mal olor', 'peste', 'tufo', 'mofeta'],
        },
    },
    {
        code: '🦘',
        name: {
            en: 'kangaroo',
            es: 'canguro',
        },
        keywords: {
            en: ['joey', 'jump', 'marsupial', 'kangaroo'],
            es: ['marsupial', 'salto', 'canguro'],
        },
    },
    {
        code: '🦡',
        name: {
            en: 'badger',
            es: 'tejón',
        },
        keywords: {
            en: ['honey badger', 'pester', 'badger'],
            es: ['ratel', 'tejón de la miel', 'tejón melero', 'tejón'],
        },
    },
    {
        code: '🐾',
        name: {
            en: 'feet',
            es: 'pies',
        },
        keywords: {
            en: ['feet', 'paw', 'print', 'paw prints'],
            es: ['huellas', 'pezuñas', 'huellas de pezuñas'],
        },
    },
    {
        code: '🦃',
        name: {
            en: 'turkey',
            es: 'pavo',
        },
        keywords: {
            en: ['bird', 'turkey'],
            es: ['ave', 'pavo'],
        },
    },
    {
        code: '🐔',
        name: {
            en: 'chicken',
            es: 'pollo',
        },
        keywords: {
            en: ['bird', 'chicken'],
            es: ['ave', 'gallinácea', 'pollo', 'gallina'],
        },
    },
    {
        code: '🐓',
        name: {
            en: 'rooster',
            es: 'gallo',
        },
        keywords: {
            en: ['bird', 'rooster'],
            es: ['ave', 'gallina', 'gallinácea', 'pollo', 'gallo'],
        },
    },
    {
        code: '🐣',
        name: {
            en: 'hatching_chick',
            es: 'pollito_saliendo_del_cascarón',
        },
        keywords: {
            en: ['baby', 'bird', 'chick', 'hatching'],
            es: ['ave', 'huevo', 'pollito', 'pollo', 'pollito rompiendo el cascarón'],
        },
    },
    {
        code: '🐤',
        name: {
            en: 'baby_chick',
            es: 'pollito',
        },
        keywords: {
            en: ['baby', 'bird', 'chick'],
            es: ['ave', 'pollo', 'polluelo', 'pollito'],
        },
    },
    {
        code: '🐥',
        name: {
            en: 'hatched_chick',
            es: 'pollito_recién_nacido',
        },
        keywords: {
            en: ['baby', 'bird', 'chick', 'front-facing baby chick'],
            es: ['ave', 'pollito', 'pollo', 'pollito de frente'],
        },
    },
    {
        code: '🐦',
        name: {
            en: 'bird',
            es: 'pájaro',
        },
        keywords: {
            en: ['bird'],
            es: ['ave', 'pajarillo', 'pájaro'],
        },
    },
    {
        code: '🐧',
        name: {
            en: 'penguin',
            es: 'pingüino',
        },
        keywords: {
            en: ['bird', 'penguin'],
            es: ['ave', 'pingüino'],
        },
    },
    {
        code: '🕊️',
        name: {
            en: 'dove_of_peace',
            es: 'paloma_de_la_paz',
        },
        keywords: {
            en: ['bird', 'fly', 'peace', 'dove'],
            es: ['ave', 'pájaro', 'paz', 'paloma'],
        },
    },
    {
        code: '🦅',
        name: {
            en: 'eagle',
            es: 'águila',
        },
        keywords: {
            en: ['bird', 'eagle'],
            es: ['ave', 'águila'],
        },
    },
    {
        code: '🦆',
        name: {
            en: 'duck',
            es: 'pato',
        },
        keywords: {
            en: ['bird', 'duck'],
            es: ['ave', 'pato'],
        },
    },
    {
        code: '🦢',
        name: {
            en: 'swan',
            es: 'cisne',
        },
        keywords: {
            en: ['bird', 'cygnet', 'ugly duckling', 'swan'],
            es: ['ave', 'patito feo', 'cisne'],
        },
    },
    {
        code: '🦉',
        name: {
            en: 'owl',
            es: 'búho',
        },
        keywords: {
            en: ['bird', 'wise', 'owl'],
            es: ['ave', 'lechuza', 'pájaro', 'búho'],
        },
    },
    {
        code: '🦤',
        name: {
            en: 'dodo',
            es: 'dodo',
        },
        keywords: {
            en: ['extinction', 'large', 'Mauritius', 'dodo'],
            es: ['ave', 'dronte', 'extinguido', 'Mauricio', 'pájaro', 'dodo'],
        },
    },
    {
        code: '🪶',
        name: {
            en: 'feather',
            es: 'pluma',
        },
        keywords: {
            en: ['bird', 'flight', 'light', 'plumage', 'feather'],
            es: ['ave', 'ligero', 'pájaro', 'plumaje', 'pluma'],
        },
    },
    {
        code: '🦩',
        name: {
            en: 'flamingo',
            es: 'flamenco',
        },
        keywords: {
            en: ['flamboyant', 'tropical', 'flamingo'],
            es: ['extravangante', 'ostentoso', 'tropical', 'flamenco'],
        },
    },
    {
        code: '🦚',
        name: {
            en: 'peacock',
            es: 'pavo_real',
        },
        keywords: {
            en: ['bird', 'ostentatious', 'peahen', 'proud', 'peacock'],
            es: ['ave', 'orgulloso', 'pavo', 'plumas', 'pavo real'],
        },
    },
    {
        code: '🦜',
        name: {
            en: 'parrot',
            es: 'loro',
        },
        keywords: {
            en: ['bird', 'pirate', 'talk', 'parrot'],
            es: ['ave', 'hablar', 'papagayo', 'pirata', 'loro'],
        },
    },
    {
        code: '🐸',
        name: {
            en: 'frog',
            es: 'rana',
        },
        keywords: {
            en: ['face', 'frog'],
            es: ['cara', 'rana'],
        },
    },
    {
        code: '🐊',
        name: {
            en: 'crocodile',
            es: 'cocodrilo',
        },
        keywords: {
            en: ['crocodile'],
            es: ['caimán', 'cocodrilo'],
        },
    },
    {
        code: '🐢',
        name: {
            en: 'turtle',
            es: 'tortuga',
        },
        keywords: {
            en: ['terrapin', 'tortoise', 'turtle'],
            es: ['galápago', 'tortuga'],
        },
    },
    {
        code: '🦎',
        name: {
            en: 'lizard',
            es: 'lagarto',
        },
        keywords: {
            en: ['reptile', 'lizard'],
            es: ['lagartija', 'reptil', 'lagarto'],
        },
    },
    {
        code: '🐍',
        name: {
            en: 'snake',
            es: 'serpiente',
        },
        keywords: {
            en: ['bearer', 'Ophiuchus', 'serpent', 'zodiac', 'snake'],
            es: ['culebra', 'reptil', 'víbora', 'serpiente'],
        },
    },
    {
        code: '🐲',
        name: {
            en: 'dragon_face',
            es: 'cara_de_dragón',
        },
        keywords: {
            en: ['dragon', 'face', 'fairy tale'],
            es: ['cara', 'cuento', 'dragón', 'fantasía', 'cara de dragón'],
        },
    },
    {
        code: '🐉',
        name: {
            en: 'dragon',
            es: 'dragón',
        },
        keywords: {
            en: ['fairy tale', 'dragon'],
            es: ['cuento', 'fantasía', 'dragón'],
        },
    },
    {
        code: '🦕',
        name: {
            en: 'sauropod',
            es: 'saurópodo',
        },
        keywords: {
            en: ['brachiosaurus', 'brontosaurus', 'diplodocus', 'sauropod'],
            es: ['braquiosaurio', 'brontosaurio', 'diplodocus', 'saurópodo'],
        },
    },
    {
        code: '🦖',
        name: {
            en: 't-rex',
            es: 't-rex',
        },
        keywords: {
            en: ['Tyrannosaurus Rex', 'T-Rex'],
            es: ['tiranosaurio', 'tiranosaurio rex', 't-rex'],
        },
    },
    {
        code: '🐳',
        name: {
            en: 'whale',
            es: 'ballena',
        },
        keywords: {
            en: ['face', 'spouting', 'whale'],
            es: ['ballena', 'chorro de agua', 'ballena soltando un chorro'],
        },
    },
    {
        code: '🐋',
        name: {
            en: 'whale2',
            es: 'ballena2',
        },
        keywords: {
            en: ['whale'],
            es: ['cachalote', 'cetáceo', 'ballena'],
        },
    },
    {
        code: '🐬',
        name: {
            en: 'dolphin',
            es: 'delfín',
        },
        keywords: {
            en: ['flipper', 'dolphin'],
            es: ['cetáceo', 'delfín'],
        },
    },
    {
        code: '🦭',
        name: {
            en: 'seal',
            es: 'foca',
        },
        keywords: {
            en: ['sea lion', 'seal'],
            es: ['león marino', 'foca'],
        },
    },
    {
        code: '🐟',
        name: {
            en: 'fish',
            es: 'pez',
        },
        keywords: {
            en: ['Pisces', 'zodiac', 'fish'],
            es: ['pececillo', 'pescado', 'piscis', 'zodiaco', 'pez'],
        },
    },
    {
        code: '🐠',
        name: {
            en: 'tropical_fish',
            es: 'pez_tropical',
        },
        keywords: {
            en: ['fish', 'tropical'],
            es: ['pez', 'tropical'],
        },
    },
    {
        code: '🐡',
        name: {
            en: 'blowfish',
            es: 'pez_globo',
        },
        keywords: {
            en: ['fish', 'blowfish'],
            es: ['globo', 'pez'],
        },
    },
    {
        code: '🦈',
        name: {
            en: 'shark',
            es: 'tiburón',
        },
        keywords: {
            en: ['fish', 'shark'],
            es: ['pez', 'tiburón'],
        },
    },
    {
        code: '🐙',
        name: {
            en: 'octopus',
            es: 'pulpo',
        },
        keywords: {
            en: ['octopus'],
            es: ['cefalópodo', 'octópodo', 'pulpo'],
        },
    },
    {
        code: '🐚',
        name: {
            en: 'shell',
            es: 'caracola',
        },
        keywords: {
            en: ['shell', 'spiral'],
            es: ['concha', 'mar', 'concha de mar'],
        },
    },
    {
        code: '🐌',
        name: {
            en: 'snail',
            es: 'caracol',
        },
        keywords: {
            en: ['snail'],
            es: ['caracola', 'molusco', 'caracol'],
        },
    },
    {
        code: '🦋',
        name: {
            en: 'butterfly',
            es: 'mariposa',
        },
        keywords: {
            en: ['insect', 'pretty', 'butterfly'],
            es: ['bonito', 'insecto', 'mariposa'],
        },
    },
    {
        code: '🐛',
        name: {
            en: 'bug',
            es: 'bicho',
        },
        keywords: {
            en: ['insect', 'bug'],
            es: ['gusano', 'insecto', 'bicho'],
        },
    },
    {
        code: '🐜',
        name: {
            en: 'ant',
            es: 'hormiga',
        },
        keywords: {
            en: ['insect', 'ant'],
            es: ['antenas', 'insecto', 'hormiga'],
        },
    },
    {
        code: '🐝',
        name: {
            en: 'bee',
            es: 'abeja',
        },
        keywords: {
            en: ['bee', 'insect', 'honeybee'],
            es: ['insecto', 'miel', 'abeja'],
        },
    },
    {
        code: '🪲',
        name: {
            en: 'beetle',
            es: 'escarabajo',
        },
        keywords: {
            en: ['bug', 'insect', 'beetle'],
            es: ['bicho', 'insecto', 'escarabajo'],
        },
    },
    {
        code: '🐞',
        name: {
            en: 'ladybug',
            es: 'mariquita',
        },
        keywords: {
            en: ['beetle', 'insect', 'ladybird', 'ladybug', 'lady beetle'],
            es: ['cochinilla', 'insecto', 'mariquita'],
        },
    },
    {
        code: '🦗',
        name: {
            en: 'cricket',
            es: 'grillo',
        },
        keywords: {
            en: ['grasshopper', 'cricket'],
            es: ['saltamontes', 'grillo'],
        },
    },
    {
        code: '🪳',
        name: {
            en: 'cockroach',
            es: 'cucaracha',
        },
        keywords: {
            en: ['insect', 'pest', 'roach', 'cockroach'],
            es: ['alimaña', 'bicho', 'insecto', 'plaga', 'cucaracha'],
        },
    },
    {
        code: '🕷️',
        name: {
            en: 'spider',
            es: 'araña',
        },
        keywords: {
            en: ['insect', 'spider'],
            es: ['insecto', 'araña'],
        },
    },
    {
        code: '🕸️',
        name: {
            en: 'spider_web',
            es: 'telaraña',
        },
        keywords: {
            en: ['spider', 'web'],
            es: ['araña', 'tela', 'telaraña', 'tela de araña'],
        },
    },
    {
        code: '🦂',
        name: {
            en: 'scorpion',
            es: 'escorpión',
        },
        keywords: {
            en: ['scorpio', 'Scorpio', 'zodiac', 'scorpion'],
            es: ['escorpio', 'zodiaco', 'escorpión'],
        },
    },
    {
        code: '🦟',
        name: {
            en: 'mosquito',
            es: 'mosquito',
        },
        keywords: {
            en: ['disease', 'fever', 'malaria', 'pest', 'virus', 'mosquito'],
            es: ['fiebre', 'insecto', 'malaria', 'virus', 'mosquito'],
        },
    },
    {
        code: '🪰',
        name: {
            en: 'fly',
            es: 'mosca',
        },
        keywords: {
            en: ['disease', 'maggot', 'pest', 'rotting', 'fly'],
            es: ['basura', 'bicho', 'mal olor', 'podrido', 'mosca'],
        },
    },
    {
        code: '🪱',
        name: {
            en: 'worm',
            es: 'gusano',
        },
        keywords: {
            en: ['annelid', 'earthworm', 'parasite', 'worm'],
            es: ['lombriz', 'oruga', 'parásito', 'gusano'],
        },
    },
    {
        code: '🦠',
        name: {
            en: 'microbe',
            es: 'microbio',
        },
        keywords: {
            en: ['amoeba', 'bacteria', 'virus', 'microbe'],
            es: ['ameba', 'bacteria', 'germen', 'virus', 'microbio'],
        },
    },
    {
        code: '💐',
        name: {
            en: 'bouquet',
            es: 'ramo',
        },
        keywords: {
            en: ['flower', 'bouquet'],
            es: ['bouquet', 'flores', 'ramo', 'ramo de flores'],
        },
    },
    {
        code: '🌸',
        name: {
            en: 'cherry_blossom',
            es: 'flor_de_cerezo',
        },
        keywords: {
            en: ['blossom', 'cherry', 'flower'],
            es: ['cerezo', 'flor', 'flor de cerezo'],
        },
    },
    {
        code: '💮',
        name: {
            en: 'white_flower',
            es: 'flor_blanca',
        },
        keywords: {
            en: ['flower', 'white flower'],
            es: ['blanca', 'flor'],
        },
    },
    {
        code: '🏵️',
        name: {
            en: 'rosette',
            es: 'roseta',
        },
        keywords: {
            en: ['plant', 'rosette'],
            es: ['flor', 'planta', 'roseta'],
        },
    },
    {
        code: '🌹',
        name: {
            en: 'rose',
            es: 'rosa',
        },
        keywords: {
            en: ['flower', 'rose'],
            es: ['flor', 'rosa'],
        },
    },
    {
        code: '🥀',
        name: {
            en: 'wilted_flower',
            es: 'flor_marchita',
        },
        keywords: {
            en: ['flower', 'wilted'],
            es: ['flor', 'marchita', 'marchitada', 'marchitarse'],
        },
    },
    {
        code: '🌺',
        name: {
            en: 'hibiscus',
            es: 'hibisco',
        },
        keywords: {
            en: ['flower', 'hibiscus'],
            es: ['flor', 'hibisco', 'flor de hibisco'],
        },
    },
    {
        code: '🌻',
        name: {
            en: 'sunflower',
            es: 'girasol',
        },
        keywords: {
            en: ['flower', 'sun', 'sunflower'],
            es: ['flor', 'sol', 'girasol'],
        },
    },
    {
        code: '🌼',
        name: {
            en: 'blossom',
            es: 'flor',
        },
        keywords: {
            en: ['flower', 'blossom'],
            es: ['flor'],
        },
    },
    {
        code: '🌷',
        name: {
            en: 'tulip',
            es: 'tulipán',
        },
        keywords: {
            en: ['flower', 'tulip'],
            es: ['flor', 'tulipán'],
        },
    },
    {
        code: '🌱',
        name: {
            en: 'seedling',
            es: 'plántula',
        },
        keywords: {
            en: ['young', 'seedling'],
            es: ['plantón', 'planta joven'],
        },
    },
    {
        code: '🪴',
        name: {
            en: 'potted_plant',
            es: 'planta_de_maceta',
        },
        keywords: {
            en: ['boring', 'grow', 'house', 'nurturing', 'plant', 'useless', 'potted plant'],
            es: ['crecer', 'maceta', 'planta', 'tiesto', 'planta de maceta'],
        },
    },
    {
        code: '🌲',
        name: {
            en: 'evergreen_tree',
            es: 'árbol_de_hoja_perenne',
        },
        keywords: {
            en: ['tree', 'evergreen tree'],
            es: ['árbol', 'hoja perenne', 'perenne', 'árbol de hoja perenne'],
        },
    },
    {
        code: '🌳',
        name: {
            en: 'deciduous_tree',
            es: 'árbol_caduco',
        },
        keywords: {
            en: ['deciduous', 'shedding', 'tree'],
            es: ['árbol', 'caducifolio', 'hoja caduca', 'árbol de hoja caduca'],
        },
    },
    {
        code: '🌴',
        name: {
            en: 'palm_tree',
            es: 'palmera',
        },
        keywords: {
            en: ['palm', 'tree'],
            es: ['árbol', 'árbol de palma', 'palmera'],
        },
    },
    {
        code: '🌵',
        name: {
            en: 'cactus',
            es: 'cactus',
        },
        keywords: {
            en: ['plant', 'cactus'],
            es: ['planta', 'cactus'],
        },
    },
    {
        code: '🌾',
        name: {
            en: 'ear_of_rice',
            es: 'planta_de_arroz',
        },
        keywords: {
            en: ['ear', 'grain', 'rice', 'sheaf of rice'],
            es: ['arroz', 'espiga', 'planta', 'espiga de arroz'],
        },
    },
    {
        code: '🌿',
        name: {
            en: 'herb',
            es: 'hierba',
        },
        keywords: {
            en: ['leaf', 'herb'],
            es: ['hoja', 'verde', 'hierba'],
        },
    },
    {
        code: '☘️',
        name: {
            en: 'shamrock',
            es: 'trébol',
        },
        keywords: {
            en: ['plant', 'shamrock'],
            es: ['planta', 'trébol'],
        },
    },
    {
        code: '🍀',
        name: {
            en: 'four_leaf_clover',
            es: 'trébol_de_cuatro_hojas',
        },
        keywords: {
            en: ['4', 'clover', 'four', 'four-leaf clover', 'leaf'],
            es: ['suerte', 'trébol', 'trébol de cuatro hojas'],
        },
    },
    {
        code: '🍁',
        name: {
            en: 'maple_leaf',
            es: 'hoja_de_arce',
        },
        keywords: {
            en: ['falling', 'leaf', 'maple'],
            es: ['arce', 'hoja', 'hoja de arce'],
        },
    },
    {
        code: '🍂',
        name: {
            en: 'fallen_leaf',
            es: 'hoja_caída',
        },
        keywords: {
            en: ['falling', 'leaf', 'fallen leaf'],
            es: ['caída', 'hojas', 'hojas caídas'],
        },
    },
    {
        code: '🍃',
        name: {
            en: 'leaves',
            es: 'hojas',
        },
        keywords: {
            en: ['blow', 'flutter', 'leaf', 'wind', 'leaf fluttering in wind'],
            es: ['hoja', 'revolotear', 'soplar', 'viento', 'hojas revoloteando al viento'],
        },
    },
    {
        code: 'foodAndDrink',
        icon: FoodAndDrink,
        header: true,
    },
    {
        code: '🍄',
        name: {
            en: 'mushroom',
            es: 'seta',
        },
        keywords: {
            en: ['toadstool', 'mushroom'],
            es: ['hongo', 'seta', 'champiñón'],
        },
    },
    {
        code: '🍇',
        name: {
            en: 'grapes',
            es: 'uvas',
        },
        keywords: {
            en: ['fruit', 'grape', 'grapes'],
            es: ['agracejo', 'fruta', 'racimo', 'uva', 'uvas'],
        },
    },
    {
        code: '🍈',
        name: {
            en: 'melon',
            es: 'melón',
        },
        keywords: {
            en: ['fruit', 'melon'],
            es: ['fruta', 'melón'],
        },
    },
    {
        code: '🍉',
        name: {
            en: 'watermelon',
            es: 'sandía',
        },
        keywords: {
            en: ['fruit', 'watermelon'],
            es: ['fruta', 'sandía'],
        },
    },
    {
        code: '🍊',
        name: {
            en: 'tangerine',
            es: 'mandarina',
        },
        keywords: {
            en: ['fruit', 'orange', 'tangerine'],
            es: ['fruta', 'naranja', 'mandarina'],
        },
    },
    {
        code: '🍋',
        name: {
            en: 'lemon',
            es: 'limón',
        },
        keywords: {
            en: ['citrus', 'fruit', 'lemon'],
            es: ['cítrico', 'citrón', 'fruta', 'limón'],
        },
    },
    {
        code: '🍌',
        name: {
            en: 'banana',
            es: 'plátano',
        },
        keywords: {
            en: ['fruit', 'banana'],
            es: ['banana', 'fruta', 'plátano'],
        },
    },
    {
        code: '🍍',
        name: {
            en: 'pineapple',
            es: 'piña',
        },
        keywords: {
            en: ['fruit', 'pineapple'],
            es: ['ananás', 'fruta', 'piña'],
        },
    },
    {
        code: '🥭',
        name: {
            en: 'mango',
            es: 'mango',
        },
        keywords: {
            en: ['fruit', 'tropical', 'mango'],
            es: ['fruta', 'tropical', 'mango'],
        },
    },
    {
        code: '🍎',
        name: {
            en: 'apple',
            es: 'manzana',
        },
        keywords: {
            en: ['apple', 'fruit', 'red'],
            es: ['fruta', 'manzana', 'poma', 'roja'],
        },
    },
    {
        code: '🍏',
        name: {
            en: 'green_apple',
            es: 'manzana_verde',
        },
        keywords: {
            en: ['apple', 'fruit', 'green'],
            es: ['fruta', 'manzana', 'poma', 'verde'],
        },
    },
    {
        code: '🍐',
        name: {
            en: 'pear',
            es: 'pera',
        },
        keywords: {
            en: ['fruit', 'pear'],
            es: ['fruta', 'perilla', 'pera'],
        },
    },
    {
        code: '🍑',
        name: {
            en: 'peach',
            es: 'melocotón',
        },
        keywords: {
            en: ['fruit', 'peach'],
            es: ['durazno', 'fruta', 'melocotón'],
        },
    },
    {
        code: '🍒',
        name: {
            en: 'cherries',
            es: 'cerezas',
        },
        keywords: {
            en: ['berries', 'cherry', 'fruit', 'red', 'cherries'],
            es: ['cereza', 'fruta', 'guindas', 'cerezas'],
        },
    },
    {
        code: '🍓',
        name: {
            en: 'strawberry',
            es: 'fresa',
        },
        keywords: {
            en: ['berry', 'fruit', 'strawberry'],
            es: ['fresón', 'fruta', 'fresa'],
        },
    },
    {
        code: '🫐',
        name: {
            en: 'blueberries',
            es: 'arándanos',
        },
        keywords: {
            en: ['berry', 'bilberry', 'blue', 'blueberry', 'blueberries'],
            es: ['arándano', 'azul', 'baya', 'frutos del bosque', 'mirtilo', 'arándanos'],
        },
    },
    {
        code: '🥝',
        name: {
            en: 'kiwifruit',
            es: 'kiwi',
        },
        keywords: {
            en: ['food', 'fruit', 'kiwi'],
            es: ['comida', 'fruta', 'kiwi'],
        },
    },
    {
        code: '🍅',
        name: {
            en: 'tomato',
            es: 'tomate',
        },
        keywords: {
            en: ['fruit', 'vegetable', 'tomato'],
            es: ['ensalada', 'fruta', 'verdura', 'tomate'],
        },
    },
    {
        code: '🫒',
        name: {
            en: 'olive',
            es: 'aceituna',
        },
        keywords: {
            en: ['food', 'olive'],
            es: ['aperitivo', 'comida', 'oliva', 'aceituna'],
        },
    },
    {
        code: '🥥',
        name: {
            en: 'coconut',
            es: 'coco',
        },
        keywords: {
            en: ['palm', 'piña colada', 'coconut'],
            es: ['palmera', 'piña colada', 'coco'],
        },
    },
    {
        code: '🥑',
        name: {
            en: 'avocado',
            es: 'aguacate',
        },
        keywords: {
            en: ['food', 'fruit', 'avocado'],
            es: ['comida', 'fruta', 'aguacate'],
        },
    },
    {
        code: '🍆',
        name: {
            en: 'eggplant',
            es: 'berenjena',
        },
        keywords: {
            en: ['aubergine', 'vegetable', 'eggplant'],
            es: ['fruto', 'verdura', 'berenjena'],
        },
    },
    {
        code: '🥔',
        name: {
            en: 'potato',
            es: 'patata',
        },
        keywords: {
            en: ['food', 'vegetable', 'potato'],
            es: ['comida', 'papa', 'verdura', 'patata'],
        },
    },
    {
        code: '🥕',
        name: {
            en: 'carrot',
            es: 'zanahoria',
        },
        keywords: {
            en: ['food', 'vegetable', 'carrot'],
            es: ['comida', 'verdura', 'zanahoria'],
        },
    },
    {
        code: '🌽',
        name: {
            en: 'corn',
            es: 'maíz',
        },
        keywords: {
            en: ['corn', 'ear', 'maize', 'maze', 'ear of corn'],
            es: ['espiga', 'maíz', 'mazorca', 'mijo', 'espiga de maíz'],
        },
    },
    {
        code: '🌶️',
        name: {
            en: 'hot_pepper',
            es: 'guindilla',
        },
        keywords: {
            en: ['hot', 'pepper'],
            es: ['chile', 'picante', 'planta'],
        },
    },
    {
        code: '🫑',
        name: {
            en: 'bell_pepper',
            es: 'pimiento',
        },
        keywords: {
            en: ['capsicum', 'pepper', 'vegetable', 'bell pepper'],
            es: ['ají', 'chile', 'morrón', 'rojo', 'verdura', 'pimiento'],
        },
    },
    {
        code: '🥒',
        name: {
            en: 'cucumber',
            es: 'pepino',
        },
        keywords: {
            en: ['food', 'pickle', 'vegetable', 'cucumber'],
            es: ['comida', 'pepinillo', 'verdura', 'pepino'],
        },
    },
    {
        code: '🥬',
        name: {
            en: 'leafy_green',
            es: 'verdura_de_hoja_verde',
        },
        keywords: {
            en: ['bok choy', 'cabbage', 'kale', 'lettuce', 'leafy green'],
            es: ['bok choy', 'col', 'kale', 'lechuga', 'pak choi', 'verdura de hoja verde'],
        },
    },
    {
        code: '🥦',
        name: {
            en: 'broccoli',
            es: 'brócoli',
        },
        keywords: {
            en: ['wild cabbage', 'broccoli'],
            es: ['col', 'repollo', 'brócoli'],
        },
    },
    {
        code: '🧄',
        name: {
            en: 'garlic',
            es: 'ajo',
        },
        keywords: {
            en: ['flavoring', 'garlic'],
            es: ['condimento', 'vampiro', 'ajo'],
        },
    },
    {
        code: '🧅',
        name: {
            en: 'onion',
            es: 'cebolla',
        },
        keywords: {
            en: ['flavoring', 'onion'],
            es: ['condimento', 'llorar', 'cebolla'],
        },
    },
    {
        code: '🥜',
        name: {
            en: 'peanuts',
            es: 'cacahuetes',
        },
        keywords: {
            en: ['food', 'nut', 'peanut', 'vegetable', 'peanuts'],
            es: ['cacahuete', 'comida', 'fruto seco', 'verdura', 'cacahuetes'],
        },
    },
    {
        code: '🌰',
        name: {
            en: 'chestnut',
            es: 'castaña',
        },
        keywords: {
            en: ['plant', 'chestnut'],
            es: ['castaño', 'fruto seco', 'castaña'],
        },
    },
    {
        code: '🍞',
        name: {
            en: 'bread',
            es: 'pan',
        },
        keywords: {
            en: ['loaf', 'bread'],
            es: ['pan', 'rebanada', 'tostada', 'pan de molde'],
        },
    },
    {
        code: '🥐',
        name: {
            en: 'croissant',
            es: 'cruasán',
        },
        keywords: {
            en: ['bread', 'breakfast', 'food', 'french', 'roll', 'croissant'],
            es: ['bollo', 'comida', 'croissant', 'francés', 'cruasán'],
        },
    },
    {
        code: '🥖',
        name: {
            en: 'baguette_bread',
            es: 'baguete',
        },
        keywords: {
            en: ['baguette', 'bread', 'food', 'french'],
            es: ['baguette', 'barra', 'comida', 'francés', 'pan', 'baguete'],
        },
    },
    {
        code: '🫓',
        name: {
            en: 'flatbread',
            es: 'pan_sin_levadura',
        },
        keywords: {
            en: ['arepa', 'lavash', 'naan', 'pita', 'flatbread'],
            es: ['arepa', 'naan', 'pita', 'tortilla', 'pan sin levadura'],
        },
    },
    {
        code: '🥨',
        name: {
            en: 'pretzel',
            es: 'galleta_salada',
        },
        keywords: {
            en: ['twisted', 'pretzel'],
            es: ['galleta salada', 'pretzel', 'bretzel'],
        },
    },
    {
        code: '🥯',
        name: {
            en: 'bagel',
            es: 'bagel',
        },
        keywords: {
            en: ['bakery', 'breakfast', 'schmear', 'bagel'],
            es: ['bocadillo', 'pan', 'panadería', 'bagel'],
        },
    },
    {
        code: '🥞',
        name: {
            en: 'pancakes',
            es: 'crepes',
        },
        keywords: {
            en: ['breakfast', 'crêpe', 'food', 'hotcake', 'pancake', 'pancakes'],
            es: ['comida', 'dulce', 'pancakes', 'postre', 'tortita', 'tortitas'],
        },
    },
    {
        code: '🧇',
        name: {
            en: 'waffle',
            es: 'gofre',
        },
        keywords: {
            en: ['breakfast', 'indecisive', 'iron', 'waffle'],
            es: ['waffle', 'gofre'],
        },
    },
    {
        code: '🧀',
        name: {
            en: 'cheese_wedge',
            es: 'cuña_de_queso',
        },
        keywords: {
            en: ['cheese', 'cheese wedge'],
            es: ['cuña', 'queso', 'trozo', 'cuña de queso'],
        },
    },
    {
        code: '🍖',
        name: {
            en: 'meat_on_bone',
            es: 'hueso_con_carne',
        },
        keywords: {
            en: ['bone', 'meat', 'meat on bone'],
            es: ['carne', 'hueso', 'restaurante', 'carne con hueso'],
        },
    },
    {
        code: '🍗',
        name: {
            en: 'poultry_leg',
            es: 'muslo_de_pollo',
        },
        keywords: {
            en: ['bone', 'chicken', 'drumstick', 'leg', 'poultry'],
            es: ['muslo', 'pollo', 'restaurante', 'muslo de pollo'],
        },
    },
    {
        code: '🥩',
        name: {
            en: 'cut_of_meat',
            es: 'chuleta',
        },
        keywords: {
            en: ['chop', 'lambchop', 'porkchop', 'steak', 'cut of meat'],
            es: ['carne', 'chuleta', 'filete', 'corte de carne'],
        },
    },
    {
        code: '🥓',
        name: {
            en: 'bacon',
            es: 'beicon',
        },
        keywords: {
            en: ['breakfast', 'food', 'meat', 'bacon'],
            es: ['bacon', 'carne', 'comida', 'panceta', 'beicon'],
        },
    },
    {
        code: '🍔',
        name: {
            en: 'hamburger',
            es: 'hamburguesa',
        },
        keywords: {
            en: ['burger', 'hamburger'],
            es: ['burger', 'hamburguesa'],
        },
    },
    {
        code: '🍟',
        name: {
            en: 'fries',
            es: 'patatas_fritas',
        },
        keywords: {
            en: ['french', 'fries'],
            es: ['papas fritas', 'patatas', 'restaurante', 'patatas fritas'],
        },
    },
    {
        code: '🍕',
        name: {
            en: 'pizza',
            es: 'pizza',
        },
        keywords: {
            en: ['cheese', 'slice', 'pizza'],
            es: ['porción', 'restaurante', 'pizza'],
        },
    },
    {
        code: '🌭',
        name: {
            en: 'hotdog',
            es: 'perrito_caliente',
        },
        keywords: {
            en: ['frankfurter', 'hotdog', 'sausage', 'hot dog'],
            es: ['perrito', 'salchicha', 'perrito caliente'],
        },
    },
    {
        code: '🥪',
        name: {
            en: 'sandwich',
            es: 'sándwich',
        },
        keywords: {
            en: ['bread', 'sandwich'],
            es: ['bocadillo', 'bocata', 'emparedado', 'sándwich'],
        },
    },
    {
        code: '🌮',
        name: {
            en: 'taco',
            es: 'taco',
        },
        keywords: {
            en: ['mexican', 'taco'],
            es: ['comida', 'mexicano', 'taco'],
        },
    },
    {
        code: '🌯',
        name: {
            en: 'burrito',
            es: 'burrito',
        },
        keywords: {
            en: ['mexican', 'wrap', 'burrito'],
            es: ['comida', 'mexicano', 'tex mex', 'wrap', 'burrito'],
        },
    },
    {
        code: '🫔',
        name: {
            en: 'tamale',
            es: 'tamal',
        },
        keywords: {
            en: ['mexican', 'wrapped', 'tamale'],
            es: ['mejicano', 'mexicano', 'wrap', 'tamal'],
        },
    },
    {
        code: '🥙',
        name: {
            en: 'stuffed_flatbread',
            es: 'kebab',
        },
        keywords: {
            en: ['falafel', 'flatbread', 'food', 'gyro', 'kebab', 'stuffed'],
            es: ['comida', 'durum', 'falafel', 'kebab', 'pan de pita', 'pan relleno'],
        },
    },
    {
        code: '🧆',
        name: {
            en: 'falafel',
            es: 'falafel',
        },
        keywords: {
            en: ['chickpea', 'meatball', 'falafel'],
            es: ['albóndiga', 'garbanzo', 'falafel'],
        },
    },
    {
        code: '🥚',
        name: {
            en: 'egg',
            es: 'huevo',
        },
        keywords: {
            en: ['breakfast', 'food', 'egg'],
            es: ['comida', 'huevo'],
        },
    },
    {
        code: '🍳',
        name: {
            en: 'fried_egg',
            es: 'huevo_frito',
        },
        keywords: {
            en: ['breakfast', 'egg', 'frying', 'pan', 'cooking'],
            es: ['freír', 'huevo', 'sartén', 'cocinar'],
        },
    },
    {
        code: '🥘',
        name: {
            en: 'shallow_pan_of_food',
            es: 'paella',
        },
        keywords: {
            en: ['casserole', 'food', 'paella', 'pan', 'shallow', 'shallow pan of food'],
            es: ['arroz', 'comida', 'paella'],
        },
    },
    {
        code: '🍲',
        name: {
            en: 'stew',
            es: 'estofado',
        },
        keywords: {
            en: ['pot', 'stew', 'pot of food'],
            es: ['comida de olla', 'puchero', 'restaurante', 'olla de comida'],
        },
    },
    {
        code: '🫕',
        name: {
            en: 'fondue',
            es: 'fondue',
        },
        keywords: {
            en: ['cheese', 'chocolate', 'melted', 'pot', 'Swiss', 'fondue'],
            es: ['chocolate', 'olla', 'queso', 'suizo', 'fondue'],
        },
    },
    {
        code: '🥣',
        name: {
            en: 'bowl_with_spoon',
            es: 'cuenco_con_cuchara',
        },
        keywords: {
            en: ['breakfast', 'cereal', 'congee', 'bowl with spoon'],
            es: ['cereal', 'desayuno', 'cuenco con cuchara'],
        },
    },
    {
        code: '🥗',
        name: {
            en: 'green_salad',
            es: 'ensalada_verde',
        },
        keywords: {
            en: ['food', 'green', 'salad'],
            es: ['bol', 'comida', 'verde', 'ensalada'],
        },
    },
    {
        code: '🍿',
        name: {
            en: 'popcorn',
            es: 'palomitas_de_maíz',
        },
        keywords: {
            en: ['popcorn'],
            es: ['maíz', 'palomitas'],
        },
    },
    {
        code: '🧈',
        name: {
            en: 'butter',
            es: 'mantequilla',
        },
        keywords: {
            en: ['dairy', 'butter'],
            es: ['lácteo', 'mantequilla'],
        },
    },
    {
        code: '🧂',
        name: {
            en: 'salt',
            es: 'sal',
        },
        keywords: {
            en: ['condiment', 'shaker', 'salt'],
            es: ['condimento', 'salero', 'sal'],
        },
    },
    {
        code: '🥫',
        name: {
            en: 'canned_food',
            es: 'comida_enlatada',
        },
        keywords: {
            en: ['can', 'canned food'],
            es: ['conserva', 'lata', 'comida enlatada'],
        },
    },
    {
        code: '🍱',
        name: {
            en: 'bento',
            es: 'bento',
        },
        keywords: {
            en: ['bento', 'box'],
            es: ['bento', 'caja', 'comida', 'restaurante', 'caja de bento'],
        },
    },
    {
        code: '🍘',
        name: {
            en: 'rice_cracker',
            es: 'galleta_de_arroz',
        },
        keywords: {
            en: ['cracker', 'rice'],
            es: ['arroz', 'galleta', 'galleta de arroz'],
        },
    },
    {
        code: '🍙',
        name: {
            en: 'rice_ball',
            es: 'bola_de_arroz',
        },
        keywords: {
            en: ['ball', 'Japanese', 'rice'],
            es: ['arroz', 'japonés', 'onigiri', 'restaurante', 'bola de arroz'],
        },
    },
    {
        code: '🍚',
        name: {
            en: 'rice',
            es: 'arroz',
        },
        keywords: {
            en: ['cooked', 'rice'],
            es: ['arroz', 'restaurante', 'arroz cocido'],
        },
    },
    {
        code: '🍛',
        name: {
            en: 'curry',
            es: 'curry',
        },
        keywords: {
            en: ['curry', 'rice'],
            es: ['arroz', 'curry', 'restaurante', 'arroz con curry'],
        },
    },
    {
        code: '🍜',
        name: {
            en: 'ramen',
            es: 'ramen',
        },
        keywords: {
            en: ['bowl', 'noodle', 'ramen', 'steaming'],
            es: ['fideos calientes', 'fideos chinos', 'fideos ramen', 'ramen', 'tazón de fideos'],
        },
    },
    {
        code: '🍝',
        name: {
            en: 'spaghetti',
            es: 'espaguetis',
        },
        keywords: {
            en: ['pasta', 'spaghetti'],
            es: ['pasta', 'restaurante', 'espagueti'],
        },
    },
    {
        code: '🍠',
        name: {
            en: 'sweet_potato',
            es: 'batata',
        },
        keywords: {
            en: ['potato', 'roasted', 'sweet'],
            es: ['asada', 'papa asada', 'patata', 'restaurante'],
        },
    },
    {
        code: '🍢',
        name: {
            en: 'oden',
            es: 'oden',
        },
        keywords: {
            en: ['kebab', 'seafood', 'skewer', 'stick', 'oden'],
            es: ['japonés', 'marisco', 'oden', 'pincho', 'brocheta'],
        },
    },
    {
        code: '🍣',
        name: {
            en: 'sushi',
            es: 'sushi',
        },
        keywords: {
            en: ['sushi'],
            es: ['restaurante', 'sushi'],
        },
    },
    {
        code: '🍤',
        name: {
            en: 'fried_shrimp',
            es: 'camarón_frito',
        },
        keywords: {
            en: ['fried', 'prawn', 'shrimp', 'tempura'],
            es: ['frito', 'gamba', 'restaurante', 'gamba frita'],
        },
    },
    {
        code: '🍥',
        name: {
            en: 'fish_cake',
            es: 'pastel_de_pescado',
        },
        keywords: {
            en: ['cake', 'fish', 'pastry', 'swirl', 'fish cake with swirl'],
            es: ['comida japonesa', 'pastel', 'pescado', 'pastel de pescado japonés'],
        },
    },
    {
        code: '🥮',
        name: {
            en: 'moon_cake',
            es: 'pastel_de_luna',
        },
        keywords: {
            en: ['autumn', 'festival', 'yuèbǐng', 'moon cake'],
            es: ['festival', 'luna', 'otoño', 'yuebing', 'pastel de luna'],
        },
    },
    {
        code: '🍡',
        name: {
            en: 'dango',
            es: 'dango',
        },
        keywords: {
            en: ['dessert', 'Japanese', 'skewer', 'stick', 'sweet', 'dango'],
            es: ['japonés', 'pincho', 'postre', 'restaurante', 'dango'],
        },
    },
    {
        code: '🥟',
        name: {
            en: 'dumpling',
            es: 'empanadilla',
        },
        keywords: {
            en: ['empanada', 'gyōza', 'jiaozi', 'pierogi', 'potsticker', 'dumpling'],
            es: ['comida', 'gyōza', 'jiaozi', 'masa', 'dumpling'],
        },
    },
    {
        code: '🥠',
        name: {
            en: 'fortune_cookie',
            es: 'galletita_fortuna',
        },
        keywords: {
            en: ['prophecy', 'fortune cookie'],
            es: ['adivinación', 'profecía', 'superstición', 'galleta de la fortuna'],
        },
    },
    {
        code: '🥡',
        name: {
            en: 'takeout_box',
            es: 'caja_comida_rápida',
        },
        keywords: {
            en: ['oyster pail', 'takeout box'],
            es: ['recipiente para llevar', 'restaurante', 'caja para llevar'],
        },
    },
    {
        code: '🦀',
        name: {
            en: 'crab',
            es: 'cangrejo',
        },
        keywords: {
            en: ['Cancer', 'zodiac', 'crab'],
            es: ['animal', 'cáncer', 'zodiaco', 'cangrejo'],
        },
    },
    {
        code: '🦞',
        name: {
            en: 'lobster',
            es: 'langosta',
        },
        keywords: {
            en: ['bisque', 'claws', 'seafood', 'lobster'],
            es: ['langosta', 'marisco', 'pinzas', 'bogavante'],
        },
    },
    {
        code: '🦐',
        name: {
            en: 'shrimp',
            es: 'camarón',
        },
        keywords: {
            en: ['food', 'shellfish', 'small', 'shrimp'],
            es: ['camarón', 'comida', 'langostino', 'marisco', 'gamba'],
        },
    },
    {
        code: '🦑',
        name: {
            en: 'squid',
            es: 'calamar',
        },
        keywords: {
            en: ['food', 'molusc', 'squid'],
            es: ['comida', 'molusco', 'calamar'],
        },
    },
    {
        code: '🦪',
        name: {
            en: 'oyster',
            es: 'ostra',
        },
        keywords: {
            en: ['diving', 'pearl', 'oyster'],
            es: ['buceo', 'perla', 'ostra'],
        },
    },
    {
        code: '🍦',
        name: {
            en: 'icecream',
            es: 'helado',
        },
        keywords: {
            en: ['cream', 'dessert', 'ice', 'icecream', 'soft', 'sweet'],
            es: ['cucurucho', 'dulce', 'helado', 'helado de cucurucho', 'restaurante', 'cucurucho de helado'],
        },
    },
    {
        code: '🍧',
        name: {
            en: 'shaved_ice',
            es: 'hielo_picado',
        },
        keywords: {
            en: ['dessert', 'ice', 'shaved', 'sweet'],
            es: ['helado', 'hielo', 'postre', 'raspado', 'granizado hawaiano'],
        },
    },
    {
        code: '🍨',
        name: {
            en: 'ice_cream',
            es: 'postre_helado',
        },
        keywords: {
            en: ['cream', 'dessert', 'ice', 'sweet'],
            es: ['postre', 'sorbete', 'helado'],
        },
    },
    {
        code: '🍩',
        name: {
            en: 'doughnut',
            es: 'rosquilla',
        },
        keywords: {
            en: ['breakfast', 'dessert', 'donut', 'sweet', 'doughnut'],
            es: ['berlina', 'pastel', 'rosquilla', 'dónut'],
        },
    },
    {
        code: '🍪',
        name: {
            en: 'cookie',
            es: 'galleta',
        },
        keywords: {
            en: ['dessert', 'sweet', 'cookie'],
            es: ['dulce', 'pasta', 'postre', 'galleta'],
        },
    },
    {
        code: '🎂',
        name: {
            en: 'birthday',
            es: 'cumpleaños',
        },
        keywords: {
            en: ['birthday', 'cake', 'celebration', 'dessert', 'pastry', 'sweet'],
            es: ['celebración', 'cumpleaños', 'tarta', 'tarta de cumpleaños'],
        },
    },
    {
        code: '🍰',
        name: {
            en: 'cake',
            es: 'pastel',
        },
        keywords: {
            en: ['cake', 'dessert', 'pastry', 'slice', 'sweet', 'shortcake'],
            es: ['pedazo de tarta', 'restaurante', 'tarta', 'trozo de tarta'],
        },
    },
    {
        code: '🧁',
        name: {
            en: 'cupcake',
            es: 'magdalena',
        },
        keywords: {
            en: ['bakery', 'sweet', 'cupcake'],
            es: ['cupcake', 'dulce', 'repostería', 'magdalena'],
        },
    },
    {
        code: '🥧',
        name: {
            en: 'pie',
            es: 'tarta',
        },
        keywords: {
            en: ['filling', 'pastry', 'pie'],
            es: ['masa', 'relleno', 'pastel'],
        },
    },
    {
        code: '🍫',
        name: {
            en: 'chocolate_bar',
            es: 'chocolatina',
        },
        keywords: {
            en: ['bar', 'chocolate', 'dessert', 'sweet'],
            es: ['barra', 'chocolate', 'restaurante', 'tableta', 'tableta de chocolate'],
        },
    },
    {
        code: '🍬',
        name: {
            en: 'candy',
            es: 'caramelo',
        },
        keywords: {
            en: ['dessert', 'sweet', 'candy'],
            es: ['chuche', 'chuchería', 'dulce', 'golosina', 'caramelo'],
        },
    },
    {
        code: '🍭',
        name: {
            en: 'lollipop',
            es: 'piruleta',
        },
        keywords: {
            en: ['candy', 'dessert', 'sweet', 'lollipop'],
            es: ['chuche', 'chuchería', 'dulce', 'golosina', 'piruleta'],
        },
    },
    {
        code: '🍮',
        name: {
            en: 'custard',
            es: 'natillas',
        },
        keywords: {
            en: ['dessert', 'pudding', 'sweet', 'custard'],
            es: ['dulce', 'postre', 'pudding', 'flan'],
        },
    },
    {
        code: '🍯',
        name: {
            en: 'honey_pot',
            es: 'tarro_de_miel',
        },
        keywords: {
            en: ['honey', 'honeypot', 'pot', 'sweet'],
            es: ['dulce', 'miel', 'tarro', 'tarro de miel'],
        },
    },
    {
        code: '🍼',
        name: {
            en: 'baby_bottle',
            es: 'biberón',
        },
        keywords: {
            en: ['baby', 'bottle', 'drink', 'milk'],
            es: ['bebé', 'bibe', 'bibi', 'botella', 'leche', 'biberón'],
        },
    },
    {
        code: '🥛',
        name: {
            en: 'glass_of_milk',
            es: 'vaso_de_leche',
        },
        keywords: {
            en: ['drink', 'glass', 'milk', 'glass of milk'],
            es: ['bebida', 'leche', 'vaso', 'vaso de leche'],
        },
    },
    {
        code: '☕',
        name: {
            en: 'coffee',
            es: 'café',
        },
        keywords: {
            en: ['beverage', 'coffee', 'drink', 'hot', 'steaming', 'tea'],
            es: ['bebida', 'café', 'caliente', 'té'],
        },
    },
    {
        code: '🫖',
        name: {
            en: 'teapot',
            es: 'tetera',
        },
        keywords: {
            en: ['drink', 'pot', 'tea', 'teapot'],
            es: ['bebida', 'infusión', 'té', 'tetera'],
        },
    },
    {
        code: '🍵',
        name: {
            en: 'tea',
            es: 'té',
        },
        keywords: {
            en: ['beverage', 'cup', 'drink', 'tea', 'teacup', 'teacup without handle'],
            es: ['bebida', 'taza', 'té', 'tazón de té'],
        },
    },
    {
        code: '🍶',
        name: {
            en: 'sake',
            es: 'sake',
        },
        keywords: {
            en: ['bar', 'beverage', 'bottle', 'cup', 'drink', 'sake'],
            es: ['bar', 'bebida', 'botella', 'restaurante', 'tazón', 'sake'],
        },
    },
    {
        code: '🍾',
        name: {
            en: 'champagne',
            es: 'champán',
        },
        keywords: {
            en: ['bar', 'bottle', 'cork', 'drink', 'popping', 'bottle with popping cork'],
            es: ['bar', 'beber', 'botella', 'cava', 'corcho', 'botella descorchada'],
        },
    },
    {
        code: '🍷',
        name: {
            en: 'wine_glass',
            es: 'copa_de_vino',
        },
        keywords: {
            en: ['bar', 'beverage', 'drink', 'glass', 'wine'],
            es: ['bar', 'bebida', 'copa', 'vaso', 'vino', 'copa de vino'],
        },
    },
    {
        code: '🍸',
        name: {
            en: 'cocktail',
            es: 'cóctel',
        },
        keywords: {
            en: ['bar', 'cocktail', 'drink', 'glass'],
            es: ['bar', 'cóctel', 'copa', 'restaurante', 'copa de cóctel'],
        },
    },
    {
        code: '🍹',
        name: {
            en: 'tropical_drink',
            es: 'bebida_tropical',
        },
        keywords: {
            en: ['bar', 'drink', 'tropical'],
            es: ['bar', 'bebida', 'restaurante', 'tropical'],
        },
    },
    {
        code: '🍺',
        name: {
            en: 'beer',
            es: 'cerveza',
        },
        keywords: {
            en: ['bar', 'beer', 'drink', 'mug'],
            es: ['bar', 'cerveza', 'jarra', 'restaurante', 'jarra de cerveza'],
        },
    },
    {
        code: '🍻',
        name: {
            en: 'beers',
            es: 'cervezas',
        },
        keywords: {
            en: ['bar', 'beer', 'clink', 'drink', 'mug', 'clinking beer mugs'],
            es: ['bar', 'cerveza', 'jarra', 'jarras', 'restaurante', 'jarras de cerveza brindando'],
        },
    },
    {
        code: '🥂',
        name: {
            en: 'clinking_glasses',
            es: 'copas_brindis',
        },
        keywords: {
            en: ['celebrate', 'clink', 'drink', 'glass', 'clinking glasses'],
            es: ['bebida', 'brindar', 'brindis', 'celebración', 'copa', 'copas brindando'],
        },
    },
    {
        code: '🥃',
        name: {
            en: 'tumbler_glass',
            es: 'vaso_corto',
        },
        keywords: {
            en: ['glass', 'liquor', 'shot', 'tumbler', 'whisky'],
            es: ['chupito', 'copa', 'licor', 'vaso', 'whisky', 'vaso de whisky'],
        },
    },
    {
        code: '🥤',
        name: {
            en: 'cup_with_straw',
            es: 'vaso_con_pajita',
        },
        keywords: {
            en: ['juice', 'soda', 'cup with straw'],
            es: ['refresco', 'zumo', 'vaso con pajita'],
        },
    },
    {
        code: '🧋',
        name: {
            en: 'bubble_tea',
            es: 'té_de_burbujas',
        },
        keywords: {
            en: ['bubble', 'milk', 'pearl', 'tea'],
            es: ['boba', 'bubble tea', 'burbuja', 'leche', 'perla', 'té', 'té de burbujas'],
        },
    },
    {
        code: '🧃',
        name: {
            en: 'beverage_box',
            es: 'tetrabrik',
        },
        keywords: {
            en: ['beverage', 'box', 'juice', 'straw', 'sweet'],
            es: ['brick', 'cartón', 'envase', 'zumo', 'tetrabrik'],
        },
    },
    {
        code: '🧉',
        name: {
            en: 'mate_drink',
            es: 'bebida_de_mate',
        },
        keywords: {
            en: ['drink', 'mate'],
            es: ['bebida', 'infusión', 'mate'],
        },
    },
    {
        code: '🧊',
        name: {
            en: 'ice_cube',
            es: 'cubito_de_hielo',
        },
        keywords: {
            en: ['cold', 'ice cube', 'iceberg', 'ice'],
            es: ['frío', 'iceberg', 'cubito de hielo'],
        },
    },
    {
        code: '🥢',
        name: {
            en: 'chopsticks',
            es: 'palillos',
        },
        keywords: {
            en: ['hashi', 'chopsticks'],
            es: ['cubiertos', 'hashi', 'palillos'],
        },
    },
    {
        code: '🍽️',
        name: {
            en: 'knife_fork_plate',
            es: 'cuchillo_tenedor_plato',
        },
        keywords: {
            en: ['cooking', 'fork', 'knife', 'plate', 'fork and knife with plate'],
            es: ['cuchillo', 'plato', 'restaurante', 'tenedor', 'cuchillo y tenedor con un plato'],
        },
    },
    {
        code: '🍴',
        name: {
            en: 'fork_and_knife',
            es: 'cuchilo_y_tenedor',
        },
        keywords: {
            en: ['cooking', 'cutlery', 'fork', 'knife', 'fork and knife'],
            es: ['cuchillo', 'restaurante', 'tenedor', 'tenedor y cuchillo'],
        },
    },
    {
        code: '🥄',
        name: {
            en: 'spoon',
            es: 'cuchara',
        },
        keywords: {
            en: ['tableware', 'spoon'],
            es: ['cubiertos', 'cucharilla', 'cuchara'],
        },
    },
    {
        code: '🔪',
        name: {
            en: 'hocho',
            es: 'cuchillo_japonés',
        },
        keywords: {
            en: ['cooking', 'hocho', 'knife', 'tool', 'weapon', 'kitchen knife'],
            es: ['arma', 'cocinar', 'cuchillo', 'cuchillo de cocina'],
        },
    },
    {
        code: '🏺',
        name: {
            en: 'amphora',
            es: 'ánfora',
        },
        keywords: {
            en: ['Aquarius', 'cooking', 'drink', 'jug', 'zodiac', 'amphora'],
            es: ['acuario', 'beber', 'jarra', 'zodiaco', 'ánfora'],
        },
    },
    {
        code: 'travelAndPlaces',
        icon: TravelAndPlaces,
        header: true,
    },
    {
        code: '🌍',
        name: {
            en: 'earth_africa',
            es: 'tierra_áfrica',
        },
        keywords: {
            en: ['Africa', 'earth', 'Europe', 'globe', 'world', 'globe showing Europe-Africa'],
            es: ['África', 'Europa', 'mundo', 'planeta', 'Tierra', 'globo terráqueo mostrando Europa y África'],
        },
    },
    {
        code: '🌎',
        name: {
            en: 'earth_americas',
            es: 'tierra_américa',
        },
        keywords: {
            en: ['Americas', 'earth', 'globe', 'world', 'globe showing Americas'],
            es: ['América', 'globo', 'mundo', 'planeta', 'Tierra', 'globo terráqueo mostrando América'],
        },
    },
    {
        code: '🌏',
        name: {
            en: 'earth_asia',
            es: 'tierra_asia',
        },
        keywords: {
            en: ['Asia', 'Australia', 'earth', 'globe', 'world', 'globe showing Asia-Australia'],
            es: ['Asia', 'Australia', 'mundo', 'planeta', 'Tierra', 'globo terráqueo mostrando Asia y Australia'],
        },
    },
    {
        code: '🌐',
        name: {
            en: 'globe_with_meridians',
            es: 'globo_terráqueo_con_meridianos',
        },
        keywords: {
            en: ['earth', 'globe', 'meridians', 'world', 'globe with meridians'],
            es: ['globo', 'meridianos', 'mundo', 'Tierra', 'globo terráqueo con meridianos'],
        },
    },
    {
        code: '🗺️',
        name: {
            en: 'world_map',
            es: 'mapamundi',
        },
        keywords: {
            en: ['map', 'world'],
            es: ['mapa', 'mapamundi', 'mundo', 'mapa mundial'],
        },
    },
    {
        code: '🗾',
        name: {
            en: 'japan',
            es: 'japón',
        },
        keywords: {
            en: ['Japan', 'map', 'map of Japan'],
            es: ['Japón', 'mapa', 'mapa de japón', 'mapa de Japón'],
        },
    },
    {
        code: '🧭',
        name: {
            en: 'compass',
            es: 'brújula',
        },
        keywords: {
            en: ['magnetic', 'navigation', 'orienteering', 'compass'],
            es: ['compás', 'magnético', 'navegación', 'orientación', 'brújula'],
        },
    },
    {
        code: '🏔️',
        name: {
            en: 'snow_capped_mountain',
            es: 'montaña_con_cima_nevada',
        },
        keywords: {
            en: ['cold', 'mountain', 'snow', 'snow-capped mountain'],
            es: ['frío', 'montaña', 'nieve', 'montaña con nieve'],
        },
    },
    {
        code: '⛰️',
        name: {
            en: 'mountain',
            es: 'montaña',
        },
        keywords: {
            en: ['mountain'],
            es: ['monte', 'montaña'],
        },
    },
    {
        code: '🌋',
        name: {
            en: 'volcano',
            es: 'volcán',
        },
        keywords: {
            en: ['eruption', 'mountain', 'volcano'],
            es: ['erupción', 'erupción volcánica', 'volcán'],
        },
    },
    {
        code: '🗻',
        name: {
            en: 'mount_fuji',
            es: 'monte_fuji',
        },
        keywords: {
            en: ['fuji', 'mountain', 'mount fuji'],
            es: ['montaña', 'monte fuji', 'monte Fuji'],
        },
    },
    {
        code: '🏕️',
        name: {
            en: 'camping',
            es: 'campin',
        },
        keywords: {
            en: ['camping'],
            es: ['acampada', 'campamento', 'vacaciones', 'camping'],
        },
    },
    {
        code: '🏖️',
        name: {
            en: 'beach_with_umbrella',
            es: 'playa_con_sombrilla',
        },
        keywords: {
            en: ['beach', 'umbrella', 'beach with umbrella'],
            es: ['playa', 'sombrilla', 'playa y sombrilla'],
        },
    },
    {
        code: '🏜️',
        name: {
            en: 'desert',
            es: 'desierto',
        },
        keywords: {
            en: ['desert'],
            es: ['arena', 'desierto'],
        },
    },
    {
        code: '🏝️',
        name: {
            en: 'desert_island',
            es: 'isla_desierta',
        },
        keywords: {
            en: ['desert', 'island'],
            es: ['desierta', 'isla'],
        },
    },
    {
        code: '🏞️',
        name: {
            en: 'national_park',
            es: 'parque_nacional',
        },
        keywords: {
            en: ['park', 'national park'],
            es: ['nacional', 'parque'],
        },
    },
    {
        code: '🏟️',
        name: {
            en: 'stadium',
            es: 'estadio',
        },
        keywords: {
            en: ['stadium'],
            es: ['estadio'],
        },
    },
    {
        code: '🏛️',
        name: {
            en: 'classical_building',
            es: 'edificio_clásico',
        },
        keywords: {
            en: ['classical', 'classical building'],
            es: ['clásico', 'edificio'],
        },
    },
    {
        code: '🏗️',
        name: {
            en: 'building_construction',
            es: 'edificio_en_construcción',
        },
        keywords: {
            en: ['construction', 'building construction'],
            es: ['edificio', 'obra', 'construcción'],
        },
    },
    {
        code: '🧱',
        name: {
            en: 'bricks',
            es: 'ladrillos',
        },
        keywords: {
            en: ['bricks', 'clay', 'mortar', 'wall', 'brick'],
            es: ['arcilla', 'cemento', 'muro', 'pared', 'ladrillo'],
        },
    },
    {
        code: '🪨',
        name: {
            en: 'rock',
            es: 'roca',
        },
        keywords: {
            en: ['boulder', 'heavy', 'solid', 'stone', 'rock'],
            es: ['pedrusco', 'peña', 'peñasco', 'roca', 'piedra'],
        },
    },
    {
        code: '🪵',
        name: {
            en: 'wood',
            es: 'madera',
        },
        keywords: {
            en: ['log', 'lumber', 'timber', 'wood'],
            es: ['hoguera', 'leña', 'madero', 'palos', 'tronco', 'madera'],
        },
    },
    {
        code: '🛖',
        name: {
            en: 'hut',
            es: 'cabaña',
        },
        keywords: {
            en: ['house', 'roundhouse', 'yurt', 'hut'],
            es: ['casa', 'yurta', 'cabaña'],
        },
    },
    {
        code: '🏘️',
        name: {
            en: 'house_buildings',
            es: 'edificios_de_viviendas',
        },
        keywords: {
            en: ['houses'],
            es: ['edificio', 'urbanización', 'casas'],
        },
    },
    {
        code: '🏚️',
        name: {
            en: 'derelict_house_building',
            es: 'edificio_de_viviendas_en_ruinas',
        },
        keywords: {
            en: ['derelict', 'house'],
            es: ['abandonada', 'casa', 'deshabitada', 'inhabitada', 'vacía'],
        },
    },
    {
        code: '🏠',
        name: {
            en: 'house',
            es: 'casa',
        },
        keywords: {
            en: ['home', 'house'],
            es: ['vivienda', 'casa'],
        },
    },
    {
        code: '🏡',
        name: {
            en: 'house_with_garden',
            es: 'casa_con_jardín',
        },
        keywords: {
            en: ['garden', 'home', 'house', 'house with garden'],
            es: ['casa', 'construcción', 'jardín', 'vivienda', 'casa con jardín'],
        },
    },
    {
        code: '🏢',
        name: {
            en: 'office',
            es: 'oficina',
        },
        keywords: {
            en: ['building', 'office building'],
            es: ['construcción', 'edificio', 'oficinas', 'edificio de oficinas'],
        },
    },
    {
        code: '🏣',
        name: {
            en: 'post_office',
            es: 'oficina_postal',
        },
        keywords: {
            en: ['Japanese', 'post', 'Japanese post office'],
            es: ['correos', 'edificio', 'japón', 'oficina de correos', 'oficina de correos japonesa'],
        },
    },
    {
        code: '🏤',
        name: {
            en: 'european_post_office',
            es: 'oficina_de_correos_europea',
        },
        keywords: {
            en: ['European', 'post', 'post office'],
            es: ['correos', 'edificio', 'europa', 'oficina de correos', 'oficina de correos europea'],
        },
    },
    {
        code: '🏥',
        name: {
            en: 'hospital',
            es: 'hospital',
        },
        keywords: {
            en: ['doctor', 'medicine', 'hospital'],
            es: ['doctor', 'edificio', 'medicina', 'médico', 'hospital'],
        },
    },
    {
        code: '🏦',
        name: {
            en: 'bank',
            es: 'banco',
        },
        keywords: {
            en: ['building', 'bank'],
            es: ['banca', 'edificio', 'banco'],
        },
    },
    {
        code: '🏨',
        name: {
            en: 'hotel',
            es: 'hotel',
        },
        keywords: {
            en: ['building', 'hotel'],
            es: ['alojamiento', 'edificio', 'turismo', 'hotel'],
        },
    },
    {
        code: '🏩',
        name: {
            en: 'love_hotel',
            es: 'motel_para_parejas',
        },
        keywords: {
            en: ['hotel', 'love'],
            es: ['amor', 'edificio', 'hotel', 'hotel del amor'],
        },
    },
    {
        code: '🏪',
        name: {
            en: 'convenience_store',
            es: 'tienda_de_barrio',
        },
        keywords: {
            en: ['convenience', 'store'],
            es: ['edificio', 'establecimiento', 'tienda de comestibles', 'tienda 24 horas'],
        },
    },
    {
        code: '🏫',
        name: {
            en: 'school',
            es: 'colegio',
        },
        keywords: {
            en: ['building', 'school'],
            es: ['edificio', 'escuela', 'colegio'],
        },
    },
    {
        code: '🏬',
        name: {
            en: 'department_store',
            es: 'grandes_almacenes',
        },
        keywords: {
            en: ['department', 'store'],
            es: ['comercio', 'grandes almacenes'],
        },
    },
    {
        code: '🏭',
        name: {
            en: 'factory',
            es: 'fábrica',
        },
        keywords: {
            en: ['building', 'factory'],
            es: ['edificio', 'industria', 'fábrica'],
        },
    },
    {
        code: '🏯',
        name: {
            en: 'japanese_castle',
            es: 'castillo_japonés',
        },
        keywords: {
            en: ['castle', 'Japanese'],
            es: ['castillo', 'construcción', 'castillo japonés'],
        },
    },
    {
        code: '🏰',
        name: {
            en: 'european_castle',
            es: 'castillo_europeo',
        },
        keywords: {
            en: ['European', 'castle'],
            es: ['castillo', 'construcción', 'castillo europeo'],
        },
    },
    {
        code: '💒',
        name: {
            en: 'wedding',
            es: 'boda',
        },
        keywords: {
            en: ['chapel', 'romance', 'wedding'],
            es: ['boda', 'iglesia', 'romance', 'iglesia celebrando boda'],
        },
    },
    {
        code: '🗼',
        name: {
            en: 'tokyo_tower',
            es: 'torre_de_tokio',
        },
        keywords: {
            en: ['Tokyo', 'tower'],
            es: ['Tokio', 'torre', 'Torre de Tokio'],
        },
    },
    {
        code: '🗽',
        name: {
            en: 'statue_of_liberty',
            es: 'estatua_de_la_libertad',
        },
        keywords: {
            en: ['liberty', 'statue', 'Statue of Liberty'],
            es: ['estatua', 'estatua de la libertad', 'Estatua de la Libertad', 'libertad'],
        },
    },
    {
        code: '⛪',
        name: {
            en: 'church',
            es: 'iglesia',
        },
        keywords: {
            en: ['Christian', 'cross', 'religion', 'church'],
            es: ['cristianismo', 'cruz', 'edificio', 'religión', 'iglesia'],
        },
    },
    {
        code: '🕌',
        name: {
            en: 'mosque',
            es: 'mezquita',
        },
        keywords: {
            en: ['islam', 'Muslim', 'religion', 'mosque'],
            es: ['islam', 'religión', 'mezquita'],
        },
    },
    {
        code: '🛕',
        name: {
            en: 'hindu_temple',
            es: 'templo_hindú',
        },
        keywords: {
            en: ['hindu', 'temple'],
            es: ['hindú', 'templo'],
        },
    },
    {
        code: '🕍',
        name: {
            en: 'synagogue',
            es: 'sinagoga',
        },
        keywords: {
            en: ['Jew', 'Jewish', 'religion', 'temple', 'synagogue'],
            es: ['judaísmo', 'religión', 'sinagoga'],
        },
    },
    {
        code: '⛩️',
        name: {
            en: 'shinto_shrine',
            es: 'santuario_sintoísta',
        },
        keywords: {
            en: ['religion', 'shinto', 'shrine'],
            es: ['japón', 'religión', 'santuario', 'sintoísmo', 'santuario sintoísta'],
        },
    },
    {
        code: '🕋',
        name: {
            en: 'kaaba',
            es: 'kaaba',
        },
        keywords: {
            en: ['islam', 'Muslim', 'religion', 'kaaba'],
            es: ['islam', 'kaaba', 'Kaaba', 'religión'],
        },
    },
    {
        code: '⛲',
        name: {
            en: 'fountain',
            es: 'fuente',
        },
        keywords: {
            en: ['fountain'],
            es: ['fuente'],
        },
    },
    {
        code: '⛺',
        name: {
            en: 'tent',
            es: 'tienda_de_campaña',
        },
        keywords: {
            en: ['camping', 'tent'],
            es: ['campaña', 'camping', 'tienda', 'vacaciones', 'tienda de campaña'],
        },
    },
    {
        code: '🌁',
        name: {
            en: 'foggy',
            es: 'brumoso',
        },
        keywords: {
            en: ['fog', 'foggy'],
            es: ['niebla', 'bruma'],
        },
    },
    {
        code: '🌃',
        name: {
            en: 'night_with_stars',
            es: 'noche_estrellada',
        },
        keywords: {
            en: ['night', 'star', 'night with stars'],
            es: ['estrellas', 'noche', 'noche estrellada'],
        },
    },
    {
        code: '🏙️',
        name: {
            en: 'cityscape',
            es: 'paisaje_urbano',
        },
        keywords: {
            en: ['city', 'cityscape'],
            es: ['ciudad', 'edificio', 'paisaje', 'paisaje urbano'],
        },
    },
    {
        code: '🌄',
        name: {
            en: 'sunrise_over_mountains',
            es: 'amanecer_sobre_las_montañas',
        },
        keywords: {
            en: ['morning', 'mountain', 'sun', 'sunrise', 'sunrise over mountains'],
            es: ['amanecer', 'montaña', 'salida', 'sol', 'amanecer sobre montañas'],
        },
    },
    {
        code: '🌅',
        name: {
            en: 'sunrise',
            es: 'amanecer',
        },
        keywords: {
            en: ['morning', 'sun', 'sunrise'],
            es: ['salida del sol', 'amanecer'],
        },
    },
    {
        code: '🌆',
        name: {
            en: 'city_sunset',
            es: 'puesta_de_sol_urbana',
        },
        keywords: {
            en: ['city', 'dusk', 'evening', 'landscape', 'sunset', 'cityscape at dusk'],
            es: ['atardecer', 'ciudad', 'edificios', 'paisaje', 'ciudad al atardecer'],
        },
    },
    {
        code: '🌇',
        name: {
            en: 'city_sunrise',
            es: 'amanecer_urbano',
        },
        keywords: {
            en: ['dusk', 'sun', 'sunset'],
            es: ['edificios', 'puesta del sol'],
        },
    },
    {
        code: '🌉',
        name: {
            en: 'bridge_at_night',
            es: 'puente_de_noche',
        },
        keywords: {
            en: ['bridge', 'night', 'bridge at night'],
            es: ['noche', 'puente', 'puente de noche'],
        },
    },
    {
        code: '♨️',
        name: {
            en: 'hotsprings',
            es: 'aguas_termales',
        },
        keywords: {
            en: ['hot', 'hotsprings', 'springs', 'steaming'],
            es: ['termas', 'vapor', 'aguas termales'],
        },
    },
    {
        code: '🎠',
        name: {
            en: 'carousel_horse',
            es: 'caballito_de_carrusel',
        },
        keywords: {
            en: ['carousel', 'horse'],
            es: ['caballo', 'entretenimiento', 'tiovivo', 'caballo de tiovivo'],
        },
    },
    {
        code: '🎡',
        name: {
            en: 'ferris_wheel',
            es: 'noria',
        },
        keywords: {
            en: ['amusement park', 'ferris', 'wheel'],
            es: ['atracciones', 'entretenimiento', 'feria', 'noria', 'noria de feria'],
        },
    },
    {
        code: '🎢',
        name: {
            en: 'roller_coaster',
            es: 'montaña_rusa',
        },
        keywords: {
            en: ['amusement park', 'coaster', 'roller'],
            es: ['atracciones', 'entretenimiento', 'feria', 'parque', 'montaña rusa'],
        },
    },
    {
        code: '💈',
        name: {
            en: 'barber',
            es: 'barbero',
        },
        keywords: {
            en: ['barber', 'haircut', 'pole'],
            es: ['barbería', 'barbero', 'peluquero', 'poste', 'poste de barbero'],
        },
    },
    {
        code: '🎪',
        name: {
            en: 'circus_tent',
            es: 'carpa_de_circo',
        },
        keywords: {
            en: ['circus', 'tent'],
            es: ['carpa', 'circo', 'entretenimiento', 'carpa de circo'],
        },
    },
    {
        code: '🚂',
        name: {
            en: 'steam_locomotive',
            es: 'locomotora_de_vapor',
        },
        keywords: {
            en: ['engine', 'railway', 'steam', 'train', 'locomotive'],
            es: ['locomotora', 'tren', 'vehículo', 'locomotora de vapor'],
        },
    },
    {
        code: '🚃',
        name: {
            en: 'railway_car',
            es: 'vagón',
        },
        keywords: {
            en: ['car', 'electric', 'railway', 'train', 'tram', 'trolleybus'],
            es: ['ferrocarril', 'tranvía', 'tren eléctrico', 'vehículo', 'vagón'],
        },
    },
    {
        code: '🚄',
        name: {
            en: 'bullettrain_side',
            es: 'tren_bala_de_lado',
        },
        keywords: {
            en: ['railway', 'shinkansen', 'speed', 'train', 'high-speed train'],
            es: ['AVE', 'ferrocarril', 'rápido', 'tren', 'velocidad', 'tren de alta velocidad'],
        },
    },
    {
        code: '🚅',
        name: {
            en: 'bullettrain_front',
            es: 'tren_bala_de_frente',
        },
        keywords: {
            en: ['bullet', 'railway', 'shinkansen', 'speed', 'train'],
            es: ['bala', 'shinkansen', 'tren', 'vehículo', 'velocidad'],
        },
    },
    {
        code: '🚆',
        name: {
            en: 'train2',
            es: 'tren2',
        },
        keywords: {
            en: ['railway', 'train'],
            es: ['ferrocarril', 'vehículo', 'tren'],
        },
    },
    {
        code: '🚇',
        name: {
            en: 'metro',
            es: 'metro',
        },
        keywords: {
            en: ['subway', 'metro'],
            es: ['subterráneo', 'suburbano', 'transporte', 'metro'],
        },
    },
    {
        code: '🚈',
        name: {
            en: 'light_rail',
            es: 'tren_ligero',
        },
        keywords: {
            en: ['railway', 'light rail'],
            es: ['ferrocarril', 'transporte', 'tren', 'tren ligero'],
        },
    },
    {
        code: '🚉',
        name: {
            en: 'station',
            es: 'estación',
        },
        keywords: {
            en: ['railway', 'train', 'station'],
            es: ['estación', 'tren', 'estación de tren'],
        },
    },
    {
        code: '🚊',
        name: {
            en: 'tram',
            es: 'tranvía',
        },
        keywords: {
            en: ['trolleybus', 'tram'],
            es: ['transporte', 'trolebús', 'tranvía'],
        },
    },
    {
        code: '🚝',
        name: {
            en: 'monorail',
            es: 'monorraíl',
        },
        keywords: {
            en: ['vehicle', 'monorail'],
            es: ['ferrocarril', 'monocarril', 'transporte', 'tren', 'monorraíl'],
        },
    },
    {
        code: '🚞',
        name: {
            en: 'mountain_railway',
            es: 'tren_de_montaña',
        },
        keywords: {
            en: ['car', 'mountain', 'railway'],
            es: ['ferrocarril', 'montaña', 'vehículo', 'ferrocarril de montaña'],
        },
    },
    {
        code: '🚋',
        name: {
            en: 'train',
            es: 'tren',
        },
        keywords: {
            en: ['car', 'tram', 'trolleybus'],
            es: ['tranvía', 'vagón', 'vehículo', 'vagón de tranvía'],
        },
    },
    {
        code: '🚌',
        name: {
            en: 'bus',
            es: 'autobús',
        },
        keywords: {
            en: ['vehicle', 'bus'],
            es: ['bus', 'transporte', 'autobús'],
        },
    },
    {
        code: '🚍',
        name: {
            en: 'oncoming_bus',
            es: 'bus_en_sentido_contrario',
        },
        keywords: {
            en: ['bus', 'oncoming'],
            es: ['autobús', 'próximo', 'vehículo'],
        },
    },
    {
        code: '🚎',
        name: {
            en: 'trolleybus',
            es: 'trolebús',
        },
        keywords: {
            en: ['bus', 'tram', 'trolley', 'trolleybus'],
            es: ['transporte', 'tranvía', 'trolebús'],
        },
    },
    {
        code: '🚐',
        name: {
            en: 'minibus',
            es: 'microbús',
        },
        keywords: {
            en: ['bus', 'minibus'],
            es: ['autobús', 'bus', 'transporte', 'minibús'],
        },
    },
    {
        code: '🚑',
        name: {
            en: 'ambulance',
            es: 'ambulancia',
        },
        keywords: {
            en: ['vehicle', 'ambulance'],
            es: ['asistencia médica', 'transporte', 'vehículo', 'ambulancia'],
        },
    },
    {
        code: '🚒',
        name: {
            en: 'fire_engine',
            es: 'camión_de_bomberos',
        },
        keywords: {
            en: ['engine', 'fire', 'truck'],
            es: ['camión', 'camión de bomberos', 'fuego', 'vehículo', 'coche de bomberos'],
        },
    },
    {
        code: '🚓',
        name: {
            en: 'police_car',
            es: 'coche_patrulla',
        },
        keywords: {
            en: ['car', 'patrol', 'police'],
            es: ['coche patrulla', 'policía', 'vehículo', 'coche de policía'],
        },
    },
    {
        code: '🚔',
        name: {
            en: 'oncoming_police_car',
            es: 'coche_de_policía_en_sentido_contrario',
        },
        keywords: {
            en: ['car', 'oncoming', 'police'],
            es: ['coche patrulla', 'policía', 'próximo', 'vehículo', 'coche de policía próximo'],
        },
    },
    {
        code: '🚕',
        name: {
            en: 'taxi',
            es: 'taxi',
        },
        keywords: {
            en: ['vehicle', 'taxi'],
            es: ['coche', 'vehículo', 'taxi'],
        },
    },
    {
        code: '🚖',
        name: {
            en: 'oncoming_taxi',
            es: 'taxi_en_sentido_contrario',
        },
        keywords: {
            en: ['oncoming', 'taxi'],
            es: ['taxi', 'vehículo', 'taxi próximo'],
        },
    },
    {
        code: '🚗',
        name: {
            en: 'car',
            es: 'coche',
        },
        keywords: {
            en: ['car', 'automobile'],
            es: ['automóvil', 'vehículo', 'coche'],
        },
    },
    {
        code: '🚘',
        name: {
            en: 'oncoming_automobile',
            es: 'automóvil_en_sentido_contrario',
        },
        keywords: {
            en: ['automobile', 'car', 'oncoming'],
            es: ['automóvil', 'coche', 'próximo', 'vehículo'],
        },
    },
    {
        code: '🚙',
        name: {
            en: 'blue_car',
            es: 'coche_azul',
        },
        keywords: {
            en: ['recreational', 'sport utility', 'sport utility vehicle'],
            es: ['camping', 'caravana', 'furgoneta', 'vacaciones', 'vehículo', 'vehículo deportivo utilitario'],
        },
    },
    {
        code: '🛻',
        name: {
            en: 'pickup_truck',
            es: 'camioneta',
        },
        keywords: {
            en: ['pick-up', 'pickup', 'truck'],
            es: ['pickup', 'ranchera', 'camioneta'],
        },
    },
    {
        code: '🚚',
        name: {
            en: 'truck',
            es: 'camión',
        },
        keywords: {
            en: ['delivery', 'truck'],
            es: ['mercancías', 'reparto', 'transporte', 'vehículo', 'camión de reparto'],
        },
    },
    {
        code: '🚛',
        name: {
            en: 'articulated_lorry',
            es: 'camión_articulado',
        },
        keywords: {
            en: ['lorry', 'semi', 'truck', 'articulated lorry'],
            es: ['camión', 'tráiler', 'vehículo', 'camión articulado'],
        },
    },
    {
        code: '🚜',
        name: {
            en: 'tractor',
            es: 'tractor',
        },
        keywords: {
            en: ['vehicle', 'tractor'],
            es: ['agricultura', 'vehículo', 'tractor'],
        },
    },
    {
        code: '🏎️',
        name: {
            en: 'racing_car',
            es: 'coche_de_carreras',
        },
        keywords: {
            en: ['car', 'racing'],
            es: ['carreras', 'coche', 'coche de carreras'],
        },
    },
    {
        code: '🏍️',
        name: {
            en: 'racing_motorcycle',
            es: 'moto_de_carreras',
        },
        keywords: {
            en: ['racing', 'motorcycle'],
            es: ['carreras', 'motocicleta', 'vehículo', 'moto'],
        },
    },
    {
        code: '🛵',
        name: {
            en: 'motor_scooter',
            es: 'vespa',
        },
        keywords: {
            en: ['motor', 'scooter'],
            es: ['escúter', 'moto', 'scooter'],
        },
    },
    {
        code: '🦽',
        name: {
            en: 'manual_wheelchair',
            es: 'silla_de_ruedas_manual',
        },
        keywords: {
            en: ['accessibility', 'manual wheelchair'],
            es: ['accesibilidad', 'silla de ruedas manual'],
        },
    },
    {
        code: '🦼',
        name: {
            en: 'motorized_wheelchair',
            es: 'silla_de_ruedas_eléctrica',
        },
        keywords: {
            en: ['accessibility', 'motorized wheelchair'],
            es: ['accesibilidad', 'silla de ruedas eléctrica'],
        },
    },
    {
        code: '🛺',
        name: {
            en: 'auto_rickshaw',
            es: 'mototaxi',
        },
        keywords: {
            en: ['tuk tuk', 'auto rickshaw'],
            es: ['rickshaw', 'tuk tuk', 'mototaxi'],
        },
    },
    {
        code: '🚲',
        name: {
            en: 'bike',
            es: 'bicicleta',
        },
        keywords: {
            en: ['bike', 'bicycle'],
            es: ['bici', 'vehículo', 'bicicleta'],
        },
    },
    {
        code: '🛴',
        name: {
            en: 'scooter',
            es: 'patinete',
        },
        keywords: {
            en: ['kick', 'scooter'],
            es: ['patinete'],
        },
    },
    {
        code: '🛹',
        name: {
            en: 'skateboard',
            es: 'monopatín',
        },
        keywords: {
            en: ['board', 'skateboard'],
            es: ['skateboard', 'tabla', 'monopatín'],
        },
    },
    {
        code: '🛼',
        name: {
            en: 'roller_skate',
            es: 'patines',
        },
        keywords: {
            en: ['roller', 'skate'],
            es: ['patín', 'patín de 4 ruedas', 'patín de cuatro ruedas', 'patines'],
        },
    },
    {
        code: '🚏',
        name: {
            en: 'busstop',
            es: 'parada_de_autobús',
        },
        keywords: {
            en: ['bus', 'stop'],
            es: ['autobús', 'parada', 'parada de autobús'],
        },
    },
    {
        code: '🛣️',
        name: {
            en: 'motorway',
            es: 'autopista',
        },
        keywords: {
            en: ['highway', 'road', 'motorway'],
            es: ['carretera', 'autopista'],
        },
    },
    {
        code: '🛤️',
        name: {
            en: 'railway_track',
            es: 'vía_de_tren',
        },
        keywords: {
            en: ['railway', 'train', 'railway track'],
            es: ['tren', 'vía', 'vía de tren'],
        },
    },
    {
        code: '🛢️',
        name: {
            en: 'oil_drum',
            es: 'barril_de_petróleo',
        },
        keywords: {
            en: ['drum', 'oil'],
            es: ['barril', 'bidón', 'petróleo', 'barril de petróleo'],
        },
    },
    {
        code: '⛽',
        name: {
            en: 'fuelpump',
            es: 'surtidor_de_gasolina',
        },
        keywords: {
            en: ['diesel', 'fuel', 'fuelpump', 'gas', 'pump', 'station'],
            es: ['bomba de gasolina', 'combustible', 'gasolina', 'surtidor', 'surtidor de gasolina'],
        },
    },
    {
        code: '🚨',
        name: {
            en: 'rotating_light',
            es: 'luz_giratoria',
        },
        keywords: {
            en: ['beacon', 'car', 'light', 'police', 'revolving'],
            es: ['coche de policía', 'luces', 'policía', 'luces de policía'],
        },
    },
    {
        code: '🚥',
        name: {
            en: 'traffic_light',
            es: 'semáforo',
        },
        keywords: {
            en: ['light', 'signal', 'traffic', 'horizontal traffic light'],
            es: ['luz', 'señales de tráfico', 'tráfico', 'semáforo horizontal'],
        },
    },
    {
        code: '🚦',
        name: {
            en: 'vertical_traffic_light',
            es: 'semáforo_vertical',
        },
        keywords: {
            en: ['light', 'signal', 'traffic', 'vertical traffic light'],
            es: ['luz', 'semáforo vertical', 'señales de tráfico', 'tráfico', 'semáforo'],
        },
    },
    {
        code: '🛑',
        name: {
            en: 'octagonal_sign',
            es: 'señal_octogonal',
        },
        keywords: {
            en: ['octagonal', 'sign', 'stop'],
            es: ['octágono', 'parada', 'señal', 'stop', 'señal de stop'],
        },
    },
    {
        code: '🚧',
        name: {
            en: 'construction',
            es: 'construcción',
        },
        keywords: {
            en: ['barrier', 'construction'],
            es: ['construcción', 'señal', 'señal de obras', 'obras'],
        },
    },
    {
        code: '⚓',
        name: {
            en: 'anchor',
            es: 'ancla',
        },
        keywords: {
            en: ['ship', 'tool', 'anchor'],
            es: ['barco', 'gancho', 'ancla'],
        },
    },
    {
        code: '⛵',
        name: {
            en: 'boat',
            es: 'barco_de_vela',
        },
        keywords: {
            en: ['boat', 'resort', 'sea', 'yacht', 'sailboat'],
            es: ['barco', 'barco de vela', 'yate', 'velero'],
        },
    },
    {
        code: '🛶',
        name: {
            en: 'canoe',
            es: 'canoa',
        },
        keywords: {
            en: ['boat', 'canoe'],
            es: ['barca', 'barco', 'piragua', 'canoa'],
        },
    },
    {
        code: '🚤',
        name: {
            en: 'speedboat',
            es: 'lancha_rápida',
        },
        keywords: {
            en: ['boat', 'speedboat'],
            es: ['barco', 'vehículo', 'lancha motora'],
        },
    },
    {
        code: '🛳️',
        name: {
            en: 'passenger_ship',
            es: 'barco_de_pasajeros',
        },
        keywords: {
            en: ['passenger', 'ship'],
            es: ['barco', 'pasajeros', 'vehículo', 'barco de pasajeros'],
        },
    },
    {
        code: '⛴️',
        name: {
            en: 'ferry',
            es: 'ferri',
        },
        keywords: {
            en: ['boat', 'passenger', 'ferry'],
            es: ['barco', 'ferry', 'ferri'],
        },
    },
    {
        code: '🛥️',
        name: {
            en: 'motor_boat',
            es: 'motora',
        },
        keywords: {
            en: ['boat', 'motorboat', 'motor boat'],
            es: ['barco', 'motor', 'vehículo', 'barco a motor'],
        },
    },
    {
        code: '🚢',
        name: {
            en: 'ship',
            es: 'barco',
        },
        keywords: {
            en: ['boat', 'passenger', 'ship'],
            es: ['vehículo', 'barco'],
        },
    },
    {
        code: '✈️',
        name: {
            en: 'airplane',
            es: 'avión',
        },
        keywords: {
            en: ['aeroplane', 'airplane'],
            es: ['aeroplano', 'avión'],
        },
    },
    {
        code: '🛩️',
        name: {
            en: 'small_airplane',
            es: 'avioneta',
        },
        keywords: {
            en: ['aeroplane', 'airplane', 'small airplane'],
            es: ['avión', 'avioneta'],
        },
    },
    {
        code: '🛫',
        name: {
            en: 'airplane_departure',
            es: 'avión_despegando',
        },
        keywords: {
            en: ['aeroplane', 'airplane', 'check-in', 'departure', 'departures'],
            es: ['aeroplano', 'avión', 'salida', 'avión despegando'],
        },
    },
    {
        code: '🛬',
        name: {
            en: 'airplane_arriving',
            es: 'avión_aterrizando',
        },
        keywords: {
            en: ['aeroplane', 'airplane', 'arrivals', 'arriving', 'landing', 'airplane arrival'],
            es: ['aeroplano', 'avión', 'llegada', 'avión aterrizando'],
        },
    },
    {
        code: '🪂',
        name: {
            en: 'parachute',
            es: 'paracaídas',
        },
        keywords: {
            en: ['hang-glide', 'parasail', 'skydive', 'parachute'],
            es: ['ala delta', 'paracaidismo', 'paravela', 'volar', 'paracaídas'],
        },
    },
    {
        code: '💺',
        name: {
            en: 'seat',
            es: 'asiento',
        },
        keywords: {
            en: ['chair', 'seat'],
            es: ['asiento', 'plaza', 'silla', 'asiento de transporte'],
        },
    },
    {
        code: '🚁',
        name: {
            en: 'helicopter',
            es: 'helicóptero',
        },
        keywords: {
            en: ['vehicle', 'helicopter'],
            es: ['aspas', 'rotores', 'vehículo', 'volar', 'helicóptero'],
        },
    },
    {
        code: '🚟',
        name: {
            en: 'suspension_railway',
            es: 'tren_colgante',
        },
        keywords: {
            en: ['railway', 'suspension'],
            es: ['ferrocarril', 'suspensión', 'vehículo', 'ferrocarril de suspensión'],
        },
    },
    {
        code: '🚠',
        name: {
            en: 'mountain_cableway',
            es: 'funicular_de_montaña',
        },
        keywords: {
            en: ['cable', 'gondola', 'mountain', 'mountain cableway'],
            es: ['cable', 'funicular', 'montaña', 'teleférico', 'vehículo', 'teleférico de montaña'],
        },
    },
    {
        code: '🚡',
        name: {
            en: 'aerial_tramway',
            es: 'teleférico',
        },
        keywords: {
            en: ['aerial', 'cable', 'car', 'gondola', 'tramway'],
            es: ['aéreo', 'tranvía', 'vehículo', 'teleférico'],
        },
    },
    {
        code: '🛰️',
        name: {
            en: 'satellite',
            es: 'satélite',
        },
        keywords: {
            en: ['space', 'satellite'],
            es: ['espacio', 'vehículo', 'satélite'],
        },
    },
    {
        code: '🚀',
        name: {
            en: 'rocket',
            es: 'cohete',
        },
        keywords: {
            en: ['space', 'rocket'],
            es: ['espacio', 'vehículo', 'cohete'],
        },
    },
    {
        code: '🛸',
        name: {
            en: 'flying_saucer',
            es: 'platillo_volante',
        },
        keywords: {
            en: ['UFO', 'flying saucer'],
            es: ['ovni', 'platillo volante'],
        },
    },
    {
        code: '🛎️',
        name: {
            en: 'bellhop_bell',
            es: 'timbre_de_hotel',
        },
        keywords: {
            en: ['bell', 'bellhop', 'hotel'],
            es: ['botones', 'campanilla', 'hotel', 'timbre', 'timbre de hotel'],
        },
    },
    {
        code: '🧳',
        name: {
            en: 'luggage',
            es: 'equipaje',
        },
        keywords: {
            en: ['packing', 'travel', 'luggage'],
            es: ['maleta', 'viajar', 'equipaje'],
        },
    },
    {
        code: '⌛',
        name: {
            en: 'hourglass',
            es: 'reloj_de_arena',
        },
        keywords: {
            en: ['sand', 'timer', 'hourglass done'],
            es: ['arena', 'reloj', 'temporizador', 'reloj de arena sin tiempo'],
        },
    },
    {
        code: '⏳',
        name: {
            en: 'hourglass_flowing_sand',
            es: 'reloj_de_arena_en_marcha',
        },
        keywords: {
            en: ['hourglass', 'sand', 'timer', 'hourglass not done'],
            es: ['reloj con arena cayendo', 'temporizador', 'reloj de arena con tiempo'],
        },
    },
    {
        code: '⌚',
        name: {
            en: 'watch',
            es: 'reloj',
        },
        keywords: {
            en: ['clock', 'watch'],
            es: ['reloj'],
        },
    },
    {
        code: '⏰',
        name: {
            en: 'alarm_clock',
            es: 'reloj_de_alarma',
        },
        keywords: {
            en: ['alarm', 'clock'],
            es: ['alarma', 'despertador', 'reloj'],
        },
    },
    {
        code: '⏱️',
        name: {
            en: 'stopwatch',
            es: 'cronómetro',
        },
        keywords: {
            en: ['clock', 'stopwatch'],
            es: ['reloj', 'cronómetro'],
        },
    },
    {
        code: '⏲️',
        name: {
            en: 'timer_clock',
            es: 'temporizador',
        },
        keywords: {
            en: ['clock', 'timer'],
            es: ['reloj', 'temporizador'],
        },
    },
    {
        code: '🕰️',
        name: {
            en: 'mantelpiece_clock',
            es: 'reloj_de_repisa',
        },
        keywords: {
            en: ['clock', 'mantelpiece clock'],
            es: ['reloj', 'sobremesa', 'reloj de sobremesa'],
        },
    },
    {
        code: '🕛',
        name: {
            en: 'clock12',
            es: 'reloj12',
        },
        keywords: {
            en: ['00', '12', '12:00', 'clock', 'o’clock', 'twelve'],
            es: ['12:00', 'doce', 'reloj', '12 en punto'],
        },
    },
    {
        code: '🕧',
        name: {
            en: 'clock1230',
            es: 'reloj1230',
        },
        keywords: {
            en: ['12', '12:30', 'clock', 'thirty', 'twelve', 'twelve-thirty'],
            es: ['12:30', 'reloj', 'doce y media'],
        },
    },
    {
        code: '🕐',
        name: {
            en: 'clock1',
            es: 'reloj1',
        },
        keywords: {
            en: ['00', 'clock', 'o’clock', 'one', '1  1:00'],
            es: ['reloj', 'una', '1 en punto  1:00'],
        },
    },
    {
        code: '🕜',
        name: {
            en: 'clock130',
            es: 'reloj130',
        },
        keywords: {
            en: ['1:30', 'clock', 'one', 'thirty', '1', 'one-thirty'],
            es: ['1:30', 'reloj', 'una y media'],
        },
    },
    {
        code: '🕑',
        name: {
            en: 'clock2',
            es: 'reloj2',
        },
        keywords: {
            en: ['00', '2', '2:00', 'clock', 'o’clock', 'two'],
            es: ['2:00', 'dos', 'reloj', '2 en punto'],
        },
    },
    {
        code: '🕝',
        name: {
            en: 'clock230',
            es: 'reloj230',
        },
        keywords: {
            en: ['2', '2:30', 'clock', 'thirty', 'two', 'two-thirty'],
            es: ['2:30', 'reloj', 'dos y media'],
        },
    },
    {
        code: '🕒',
        name: {
            en: 'clock3',
            es: 'reloj3',
        },
        keywords: {
            en: ['00', '3', '3:00', 'clock', 'o’clock', 'three'],
            es: ['3:00', 'reloj', 'tres', '3 en punto'],
        },
    },
    {
        code: '🕞',
        name: {
            en: 'clock330',
            es: 'reloj330',
        },
        keywords: {
            en: ['3', '3:30', 'clock', 'thirty', 'three', 'three-thirty'],
            es: ['3:30', 'reloj', 'tres y media'],
        },
    },
    {
        code: '🕓',
        name: {
            en: 'clock4',
            es: 'reloj4',
        },
        keywords: {
            en: ['00', '4', '4:00', 'clock', 'four', 'o’clock'],
            es: ['4:00', 'cuatro', 'reloj', '4 en punto'],
        },
    },
    {
        code: '🕟',
        name: {
            en: 'clock430',
            es: 'reloj430',
        },
        keywords: {
            en: ['4', '4:30', 'clock', 'four', 'thirty', 'four-thirty'],
            es: ['4:30', 'reloj', 'cuatro y media'],
        },
    },
    {
        code: '🕔',
        name: {
            en: 'clock5',
            es: 'reloj5',
        },
        keywords: {
            en: ['00', '5', '5:00', 'clock', 'five', 'o’clock'],
            es: ['5:00', 'cinco', 'reloj', '5 en punto'],
        },
    },
    {
        code: '🕠',
        name: {
            en: 'clock530',
            es: 'reloj530',
        },
        keywords: {
            en: ['5', '5:30', 'clock', 'five', 'thirty', 'five-thirty'],
            es: ['5:30', 'reloj', 'cinco y media'],
        },
    },
    {
        code: '🕕',
        name: {
            en: 'clock6',
            es: 'reloj6',
        },
        keywords: {
            en: ['00', '6', '6:00', 'clock', 'o’clock', 'six'],
            es: ['6:00', 'reloj', 'seis', '6 en punto'],
        },
    },
    {
        code: '🕡',
        name: {
            en: 'clock630',
            es: 'reloj630',
        },
        keywords: {
            en: ['6', '6:30', 'clock', 'six', 'thirty', 'six-thirty'],
            es: ['6:30', 'reloj', 'seis y media'],
        },
    },
    {
        code: '🕖',
        name: {
            en: 'clock7',
            es: 'reloj7',
        },
        keywords: {
            en: ['00', '7', '7:00', 'clock', 'o’clock', 'seven'],
            es: ['7:00', 'reloj', 'siete', '7 en punto'],
        },
    },
    {
        code: '🕢',
        name: {
            en: 'clock730',
            es: 'reloj730',
        },
        keywords: {
            en: ['7', '7:30', 'clock', 'seven', 'thirty', 'seven-thirty'],
            es: ['7:30', 'reloj', 'siete y media'],
        },
    },
    {
        code: '🕗',
        name: {
            en: 'clock8',
            es: 'reloj8',
        },
        keywords: {
            en: ['00', '8', '8:00', 'clock', 'eight', 'o’clock'],
            es: ['8:00', 'ocho', 'reloj', '8 en punto'],
        },
    },
    {
        code: '🕣',
        name: {
            en: 'clock830',
            es: 'reloj830',
        },
        keywords: {
            en: ['8', '8:30', 'clock', 'eight', 'thirty', 'eight-thirty'],
            es: ['8:30', 'reloj', 'ocho y media'],
        },
    },
    {
        code: '🕘',
        name: {
            en: 'clock9',
            es: 'reloj9',
        },
        keywords: {
            en: ['00', '9', '9:00', 'clock', 'nine', 'o’clock'],
            es: ['9:00', 'nueve', 'reloj', '9 en punto'],
        },
    },
    {
        code: '🕤',
        name: {
            en: 'clock930',
            es: 'reloj930',
        },
        keywords: {
            en: ['9', '9:30', 'clock', 'nine', 'thirty', 'nine-thirty'],
            es: ['9:30', 'reloj', 'nueve y media'],
        },
    },
    {
        code: '🕙',
        name: {
            en: 'clock10',
            es: 'reloj10',
        },
        keywords: {
            en: ['00', '10', '10:00', 'clock', 'o’clock', 'ten'],
            es: ['10:00', 'diez', 'reloj', '10 en punto'],
        },
    },
    {
        code: '🕥',
        name: {
            en: 'clock1030',
            es: 'reloj1030',
        },
        keywords: {
            en: ['10', '10:30', 'clock', 'ten', 'thirty', 'ten-thirty'],
            es: ['10:30', 'reloj', 'diez y media'],
        },
    },
    {
        code: '🕚',
        name: {
            en: 'clock11',
            es: 'reloj11',
        },
        keywords: {
            en: ['00', '11', '11:00', 'clock', 'eleven', 'o’clock'],
            es: ['11:00', 'once', 'reloj', '11 en punto'],
        },
    },
    {
        code: '🕦',
        name: {
            en: 'clock1130',
            es: 'reloj1130',
        },
        keywords: {
            en: ['11', '11:30', 'clock', 'eleven', 'thirty', 'eleven-thirty'],
            es: ['11:30', 'reloj', 'once y media'],
        },
    },
    {
        code: '🌑',
        name: {
            en: 'new_moon',
            es: 'luna_nueva',
        },
        keywords: {
            en: ['dark', 'moon', 'new moon'],
            es: ['luna', 'oscuridad', 'luna nueva'],
        },
    },
    {
        code: '🌒',
        name: {
            en: 'waxing_crescent_moon',
            es: 'luna_nueva_visible',
        },
        keywords: {
            en: ['crescent', 'moon', 'waxing'],
            es: ['creciente', 'cuarto', 'espacio', 'luna'],
        },
    },
    {
        code: '🌓',
        name: {
            en: 'first_quarter_moon',
            es: 'luna_en_cuarto_creciente',
        },
        keywords: {
            en: ['moon', 'quarter', 'first quarter moon'],
            es: ['creciente', 'cuarto', 'espacio', 'luna', 'luna en cuarto creciente'],
        },
    },
    {
        code: '🌔',
        name: {
            en: 'moon',
            es: 'luna',
        },
        keywords: {
            en: ['gibbous', 'moon', 'waxing'],
            es: ['creciente', 'gibosa', 'luna'],
        },
    },
    {
        code: '🌕',
        name: {
            en: 'full_moon',
            es: 'luna_llena',
        },
        keywords: {
            en: ['full', 'moon'],
            es: ['llena', 'luna', 'plenilunio'],
        },
    },
    {
        code: '🌖',
        name: {
            en: 'waning_gibbous_moon',
            es: 'luna_gibosa_menguante',
        },
        keywords: {
            en: ['gibbous', 'moon', 'waning'],
            es: ['gibosa', 'luna', 'menguante'],
        },
    },
    {
        code: '🌗',
        name: {
            en: 'last_quarter_moon',
            es: 'luna_en_cuarto_menguante',
        },
        keywords: {
            en: ['moon', 'quarter', 'last quarter moon'],
            es: ['cuarto', 'luna', 'menguante', 'luna en cuarto menguante'],
        },
    },
    {
        code: '🌘',
        name: {
            en: 'waning_crescent_moon',
            es: 'luna_menguante',
        },
        keywords: {
            en: ['crescent', 'moon', 'waning'],
            es: ['luna', 'menguante'],
        },
    },
    {
        code: '🌙',
        name: {
            en: 'crescent_moon',
            es: 'luna_creciente',
        },
        keywords: {
            en: ['crescent', 'moon'],
            es: ['creciente', 'espacio', 'luna'],
        },
    },
    {
        code: '🌚',
        name: {
            en: 'new_moon_with_face',
            es: 'luna_nueva_con_cara',
        },
        keywords: {
            en: ['face', 'moon', 'new moon face'],
            es: ['cara', 'espacio', 'luna', 'luna nueva con cara'],
        },
    },
    {
        code: '🌛',
        name: {
            en: 'first_quarter_moon_with_face',
            es: 'luna_en_cuarto_creciente_con_cara',
        },
        keywords: {
            en: ['face', 'moon', 'quarter', 'first quarter moon face'],
            es: ['cara', 'creciente', 'cuarto', 'espacio', 'luna', 'luna de cuarto creciente con cara'],
        },
    },
    {
        code: '🌜',
        name: {
            en: 'last_quarter_moon_with_face',
            es: 'luna_en_cuarto_menguante_con_cara',
        },
        keywords: {
            en: ['face', 'moon', 'quarter', 'last quarter moon face'],
            es: ['cara', 'creciente', 'cuarto', 'espacio', 'luna', 'luna de cuarto menguante con cara'],
        },
    },
    {
        code: '🌡️',
        name: {
            en: 'thermometer',
            es: 'termómetro',
        },
        keywords: {
            en: ['weather', 'thermometer'],
            es: ['temperatura', 'termómetro'],
        },
    },
    {
        code: '☀️',
        name: {
            en: 'sunny',
            es: 'soleado',
        },
        keywords: {
            en: ['bright', 'rays', 'sunny', 'sun'],
            es: ['espacio', 'rayos', 'soleado', 'sol'],
        },
    },
    {
        code: '🌝',
        name: {
            en: 'full_moon_with_face',
            es: 'luna_llena_con_cara',
        },
        keywords: {
            en: ['bright', 'face', 'full', 'moon'],
            es: ['cara', 'llena', 'luna', 'luna llena con cara'],
        },
    },
    {
        code: '🌞',
        name: {
            en: 'sun_with_face',
            es: 'sol_con_cara',
        },
        keywords: {
            en: ['bright', 'face', 'sun', 'sun with face'],
            es: ['brillante', 'cara', 'sol', 'sol con cara'],
        },
    },
    {
        code: '🪐',
        name: {
            en: 'ringed_planet',
            es: 'planeta_con_anillos',
        },
        keywords: {
            en: ['saturn', 'saturnine', 'ringed planet'],
            es: ['saturnino', 'saturno', 'planeta con anillos'],
        },
    },
    {
        code: '⭐',
        name: {
            en: 'star',
            es: 'estrella',
        },
        keywords: {
            en: ['star'],
            es: ['estelar  estrella'],
        },
    },
    {
        code: '🌟',
        name: {
            en: 'star2',
            es: 'estrella2',
        },
        keywords: {
            en: ['glittery', 'glow', 'shining', 'sparkle', 'star', 'glowing star'],
            es: ['brillante', 'estrella', 'resplandeciente'],
        },
    },
    {
        code: '🌠',
        name: {
            en: 'stars',
            es: 'estrellas',
        },
        keywords: {
            en: ['falling', 'shooting', 'star'],
            es: ['estrella', 'lluvia', 'estrella fugaz'],
        },
    },
    {
        code: '🌌',
        name: {
            en: 'milky_way',
            es: 'vía_láctea',
        },
        keywords: {
            en: ['space', 'milky way'],
            es: ['espacio', 'galaxia', 'vía láctea', 'Vía Láctea'],
        },
    },
    {
        code: '☁️',
        name: {
            en: 'cloud',
            es: 'nube',
        },
        keywords: {
            en: ['weather', 'cloud'],
            es: ['tiempo', 'nube'],
        },
    },
    {
        code: '⛅',
        name: {
            en: 'partly_sunny',
            es: 'parcialmente_soleado',
        },
        keywords: {
            en: ['cloud', 'sun', 'sun behind cloud'],
            es: ['nube', 'sol', 'sol con nubes', 'sol detrás de una nube'],
        },
    },
    {
        code: '⛈️',
        name: {
            en: 'thunder_cloud_and_rain',
            es: 'nube_de_truenos_y_lluvia',
        },
        keywords: {
            en: ['cloud', 'rain', 'thunder', 'cloud with lightning and rain'],
            es: ['lluvia', 'nube', 'trueno', 'nube con rayo y lluvia'],
        },
    },
    {
        code: '🌤️',
        name: {
            en: 'mostly_sunny',
            es: 'casi_todo_soleado',
        },
        keywords: {
            en: ['cloud', 'sun', 'sun behind small cloud'],
            es: ['nube', 'sol', 'sol detrás de una nube pequeña'],
        },
    },
    {
        code: '🌥️',
        name: {
            en: 'barely_sunny',
            es: 'sol_con_nubes',
        },
        keywords: {
            en: ['cloud', 'sun', 'sun behind large cloud'],
            es: ['nube', 'sol', 'sol detrás de una nube grande'],
        },
    },
    {
        code: '🌦️',
        name: {
            en: 'partly_sunny_rain',
            es: 'parcialmente_soleado_lluvioso',
        },
        keywords: {
            en: ['cloud', 'rain', 'sun', 'sun behind rain cloud'],
            es: ['lluvia', 'nube', 'sol', 'sol detrás de una nube con lluvia'],
        },
    },
    {
        code: '🌧️',
        name: {
            en: 'rain_cloud',
            es: 'nube_de_lluvia',
        },
        keywords: {
            en: ['cloud', 'rain', 'cloud with rain'],
            es: ['lluvia', 'nube', 'nube con lluvia'],
        },
    },
    {
        code: '🌨️',
        name: {
            en: 'snow_cloud',
            es: 'nube_de_nieve',
        },
        keywords: {
            en: ['cloud', 'cold', 'snow', 'cloud with snow'],
            es: ['frío', 'nieve', 'nube', 'nube con nieve'],
        },
    },
    {
        code: '🌩️',
        name: {
            en: 'lightning',
            es: 'relámpago',
        },
        keywords: {
            en: ['cloud', 'lightning', 'cloud with lightning'],
            es: ['nube', 'rayo', 'nube con rayo'],
        },
    },
    {
        code: '🌪️',
        name: {
            en: 'tornado',
            es: 'tornado',
        },
        keywords: {
            en: ['cloud', 'whirlwind', 'tornado'],
            es: ['nube', 'torbellino', 'tornado'],
        },
    },
    {
        code: '🌫️',
        name: {
            en: 'fog',
            es: 'niebla',
        },
        keywords: {
            en: ['cloud', 'fog'],
            es: ['nube', 'niebla'],
        },
    },
    {
        code: '🌬️',
        name: {
            en: 'wind_blowing_face',
            es: 'cara_soplando_viento',
        },
        keywords: {
            en: ['blow', 'cloud', 'face', 'wind'],
            es: ['cara', 'nube', 'soplar', 'viento', 'cara de viento'],
        },
    },
    {
        code: '🌀',
        name: {
            en: 'cyclone',
            es: 'ciclón',
        },
        keywords: {
            en: ['dizzy', 'hurricane', 'twister', 'typhoon', 'cyclone'],
            es: ['mareo', 'tifón', 'tornado', 'ciclón'],
        },
    },
    {
        code: '🌈',
        name: {
            en: 'rainbow',
            es: 'arco_iris',
        },
        keywords: {
            en: ['rain', 'rainbow'],
            es: ['colores', 'lluvia', 'arcoíris'],
        },
    },
    {
        code: '🌂',
        name: {
            en: 'closed_umbrella',
            es: 'paraguas_cerrado',
        },
        keywords: {
            en: ['clothing', 'rain', 'umbrella', 'closed umbrella'],
            es: ['accesorios', 'lluvia', 'paraguas', 'paraguas cerrado'],
        },
    },
    {
        code: '☂️',
        name: {
            en: 'umbrella',
            es: 'paraguas',
        },
        keywords: {
            en: ['clothing', 'rain', 'umbrella'],
            es: ['lluvia', 'paraguas abierto', 'paraguas'],
        },
    },
    {
        code: '☔',
        name: {
            en: 'umbrella_with_rain_drops',
            es: 'paraguas_con_gotas_de_lluvia',
        },
        keywords: {
            en: ['clothing', 'drop', 'rain', 'umbrella', 'umbrella with rain drops'],
            es: ['gotas', 'lluvia', 'paraguas', 'paraguas con gotas de lluvia'],
        },
    },
    {
        code: '⛱️',
        name: {
            en: 'umbrella_on_ground',
            es: 'paraguas_en_el_suelo',
        },
        keywords: {
            en: ['rain', 'sun', 'umbrella', 'umbrella on ground'],
            es: ['arena', 'sol', 'sombrilla', 'sombrilla en la arena'],
        },
    },
    {
        code: '⚡',
        name: {
            en: 'zap',
            es: 'alto_voltaje',
        },
        keywords: {
            en: ['danger', 'electric', 'lightning', 'voltage', 'zap', 'high voltage'],
            es: ['electricidad', 'peligro', 'peligro de alto voltaje', 'señal de alto voltaje', 'voltaje', 'alto voltaje'],
        },
    },
    {
        code: '❄️',
        name: {
            en: 'snowflake',
            es: 'copo_de_nieve',
        },
        keywords: {
            en: ['cold', 'snow', 'snowflake'],
            es: ['frío', 'nieve', 'copo de nieve'],
        },
    },
    {
        code: '☃️',
        name: {
            en: 'snowman',
            es: 'muñeco_de_nieve',
        },
        keywords: {
            en: ['cold', 'snow', 'snowman'],
            es: ['nieve', 'muñeco de nieve con nieve'],
        },
    },
    {
        code: '⛄',
        name: {
            en: 'snowman_without_snow',
            es: 'muñeco_de_nieve_sin_nieve',
        },
        keywords: {
            en: ['cold', 'snow', 'snowman', 'snowman without snow'],
            es: ['muñeco de nieve sin nieve', 'nieve', 'muñeco de nieve'],
        },
    },
    {
        code: '☄️',
        name: {
            en: 'comet',
            es: 'astro_cometa',
        },
        keywords: {
            en: ['space', 'comet'],
            es: ['cometa', 'espacio', 'meteorito'],
        },
    },
    {
        code: '🔥',
        name: {
            en: 'fire',
            es: 'fuego',
        },
        keywords: {
            en: ['flame', 'tool', 'fire'],
            es: ['llama', 'fuego'],
        },
    },
    {
        code: '💧',
        name: {
            en: 'droplet',
            es: 'gota',
        },
        keywords: {
            en: ['cold', 'comic', 'drop', 'sweat', 'droplet'],
            es: ['agua', 'cómic', 'sudor', 'gota'],
        },
    },
    {
        code: '🌊',
        name: {
            en: 'ocean',
            es: 'océano',
        },
        keywords: {
            en: ['ocean', 'water', 'wave'],
            es: ['mar', 'océano', 'ola', 'ola de mar'],
        },
    },
    {
        code: 'activities',
        icon: Activities,
        header: true,
    },
    {
        code: '🎃',
        name: {
            en: 'jack_o_lantern',
            es: 'calabaza_iluminada',
        },
        keywords: {
            en: ['celebration', 'halloween', 'jack', 'lantern', 'jack-o-lantern'],
            es: ['calabaza', 'celebración', 'Halloween', 'linterna', 'calabaza de Halloween'],
        },
    },
    {
        code: '🎄',
        name: {
            en: 'christmas_tree',
            es: 'árbol_de_navidad',
        },
        keywords: {
            en: ['celebration', 'Christmas', 'tree'],
            es: ['abeto de Navidad', 'árbol', 'celebración', 'Navidad', 'árbol de Navidad'],
        },
    },
    {
        code: '🎆',
        name: {
            en: 'fireworks',
            es: 'fuegos_artificiales',
        },
        keywords: {
            en: ['celebration', 'fireworks'],
            es: ['celebración', 'fuegos artificiales'],
        },
    },
    {
        code: '🎇',
        name: {
            en: 'sparkler',
            es: 'bengala',
        },
        keywords: {
            en: ['celebration', 'fireworks', 'sparkle', 'sparkler'],
            es: ['celebración', 'fuegos artificiales', 'bengala'],
        },
    },
    {
        code: '🧨',
        name: {
            en: 'firecracker',
            es: 'petardo',
        },
        keywords: {
            en: ['dynamite', 'explosive', 'fireworks', 'firecracker'],
            es: ['dinamita', 'explosivo', 'fuegos artificiales', 'petardo'],
        },
    },
    {
        code: '✨',
        name: {
            en: 'sparkles',
            es: 'destellos',
        },
        keywords: {
            en: ['sparkle', 'star', '*', 'sparkles'],
            es: ['bengala', 'estrellas', '*', 'chispas'],
        },
    },
    {
        code: '🎈',
        name: {
            en: 'balloon',
            es: 'globo',
        },
        keywords: {
            en: ['celebration', 'balloon'],
            es: ['celebración', 'globo'],
        },
    },
    {
        code: '🎉',
        name: {
            en: 'tada',
            es: 'gorro_de_fiesta',
        },
        keywords: {
            en: ['celebration', 'party', 'popper', 'tada'],
            es: ['celebración', 'confeti', 'fiesta', 'cañón de confeti'],
        },
    },
    {
        code: '🎊',
        name: {
            en: 'confetti_ball',
            es: 'bola_de_confeti',
        },
        keywords: {
            en: ['ball', 'celebration', 'confetti'],
            es: ['celebración', 'confeti', 'bola de confeti'],
        },
    },
    {
        code: '🎋',
        name: {
            en: 'tanabata_tree',
            es: 'árbol_de_los_deseos',
        },
        keywords: {
            en: ['banner', 'celebration', 'Japanese', 'tree', 'tanabata tree'],
            es: ['árbol', 'celebración', 'festividad', 'tanabata', 'árbol de tanabata'],
        },
    },
    {
        code: '🎍',
        name: {
            en: 'bamboo',
            es: 'bambú',
        },
        keywords: {
            en: ['bamboo', 'celebration', 'Japanese', 'pine', 'pine decoration'],
            es: ['año nuevo japonés', 'bambú', 'celebración', 'decoración', 'kadomatsu', 'decoración de pino'],
        },
    },
    {
        code: '🎎',
        name: {
            en: 'dolls',
            es: 'muñecas',
        },
        keywords: {
            en: ['celebration', 'doll', 'festival', 'Japanese', 'Japanese dolls'],
            es: ['celebración', 'festival', 'hinamatsuri', 'muñecas', 'muñecas japonesas'],
        },
    },
    {
        code: '🎏',
        name: {
            en: 'flags',
            es: 'banderas',
        },
        keywords: {
            en: ['carp', 'celebration', 'streamer'],
            es: ['banderín', 'carpa', 'celebración', 'koinobori', 'banderín de carpas'],
        },
    },
    {
        code: '🎐',
        name: {
            en: 'wind_chime',
            es: 'campanilla_de_viento',
        },
        keywords: {
            en: ['bell', 'celebration', 'chime', 'wind'],
            es: ['campanilla', 'furin', 'viento', 'campanilla de viento'],
        },
    },
    {
        code: '🎑',
        name: {
            en: 'rice_scene',
            es: 'espiga_de_arroz',
        },
        keywords: {
            en: ['celebration', 'ceremony', 'moon', 'moon viewing ceremony'],
            es: ['celebración', 'contemplación', 'luna', 'tsukimi', 'ceremonia de contemplación de la luna'],
        },
    },
    {
        code: '🧧',
        name: {
            en: 'red_envelope',
            es: 'sobre_rojo',
        },
        keywords: {
            en: ['gift', 'good luck', 'hóngbāo', 'lai see', 'money', 'red envelope'],
            es: ['buena suerte', 'hóngbāo', 'lai see', 'regalo', 'sobre rojo'],
        },
    },
    {
        code: '🎀',
        name: {
            en: 'ribbon',
            es: 'cinta',
        },
        keywords: {
            en: ['celebration', 'ribbon'],
            es: ['celebración', 'lazo'],
        },
    },
    {
        code: '🎁',
        name: {
            en: 'gift',
            es: 'regalo',
        },
        keywords: {
            en: ['box', 'celebration', 'gift', 'present', 'wrapped'],
            es: ['celebración', 'envoltorio', 'presente', 'regalo envuelto', 'regalo'],
        },
    },
    {
        code: '🎗️',
        name: {
            en: 'reminder_ribbon',
            es: 'lazo_de_apoyo',
        },
        keywords: {
            en: ['celebration', 'reminder', 'ribbon'],
            es: ['conmemorativo', 'lazo'],
        },
    },
    {
        code: '🎟️',
        name: {
            en: 'admission_tickets',
            es: 'boletos_de_entrada',
        },
        keywords: {
            en: ['admission', 'ticket', 'admission tickets'],
            es: ['acceso', 'admisión', 'entrada', 'evento', 'entradas'],
        },
    },
    {
        code: '🎫',
        name: {
            en: 'ticket',
            es: 'tique',
        },
        keywords: {
            en: ['admission', 'ticket'],
            es: ['acceso', 'admisión', 'tique'],
        },
    },
    {
        code: '🎖️',
        name: {
            en: 'medal',
            es: 'medalla',
        },
        keywords: {
            en: ['celebration', 'medal', 'military'],
            es: ['celebración', 'medalla', 'militar'],
        },
    },
    {
        code: '🏆',
        name: {
            en: 'trophy',
            es: 'trofeo',
        },
        keywords: {
            en: ['prize', 'trophy'],
            es: ['premio', 'trofeo'],
        },
    },
    {
        code: '🏅',
        name: {
            en: 'sports_medal',
            es: 'medalla_deportiva',
        },
        keywords: {
            en: ['medal', 'sports medal'],
            es: ['medalla', 'premio', 'medalla deportiva'],
        },
    },
    {
        code: '🥇',
        name: {
            en: 'first_place_medal',
            es: 'medalla_de_oro',
        },
        keywords: {
            en: ['first', 'gold', 'medal', '1st place medal'],
            es: ['medalla', 'oro', 'primero', 'medalla de oro'],
        },
    },
    {
        code: '🥈',
        name: {
            en: 'second_place_medal',
            es: 'medalla_de_plata',
        },
        keywords: {
            en: ['medal', 'second', 'silver', '2nd place medal'],
            es: ['medalla', 'plata', 'segundo', 'medalla de plata'],
        },
    },
    {
        code: '🥉',
        name: {
            en: 'third_place_medal',
            es: 'medalla_de_bronce',
        },
        keywords: {
            en: ['bronze', 'medal', 'third', '3rd place medal'],
            es: ['bronce', 'medalla', 'tercero', 'medalla de bronce'],
        },
    },
    {
        code: '⚽',
        name: {
            en: 'soccer',
            es: 'fútbol',
        },
        keywords: {
            en: ['ball', 'football', 'soccer'],
            es: ['balón', 'fútbol', 'balón de fútbol'],
        },
    },
    {
        code: '⚾',
        name: {
            en: 'baseball',
            es: 'béisbol',
        },
        keywords: {
            en: ['ball', 'baseball'],
            es: ['balón', 'baseball', 'pelota', 'béisbol'],
        },
    },
    {
        code: '🥎',
        name: {
            en: 'softball',
            es: 'pelota_de_softball',
        },
        keywords: {
            en: ['ball', 'glove', 'underarm', 'softball'],
            es: ['bola', 'pelota', 'softball', 'pelota de softball'],
        },
    },
    {
        code: '🏀',
        name: {
            en: 'basketball',
            es: 'baloncesto',
        },
        keywords: {
            en: ['ball', 'hoop', 'basketball'],
            es: ['balón', 'canasta', 'deporte', 'balón de baloncesto'],
        },
    },
    {
        code: '🏐',
        name: {
            en: 'volleyball',
            es: 'voleibol',
        },
        keywords: {
            en: ['ball', 'game', 'volleyball'],
            es: ['balón', 'juego', 'pelota', 'voleibol', 'pelota de voleibol'],
        },
    },
    {
        code: '🏈',
        name: {
            en: 'football',
            es: 'balón_de_fútbol_americano',
        },
        keywords: {
            en: ['american', 'ball', 'football'],
            es: ['balón', 'deporte', 'fútbol americano', 'balón de fútbol americano'],
        },
    },
    {
        code: '🏉',
        name: {
            en: 'rugby_football',
            es: 'pelota_de_rugby',
        },
        keywords: {
            en: ['ball', 'football', 'rugby'],
            es: ['balón', 'deporte', 'rugby', 'balón de rugby'],
        },
    },
    {
        code: '🎾',
        name: {
            en: 'tennis',
            es: 'tenis',
        },
        keywords: {
            en: ['ball', 'racquet', 'tennis'],
            es: ['deporte', 'pelota', 'tenis', 'pelota de tenis'],
        },
    },
    {
        code: '🥏',
        name: {
            en: 'flying_disc',
            es: 'disco_volador',
        },
        keywords: {
            en: ['ultimate', 'flying disc'],
            es: ['disco', 'frisbee', 'disco volador'],
        },
    },
    {
        code: '🎳',
        name: {
            en: 'bowling',
            es: 'bolos',
        },
        keywords: {
            en: ['ball', 'game', 'bowling'],
            es: ['bola', 'bola de bolos', 'juego', 'bolos'],
        },
    },
    {
        code: '🏏',
        name: {
            en: 'cricket_bat_and_ball',
            es: 'pelota_y_bate_de_cricket',
        },
        keywords: {
            en: ['ball', 'bat', 'game', 'cricket game'],
            es: ['juego', 'pelota', 'críquet'],
        },
    },
    {
        code: '🏑',
        name: {
            en: 'field_hockey_stick_and_ball',
            es: 'palo_y_pelota_de_hockey',
        },
        keywords: {
            en: ['ball', 'field', 'game', 'hockey', 'stick'],
            es: ['hierba', 'hockey', 'juego', 'palo', 'pelota', 'hockey sobre hierba'],
        },
    },
    {
        code: '🏒',
        name: {
            en: 'ice_hockey_stick_and_puck',
            es: 'palo_y_disco_de_hockey_sobre_hielo',
        },
        keywords: {
            en: ['game', 'hockey', 'ice', 'puck', 'stick'],
            es: ['disco', 'hielo', 'hockey', 'palo', 'hockey sobre hielo'],
        },
    },
    {
        code: '🥍',
        name: {
            en: 'lacrosse',
            es: 'lacrosse',
        },
        keywords: {
            en: ['ball', 'goal', 'stick', 'lacrosse'],
            es: ['bola', 'palo', 'pelota', 'raqueta', 'lacrosse'],
        },
    },
    {
        code: '🏓',
        name: {
            en: 'table_tennis_paddle_and_ball',
            es: 'raqueta_y_pelota_de_tenis_de_mesa',
        },
        keywords: {
            en: ['ball', 'bat', 'game', 'paddle', 'table tennis', 'ping pong'],
            es: ['juego', 'mesa', 'pelota', 'ping pong', 'tenis de mesa'],
        },
    },
    {
        code: '🏸',
        name: {
            en: 'badminton_racquet_and_shuttlecock',
            es: 'raqueta_y_pluma_de_bádminton',
        },
        keywords: {
            en: ['birdie', 'game', 'racquet', 'shuttlecock', 'badminton'],
            es: ['pluma', 'raqueta', 'volante', 'bádminton'],
        },
    },
    {
        code: '🥊',
        name: {
            en: 'boxing_glove',
            es: 'guante-boxeo',
        },
        keywords: {
            en: ['boxing', 'glove'],
            es: ['boxeo', 'deporte', 'guante', 'guante de boxeo'],
        },
    },
    {
        code: '🥋',
        name: {
            en: 'martial_arts_uniform',
            es: 'uniforme_artes_marciales',
        },
        keywords: {
            en: ['judo', 'karate', 'martial arts', 'taekwondo', 'uniform', 'martial arts uniform'],
            es: ['artes marciales', 'judo', 'kárate', 'taekwondo', 'uniforme de artes marciales'],
        },
    },
    {
        code: '🥅',
        name: {
            en: 'goal_net',
            es: 'portería',
        },
        keywords: {
            en: ['goal', 'net'],
            es: ['deporte', 'red', 'portería'],
        },
    },
    {
        code: '⛳',
        name: {
            en: 'golf',
            es: 'golf',
        },
        keywords: {
            en: ['golf', 'hole', 'flag in hole'],
            es: ['banderín', 'golf', 'hoyo', 'banderín en hoyo'],
        },
    },
    {
        code: '⛸️',
        name: {
            en: 'ice_skate',
            es: 'patinaje_sobre_hielo',
        },
        keywords: {
            en: ['ice', 'skate'],
            es: ['hielo', 'patín', 'patín de hielo'],
        },
    },
    {
        code: '🎣',
        name: {
            en: 'fishing_pole_and_fish',
            es: 'caña_de_pescar_y_pez',
        },
        keywords: {
            en: ['fish', 'pole', 'fishing pole'],
            es: ['caña', 'entretenimiento', 'esparcimiento', 'pesca', 'pez', 'caña de pescar'],
        },
    },
    {
        code: '🤿',
        name: {
            en: 'diving_mask',
            es: 'máscara_de_buceo',
        },
        keywords: {
            en: ['diving', 'scuba', 'snorkeling', 'diving mask'],
            es: ['bucear', 'buzo', 'esnórquel', 'máscara', 'tubo', 'máscara de buceo'],
        },
    },
    {
        code: '🎽',
        name: {
            en: 'running_shirt_with_sash',
            es: 'camiseta_de_correr_con_franja',
        },
        keywords: {
            en: ['athletics', 'running', 'sash', 'shirt'],
            es: ['banda', 'camiseta con banda', 'camiseta de correr', 'deporte', 'camiseta sin mangas'],
        },
    },
    {
        code: '🎿',
        name: {
            en: 'ski',
            es: 'esquí',
        },
        keywords: {
            en: ['ski', 'snow', 'skis'],
            es: ['esquí', 'esquíes', 'nieve', 'esquís'],
        },
    },
    {
        code: '🛷',
        name: {
            en: 'sled',
            es: 'trineo',
        },
        keywords: {
            en: ['sledge', 'sleigh', 'sled'],
            es: ['trineo'],
        },
    },
    {
        code: '🥌',
        name: {
            en: 'curling_stone',
            es: 'piedra_curling',
        },
        keywords: {
            en: ['game', 'rock', 'curling stone'],
            es: ['juego', 'roca', 'piedra de curling'],
        },
    },
    {
        code: '🎯',
        name: {
            en: 'dart',
            es: 'dardo',
        },
        keywords: {
            en: ['dart', 'direct hit', 'game', 'hit', 'target', 'bullseye'],
            es: ['blanco', 'en el blanco', 'juego', 'diana'],
        },
    },
    {
        code: '🪀',
        name: {
            en: 'yo-yo',
            es: 'yoyó',
        },
        keywords: {
            en: ['fluctuate', 'toy', 'yo-yo'],
            es: ['dieta', 'efecto', 'fluctuar', 'juguete', 'yoyó'],
        },
    },
    {
        code: '🪁',
        name: {
            en: 'kite',
            es: 'cometa',
        },
        keywords: {
            en: ['fly', 'soar', 'kite'],
            es: ['juguete', 'planear', 'viento', 'volar', 'cometa'],
        },
    },
    {
        code: '🔫',
        name: {
            en: 'gun',
            es: 'pistola',
        },
        keywords: {
            en: ['gun', 'handgun', 'pistol', 'revolver', 'tool', 'water', 'weapon'],
            es: ['agua', 'juguete', 'pistola', 'verano', 'pistola de agua'],
        },
    },
    {
        code: '🎱',
        name: {
            en: '8ball',
            es: 'bola_ocho',
        },
        keywords: {
            en: ['8', 'ball', 'billiard', 'eight', 'game', 'pool 8 ball'],
            es: ['8', 'billar', 'bola ocho', 'juego', 'bola negra de billar'],
        },
    },
    {
        code: '🔮',
        name: {
            en: 'crystal_ball',
            es: 'bola_de_cristal',
        },
        keywords: {
            en: ['ball', 'crystal', 'fairy tale', 'fantasy', 'fortune', 'tool'],
            es: ['adivinación', 'bola', 'buena fortuna', 'cristal', 'bola de cristal'],
        },
    },
    {
        code: '🪄',
        name: {
            en: 'magic_wand',
            es: 'varita_mágica',
        },
        keywords: {
            en: ['magic', 'witch', 'wizard', 'magic wand'],
            es: ['bruja', 'hechicero', 'magia', 'mago', 'prestidigitación', 'varita', 'varita mágica'],
        },
    },
    {
        code: '🎮',
        name: {
            en: 'video_game',
            es: 'videojuego',
        },
        keywords: {
            en: ['controller', 'game', 'video game'],
            es: ['juego', 'mando', 'videojuego', 'mando de videoconsola'],
        },
    },
    {
        code: '🕹️',
        name: {
            en: 'joystick',
            es: 'palanca_de_mando',
        },
        keywords: {
            en: ['game', 'video game', 'joystick'],
            es: ['juego', 'mando', 'palanca', 'videojuego', 'joystick'],
        },
    },
    {
        code: '🎰',
        name: {
            en: 'slot_machine',
            es: 'tragaperras',
        },
        keywords: {
            en: ['game', 'slot', 'slot machine'],
            es: ['juego', 'máquina', 'máquina tragaperras'],
        },
    },
    {
        code: '🎲',
        name: {
            en: 'game_die',
            es: 'dado',
        },
        keywords: {
            en: ['dice', 'die', 'game'],
            es: ['juego', 'dado'],
        },
    },
    {
        code: '🧩',
        name: {
            en: 'jigsaw',
            es: 'pieza_de_puzle',
        },
        keywords: {
            en: ['clue', 'interlocking', 'jigsaw', 'piece', 'puzzle'],
            es: ['conectar', 'pieza', 'pista', 'puzle', 'rompecabezas', 'pieza de puzle'],
        },
    },
    {
        code: '🧸',
        name: {
            en: 'teddy_bear',
            es: 'osito_de_peluche',
        },
        keywords: {
            en: ['plaything', 'plush', 'stuffed', 'toy', 'teddy bear'],
            es: ['juguete', 'oso', 'peluche', 'osito de peluche'],
        },
    },
    {
        code: '🪅',
        name: {
            en: 'pinata',
            es: 'piñata',
        },
        keywords: {
            en: ['celebration', 'party', 'piñata'],
            es: ['caballito', 'celebración', 'fiesta', 'piñata'],
        },
    },
    {
        code: '🪆',
        name: {
            en: 'nesting_dolls',
            es: 'muñeca_rusa',
        },
        keywords: {
            en: ['doll', 'nesting', 'russia', 'nesting dolls'],
            es: ['babushka', 'mamushka', 'matrioska', 'rusia', 'muñeca rusa'],
        },
    },
    {
        code: '♠️',
        name: {
            en: 'spades',
            es: 'picas',
        },
        keywords: {
            en: ['card', 'game', 'spade suit'],
            es: ['carta', 'juego', 'palo', 'picas', 'palo de picas'],
        },
    },
    {
        code: '♥️',
        name: {
            en: 'hearts',
            es: 'corazones',
        },
        keywords: {
            en: ['card', 'game', 'heart suit'],
            es: ['carta', 'corazones', 'juego', 'palo', 'palo de corazones'],
        },
    },
    {
        code: '♦️',
        name: {
            en: 'diamonds',
            es: 'diamantes',
        },
        keywords: {
            en: ['card', 'game', 'diamond suit'],
            es: ['carta', 'diamantes', 'juego', 'palo', 'palo de diamantes'],
        },
    },
    {
        code: '♣️',
        name: {
            en: 'clubs',
            es: 'tréboles',
        },
        keywords: {
            en: ['card', 'game', 'club suit'],
            es: ['carta', 'juego', 'palo', 'tréboles', 'palo de tréboles'],
        },
    },
    {
        code: '♟️',
        name: {
            en: 'chess_pawn',
            es: 'peón_de_ajedrez',
        },
        keywords: {
            en: ['chess', 'dupe', 'expendable', 'chess pawn'],
            es: ['ajedrez', 'peón', 'peón de ajedrez'],
        },
    },
    {
        code: '🃏',
        name: {
            en: 'black_joker',
            es: 'comodín_negro',
        },
        keywords: {
            en: ['card', 'game', 'wildcard', 'joker'],
            es: ['joker', 'comodín'],
        },
    },
    {
        code: '🀄',
        name: {
            en: 'mahjong',
            es: 'dragón_rojo',
        },
        keywords: {
            en: ['game', 'mahjong', 'red', 'mahjong red dragon'],
            es: ['dragón rojo', 'juego', 'mahjong', 'dragón rojo de mahjong'],
        },
    },
    {
        code: '🎴',
        name: {
            en: 'flower_playing_cards',
            es: 'cartas-de_juegos_de_asociación',
        },
        keywords: {
            en: ['card', 'flower', 'game', 'Japanese', 'playing', 'flower playing cards'],
            es: ['carta', 'flor', 'hanafuda', 'naipe japonés', 'cartas de flores'],
        },
    },
    {
        code: '🎭',
        name: {
            en: 'performing_arts',
            es: 'artes_escénicas',
        },
        keywords: {
            en: ['art', 'mask', 'performing', 'theater', 'theatre', 'performing arts'],
            es: ['actuación', 'arte', 'artes escénicas', 'entretenimiento', 'máscaras de teatro'],
        },
    },
    {
        code: '🖼️',
        name: {
            en: 'frame_with_picture',
            es: 'marco_con_foto',
        },
        keywords: {
            en: ['art', 'frame', 'museum', 'painting', 'picture', 'framed picture'],
            es: ['marco', 'museo', 'cuadro enmarcado'],
        },
    },
    {
        code: '🎨',
        name: {
            en: 'art',
            es: 'arte',
        },
        keywords: {
            en: ['art', 'museum', 'painting', 'palette', 'artist palette'],
            es: ['arte', 'artista', 'paleta', 'pintura', 'paleta de pintor'],
        },
    },
    {
        code: '🧵',
        name: {
            en: 'thread',
            es: 'hilo',
        },
        keywords: {
            en: ['needle', 'sewing', 'spool', 'string', 'thread'],
            es: ['aguja', 'carrete', 'coser', 'costura', 'hilo'],
        },
    },
    {
        code: '🪡',
        name: {
            en: 'sewing_needle',
            es: 'aguja_de_coser',
        },
        keywords: {
            en: ['embroidery', 'needle', 'sewing', 'stitches', 'sutures', 'tailoring'],
            es: ['aguja', 'bordado', 'coser', 'hilar', 'punto', 'tejer', 'aguja de coser'],
        },
    },
    {
        code: '🧶',
        name: {
            en: 'yarn',
            es: 'ovillo',
        },
        keywords: {
            en: ['ball', 'crochet', 'knit', 'yarn'],
            es: ['bola', 'croché', 'punto', 'tejer', 'ovillo'],
        },
    },
    {
        code: '🪢',
        name: {
            en: 'knot',
            es: 'nudo',
        },
        keywords: {
            en: ['rope', 'tangled', 'tie', 'twine', 'twist', 'knot'],
            es: ['anudar', 'atar', 'enredar', 'trenzar', 'nudo'],
        },
    },
    {
        code: 'objects',
        icon: Objects,
        header: true,
    },
    {
        code: '👓',
        name: {
            en: 'eyeglasses',
            es: 'gafas',
        },
        keywords: {
            en: ['clothing', 'eye', 'eyeglasses', 'eyewear', 'glasses'],
            es: ['accesorios', 'ojo', 'ropa', 'gafas'],
        },
    },
    {
        code: '🕶️',
        name: {
            en: 'dark_sunglasses',
            es: 'gafas_de_sol_oscuras',
        },
        keywords: {
            en: ['dark', 'eye', 'eyewear', 'glasses', 'sunglasses'],
            es: ['gafas', 'ojo', 'oscuras', 'sol', 'gafas de sol'],
        },
    },
    {
        code: '🥽',
        name: {
            en: 'goggles',
            es: 'gafas_de_protección',
        },
        keywords: {
            en: ['eye protection', 'swimming', 'welding', 'goggles'],
            es: ['gafas', 'nadar', 'protección ocular', 'soldar', 'gafas de protección'],
        },
    },
    {
        code: '🥼',
        name: {
            en: 'lab_coat',
            es: 'bata_de_laboratorio',
        },
        keywords: {
            en: ['doctor', 'experiment', 'scientist', 'lab coat'],
            es: ['científico', 'doctor', 'experimento', 'médico', 'bata de laboratorio'],
        },
    },
    {
        code: '🦺',
        name: {
            en: 'safety_vest',
            es: 'chaleco_de_seguridad',
        },
        keywords: {
            en: ['emergency', 'safety', 'vest'],
            es: ['chaleco', 'emergencia', 'seguridad', 'chaleco de seguridad'],
        },
    },
    {
        code: '👔',
        name: {
            en: 'necktie',
            es: 'corbata',
        },
        keywords: {
            en: ['clothing', 'tie', 'necktie'],
            es: ['accesorio', 'ropa', 'corbata'],
        },
    },
    {
        code: '👕',
        name: {
            en: 'shirt',
            es: 'camiseta',
        },
        keywords: {
            en: ['clothing', 'shirt', 'tshirt', 't-shirt'],
            es: ['ropa', 'camiseta'],
        },
    },
    {
        code: '👖',
        name: {
            en: 'jeans',
            es: 'vaqueros',
        },
        keywords: {
            en: ['clothing', 'pants', 'trousers', 'jeans'],
            es: ['pantalones', 'ropa', 'vaqueros'],
        },
    },
    {
        code: '🧣',
        name: {
            en: 'scarf',
            es: 'bufanda',
        },
        keywords: {
            en: ['neck', 'scarf'],
            es: ['abrigo', 'cuello', 'bufanda'],
        },
    },
    {
        code: '🧤',
        name: {
            en: 'gloves',
            es: 'guantes',
        },
        keywords: {
            en: ['hand', 'gloves'],
            es: ['mano', 'guantes'],
        },
    },
    {
        code: '🧥',
        name: {
            en: 'coat',
            es: 'abrigo',
        },
        keywords: {
            en: ['jacket', 'coat'],
            es: ['chaquetón', 'abrigo'],
        },
    },
    {
        code: '🧦',
        name: {
            en: 'socks',
            es: 'calcetines',
        },
        keywords: {
            en: ['stocking', 'socks'],
            es: ['pies', 'ropa', 'calcetines'],
        },
    },
    {
        code: '👗',
        name: {
            en: 'dress',
            es: 'vestido',
        },
        keywords: {
            en: ['clothing', 'dress'],
            es: ['mujer', 'ropa', 'vestido'],
        },
    },
    {
        code: '👘',
        name: {
            en: 'kimono',
            es: 'kimono',
        },
        keywords: {
            en: ['clothing', 'kimono'],
            es: ['japonés', 'ropa', 'kimono'],
        },
    },
    {
        code: '🥻',
        name: {
            en: 'sari',
            es: 'sari',
        },
        keywords: {
            en: ['clothing', 'dress', 'sari'],
            es: ['prenda', 'ropa', 'vestido', 'sari'],
        },
    },
    {
        code: '🩱',
        name: {
            en: 'one-piece_swimsuit',
            es: 'traje_de_baño_de_una_pieza',
        },
        keywords: {
            en: ['bathing suit', 'one-piece swimsuit'],
            es: ['bañador', 'traje de baño de una pieza'],
        },
    },
    {
        code: '🩲',
        name: {
            en: 'briefs',
            es: 'ropa_interior',
        },
        keywords: {
            en: ['bathing suit', 'one-piece', 'swimsuit', 'underwear', 'briefs'],
            es: ['bañador', 'bragas', 'braguitas', 'calzoncillos', 'slip', 'ropa interior'],
        },
    },
    {
        code: '🩳',
        name: {
            en: 'shorts',
            es: 'pantalones_cortos',
        },
        keywords: {
            en: ['bathing suit', 'pants', 'underwear', 'shorts'],
            es: ['bañador', 'bermudas', 'calzoncillos', 'ropa interior', 'shorts', 'pantalones cortos'],
        },
    },
    {
        code: '👙',
        name: {
            en: 'bikini',
            es: 'bikini',
        },
        keywords: {
            en: ['clothing', 'swim', 'bikini'],
            es: ['baño', 'playa', 'ropa', 'bikini'],
        },
    },
    {
        code: '👚',
        name: {
            en: 'womans_clothes',
            es: 'ropa_de_mujer',
        },
        keywords: {
            en: ['clothing', 'woman', 'woman’s clothes'],
            es: ['blusa', 'camisa', 'femenina', 'ropa', 'ropa de mujer'],
        },
    },
    {
        code: '👛',
        name: {
            en: 'purse',
            es: 'cartera_de_mano',
        },
        keywords: {
            en: ['clothing', 'coin', 'purse'],
            es: ['accesorios', 'cartera', 'complementos', 'monedero'],
        },
    },
    {
        code: '👜',
        name: {
            en: 'handbag',
            es: 'bolso',
        },
        keywords: {
            en: ['bag', 'clothing', 'purse', 'handbag'],
            es: ['accesorios', 'complementos', 'bolso'],
        },
    },
    {
        code: '👝',
        name: {
            en: 'pouch',
            es: 'cartera',
        },
        keywords: {
            en: ['bag', 'clothing', 'pouch', 'clutch bag'],
            es: ['accesorios', 'bolso', 'cartera', 'complementos', 'bolso de mano'],
        },
    },
    {
        code: '🛍️',
        name: {
            en: 'shopping_bags',
            es: 'bolsas_de_la_compra',
        },
        keywords: {
            en: ['bag', 'hotel', 'shopping', 'shopping bags'],
            es: ['bolsa', 'compra', 'bolsas de compras'],
        },
    },
    {
        code: '🎒',
        name: {
            en: 'school_satchel',
            es: 'mochila',
        },
        keywords: {
            en: ['bag', 'rucksack', 'satchel', 'school', 'backpack'],
            es: ['colegio', 'mochila', 'mochila escolar'],
        },
    },
    {
        code: '🩴',
        name: {
            en: 'thong_sandal',
            es: 'chancla',
        },
        keywords: {
            en: ['beach sandals', 'sandals', 'thong sandals', 'thongs', 'zōri', 'thong sandal'],
            es: ['chancla de dedo', 'chancleta', 'chinela', 'sandalia', 'chancla'],
        },
    },
    {
        code: '👞',
        name: {
            en: 'mans_shoe',
            es: 'zapatos_de_hombre',
        },
        keywords: {
            en: ['clothing', 'man', 'shoe', 'man’s shoe'],
            es: ['calzado', 'hombre', 'ropa', 'zapato', 'zapato de hombre'],
        },
    },
    {
        code: '👟',
        name: {
            en: 'athletic_shoe',
            es: 'zapatilla_de_atletismo',
        },
        keywords: {
            en: ['athletic', 'clothing', 'shoe', 'sneaker', 'running shoe'],
            es: ['calzado', 'correr', 'ropa', 'tenis', 'zapatilla deportiva'],
        },
    },
    {
        code: '🥾',
        name: {
            en: 'hiking_boot',
            es: 'bota_de_senderismo',
        },
        keywords: {
            en: ['backpacking', 'boot', 'camping', 'hiking'],
            es: ['bota', 'camping', 'mochilero', 'senderismo', 'bota de senderismo'],
        },
    },
    {
        code: '🥿',
        name: {
            en: 'womans_flat_shoe',
            es: 'bailarina',
        },
        keywords: {
            en: ['ballet flat', 'slip-on', 'slipper', 'flat shoe'],
            es: ['calzado', 'zapato', 'bailarina'],
        },
    },
    {
        code: '👠',
        name: {
            en: 'high_heel',
            es: 'tacón_de_aguja',
        },
        keywords: {
            en: ['clothing', 'heel', 'shoe', 'woman', 'high-heeled shoe'],
            es: ['mujer', 'tacón', 'zapato', 'zapato de tacón'],
        },
    },
    {
        code: '👡',
        name: {
            en: 'sandal',
            es: 'sandalia',
        },
        keywords: {
            en: ['clothing', 'sandal', 'shoe', 'woman', 'woman’s sandal'],
            es: ['calzado', 'mujer', 'ropa', 'sandalia', 'sandalia de mujer'],
        },
    },
    {
        code: '🩰',
        name: {
            en: 'ballet_shoes',
            es: 'zapatillas_de_ballet',
        },
        keywords: {
            en: ['ballet', 'dance', 'ballet shoes'],
            es: ['bailar', 'balé', 'ballet', 'danza', 'zapatillas de ballet'],
        },
    },
    {
        code: '👢',
        name: {
            en: 'boot',
            es: 'bota',
        },
        keywords: {
            en: ['boot', 'clothing', 'shoe', 'woman', 'woman’s boot'],
            es: ['bota', 'calzado', 'mujer', 'ropa', 'bota de mujer'],
        },
    },
    {
        code: '👑',
        name: {
            en: 'crown',
            es: 'corona',
        },
        keywords: {
            en: ['clothing', 'king', 'queen', 'crown'],
            es: ['accesorios', 'complementos', 'reina', 'rey', 'corona'],
        },
    },
    {
        code: '👒',
        name: {
            en: 'womans_hat',
            es: 'sombrero_de_mujer',
        },
        keywords: {
            en: ['clothing', 'hat', 'woman', 'woman’s hat'],
            es: ['accesorio', 'mujer', 'ropa', 'sombrero', 'sombrero de mujer'],
        },
    },
    {
        code: '🎩',
        name: {
            en: 'tophat',
            es: 'sombrero_de_copa',
        },
        keywords: {
            en: ['clothing', 'hat', 'top', 'tophat'],
            es: ['chistera', 'copa', 'ropa', 'sombrero', 'sombrero de copa'],
        },
    },
    {
        code: '🎓',
        name: {
            en: 'mortar_board',
            es: 'birrete',
        },
        keywords: {
            en: ['cap', 'celebration', 'clothing', 'graduation', 'hat'],
            es: ['celebración', 'gorro', 'graduación', 'birrete'],
        },
    },
    {
        code: '🧢',
        name: {
            en: 'billed_cap',
            es: 'gorra',
        },
        keywords: {
            en: ['baseball cap', 'billed cap'],
            es: ['béisbol', 'gorra', 'visera', 'gorra con visera'],
        },
    },
    {
        code: '🪖',
        name: {
            en: 'military_helmet',
            es: 'casco_militar',
        },
        keywords: {
            en: ['army', 'helmet', 'military', 'soldier', 'warrior'],
            es: ['casco', 'ejército', 'guerra', 'guerrero', 'soldado', 'casco militar'],
        },
    },
    {
        code: '⛑️',
        name: {
            en: 'helmet_with_white_cross',
            es: 'casco_con_cruz_blanca',
        },
        keywords: {
            en: ['aid', 'cross', 'face', 'hat', 'helmet', 'rescue worker’s helmet'],
            es: ['ayuda', 'cara', 'casco', 'cruz', 'casco con una cruz blanca'],
        },
    },
    {
        code: '📿',
        name: {
            en: 'prayer_beads',
            es: 'rosario',
        },
        keywords: {
            en: ['beads', 'clothing', 'necklace', 'prayer', 'religion'],
            es: ['collar', 'cuentas', 'religión', 'rosario'],
        },
    },
    {
        code: '💄',
        name: {
            en: 'lipstick',
            es: 'lápiz_labial',
        },
        keywords: {
            en: ['cosmetics', 'makeup', 'lipstick'],
            es: ['barra', 'cosmética', 'labios', 'maquillaje', 'pintalabios'],
        },
    },
    {
        code: '💍',
        name: {
            en: 'ring',
            es: 'anillo',
        },
        keywords: {
            en: ['diamond', 'ring'],
            es: ['diamante', 'anillo'],
        },
    },
    {
        code: '💎',
        name: {
            en: 'gem',
            es: 'joya',
        },
        keywords: {
            en: ['diamond', 'gem', 'jewel', 'gem stone'],
            es: ['diamante', 'gema', 'joya', 'piedra', 'preciosa'],
        },
    },
    {
        code: '🔇',
        name: {
            en: 'mute',
            es: 'mudo',
        },
        keywords: {
            en: ['mute', 'quiet', 'silent', 'speaker', 'muted speaker'],
            es: ['altavoz', 'altavoz con marca de cancelación', 'mute', 'silencio', 'altavoz silenciado'],
        },
    },
    {
        code: '🔈',
        name: {
            en: 'speaker',
            es: 'altavoz',
        },
        keywords: {
            en: ['soft', 'speaker low volume'],
            es: ['volumen bajo', 'altavoz a volumen bajo'],
        },
    },
    {
        code: '🔉',
        name: {
            en: 'sound',
            es: 'sonido',
        },
        keywords: {
            en: ['medium', 'speaker medium volume'],
            es: ['altavoz con volumen medio', 'medio', 'volumen medio', 'altavoz a volumen medio'],
        },
    },
    {
        code: '🔊',
        name: {
            en: 'loud_sound',
            es: 'sonido_agudo',
        },
        keywords: {
            en: ['loud', 'speaker high volume'],
            es: ['altavoz', 'alto', 'volumen alto', 'altavoz a volumen alto'],
        },
    },
    {
        code: '📢',
        name: {
            en: 'loudspeaker',
            es: 'altavoz_sonando',
        },
        keywords: {
            en: ['loud', 'public address', 'loudspeaker'],
            es: ['altavoz', 'comunicación', 'altavoz de mano'],
        },
    },
    {
        code: '📣',
        name: {
            en: 'mega',
            es: 'mega',
        },
        keywords: {
            en: ['cheering', 'megaphone'],
            es: ['comunicación', 'megáfono'],
        },
    },
    {
        code: '📯',
        name: {
            en: 'postal_horn',
            es: 'corneta',
        },
        keywords: {
            en: ['horn', 'post', 'postal'],
            es: ['corneta', 'posta', 'corneta de posta'],
        },
    },
    {
        code: '🔔',
        name: {
            en: 'bell',
            es: 'campana',
        },
        keywords: {
            en: ['bell'],
            es: ['campana'],
        },
    },
    {
        code: '🔕',
        name: {
            en: 'no_bell',
            es: 'prohibido_claxon',
        },
        keywords: {
            en: ['bell', 'forbidden', 'mute', 'quiet', 'silent', 'bell with slash'],
            es: ['campana', 'cancelación', 'ruido', 'campana con signo de cancelación'],
        },
    },
    {
        code: '🎼',
        name: {
            en: 'musical_score',
            es: 'partitura',
        },
        keywords: {
            en: ['music', 'score', 'musical score'],
            es: ['música', 'partitura', 'pentagrama'],
        },
    },
    {
        code: '🎵',
        name: {
            en: 'musical_note',
            es: 'nota_musical',
        },
        keywords: {
            en: ['music', 'note', 'musical note'],
            es: ['música', 'nota', 'nota musical'],
        },
    },
    {
        code: '🎶',
        name: {
            en: 'notes',
            es: 'notas',
        },
        keywords: {
            en: ['music', 'note', 'notes', 'musical notes'],
            es: ['música', 'notas', 'notas musicales'],
        },
    },
    {
        code: '🎙️',
        name: {
            en: 'studio_microphone',
            es: 'micrófono_de_estudio',
        },
        keywords: {
            en: ['mic', 'microphone', 'music', 'studio'],
            es: ['estudio', 'micrófono', 'música', 'micrófono de estudio'],
        },
    },
    {
        code: '🎚️',
        name: {
            en: 'level_slider',
            es: 'indicador_de_nivel',
        },
        keywords: {
            en: ['level', 'music', 'slider'],
            es: ['control', 'fader', 'volumen', 'control de volumen'],
        },
    },
    {
        code: '🎛️',
        name: {
            en: 'control_knobs',
            es: 'mandos_de_control',
        },
        keywords: {
            en: ['control', 'knobs', 'music'],
            es: ['control', 'diales', 'música', 'potenciómetros', 'ruedas', 'ruedas de control'],
        },
    },
    {
        code: '🎤',
        name: {
            en: 'microphone',
            es: 'micrófono',
        },
        keywords: {
            en: ['karaoke', 'mic', 'microphone'],
            es: ['entretenimiento', 'karaoke', 'micro', 'micrófono'],
        },
    },
    {
        code: '🎧',
        name: {
            en: 'headphones',
            es: 'auriculares',
        },
        keywords: {
            en: ['earbud', 'headphone'],
            es: ['cascos', 'auricular'],
        },
    },
    {
        code: '📻',
        name: {
            en: 'radio',
            es: 'radio',
        },
        keywords: {
            en: ['video', 'radio'],
            es: ['radio'],
        },
    },
    {
        code: '🎷',
        name: {
            en: 'saxophone',
            es: 'saxofón',
        },
        keywords: {
            en: ['instrument', 'music', 'sax', 'saxophone'],
            es: ['instrumento', 'instrumento musical', 'música', 'saxo', 'saxofón'],
        },
    },
    {
        code: '🪗',
        name: {
            en: 'accordion',
            es: 'acordeón',
        },
        keywords: {
            en: ['concertina', 'squeeze box', 'accordion'],
            es: ['concertina', 'acordeón'],
        },
    },
    {
        code: '🎸',
        name: {
            en: 'guitar',
            es: 'guitarra',
        },
        keywords: {
            en: ['instrument', 'music', 'guitar'],
            es: ['instrumento', 'instrumento musical', 'música', 'guitarra'],
        },
    },
    {
        code: '🎹',
        name: {
            en: 'musical_keyboard',
            es: 'teclado_musical',
        },
        keywords: {
            en: ['instrument', 'keyboard', 'music', 'piano', 'musical keyboard'],
            es: ['instrumento', 'instrumento musical', 'música', 'teclado', 'piano', 'teclado musical'],
        },
    },
    {
        code: '🎺',
        name: {
            en: 'trumpet',
            es: 'trompeta',
        },
        keywords: {
            en: ['instrument', 'music', 'trumpet'],
            es: ['instrumento', 'instrumento musical', 'música', 'trompeta'],
        },
    },
    {
        code: '🎻',
        name: {
            en: 'violin',
            es: 'violín',
        },
        keywords: {
            en: ['instrument', 'music', 'violin'],
            es: ['instrumento', 'instrumento musical', 'música', 'violín'],
        },
    },
    {
        code: '🪕',
        name: {
            en: 'banjo',
            es: 'banjo',
        },
        keywords: {
            en: ['music', 'stringed', 'banjo'],
            es: ['banyo', 'cuerda', 'instrumento', 'música', 'banjo'],
        },
    },
    {
        code: '🥁',
        name: {
            en: 'drum_with_drumsticks',
            es: 'tambor_con_baquetas',
        },
        keywords: {
            en: ['drumsticks', 'music', 'drum'],
            es: ['baquetas', 'música', 'tambor'],
        },
    },
    {
        code: '🪘',
        name: {
            en: 'long_drum',
            es: 'tamboril',
        },
        keywords: {
            en: ['beat', 'conga', 'drum', 'rhythm', 'long drum'],
            es: ['conga', 'ritmo', 'tambor', 'tamboril'],
        },
    },
    {
        code: '📱',
        name: {
            en: 'iphone',
            es: 'iphone',
        },
        keywords: {
            en: ['cell', 'mobile', 'phone', 'telephone'],
            es: ['celular', 'móvil', 'teléfono'],
        },
    },
    {
        code: '📲',
        name: {
            en: 'calling',
            es: 'llamando',
        },
        keywords: {
            en: ['arrow', 'cell', 'mobile', 'phone', 'receive', 'mobile phone with arrow'],
            es: ['flecha', 'llamada', 'móvil', 'recibir', 'teléfono', 'móvil con una flecha'],
        },
    },
    {
        code: '☎️',
        name: {
            en: 'phone',
            es: 'teléfono',
        },
        keywords: {
            en: ['phone', 'telephone'],
            es: ['teléfono'],
        },
    },
    {
        code: '📞',
        name: {
            en: 'telephone_receiver',
            es: 'receptor_de_teléfono',
        },
        keywords: {
            en: ['phone', 'receiver', 'telephone'],
            es: ['comunicación', 'teléfono', 'auricular de teléfono'],
        },
    },
    {
        code: '📟',
        name: {
            en: 'pager',
            es: 'buscapersonas',
        },
        keywords: {
            en: ['pager'],
            es: ['comunicación', 'localizador', 'busca'],
        },
    },
    {
        code: '📠',
        name: {
            en: 'fax',
            es: 'fax',
        },
        keywords: {
            en: ['fax', 'fax machine'],
            es: ['comunicación', 'fax', 'máquina de fax'],
        },
    },
    {
        code: '🔋',
        name: {
            en: 'battery',
            es: 'batería',
        },
        keywords: {
            en: ['battery'],
            es: ['batería', 'pila'],
        },
    },
    {
        code: '🔌',
        name: {
            en: 'electric_plug',
            es: 'enchufe_eléctrico',
        },
        keywords: {
            en: ['electric', 'electricity', 'plug'],
            es: ['corriente', 'electricidad', 'eléctrico', 'enchufe'],
        },
    },
    {
        code: '💻',
        name: {
            en: 'computer',
            es: 'ordenador',
        },
        keywords: {
            en: ['computer', 'pc', 'personal', 'laptop'],
            es: ['ordenador', 'pc', 'personal', 'ordenador portátil'],
        },
    },
    {
        code: '🖥️',
        name: {
            en: 'desktop_computer',
            es: 'ordenador_de_sobremesa',
        },
        keywords: {
            en: ['computer', 'desktop'],
            es: ['ordenador', 'sobremesa', 'ordenador de sobremesa'],
        },
    },
    {
        code: '🖨️',
        name: {
            en: 'printer',
            es: 'impresora',
        },
        keywords: {
            en: ['computer', 'printer'],
            es: ['ordenador', 'impresora'],
        },
    },
    {
        code: '⌨️',
        name: {
            en: 'keyboard',
            es: 'teclado',
        },
        keywords: {
            en: ['computer', 'keyboard'],
            es: ['ordenador', 'teclado'],
        },
    },
    {
        code: '🖱️',
        name: {
            en: 'three_button_mouse',
            es: 'mouse_de_tres_botones',
        },
        keywords: {
            en: ['computer', 'computer mouse'],
            es: ['ordenador', 'ratón', 'ratón de ordenador'],
        },
    },
    {
        code: '🖲️',
        name: {
            en: 'trackball',
            es: 'bola_de_seguimiento',
        },
        keywords: {
            en: ['computer', 'trackball'],
            es: ['ordenador', 'trackball', 'bola de desplazamiento'],
        },
    },
    {
        code: '💽',
        name: {
            en: 'minidisc',
            es: 'minidisc',
        },
        keywords: {
            en: ['computer', 'disk', 'minidisk', 'optical'],
            es: ['disco', 'md', 'minidisc'],
        },
    },
    {
        code: '💾',
        name: {
            en: 'floppy_disk',
            es: 'disquete',
        },
        keywords: {
            en: ['computer', 'disk', 'floppy'],
            es: ['disco', 'disco de 3 1/2', 'disquete'],
        },
    },
    {
        code: '💿',
        name: {
            en: 'cd',
            es: 'cd',
        },
        keywords: {
            en: ['CD', 'computer', 'disk', 'optical'],
            es: ['cd', 'disco', 'disco óptico'],
        },
    },
    {
        code: '📀',
        name: {
            en: 'dvd',
            es: 'dvd',
        },
        keywords: {
            en: ['Blu-ray', 'computer', 'disk', 'optical', 'dvd  DVD'],
            es: ['disco', 'dvd', 'disco DVD'],
        },
    },
    {
        code: '🧮',
        name: {
            en: 'abacus',
            es: 'ábaco',
        },
        keywords: {
            en: ['calculation', 'abacus'],
            es: ['cálculo', 'contar', 'matemáticas', 'ábaco'],
        },
    },
    {
        code: '🎥',
        name: {
            en: 'movie_camera',
            es: 'cámara_de_cine',
        },
        keywords: {
            en: ['camera', 'cinema', 'movie'],
            es: ['cámara', 'cine', 'entretenimiento', 'película', 'cámara de cine'],
        },
    },
    {
        code: '🎞️',
        name: {
            en: 'film_frames',
            es: 'fotogramas_de_película',
        },
        keywords: {
            en: ['cinema', 'film', 'frames', 'movie'],
            es: ['cine', 'fotograma', 'película', 'fotograma de película'],
        },
    },
    {
        code: '📽️',
        name: {
            en: 'film_projector',
            es: 'proyector_de_cine',
        },
        keywords: {
            en: ['cinema', 'film', 'movie', 'projector', 'video'],
            es: ['cine', 'película', 'proyector', 'proyector de cine'],
        },
    },
    {
        code: '🎬',
        name: {
            en: 'clapper',
            es: 'claqueta',
        },
        keywords: {
            en: ['clapper', 'movie', 'clapper board'],
            es: ['cine', 'claqueta de cine', 'entretenimiento', 'película', 'claqueta'],
        },
    },
    {
        code: '📺',
        name: {
            en: 'tv',
            es: 'televisión',
        },
        keywords: {
            en: ['tv', 'video', 'television'],
            es: ['tv', 'televisión'],
        },
    },
    {
        code: '📷',
        name: {
            en: 'camera',
            es: 'cámara',
        },
        keywords: {
            en: ['video', 'camera'],
            es: ['cámara', 'cámara de fotos'],
        },
    },
    {
        code: '📸',
        name: {
            en: 'camera_with_flash',
            es: 'cámara_con_flash',
        },
        keywords: {
            en: ['camera', 'flash', 'video', 'camera with flash'],
            es: ['cámara', 'flash', 'cámara con flash'],
        },
    },
    {
        code: '📹',
        name: {
            en: 'video_camera',
            es: 'videocámara',
        },
        keywords: {
            en: ['camera', 'video'],
            es: ['cámara', 'vídeo', 'videocámara'],
        },
    },
    {
        code: '📼',
        name: {
            en: 'vhs',
            es: 'vhs',
        },
        keywords: {
            en: ['tape', 'vhs', 'video', 'videocassette'],
            es: ['cinta', 'cinta de vídeo'],
        },
    },
    {
        code: '🔍',
        name: {
            en: 'mag',
            es: 'lupa',
        },
        keywords: {
            en: ['glass', 'magnifying', 'search', 'tool', 'magnifying glass tilted left'],
            es: ['buscar', 'lupa', 'lupa orientada hacia la izquierda'],
        },
    },
    {
        code: '🔎',
        name: {
            en: 'mag_right',
            es: 'lupa_derecha',
        },
        keywords: {
            en: ['glass', 'magnifying', 'search', 'tool', 'magnifying glass tilted right'],
            es: ['buscar', 'lupa', 'lupa orientada hacia la derecha'],
        },
    },
    {
        code: '🕯️',
        name: {
            en: 'candle',
            es: 'vela',
        },
        keywords: {
            en: ['light', 'candle'],
            es: ['luz', 'vela'],
        },
    },
    {
        code: '💡',
        name: {
            en: 'bulb',
            es: 'bombilla',
        },
        keywords: {
            en: ['bulb', 'comic', 'electric', 'idea', 'light'],
            es: ['cómic', 'electricidad', 'idea', 'luz', 'bombilla'],
        },
    },
    {
        code: '🔦',
        name: {
            en: 'flashlight',
            es: 'linterna',
        },
        keywords: {
            en: ['electric', 'light', 'tool', 'torch', 'flashlight'],
            es: ['luz', 'linterna'],
        },
    },
    {
        code: '🏮',
        name: {
            en: 'izakaya_lantern',
            es: 'farolillo_de_papel',
        },
        keywords: {
            en: ['bar', 'lantern', 'light', 'red', 'red paper lantern'],
            es: ['izakaya', 'lámpara roja', 'linterna izakaya', 'linterna japonesa', 'restaurante', 'lámpara japonesa'],
        },
    },
    {
        code: '🪔',
        name: {
            en: 'diya_lamp',
            es: 'lámpara_de_aceite',
        },
        keywords: {
            en: ['diya', 'lamp', 'oil'],
            es: ['aceite', 'diya', 'lámpara', 'lámpara de aceite'],
        },
    },
    {
        code: '📔',
        name: {
            en: 'notebook_with_decorative_cover',
            es: 'cuaderno_con_tapa_decorada',
        },
        keywords: {
            en: ['book', 'cover', 'decorated', 'notebook', 'notebook with decorative cover'],
            es: ['cuaderno', 'decoración', 'tapa', 'cuaderno con tapa decorativa'],
        },
    },
    {
        code: '📕',
        name: {
            en: 'closed_book',
            es: 'libro_cerrado',
        },
        keywords: {
            en: ['book', 'closed'],
            es: ['cerrado', 'libro'],
        },
    },
    {
        code: '📖',
        name: {
            en: 'book',
            es: 'libro',
        },
        keywords: {
            en: ['book', 'open'],
            es: ['abierto', 'libro'],
        },
    },
    {
        code: '📗',
        name: {
            en: 'green_book',
            es: 'libro_verde',
        },
        keywords: {
            en: ['book', 'green'],
            es: ['libro', 'verde'],
        },
    },
    {
        code: '📘',
        name: {
            en: 'blue_book',
            es: 'libro_azul',
        },
        keywords: {
            en: ['blue', 'book'],
            es: ['azul', 'libro'],
        },
    },
    {
        code: '📙',
        name: {
            en: 'orange_book',
            es: 'libro_naranja',
        },
        keywords: {
            en: ['book', 'orange'],
            es: ['libro', 'naranja'],
        },
    },
    {
        code: '📚',
        name: {
            en: 'books',
            es: 'libros',
        },
        keywords: {
            en: ['book', 'books'],
            es: ['libro', 'libros'],
        },
    },
    {
        code: '📓',
        name: {
            en: 'notebook',
            es: 'cuaderno',
        },
        keywords: {
            en: ['notebook'],
            es: ['libreta', 'cuaderno'],
        },
    },
    {
        code: '📒',
        name: {
            en: 'ledger',
            es: 'registro',
        },
        keywords: {
            en: ['notebook', 'ledger'],
            es: ['cuaderno', 'libro de contabilidad'],
        },
    },
    {
        code: '📃',
        name: {
            en: 'page_with_curl',
            es: 'página_doblada_por_abajo',
        },
        keywords: {
            en: ['curl', 'document', 'page', 'page with curl'],
            es: ['documento', 'página', 'página doblada'],
        },
    },
    {
        code: '📜',
        name: {
            en: 'scroll',
            es: 'pergamino',
        },
        keywords: {
            en: ['paper', 'scroll'],
            es: ['pergamino de papel', 'pergamino'],
        },
    },
    {
        code: '📄',
        name: {
            en: 'page_facing_up',
            es: 'página_boca_arriba',
        },
        keywords: {
            en: ['document', 'page', 'page facing up'],
            es: ['anverso', 'documento', 'página', 'página hacia arriba'],
        },
    },
    {
        code: '📰',
        name: {
            en: 'newspaper',
            es: 'periódico',
        },
        keywords: {
            en: ['news', 'paper', 'newspaper'],
            es: ['diario', 'periódico'],
        },
    },
    {
        code: '🗞️',
        name: {
            en: 'rolled_up_newspaper',
            es: 'periódico_enrollado',
        },
        keywords: {
            en: ['news', 'newspaper', 'paper', 'rolled', 'rolled-up newspaper'],
            es: ['noticias', 'papel', 'periódico', 'periódico enrollado'],
        },
    },
    {
        code: '📑',
        name: {
            en: 'bookmark_tabs',
            es: 'pestañas_de_marcadores',
        },
        keywords: {
            en: ['bookmark', 'mark', 'marker', 'tabs'],
            es: ['pestañas', 'marcadores'],
        },
    },
    {
        code: '🔖',
        name: {
            en: 'bookmark',
            es: 'marcador',
        },
        keywords: {
            en: ['mark', 'bookmark'],
            es: ['marcador', 'marcapáginas'],
        },
    },
    {
        code: '🏷️',
        name: {
            en: 'label',
            es: 'etiqueta',
        },
        keywords: {
            en: ['label'],
            es: ['etiqueta'],
        },
    },
    {
        code: '💰',
        name: {
            en: 'moneybag',
            es: 'bolsa_de_dinero',
        },
        keywords: {
            en: ['bag', 'dollar', 'money', 'moneybag'],
            es: ['bolsa', 'bolsa de dólares', 'dinero', 'bolsa de dinero'],
        },
    },
    {
        code: '🪙',
        name: {
            en: 'coin',
            es: 'moneda',
        },
        keywords: {
            en: ['gold', 'metal', 'money', 'silver', 'treasure', 'coin'],
            es: ['dinero', 'metal', 'oro', 'plata', 'tesoro', 'moneda'],
        },
    },
    {
        code: '💴',
        name: {
            en: 'yen',
            es: 'yen',
        },
        keywords: {
            en: ['banknote', 'bill', 'currency', 'money', 'note', 'yen'],
            es: ['billete', 'billete de banco', 'dinero', 'yen', 'billete de yen'],
        },
    },
    {
        code: '💵',
        name: {
            en: 'dollar',
            es: 'dólar',
        },
        keywords: {
            en: ['banknote', 'bill', 'currency', 'dollar', 'money', 'note'],
            es: ['billete', 'billete de banco', 'dinero', 'dólar', 'billete de dólar'],
        },
    },
    {
        code: '💶',
        name: {
            en: 'euro',
            es: 'euro',
        },
        keywords: {
            en: ['banknote', 'bill', 'currency', 'euro', 'money', 'note'],
            es: ['billete', 'billete de banco', 'dinero', 'euro', 'billete de euro'],
        },
    },
    {
        code: '💷',
        name: {
            en: 'pound',
            es: 'libra_esterlina',
        },
        keywords: {
            en: ['banknote', 'bill', 'currency', 'money', 'note', 'pound'],
            es: ['billete de banco', 'dinero', 'libra', 'billete de libra'],
        },
    },
    {
        code: '💸',
        name: {
            en: 'money_with_wings',
            es: 'dinero_con_alas',
        },
        keywords: {
            en: ['banknote', 'bill', 'fly', 'money', 'wings', 'money with wings'],
            es: ['billete', 'billete de banco', 'dinero', 'dinero con alas', 'billete con alas'],
        },
    },
    {
        code: '💳',
        name: {
            en: 'credit_card',
            es: 'tarjeta_de_crédito',
        },
        keywords: {
            en: ['card', 'credit', 'money'],
            es: ['crédito', 'tarjeta', 'tarjeta de crédito'],
        },
    },
    {
        code: '🧾',
        name: {
            en: 'receipt',
            es: 'recibo',
        },
        keywords: {
            en: ['accounting', 'bookkeeping', 'evidence', 'proof', 'receipt'],
            es: ['contabilidad', 'prueba', 'teneduría de libros', 'testimonio', 'recibo'],
        },
    },
    {
        code: '💹',
        name: {
            en: 'chart',
            es: 'gráfico',
        },
        keywords: {
            en: ['chart', 'graph', 'growth', 'money', 'yen', 'chart increasing with yen'],
            es: ['alza', 'mercado', 'mercado alcista', 'tabla', 'mercado al alza'],
        },
    },
    {
        code: '✉️',
        name: {
            en: 'email',
            es: 'correo',
        },
        keywords: {
            en: ['email', 'letter', 'envelope'],
            es: ['carta', 'correo', 'sobre'],
        },
    },
    {
        code: '📧',
        name: {
            en: 'e-mail',
            es: 'correo_electrónico',
        },
        keywords: {
            en: ['email', 'letter', 'mail', 'e-mail'],
            es: ['comunicación', 'correo', 'sobre', 'correo electrónico'],
        },
    },
    {
        code: '📨',
        name: {
            en: 'incoming_envelope',
            es: 'correo_entrante',
        },
        keywords: {
            en: ['e-mail', 'email', 'envelope', 'incoming', 'letter', 'receive'],
            es: ['carta', 'comunicación', 'correo', 'correo electrónico', 'sobre', 'sobre entrante'],
        },
    },
    {
        code: '📩',
        name: {
            en: 'envelope_with_arrow',
            es: 'sobre_con_flecha',
        },
        keywords: {
            en: ['arrow', 'e-mail', 'email', 'envelope', 'outgoing', 'envelope with arrow'],
            es: ['carta', 'comunicación', 'correo', 'correo electrónico', 'sobre', 'sobre con flecha'],
        },
    },
    {
        code: '📤',
        name: {
            en: 'outbox_tray',
            es: 'bandeja_de_salida',
        },
        keywords: {
            en: ['box', 'letter', 'mail', 'outbox', 'sent', 'tray'],
            es: ['bandeja', 'comunicación', 'correo', 'enviado', 'salida', 'bandeja de salida'],
        },
    },
    {
        code: '📥',
        name: {
            en: 'inbox_tray',
            es: 'bandeja_de_entrada',
        },
        keywords: {
            en: ['box', 'inbox', 'letter', 'mail', 'receive', 'tray'],
            es: ['bandeja', 'comunicación', 'correo', 'entrada', 'recibido', 'bandeja de entrada'],
        },
    },
    {
        code: '📦',
        name: {
            en: 'package',
            es: 'paquete',
        },
        keywords: {
            en: ['box', 'parcel', 'package'],
            es: ['caja', 'paquete'],
        },
    },
    {
        code: '📫',
        name: {
            en: 'mailbox',
            es: 'buzón',
        },
        keywords: {
            en: ['closed', 'mail', 'mailbox', 'postbox', 'closed mailbox with raised flag'],
            es: ['bandera', 'buzón', 'buzón cerrado', 'con contenido', 'buzón cerrado con la bandera levantada'],
        },
    },
    {
        code: '📪',
        name: {
            en: 'mailbox_closed',
            es: 'buzón_cerrado',
        },
        keywords: {
            en: ['closed', 'lowered', 'mail', 'mailbox', 'postbox', 'closed mailbox with lowered flag'],
            es: ['bandera', 'buzón', 'buzón cerrado', 'vacío', 'buzón cerrado con la bandera bajada'],
        },
    },
    {
        code: '📬',
        name: {
            en: 'mailbox_with_mail',
            es: 'buzón_con_cartas',
        },
        keywords: {
            en: ['mail', 'mailbox', 'open', 'postbox', 'open mailbox with raised flag'],
            es: ['bandera', 'buzón', 'buzón abierto', 'con contenido', 'buzón abierto con la bandera levantada'],
        },
    },
    {
        code: '📭',
        name: {
            en: 'mailbox_with_no_mail',
            es: 'buzón_sin_cartas',
        },
        keywords: {
            en: ['lowered', 'mail', 'mailbox', 'open', 'postbox', 'open mailbox with lowered flag'],
            es: ['bandera', 'buzón', 'buzón abierto', 'vacío', 'buzón abierto con la bandera bajada'],
        },
    },
    {
        code: '📮',
        name: {
            en: 'postbox',
            es: 'carta_al_buzón',
        },
        keywords: {
            en: ['mail', 'mailbox', 'postbox'],
            es: ['cartas', 'correo', 'buzón'],
        },
    },
    {
        code: '🗳️',
        name: {
            en: 'ballot_box_with_ballot',
            es: 'urna_con_papeleta',
        },
        keywords: {
            en: ['ballot', 'box', 'ballot box with ballot'],
            es: ['papeleta', 'urna', 'voto', 'urna con papeleta'],
        },
    },
    {
        code: '✏️',
        name: {
            en: 'pencil2',
            es: 'lápiz2',
        },
        keywords: {
            en: ['pencil'],
            es: ['escolar', 'escribir', 'lapicero', 'lápiz'],
        },
    },
    {
        code: '✒️',
        name: {
            en: 'black_nib',
            es: 'plumín_negro',
        },
        keywords: {
            en: ['nib', 'pen', 'black nib'],
            es: ['bolígrafo', 'escribir', 'pluma', 'tinta', 'pluma negra'],
        },
    },
    {
        code: '🖋️',
        name: {
            en: 'lower_left_fountain_pen',
            es: 'pluma_estilográfica_abajo_a_la_izquierda',
        },
        keywords: {
            en: ['fountain', 'pen'],
            es: ['bolígrafo', 'escribir', 'pluma', 'tinta', 'estilográfica'],
        },
    },
    {
        code: '🖊️',
        name: {
            en: 'lower_left_ballpoint_pen',
            es: 'bolígrafo_abajo_a_la_izquierda',
        },
        keywords: {
            en: ['ballpoint', 'pen'],
            es: ['boli', 'escribir', 'bolígrafo'],
        },
    },
    {
        code: '🖌️',
        name: {
            en: 'lower_left_paintbrush',
            es: 'pincel_abajo_a_la_izquierda',
        },
        keywords: {
            en: ['painting', 'paintbrush'],
            es: ['pintar', 'pincel'],
        },
    },
    {
        code: '🖍️',
        name: {
            en: 'lower_left_crayon',
            es: 'lápiz_abajo_a_la_izquierda',
        },
        keywords: {
            en: ['crayon'],
            es: ['cera', 'lápiz', 'lápiz de cera'],
        },
    },
    {
        code: '📝',
        name: {
            en: 'memo',
            es: 'nota',
        },
        keywords: {
            en: ['pencil', 'memo'],
            es: ['comunicación', 'cuaderno de notas'],
        },
    },
    {
        code: '💼',
        name: {
            en: 'briefcase',
            es: 'maletín',
        },
        keywords: {
            en: ['briefcase'],
            es: ['cartera', 'documentos', 'maletín'],
        },
    },
    {
        code: '📁',
        name: {
            en: 'file_folder',
            es: 'carpeta_de_archivos',
        },
        keywords: {
            en: ['file', 'folder'],
            es: ['archivo', 'carpeta', 'carpeta de archivos'],
        },
    },
    {
        code: '📂',
        name: {
            en: 'open_file_folder',
            es: 'carpeta_abierta',
        },
        keywords: {
            en: ['file', 'folder', 'open'],
            es: ['abierta', 'archivo', 'carpeta', 'carpeta de archivos abierta'],
        },
    },
    {
        code: '🗂️',
        name: {
            en: 'card_index_dividers',
            es: 'separadores_de_índice_de_tarjetas',
        },
        keywords: {
            en: ['card', 'dividers', 'index'],
            es: ['fichas', 'fichero', 'separador', 'separador de fichas'],
        },
    },
    {
        code: '📅',
        name: {
            en: 'date',
            es: 'fecha',
        },
        keywords: {
            en: ['date', 'calendar'],
            es: ['fecha', 'calendario'],
        },
    },
    {
        code: '📆',
        name: {
            en: 'calendar',
            es: 'calendario',
        },
        keywords: {
            en: ['calendar', 'tear-off calendar'],
            es: ['calendario', 'fecha', 'calendario recortable'],
        },
    },
    {
        code: '🗒️',
        name: {
            en: 'spiral_note_pad',
            es: 'cuaderno_de_espiral',
        },
        keywords: {
            en: ['note', 'pad', 'spiral', 'spiral notepad'],
            es: ['bloc', 'cuaderno', 'espiral', 'notas', 'bloc de notas de espiral'],
        },
    },
    {
        code: '🗓️',
        name: {
            en: 'spiral_calendar_pad',
            es: 'calendario_de_sobremesa',
        },
        keywords: {
            en: ['calendar', 'pad', 'spiral'],
            es: ['calendario', 'espiral', 'calendario de espiral'],
        },
    },
    {
        code: '📇',
        name: {
            en: 'card_index',
            es: 'índice_de_tarjetas',
        },
        keywords: {
            en: ['card', 'index', 'rolodex'],
            es: ['cartera', 'ficha', 'organizador', 'tarjetas', 'organizador de fichas'],
        },
    },
    {
        code: '📈',
        name: {
            en: 'chart_with_upwards_trend',
            es: 'gráfico_con_tendencia_ascendente',
        },
        keywords: {
            en: ['chart', 'graph', 'growth', 'trend', 'upward', 'chart increasing'],
            es: ['ascendente', 'gráfica', 'gráfico', 'tendencia ascendente', 'gráfica de evolución ascendente'],
        },
    },
    {
        code: '📉',
        name: {
            en: 'chart_with_downwards_trend',
            es: 'gráfico_con_tendencia_descendente',
        },
        keywords: {
            en: ['chart', 'down', 'graph', 'trend', 'chart decreasing'],
            es: ['descendente', 'gráfica', 'gráfico', 'tendencia descendente', 'gráfica de evolución descendente'],
        },
    },
    {
        code: '📊',
        name: {
            en: 'bar_chart',
            es: 'gráfico_de_barras',
        },
        keywords: {
            en: ['bar', 'chart', 'graph'],
            es: ['barras', 'gráfico', 'gráfico de barras'],
        },
    },
    {
        code: '📋',
        name: {
            en: 'clipboard',
            es: 'portapapeles',
        },
        keywords: {
            en: ['clipboard'],
            es: ['papeles', 'pinza', 'tabla', 'portapapeles'],
        },
    },
    {
        code: '📌',
        name: {
            en: 'pushpin',
            es: 'chincheta',
        },
        keywords: {
            en: ['pin', 'pushpin'],
            es: ['tachuela', 'chincheta'],
        },
    },
    {
        code: '📍',
        name: {
            en: 'round_pushpin',
            es: 'tachuela_redonda',
        },
        keywords: {
            en: ['pin', 'pushpin', 'round pushpin'],
            es: ['chincheta', 'chincheta redonda'],
        },
    },
    {
        code: '📎',
        name: {
            en: 'paperclip',
            es: 'clip',
        },
        keywords: {
            en: ['paperclip'],
            es: ['clip'],
        },
    },
    {
        code: '🖇️',
        name: {
            en: 'linked_paperclips',
            es: 'clips_unidos',
        },
        keywords: {
            en: ['link', 'paperclip', 'linked paperclips'],
            es: ['clips', 'unidos', 'unión'],
        },
    },
    {
        code: '📏',
        name: {
            en: 'straight_ruler',
            es: 'regla',
        },
        keywords: {
            en: ['ruler', 'straight edge', 'straight ruler'],
            es: ['regla'],
        },
    },
    {
        code: '📐',
        name: {
            en: 'triangular_ruler',
            es: 'escuadra',
        },
        keywords: {
            en: ['ruler', 'set', 'triangle', 'triangular ruler'],
            es: ['regla', 'regla triangular', 'triángulo', 'escuadra'],
        },
    },
    {
        code: '✂️',
        name: {
            en: 'scissors',
            es: 'tijeras',
        },
        keywords: {
            en: ['cutting', 'tool', 'scissors'],
            es: ['cortar', 'herramienta', 'tijeras'],
        },
    },
    {
        code: '🗃️',
        name: {
            en: 'card_file_box',
            es: 'fichero_de_tarjetas',
        },
        keywords: {
            en: ['box', 'card', 'file'],
            es: ['archivador', 'archivo', 'caja', 'archivador de tarjetas'],
        },
    },
    {
        code: '🗄️',
        name: {
            en: 'file_cabinet',
            es: 'archivador',
        },
        keywords: {
            en: ['cabinet', 'file', 'filing'],
            es: ['archivos', 'oficina', 'organizador', 'archivador'],
        },
    },
    {
        code: '🗑️',
        name: {
            en: 'wastebasket',
            es: 'papelera',
        },
        keywords: {
            en: ['wastebasket'],
            es: ['basura', 'cubo', 'papelera'],
        },
    },
    {
        code: '🔒',
        name: {
            en: 'lock',
            es: 'candado',
        },
        keywords: {
            en: ['closed', 'locked'],
            es: ['candado', 'cerrado', 'cerrar'],
        },
    },
    {
        code: '🔓',
        name: {
            en: 'unlock',
            es: 'activar',
        },
        keywords: {
            en: ['lock', 'open', 'unlock', 'unlocked'],
            es: ['abierto', 'abrir', 'candado'],
        },
    },
    {
        code: '🔏',
        name: {
            en: 'lock_with_ink_pen',
            es: 'candado_con_pluma_de_tinta',
        },
        keywords: {
            en: ['ink', 'lock', 'nib', 'pen', 'privacy', 'locked with pen'],
            es: ['candado', 'cerrado', 'estilográfica', 'pluma', 'privacidad', 'candado con pluma estilográfica'],
        },
    },
    {
        code: '🔐',
        name: {
            en: 'closed_lock_with_key',
            es: 'candado_cerrado_con_llave',
        },
        keywords: {
            en: ['closed', 'key', 'lock', 'secure', 'locked with key'],
            es: ['candado', 'cerrado', 'llave', 'seguro', 'candado cerrado y llave'],
        },
    },
    {
        code: '🔑',
        name: {
            en: 'key',
            es: 'llave',
        },
        keywords: {
            en: ['lock', 'password', 'key'],
            es: ['contraseña', 'llave'],
        },
    },
    {
        code: '🗝️',
        name: {
            en: 'old_key',
            es: 'llave_vieja',
        },
        keywords: {
            en: ['clue', 'key', 'lock', 'old'],
            es: ['antigua', 'llave'],
        },
    },
    {
        code: '🔨',
        name: {
            en: 'hammer',
            es: 'martillo',
        },
        keywords: {
            en: ['tool', 'hammer'],
            es: ['herramienta', 'martillo'],
        },
    },
    {
        code: '🪓',
        name: {
            en: 'axe',
            es: 'hacha',
        },
        keywords: {
            en: ['chop', 'hatchet', 'split', 'wood', 'axe'],
            es: ['cortar', 'dividir', 'hachuela', 'madera', 'talar', 'hacha'],
        },
    },
    {
        code: '⛏️',
        name: {
            en: 'pick',
            es: 'pico',
        },
        keywords: {
            en: ['mining', 'tool', 'pick'],
            es: ['herramienta', 'mina', 'pico'],
        },
    },
    {
        code: '⚒️',
        name: {
            en: 'hammer_and_pick',
            es: 'martillo_y_pico',
        },
        keywords: {
            en: ['hammer', 'pick', 'tool', 'hammer and pick'],
            es: ['herramienta', 'martillo', 'pico', 'martillo y pico'],
        },
    },
    {
        code: '🛠️',
        name: {
            en: 'hammer_and_wrench',
            es: 'martillo_y_llave_inglesa',
        },
        keywords: {
            en: ['hammer', 'spanner', 'tool', 'wrench', 'hammer and wrench'],
            es: ['herramienta', 'llave inglesa', 'martillo', 'martillo y llave inglesa'],
        },
    },
    {
        code: '🗡️',
        name: {
            en: 'dagger_knife',
            es: 'daga',
        },
        keywords: {
            en: ['knife', 'weapon', 'dagger'],
            es: ['arma', 'cuchillo', 'daga', 'puñal'],
        },
    },
    {
        code: '⚔️',
        name: {
            en: 'crossed_swords',
            es: 'espadas_cruzadas',
        },
        keywords: {
            en: ['crossed', 'swords', 'weapon'],
            es: ['arma', 'cruzadas', 'espadas'],
        },
    },
    {
        code: '💣',
        name: {
            en: 'bomb',
            es: 'bomba',
        },
        keywords: {
            en: ['comic', 'bomb'],
            es: ['cómic', 'emoción', 'bomba'],
        },
    },
    {
        code: '🪃',
        name: {
            en: 'boomerang',
            es: 'bumerán',
        },
        keywords: {
            en: ['rebound', 'repercussion', 'boomerang'],
            es: ['boomerang', 'rebotar', 'bumerán'],
        },
    },
    {
        code: '🏹',
        name: {
            en: 'bow_and_arrow',
            es: 'arco_y_flecha',
        },
        keywords: {
            en: ['archer', 'arrow', 'bow', 'Sagittarius', 'zodiac', 'bow and arrow'],
            es: ['arco', 'arquero', 'flecha', 'sagitario', 'zodiaco', 'arco y flecha'],
        },
    },
    {
        code: '🛡️',
        name: {
            en: 'shield',
            es: 'escudo',
        },
        keywords: {
            en: ['weapon', 'shield'],
            es: ['defensa', 'escudo'],
        },
    },
    {
        code: '🪚',
        name: {
            en: 'carpentry_saw',
            es: 'sierra_de_carpintería',
        },
        keywords: {
            en: ['carpenter', 'lumber', 'saw', 'tool', 'carpentry saw'],
            es: ['carpintería', 'carpintero', 'herramienta', 'sierra', 'talar', 'sierra de carpintería'],
        },
    },
    {
        code: '🔧',
        name: {
            en: 'wrench',
            es: 'llave_de_tuerca',
        },
        keywords: {
            en: ['spanner', 'tool', 'wrench'],
            es: ['herramienta', 'llave inglesa'],
        },
    },
    {
        code: '🪛',
        name: {
            en: 'screwdriver',
            es: 'destornillador',
        },
        keywords: {
            en: ['screw', 'tool', 'screwdriver'],
            es: ['atornillador', 'herramienta', 'tornillo', 'destornillador'],
        },
    },
    {
        code: '🔩',
        name: {
            en: 'nut_and_bolt',
            es: 'tuerca_y_perno',
        },
        keywords: {
            en: ['bolt', 'nut', 'tool', 'nut and bolt'],
            es: ['herramienta', 'tornillo', 'tuerca', 'tornillo y tuerca'],
        },
    },
    {
        code: '⚙️',
        name: {
            en: 'gear',
            es: 'engranaje',
        },
        keywords: {
            en: ['cog', 'cogwheel', 'tool', 'gear'],
            es: ['herramienta', 'engranaje'],
        },
    },
    {
        code: '🗜️',
        name: {
            en: 'compression',
            es: 'compresión',
        },
        keywords: {
            en: ['compress', 'tool', 'vice', 'clamp'],
            es: ['herramienta', 'tornillo', 'tornillo de banco'],
        },
    },
    {
        code: '⚖️',
        name: {
            en: 'scales',
            es: 'balanza',
        },
        keywords: {
            en: ['balance', 'justice', 'Libra', 'scale', 'zodiac'],
            es: ['justicia', 'libra', 'peso', 'zodiaco', 'balanza'],
        },
    },
    {
        code: '🦯',
        name: {
            en: 'probing_cane',
            es: 'bastón',
        },
        keywords: {
            en: ['accessibility', 'blind', 'white cane'],
            es: ['accesibilidad', 'ceguera', 'ciega', 'ciego', 'invidente', 'bastón'],
        },
    },
    {
        code: '🔗',
        name: {
            en: 'link',
            es: 'eslabón',
        },
        keywords: {
            en: ['link'],
            es: ['eslabón'],
        },
    },
    {
        code: '⛓️',
        name: {
            en: 'chains',
            es: 'cadenas',
        },
        keywords: {
            en: ['chain', 'chains'],
            es: ['cadena', 'cadenas'],
        },
    },
    {
        code: '🪝',
        name: {
            en: 'hook',
            es: 'gancho',
        },
        keywords: {
            en: ['catch', 'crook', 'curve', 'ensnare', 'selling point', 'hook'],
            es: ['agarrar', 'anzuelo', 'atrapar', 'garfio', 'gancho'],
        },
    },
    {
        code: '🧰',
        name: {
            en: 'toolbox',
            es: 'caja_de_herramientas',
        },
        keywords: {
            en: ['chest', 'mechanic', 'tool', 'toolbox'],
            es: ['armario', 'herramienta', 'mecánico', 'caja de herramientas'],
        },
    },
    {
        code: '🧲',
        name: {
            en: 'magnet',
            es: 'imán',
        },
        keywords: {
            en: ['attraction', 'horseshoe', 'magnetic', 'magnet'],
            es: ['atracción', 'herradura', 'magnético', 'imán'],
        },
    },
    {
        code: '🪜',
        name: {
            en: 'ladder',
            es: 'escalera',
        },
        keywords: {
            en: ['climb', 'rung', 'step', 'ladder'],
            es: ['escalar', 'escalerilla', 'escalón', 'peldaño', 'escalera'],
        },
    },
    {
        code: '⚗️',
        name: {
            en: 'alembic',
            es: 'alambique',
        },
        keywords: {
            en: ['chemistry', 'tool', 'alembic'],
            es: ['herramienta', 'química', 'alambique'],
        },
    },
    {
        code: '🧪',
        name: {
            en: 'test_tube',
            es: 'tubo_de_ensayo',
        },
        keywords: {
            en: ['chemist', 'chemistry', 'experiment', 'lab', 'science', 'test tube'],
            es: ['ciencia', 'experimento', 'laboratorio', 'química', 'químico', 'tubo de ensayo'],
        },
    },
    {
        code: '🧫',
        name: {
            en: 'petri_dish',
            es: 'placa_de_petri',
        },
        keywords: {
            en: ['bacteria', 'biologist', 'biology', 'culture', 'lab', 'petri dish'],
            es: ['bacterias', 'biología', 'biólogo', 'cultivo', 'laboratorio', 'placa de petri'],
        },
    },
    {
        code: '🧬',
        name: {
            en: 'dna',
            es: 'adn',
        },
        keywords: {
            en: ['biologist', 'evolution', 'gene', 'genetics', 'life', 'dna'],
            es: ['biólogo', 'evolución', 'gen', 'genética', 'vida', 'adn'],
        },
    },
    {
        code: '🔬',
        name: {
            en: 'microscope',
            es: 'microscopio',
        },
        keywords: {
            en: ['science', 'tool', 'microscope'],
            es: ['instrumento', 'laboratorio', 'microscopio'],
        },
    },
    {
        code: '🔭',
        name: {
            en: 'telescope',
            es: 'telescopio',
        },
        keywords: {
            en: ['science', 'tool', 'telescope'],
            es: ['astronomía', 'instrumento', 'telescopio'],
        },
    },
    {
        code: '📡',
        name: {
            en: 'satellite_antenna',
            es: 'antena_de_satélite',
        },
        keywords: {
            en: ['antenna', 'dish', 'satellite'],
            es: ['antena', 'comunicación', 'satélite', 'antena de satélite'],
        },
    },
    {
        code: '💉',
        name: {
            en: 'syringe',
            es: 'jeringuilla',
        },
        keywords: {
            en: ['medicine', 'needle', 'shot', 'sick', 'syringe'],
            es: ['aguja', 'jeringa', 'medicina', 'médico', 'jeringuilla'],
        },
    },
    {
        code: '🩸',
        name: {
            en: 'drop_of_blood',
            es: 'gota_de_sangre',
        },
        keywords: {
            en: ['bleed', 'blood donation', 'injury', 'medicine', 'menstruation', 'drop of blood'],
            es: ['donación de sangre', 'donar sangre', 'herida', 'medicina', 'sangre', 'gota de sangre'],
        },
    },
    {
        code: '💊',
        name: {
            en: 'pill',
            es: 'píldora',
        },
        keywords: {
            en: ['doctor', 'medicine', 'sick', 'pill'],
            es: ['comprimido', 'medicina', 'médico', 'pastilla', 'píldora'],
        },
    },
    {
        code: '🩹',
        name: {
            en: 'adhesive_bandage',
            es: 'tirita',
        },
        keywords: {
            en: ['bandage', 'adhesive bandage'],
            es: ['apósito', 'tirita'],
        },
    },
    {
        code: '🩺',
        name: {
            en: 'stethoscope',
            es: 'estetoscopio',
        },
        keywords: {
            en: ['doctor', 'heart', 'medicine', 'stethoscope'],
            es: ['corazón', 'doctor', 'fonendoscopio', 'latido', 'medicina', 'médico', 'estetoscopio'],
        },
    },
    {
        code: '🚪',
        name: {
            en: 'door',
            es: 'puerta',
        },
        keywords: {
            en: ['door'],
            es: ['puerta'],
        },
    },
    {
        code: '🛗',
        name: {
            en: 'elevator',
            es: 'ascensor',
        },
        keywords: {
            en: ['accessibility', 'hoist', 'lift', 'elevator'],
            es: ['accesibilidad', 'elevador', 'montacargas', 'ascensor'],
        },
    },
    {
        code: '🪞',
        name: {
            en: 'mirror',
            es: 'espejo',
        },
        keywords: {
            en: ['reflection', 'reflector', 'speculum', 'mirror'],
            es: ['espéculo', 'reflector', 'reflejo', 'espejo'],
        },
    },
    {
        code: '🪟',
        name: {
            en: 'window',
            es: 'ventana',
        },
        keywords: {
            en: ['frame', 'fresh air', 'opening', 'transparent', 'view', 'window'],
            es: ['abertura', 'apertura', 'cristal', 'marco', 'transparente', 'vista', 'ventana'],
        },
    },
    {
        code: '🛏️',
        name: {
            en: 'bed',
            es: 'cama',
        },
        keywords: {
            en: ['hotel', 'sleep', 'bed'],
            es: ['dormir', 'hotel', 'cama'],
        },
    },
    {
        code: '🛋️',
        name: {
            en: 'couch_and_lamp',
            es: 'sofá_y_lámpara',
        },
        keywords: {
            en: ['couch', 'hotel', 'lamp', 'couch and lamp'],
            es: ['hotel', 'lámpara', 'sofá', 'sofá y lámpara'],
        },
    },
    {
        code: '🪑',
        name: {
            en: 'chair',
            es: 'silla',
        },
        keywords: {
            en: ['seat', 'sit', 'chair'],
            es: ['asiento', 'sentarse', 'silla'],
        },
    },
    {
        code: '🚽',
        name: {
            en: 'toilet',
            es: 'baño',
        },
        keywords: {
            en: ['toilet'],
            es: ['baño', 'váter', 'wc', 'inodoro'],
        },
    },
    {
        code: '🪠',
        name: {
            en: 'plunger',
            es: 'desatascador',
        },
        keywords: {
            en: ['force cup', 'plumber', 'suction', 'toilet', 'plunger'],
            es: ['fontanero', 'retrete', 'servicio', 'succión', 'desatascador'],
        },
    },
    {
        code: '🚿',
        name: {
            en: 'shower',
            es: 'ducha',
        },
        keywords: {
            en: ['water', 'shower'],
            es: ['agua', 'baño', 'ducha'],
        },
    },
    {
        code: '🛁',
        name: {
            en: 'bathtub',
            es: 'bañera',
        },
        keywords: {
            en: ['bath', 'bathtub'],
            es: ['baño', 'bañera'],
        },
    },
    {
        code: '🪤',
        name: {
            en: 'mouse_trap',
            es: 'ratonera',
        },
        keywords: {
            en: ['bait', 'mousetrap', 'snare', 'trap', 'mouse trap'],
            es: ['cebo', 'cepo', 'engañar', 'ratón', 'ratonera', 'trampa', 'trampa de ratones'],
        },
    },
    {
        code: '🪒',
        name: {
            en: 'razor',
            es: 'cuchilla_de_afeitar',
        },
        keywords: {
            en: ['sharp', 'shave', 'razor'],
            es: ['afeitado', 'afeitar', 'afilado', 'barbero', 'navaja', 'cuchilla de afeitar'],
        },
    },
    {
        code: '🧴',
        name: {
            en: 'lotion_bottle',
            es: 'bote_de_crema',
        },
        keywords: {
            en: ['lotion', 'moisturizer', 'shampoo', 'sunscreen', 'lotion bottle'],
            es: ['champú', 'crema', 'hidratante', 'protector solar', 'bote de crema'],
        },
    },
    {
        code: '🧷',
        name: {
            en: 'safety_pin',
            es: 'imperdible',
        },
        keywords: {
            en: ['diaper', 'punk rock', 'safety pin'],
            es: ['pañal', 'punk rock', 'imperdible'],
        },
    },
    {
        code: '🧹',
        name: {
            en: 'broom',
            es: 'escoba',
        },
        keywords: {
            en: ['cleaning', 'sweeping', 'witch', 'broom'],
            es: ['barrer', 'bruja', 'fregar', 'escoba'],
        },
    },
    {
        code: '🧺',
        name: {
            en: 'basket',
            es: 'cesta',
        },
        keywords: {
            en: ['farming', 'laundry', 'picnic', 'basket'],
            es: ['colada', 'cosecha', 'pícnic', 'cesta'],
        },
    },
    {
        code: '🧻',
        name: {
            en: 'roll_of_paper',
            es: 'rollo_de_papel',
        },
        keywords: {
            en: ['paper towels', 'toilet paper', 'roll of paper'],
            es: ['papel absorbente', 'papel higiénico', 'rollo de papel'],
        },
    },
    {
        code: '🪣',
        name: {
            en: 'bucket',
            es: 'cubo',
        },
        keywords: {
            en: ['cask', 'pail', 'vat', 'bucket'],
            es: ['balde', 'barreño', 'cuba', 'cubeta', 'cubo'],
        },
    },
    {
        code: '🧼',
        name: {
            en: 'soap',
            es: 'jabón',
        },
        keywords: {
            en: ['bar', 'bathing', 'cleaning', 'lather', 'soapdish', 'soap'],
            es: ['bañarse', 'enjabonarse', 'jabonera', 'lavarse', 'pastilla', 'jabón'],
        },
    },
    {
        code: '🪥',
        name: {
            en: 'toothbrush',
            es: 'cepillo_de_dientes',
        },
        keywords: {
            en: ['bathroom', 'brush', 'clean', 'dental', 'hygiene', 'teeth', 'toothbrush'],
            es: ['cepillo', 'dental', 'higiene', 'limpio', 'servicio', 'cepillo de dientes'],
        },
    },
    {
        code: '🧽',
        name: {
            en: 'sponge',
            es: 'esponja',
        },
        keywords: {
            en: ['absorbing', 'cleaning', 'porous', 'sponge'],
            es: ['absorbente', 'limpiar', 'poroso', 'esponja'],
        },
    },
    {
        code: '🧯',
        name: {
            en: 'fire_extinguisher',
            es: 'extintor',
        },
        keywords: {
            en: ['extinguish', 'fire', 'quench', 'fire extinguisher'],
            es: ['apagar', 'extinguir', 'incendio', 'extintor'],
        },
    },
    {
        code: '🛒',
        name: {
            en: 'shopping_trolley',
            es: 'carrito_de_compras',
        },
        keywords: {
            en: ['cart', 'shopping', 'trolley'],
            es: ['carrito', 'carro', 'compra', 'supermercado', 'carrito de la compra'],
        },
    },
    {
        code: '🚬',
        name: {
            en: 'smoking',
            es: 'fumando',
        },
        keywords: {
            en: ['smoking', 'cigarette'],
            es: ['cigarro', 'fumar', 'cigarrillo'],
        },
    },
    {
        code: '⚰️',
        name: {
            en: 'coffin',
            es: 'ataúd',
        },
        keywords: {
            en: ['death', 'coffin'],
            es: ['muerte', 'ataúd'],
        },
    },
    {
        code: '🪦',
        name: {
            en: 'headstone',
            es: 'lápida',
        },
        keywords: {
            en: ['cemetery', 'grave', 'graveyard', 'tombstone', 'headstone'],
            es: ['cementario', 'estela', 'sepulcro', 'tumba', 'lápida'],
        },
    },
    {
        code: '⚱️',
        name: {
            en: 'funeral_urn',
            es: 'urna_funeraria',
        },
        keywords: {
            en: ['ashes', 'death', 'funeral', 'urn'],
            es: ['funeraria', 'muerte', 'urna'],
        },
    },
    {
        code: '🧿',
        name: {
            en: 'nazar_amulet',
            es: 'ojo_turco',
        },
        keywords: {
            en: ['bead', 'charm', 'evil-eye', 'nazar', 'talisman', 'nazar amulet'],
            es: ['amuleto', 'mal de ojo', 'nazar', 'talismán', 'ojo turco'],
        },
    },
    {
        code: '🗿',
        name: {
            en: 'moyai',
            es: 'moái',
        },
        keywords: {
            en: ['face', 'moyai', 'statue', 'moai'],
            es: ['estatua', 'moái', 'Pascua'],
        },
    },
    {
        code: '🪧',
        name: {
            en: 'placard',
            es: 'letrero',
        },
        keywords: {
            en: ['demonstration', 'picket', 'protest', 'sign', 'placard'],
            es: ['anuncio', 'aviso', 'cartel', 'pancarta', 'poste', 'letrero'],
        },
    },
    {
        code: 'symbols',
        icon: Symbols,
        header: true,
    },
    {
        code: '🏧',
        name: {
            en: 'atm',
            es: 'cajero_automático',
        },
        keywords: {
            en: ['ATM', 'automated', 'bank', 'teller', 'ATM sign'],
            es: ['atm', 'banco', 'cajero', 'señal de cajero automático'],
        },
    },
    {
        code: '🚮',
        name: {
            en: 'put_litter_in_its_place',
            es: 'la_basura_en_su_lugar',
        },
        keywords: {
            en: ['litter', 'litter bin', 'litter in bin sign'],
            es: ['basura', 'papelera', 'señal', 'tirar la basura en la papelera', 'señal de usar papelera'],
        },
    },
    {
        code: '🚰',
        name: {
            en: 'potable_water',
            es: 'agua_potable',
        },
        keywords: {
            en: ['drinking', 'potable', 'water'],
            es: ['agua', 'potable'],
        },
    },
    {
        code: '♿',
        name: {
            en: 'wheelchair',
            es: 'silla_de_ruedas',
        },
        keywords: {
            en: ['access', 'wheelchair symbol'],
            es: ['acceso', 'señal', 'silla', 'silla de ruedas', 'símbolo', 'símbolo de silla de ruedas'],
        },
    },
    {
        code: '🚹',
        name: {
            en: 'mens',
            es: 'baño_de_hombres',
        },
        keywords: {
            en: ['bathroom', 'lavatory', 'man', 'restroom', 'toilet', 'WC', 'men’s room'],
            es: ['aseo de caballeros', 'baño', 'señal', 'señal con un hombre', 'servicio', 'aseo para hombres'],
        },
    },
    {
        code: '🚺',
        name: {
            en: 'womens',
            es: 'baño_de_mujeres',
        },
        keywords: {
            en: ['bathroom', 'lavatory', 'restroom', 'toilet', 'WC', 'woman', 'women’s room'],
            es: ['aseo de señoras', 'baño', 'señal', 'señal con una mujer', 'servicio', 'señal de aseo para mujeres'],
        },
    },
    {
        code: '🚻',
        name: {
            en: 'restroom',
            es: 'signo_de_baño',
        },
        keywords: {
            en: ['bathroom', 'lavatory', 'toilet', 'WC', 'restroom'],
            es: ['aseos', 'servicios', 'wc', 'señal de aseos'],
        },
    },
    {
        code: '🚼',
        name: {
            en: 'baby_symbol',
            es: 'símbolo_de_bebé',
        },
        keywords: {
            en: ['baby', 'changing', 'baby symbol'],
            es: ['bebé', 'cambiar', 'lactancia', 'señal de bebé'],
        },
    },
    {
        code: '🚾',
        name: {
            en: 'wc',
            es: 'wc',
        },
        keywords: {
            en: ['bathroom', 'closet', 'lavatory', 'restroom', 'toilet', 'water', 'WC'],
            es: ['lavabo', 'servicios', 'WC', 'aseos'],
        },
    },
    {
        code: '🛂',
        name: {
            en: 'passport_control',
            es: 'control_de_pasaportes',
        },
        keywords: {
            en: ['control', 'passport'],
            es: ['control', 'pasaportes', 'control de pasaportes'],
        },
    },
    {
        code: '🛃',
        name: {
            en: 'customs',
            es: 'aduana',
        },
        keywords: {
            en: ['customs'],
            es: ['aduana'],
        },
    },
    {
        code: '🛄',
        name: {
            en: 'baggage_claim',
            es: 'recogida_de_equipaje',
        },
        keywords: {
            en: ['baggage', 'claim'],
            es: ['equipaje', 'maleta', 'recogida de equipajes'],
        },
    },
    {
        code: '🛅',
        name: {
            en: 'left_luggage',
            es: 'consigna',
        },
        keywords: {
            en: ['baggage', 'locker', 'luggage', 'left luggage'],
            es: ['depósito', 'equipaje', 'servicio de equipaje en depósito', 'consigna'],
        },
    },
    {
        code: '⚠️',
        name: {
            en: 'warning',
            es: 'advertencia',
        },
        keywords: {
            en: ['warning'],
            es: ['cuidado', 'señal', 'advertencia'],
        },
    },
    {
        code: '🚸',
        name: {
            en: 'children_crossing',
            es: 'niños_cruzando',
        },
        keywords: {
            en: ['child', 'crossing', 'pedestrian', 'traffic', 'children crossing'],
            es: ['cruzando', 'niños', 'señal'],
        },
    },
    {
        code: '⛔',
        name: {
            en: 'no_entry',
            es: 'prohibido_el_paso',
        },
        keywords: {
            en: ['entry', 'forbidden', 'no', 'not', 'prohibited', 'traffic'],
            es: ['no', 'prohibido', 'señal', 'señal de dirección prohibida', 'dirección prohibida'],
        },
    },
    {
        code: '🚫',
        name: {
            en: 'no_entry_sign',
            es: 'señal_de_prohibido_el_paso',
        },
        keywords: {
            en: ['entry', 'forbidden', 'no', 'not', 'prohibited'],
            es: ['entrar', 'no', 'pasar', 'prohibición', 'prohibido'],
        },
    },
    {
        code: '🚳',
        name: {
            en: 'no_bicycles',
            es: 'prohibidas_bicicletas',
        },
        keywords: {
            en: ['bicycle', 'bike', 'forbidden', 'no', 'prohibited', 'no bicycles'],
            es: ['bicicleta', 'prohibido', 'vehículo', 'bicicletas prohibidas'],
        },
    },
    {
        code: '🚭',
        name: {
            en: 'no_smoking',
            es: 'prohibido_fumar',
        },
        keywords: {
            en: ['forbidden', 'no', 'not', 'prohibited', 'smoking'],
            es: ['fumar', 'no', 'prohibido', 'señal'],
        },
    },
    {
        code: '🚯',
        name: {
            en: 'do_not_litter',
            es: 'no_tirar_basura',
        },
        keywords: {
            en: ['forbidden', 'litter', 'no', 'not', 'prohibited', 'no littering'],
            es: ['basura', 'prohibido', 'señal', 'señal de no tirar basura', 'prohibido tirar basura'],
        },
    },
    {
        code: '🚱',
        name: {
            en: 'non-potable_water',
            es: 'agua_no_potable',
        },
        keywords: {
            en: ['non-drinking', 'non-potable', 'water'],
            es: ['agua', 'no potable', 'agua no potable'],
        },
    },
    {
        code: '🚷',
        name: {
            en: 'no_pedestrians',
            es: 'prohibido_el_paso_a_peatones',
        },
        keywords: {
            en: ['forbidden', 'no', 'not', 'pedestrian', 'prohibited', 'no pedestrians'],
            es: ['peatón', 'peatones', 'prohibido', 'señal', 'prohibido el paso de peatones'],
        },
    },
    {
        code: '📵',
        name: {
            en: 'no_mobile_phones',
            es: 'prohibidos_teléfonos_móviles',
        },
        keywords: {
            en: ['cell', 'forbidden', 'mobile', 'no', 'phone', 'no mobile phones'],
            es: ['móvil', 'no hacer llamadas', 'prohibido', 'teléfono', 'prohibido el uso de móviles'],
        },
    },
    {
        code: '🔞',
        name: {
            en: 'underage',
            es: 'menor_de_edad',
        },
        keywords: {
            en: ['18', 'age restriction', 'eighteen', 'prohibited', 'underage', 'no one under eighteen'],
            es: ['prohibido', 'prohibido para menores de 18 años', '18  no apto para menores', 'prohibido para menos de 18 años'],
        },
    },
    {
        code: '☢️',
        name: {
            en: 'radioactive_sign',
            es: 'señal_de_radioactividad',
        },
        keywords: {
            en: ['sign', 'radioactive'],
            es: ['radiactividad', 'radioactividad', 'radioactivo', 'señal', 'radiactivo'],
        },
    },
    {
        code: '☣️',
        name: {
            en: 'biohazard_sign',
            es: 'símbolo_de_riesgo_biológico',
        },
        keywords: {
            en: ['sign', 'biohazard'],
            es: ['peligro', 'señal', 'riesgo biológico'],
        },
    },
    {
        code: '⬆️',
        name: {
            en: 'arrow_up',
            es: 'flecha_hacia_arriba',
        },
        keywords: {
            en: ['arrow', 'cardinal', 'direction', 'north', 'up arrow'],
            es: ['dirección', 'flecha', 'flecha arriba', 'norte', 'flecha hacia arriba'],
        },
    },
    {
        code: '↗️',
        name: {
            en: 'arrow_upper_right',
            es: 'flecha_hacia_arriba_a_la_derecha',
        },
        keywords: {
            en: ['arrow', 'direction', 'intercardinal', 'northeast', 'up-right arrow'],
            es: ['arriba', 'derecha', 'dirección', 'flecha', 'noreste', 'flecha hacia la esquina superior derecha'],
        },
    },
    {
        code: '➡️',
        name: {
            en: 'arrow_right',
            es: 'flecha_a_la_derecha',
        },
        keywords: {
            en: ['arrow', 'cardinal', 'direction', 'east', 'right arrow'],
            es: ['derecha', 'dirección', 'este', 'flecha', 'flecha hacia la derecha'],
        },
    },
    {
        code: '↘️',
        name: {
            en: 'arrow_lower_right',
            es: 'flecha_abajo_a_la_derecha',
        },
        keywords: {
            en: ['arrow', 'direction', 'intercardinal', 'southeast', 'down-right arrow'],
            es: ['abajo', 'derecha', 'dirección', 'flecha', 'sudeste', 'flecha hacia la esquina inferior derecha'],
        },
    },
    {
        code: '⬇️',
        name: {
            en: 'arrow_down',
            es: 'flecha_hacia_abajo',
        },
        keywords: {
            en: ['arrow', 'cardinal', 'direction', 'down', 'south'],
            es: ['abajo', 'dirección', 'flecha', 'sur', 'flecha hacia abajo'],
        },
    },
    {
        code: '↙️',
        name: {
            en: 'arrow_lower_left',
            es: 'flecha_abajo_a_la_iquierda',
        },
        keywords: {
            en: ['arrow', 'direction', 'intercardinal', 'southwest', 'down-left arrow'],
            es: ['abajo', 'dirección', 'flecha', 'izquierda', 'suroeste', 'flecha hacia la esquina inferior izquierda'],
        },
    },
    {
        code: '⬅️',
        name: {
            en: 'arrow_left',
            es: 'flecha_a_la_izquierda',
        },
        keywords: {
            en: ['arrow', 'cardinal', 'direction', 'west', 'left arrow'],
            es: ['flecha', 'izquierda', 'oeste', 'flecha hacia la izquierda'],
        },
    },
    {
        code: '↖️',
        name: {
            en: 'arrow_upper_left',
            es: 'flecha_hacia_arriba_a_la_izquierda',
        },
        keywords: {
            en: ['arrow', 'direction', 'intercardinal', 'northwest', 'up-left arrow'],
            es: ['arriba', 'dirección', 'flecha', 'izquierda', 'noroeste', 'flecha hacia la esquina superior izquierda'],
        },
    },
    {
        code: '↕️',
        name: {
            en: 'arrow_up_down',
            es: 'flecha_hacia_arriba_y_hacia_abajo',
        },
        keywords: {
            en: ['arrow', 'up-down arrow'],
            es: ['abajo', 'arriba', 'dirección', 'flecha', 'flecha arriba y abajo'],
        },
    },
    {
        code: '↔️',
        name: {
            en: 'left_right_arrow',
            es: 'flecha_izquierda_derecha',
        },
        keywords: {
            en: ['arrow', 'left-right arrow'],
            es: ['derecha', 'dirección', 'flecha', 'izquierda', 'flecha izquierda y derecha'],
        },
    },
    {
        code: '↩️',
        name: {
            en: 'leftwards_arrow_with_hook',
            es: 'flecha_curvada_a_la_izquierda',
        },
        keywords: {
            en: ['arrow', 'right arrow curving left'],
            es: ['curva', 'dirección', 'flecha', 'izquierda', 'flecha derecha curvándose a la izquierda'],
        },
    },
    {
        code: '↪️',
        name: {
            en: 'arrow_right_hook',
            es: 'flecha_en_curva_a_la_derecha',
        },
        keywords: {
            en: ['arrow', 'left arrow curving right'],
            es: ['curva', 'derecha', 'dirección', 'flecha', 'flecha izquierda curvándose a la derecha'],
        },
    },
    {
        code: '⤴️',
        name: {
            en: 'arrow_heading_up',
            es: 'flecha_en_dirección_ascendente',
        },
        keywords: {
            en: ['arrow', 'right arrow curving up'],
            es: ['arriba', 'curva', 'dirección', 'flecha', 'flecha derecha curvándose hacia arriba'],
        },
    },
    {
        code: '⤵️',
        name: {
            en: 'arrow_heading_down',
            es: 'flecha_en_dirección_descendente',
        },
        keywords: {
            en: ['arrow', 'down', 'right arrow curving down'],
            es: ['abajo', 'curva', 'dirección', 'flecha', 'flecha derecha curvándose hacia abajo'],
        },
    },
    {
        code: '🔃',
        name: {
            en: 'arrows_clockwise',
            es: 'flechas_en_sentido_horario',
        },
        keywords: {
            en: ['arrow', 'clockwise', 'reload', 'clockwise vertical arrows'],
            es: ['flechas', 'flechas verticales sentido horario', 'horario', 'señal de recarga', 'flechas verticales en sentido horario'],
        },
    },
    {
        code: '🔄',
        name: {
            en: 'arrows_counterclockwise',
            es: 'flechas_en_sentido_antihorario',
        },
        keywords: {
            en: ['anticlockwise', 'arrow', 'counterclockwise', 'withershins', 'counterclockwise arrows button'],
            es: ['dirección', 'flechas', 'señal de recarga', 'sentido antihorario', 'flechas en sentido antihorario'],
        },
    },
    {
        code: '🔙',
        name: {
            en: 'back',
            es: 'atrás',
        },
        keywords: {
            en: ['arrow', 'BACK'],
            es: ['atrás', 'atrás con flecha izquierda', 'back', 'flecha', 'flecha a la izquierda', 'flecha BACK'],
        },
    },
    {
        code: '🔚',
        name: {
            en: 'end',
            es: 'fin',
        },
        keywords: {
            en: ['arrow', 'END'],
            es: ['final', 'final con flecha izquierda', 'flecha', 'flecha a la izquierda', 'flecha END'],
        },
    },
    {
        code: '🔛',
        name: {
            en: 'on',
            es: 'encendido',
        },
        keywords: {
            en: ['arrow', 'mark', 'ON', 'ON!'],
            es: ['flecha', 'on', 'señal', 'flecha de doble punta con la palabra "on" encima  flecha ON!'],
        },
    },
    {
        code: '🔜',
        name: {
            en: 'soon',
            es: 'pronto',
        },
        keywords: {
            en: ['arrow', 'SOON'],
            es: ['flecha', 'soon', 'soon con flecha a la derecha', 'flecha SOON'],
        },
    },
    {
        code: '🔝',
        name: {
            en: 'top',
            es: 'parte_superior',
        },
        keywords: {
            en: ['arrow', 'TOP', 'up'],
            es: ['arriba', 'flecha hacia arriba', 'top', 'top con flecha hacia arriba', 'flecha TOP'],
        },
    },
    {
        code: '🛐',
        name: {
            en: 'place_of_worship',
            es: 'lugar_de_culto',
        },
        keywords: {
            en: ['religion', 'worship', 'place of worship'],
            es: ['culto', 'religión', 'lugar de culto'],
        },
    },
    {
        code: '⚛️',
        name: {
            en: 'atom_symbol',
            es: 'símbolo_del_átomo',
        },
        keywords: {
            en: ['atheist', 'atom  atom symbol'],
            es: ['átomo', 'símbolo', 'símbolo de átomo'],
        },
    },
    {
        code: '🕉️',
        name: {
            en: 'om_symbol',
            es: 'símbolo_de_om',
        },
        keywords: {
            en: ['Hindu', 'religion', 'om'],
            es: ['hindú', 'religión', 'om'],
        },
    },
    {
        code: '✡️',
        name: {
            en: 'star_of_david',
            es: 'estrella_de_david',
        },
        keywords: {
            en: ['David', 'Jew', 'Jewish', 'religion', 'star', 'star of David'],
            es: ['david', 'estrella', 'estrella de david', 'estrella de David', 'judaísmo', 'religión'],
        },
    },
    {
        code: '☸️',
        name: {
            en: 'wheel_of_dharma',
            es: 'rueda_del_dharma',
        },
        keywords: {
            en: ['Buddhist', 'dharma', 'religion', 'wheel', 'wheel of dharma'],
            es: ['budismo', 'dharma', 'religión', 'rueda', 'rueda del dharma'],
        },
    },
    {
        code: '☯️',
        name: {
            en: 'yin_yang',
            es: 'yin_yang',
        },
        keywords: {
            en: ['religion', 'tao', 'taoist', 'yang', 'yin'],
            es: ['religión', 'taoísmo', 'yang', 'yin'],
        },
    },
    {
        code: '✝️',
        name: {
            en: 'latin_cross',
            es: 'cruz_latina',
        },
        keywords: {
            en: ['Christian', 'cross', 'religion', 'latin cross'],
            es: ['cristianismo', 'cruz', 'religión', 'cruz latina'],
        },
    },
    {
        code: '☦️',
        name: {
            en: 'orthodox_cross',
            es: 'cruz_ortodoxa',
        },
        keywords: {
            en: ['Christian', 'cross', 'religion', 'orthodox cross'],
            es: ['cruz', 'religión', 'cruz ortodoxa'],
        },
    },
    {
        code: '☪️',
        name: {
            en: 'star_and_crescent',
            es: 'estrella_y_luna_creciente',
        },
        keywords: {
            en: ['islam', 'Muslim', 'religion', 'star and crescent'],
            es: ['estrella', 'islam', 'luna', 'religión', 'media luna y estrella'],
        },
    },
    {
        code: '☮️',
        name: {
            en: 'peace_symbol',
            es: 'símbolo_de_la_paz',
        },
        keywords: {
            en: ['peace', 'peace symbol'],
            es: ['paz', 'símbolo de la paz'],
        },
    },
    {
        code: '🕎',
        name: {
            en: 'menorah_with_nine_branches',
            es: 'candelabro_de_nueve_brazos',
        },
        keywords: {
            en: ['candelabrum', 'candlestick', 'religion', 'menorah'],
            es: ['candelabro', 'religión', 'menorá'],
        },
    },
    {
        code: '🔯',
        name: {
            en: 'six_pointed_star',
            es: 'estrella_de_seis_puntas',
        },
        keywords: {
            en: ['fortune', 'star', 'dotted six-pointed star'],
            es: ['adivinación', 'buena fortuna', 'estrella', 'seis puntas', 'estrella de seis puntas'],
        },
    },
    {
        code: '♈',
        name: {
            en: 'aries',
            es: 'aries',
        },
        keywords: {
            en: ['ram', 'zodiac', 'Aries'],
            es: ['aries', 'Aries', 'carnero', 'zodiaco'],
        },
    },
    {
        code: '♉',
        name: {
            en: 'taurus',
            es: 'tauro',
        },
        keywords: {
            en: ['bull', 'ox', 'zodiac', 'Taurus'],
            es: ['buey', 'tauro', 'Tauro', 'toro', 'zodiaco'],
        },
    },
    {
        code: '♊',
        name: {
            en: 'gemini',
            es: 'géminis',
        },
        keywords: {
            en: ['twins', 'zodiac', 'Gemini'],
            es: ['gemelos', 'géminis', 'Géminis', 'zodiaco'],
        },
    },
    {
        code: '♋',
        name: {
            en: 'cancer',
            es: 'cáncer',
        },
        keywords: {
            en: ['crab', 'zodiac', 'Cancer'],
            es: ['cáncer', 'Cáncer', 'cangrejo', 'zodiaco'],
        },
    },
    {
        code: '♌',
        name: {
            en: 'leo',
            es: 'leo',
        },
        keywords: {
            en: ['lion', 'zodiac', 'Leo'],
            es: ['leo', 'Leo', 'león', 'zodiaco'],
        },
    },
    {
        code: '♍',
        name: {
            en: 'virgo',
            es: 'virgo',
        },
        keywords: {
            en: ['zodiac', 'Virgo'],
            es: ['zodiaco', 'virgo  Virgo'],
        },
    },
    {
        code: '♎',
        name: {
            en: 'libra',
            es: 'libra',
        },
        keywords: {
            en: ['balance', 'justice', 'scales', 'zodiac', 'Libra'],
            es: ['balanza', 'escala', 'justicia', 'libra', 'Libra', 'zodiaco'],
        },
    },
    {
        code: '♏',
        name: {
            en: 'scorpius',
            es: 'escorpio',
        },
        keywords: {
            en: ['Scorpio', 'scorpion', 'scorpius', 'zodiac'],
            es: ['escorpio', 'Escorpio', 'escorpión', 'zodiaco'],
        },
    },
    {
        code: '♐',
        name: {
            en: 'sagittarius',
            es: 'sagitario',
        },
        keywords: {
            en: ['archer', 'zodiac', 'Sagittarius'],
            es: ['arquero', 'sagitario', 'Sagitario', 'zodiaco'],
        },
    },
    {
        code: '♑',
        name: {
            en: 'capricorn',
            es: 'capricornio',
        },
        keywords: {
            en: ['goat', 'zodiac', 'Capricorn'],
            es: ['cabra', 'capricornio', 'Capricornio', 'zodiaco'],
        },
    },
    {
        code: '♒',
        name: {
            en: 'aquarius',
            es: 'acuario',
        },
        keywords: {
            en: ['bearer', 'water', 'zodiac', 'Aquarius'],
            es: ['acuario', 'Acuario', 'agua', 'zodiaco'],
        },
    },
    {
        code: '♓',
        name: {
            en: 'pisces',
            es: 'piscis',
        },
        keywords: {
            en: ['fish', 'zodiac', 'Pisces'],
            es: ['pescado', 'pez', 'piscis', 'Piscis', 'zodiaco'],
        },
    },
    {
        code: '⛎',
        name: {
            en: 'ophiuchus',
            es: 'ofiuco',
        },
        keywords: {
            en: ['bearer', 'serpent', 'snake', 'zodiac', 'Ophiuchus'],
            es: ['ofiuco', 'Ofiuco', 'serpiente', 'zodiaco'],
        },
    },
    {
        code: '🔀',
        name: {
            en: 'twisted_rightwards_arrows',
            es: 'flechas_cruzadas_hacia_la_derecha',
        },
        keywords: {
            en: ['arrow', 'crossed', 'shuffle tracks button'],
            es: ['cruzado', 'flechas', 'flechas entrecruzadas', 'reproducción aleatoria'],
        },
    },
    {
        code: '🔁',
        name: {
            en: 'repeat',
            es: 'repetir',
        },
        keywords: {
            en: ['arrow', 'clockwise', 'repeat', 'repeat button'],
            es: ['flechas', 'repetición', 'repetir'],
        },
    },
    {
        code: '🔂',
        name: {
            en: 'repeat_one',
            es: 'repetir_una_vez',
        },
        keywords: {
            en: ['arrow', 'clockwise', 'once', 'repeat single button'],
            es: ['flechas', 'repetición', 'uno', 'repetir una vez'],
        },
    },
    {
        code: '▶️',
        name: {
            en: 'arrow_forward',
            es: 'flecha_hacia_delante',
        },
        keywords: {
            en: ['arrow', 'play', 'right', 'triangle', 'play button'],
            es: ['botón de reproducción', 'flecha', 'triángulo', 'reproducir'],
        },
    },
    {
        code: '⏩',
        name: {
            en: 'fast_forward',
            es: 'avance_rápido',
        },
        keywords: {
            en: ['arrow', 'double', 'fast', 'forward', 'fast-forward button'],
            es: ['avanzar', 'doble', 'flecha', 'avance rápido'],
        },
    },
    {
        code: '⏭️',
        name: {
            en: 'black_right_pointing_double_triangle_with_vertical_bar',
            es: 'triángulo_doble_negro_en_dirección_derecha_con_barra_vertical',
        },
        keywords: {
            en: ['arrow', 'next scene', 'next track', 'triangle', 'next track button'],
            es: ['raya vertical', 'siguiente', 'triángulos', 'pista siguiente'],
        },
    },
    {
        code: '⏯️',
        name: {
            en: 'black_right_pointing_triangle_with_double_vertical_bar',
            es: 'triángulo_negro_en_dirección_derecha_con_doble_barra_vertical',
        },
        keywords: {
            en: ['arrow', 'pause', 'play', 'right', 'triangle', 'play or pause button'],
            es: ['pausa', 'reproducir', 'triángulo', 'reproducir o pausa'],
        },
    },
    {
        code: '◀️',
        name: {
            en: 'arrow_backward',
            es: 'flecha_hacia_atrás',
        },
        keywords: {
            en: ['arrow', 'left', 'reverse', 'triangle', 'reverse button'],
            es: ['izquierda', 'triángulo', 'retroceso'],
        },
    },
    {
        code: '⏪',
        name: {
            en: 'rewind',
            es: 'rebobinar',
        },
        keywords: {
            en: ['arrow', 'double', 'rewind', 'fast reverse button'],
            es: ['flecha', 'flecha doble a la izquierda', 'izquierda', 'rebobinado', 'rebobinar', 'retroceso rápido'],
        },
    },
    {
        code: '⏮️',
        name: {
            en: 'black_left_pointing_double_triangle_with_vertical_bar',
            es: 'triángulo_doble_negro_en_dirección_izquierda_con_barra_vertical',
        },
        keywords: {
            en: ['arrow', 'previous scene', 'previous track', 'triangle', 'last track button'],
            es: ['atrás', 'escena anterior', 'triángulo', 'pista anterior'],
        },
    },
    {
        code: '🔼',
        name: {
            en: 'arrow_up_small',
            es: 'flecha_pequeña_hacia_arriba',
        },
        keywords: {
            en: ['arrow', 'button', 'upwards button'],
            es: ['arriba', 'botón', 'botón triángulo hacia arriba', 'triángulo', 'triángulo hacia arriba'],
        },
    },
    {
        code: '⏫',
        name: {
            en: 'arrow_double_up',
            es: 'flecha_doble_hacia_arriba',
        },
        keywords: {
            en: ['arrow', 'double', 'fast up button'],
            es: ['arriba', 'flecha', 'triángulo doble hacia arriba'],
        },
    },
    {
        code: '🔽',
        name: {
            en: 'arrow_down_small',
            es: 'flecha_pequeña_hacia_abajo',
        },
        keywords: {
            en: ['arrow', 'button', 'down', 'downwards button'],
            es: ['abajo', 'botón', 'botón triángulo hacia abajo', 'triángulo', 'triángulo hacia abajo'],
        },
    },
    {
        code: '⏬',
        name: {
            en: 'arrow_double_down',
            es: 'flecha_doble_hacia_abajo',
        },
        keywords: {
            en: ['arrow', 'double', 'down', 'fast down button'],
            es: ['triángulo', 'triángulo doble abajo', 'triángulo doble hacia abajo'],
        },
    },
    {
        code: '⏸️',
        name: {
            en: 'double_vertical_bar',
            es: 'doble_barra_vertical',
        },
        keywords: {
            en: ['bar', 'double', 'pause', 'vertical', 'pause button'],
            es: ['barras', 'botón', 'vertical', 'pausa'],
        },
    },
    {
        code: '⏹️',
        name: {
            en: 'black_square_for_stop',
            es: 'cuadrado_negro_para_detener',
        },
        keywords: {
            en: ['square', 'stop', 'stop button'],
            es: ['botón', 'cuadrado', 'parar', 'detener'],
        },
    },
    {
        code: '⏺️',
        name: {
            en: 'black_circle_for_record',
            es: 'círculo_negro_de_grabación',
        },
        keywords: {
            en: ['circle', 'record', 'record button'],
            es: ['botón', 'círculo', 'grabar'],
        },
    },
    {
        code: '⏏️',
        name: {
            en: 'eject',
            es: 'expulsar',
        },
        keywords: {
            en: ['eject', 'eject button'],
            es: ['botón', 'expulsar'],
        },
    },
    {
        code: '🎦',
        name: {
            en: 'cinema',
            es: 'cine',
        },
        keywords: {
            en: ['camera', 'film', 'movie', 'cinema'],
            es: ['entretenimiento', 'película', 'cine'],
        },
    },
    {
        code: '🔅',
        name: {
            en: 'low_brightness',
            es: 'poco_brillo',
        },
        keywords: {
            en: ['brightness', 'dim', 'low', 'dim button'],
            es: ['bajo', 'brillo', 'señal de brillo bajo', 'tenue'],
        },
    },
    {
        code: '🔆',
        name: {
            en: 'high_brightness',
            es: 'mucho_brillo',
        },
        keywords: {
            en: ['bright', 'brightness', 'bright button'],
            es: ['alto', 'brillante', 'brillo', 'señal de brillo alto'],
        },
    },
    {
        code: '📶',
        name: {
            en: 'signal_strength',
            es: 'barras_de_recepción_de_señal',
        },
        keywords: {
            en: ['antenna', 'bar', 'cell', 'mobile', 'phone', 'antenna bars'],
            es: ['antena', 'celular', 'móvil', 'señal', 'teléfono', 'barras de cobertura'],
        },
    },
    {
        code: '📳',
        name: {
            en: 'vibration_mode',
            es: 'modo_vibración',
        },
        keywords: {
            en: ['cell', 'mobile', 'mode', 'phone', 'telephone', 'vibration'],
            es: ['móvil', 'teléfono', 'teléfono celular', 'vibración', 'modo vibración'],
        },
    },
    {
        code: '📴',
        name: {
            en: 'mobile_phone_off',
            es: 'móvil_desconectado',
        },
        keywords: {
            en: ['cell', 'mobile', 'off', 'phone', 'telephone'],
            es: ['apagado', 'móvil', 'teléfono', 'teléfono celular'],
        },
    },
    {
        code: '♀️',
        name: {
            en: 'female_sign',
            es: 'signo_femenino',
        },
        keywords: {
            en: ['woman', 'female sign'],
            es: ['mujer', 'signo', 'símbolo', 'signo femenino'],
        },
    },
    {
        code: '♂️',
        name: {
            en: 'male_sign',
            es: 'signo_masculino',
        },
        keywords: {
            en: ['man', 'male sign'],
            es: ['hombre', 'signo', 'símbolo', 'signo masculino'],
        },
    },
    {
        code: '⚧️',
        name: {
            en: 'transgender_symbol',
            es: 'símbolo_de_transgénero',
        },
        keywords: {
            en: ['transgender', 'transgender symbol'],
            es: ['transgénero', 'símbolo de transgénero'],
        },
    },
    {
        code: '✖️',
        name: {
            en: 'heavy_multiplication_x',
            es: 'signo_de_multiplicación_grueso',
        },
        keywords: {
            en: ['×', 'cancel', 'multiplication', 'sign', 'x', 'multiply'],
            es: ['cancelar', 'marca', 'prohibido', 'signo de multiplicación', '×', 'multiplicación', 'x'],
        },
    },
    {
        code: '➕',
        name: {
            en: 'heavy_plus_sign',
            es: 'signo_de_suma_grueso',
        },
        keywords: {
            en: ['math', 'sign', '+', 'plus'],
            es: ['signo', 'suma', '+  más'],
        },
    },
    {
        code: '➖',
        name: {
            en: 'heavy_minus_sign',
            es: 'signo_de_resta_grueso',
        },
        keywords: {
            en: ['−', 'math', 'sign', '-', 'minus'],
            es: ['−', 'resta', 'signo', '-', 'menos'],
        },
    },
    {
        code: '➗',
        name: {
            en: 'heavy_division_sign',
            es: 'signo_de_división_grueso',
        },
        keywords: {
            en: ['÷', 'division', 'math', 'sign', 'divide'],
            es: ['÷', 'signo', 'signo de división', 'división'],
        },
    },
    {
        code: '♾️',
        name: {
            en: 'infinity',
            es: 'infinito',
        },
        keywords: {
            en: ['forever', 'unbounded', 'universal', 'infinity'],
            es: ['ilimitado', 'siempre', 'universal', 'infinito'],
        },
    },
    {
        code: '‼️',
        name: {
            en: 'bangbang',
            es: 'bangbang',
        },
        keywords: {
            en: ['bangbang', 'exclamation', 'mark', '!  !!', 'double exclamation mark'],
            es: ['exclamación', 'puntuación', 'sorpresa', '!!', 'exclamación doble'],
        },
    },
    {
        code: '⁉️',
        name: {
            en: 'interrobang',
            es: 'signos_de_interrogación_y_exclamación',
        },
        keywords: {
            en: ['exclamation', 'interrobang', 'mark', 'punctuation', 'question', '!  !?  ?'],
            es: ['exclamación', 'interrogación', '!  !?  ?', 'exclamación e interrogación'],
        },
    },
    {
        code: '❓',
        name: {
            en: 'question',
            es: 'signo_de_interrogación_rojo',
        },
        keywords: {
            en: ['mark', 'punctuation', 'question', '?', 'red question mark'],
            es: ['interrogación', 'pregunta', 'puntuación', 'signo de interrogación', '?', 'interrogación roja'],
        },
    },
    {
        code: '❔',
        name: {
            en: 'grey_question',
            es: 'signo_de_interrogación_gris',
        },
        keywords: {
            en: ['mark', 'outlined', 'punctuation', 'question', '?', 'white question mark'],
            es: ['interrogación', 'pregunta', 'puntuación', '?', 'interrogación blanca'],
        },
    },
    {
        code: '❕',
        name: {
            en: 'grey_exclamation',
            es: 'signo_de_exclamación_gris',
        },
        keywords: {
            en: ['exclamation', 'mark', 'outlined', 'punctuation', '!', 'white exclamation mark'],
            es: ['exclamación', 'puntuación', '!', 'exclamación blanca'],
        },
    },
    {
        code: '❗',
        name: {
            en: 'exclamation',
            es: 'exclamación',
        },
        keywords: {
            en: ['exclamation', 'mark', 'punctuation', '!', 'red exclamation mark'],
            es: ['exclamación', 'puntuación', 'signo de exclamación', '!', 'exclamación roja'],
        },
    },
    {
        code: '〰️',
        name: {
            en: 'wavy_dash',
            es: 'guion_ondulante',
        },
        keywords: {
            en: ['dash', 'punctuation', 'wavy'],
            es: ['guion', 'marca de sonido largo', 'ondulado'],
        },
    },
    {
        code: '💱',
        name: {
            en: 'currency_exchange',
            es: 'cambio_de_divisas',
        },
        keywords: {
            en: ['bank', 'currency', 'exchange', 'money'],
            es: ['cambio', 'dinero', 'divisa', 'moneda', 'cambio de divisas'],
        },
    },
    {
        code: '💲',
        name: {
            en: 'heavy_dollar_sign',
            es: 'símbolo_de_dólar_grueso',
        },
        keywords: {
            en: ['currency', 'dollar', 'money', 'heavy dollar sign'],
            es: ['dinero', 'dólar', 'símbolo', 'símbolo de dólar'],
        },
    },
    {
        code: '⚕️',
        name: {
            en: 'medical_symbol',
            es: 'símbolo_médico',
        },
        keywords: {
            en: ['aesculapius', 'medicine', 'staff', 'medical symbol'],
            es: ['asclepio', 'esculapio', 'medicina', 'serpiente', 'símbolo de medicina'],
        },
    },
    {
        code: '♻️',
        name: {
            en: 'recycle',
            es: 'reciclar',
        },
        keywords: {
            en: ['recycle', 'recycling symbol'],
            es: ['reciclaje', 'reciclar', 'señal', 'símbolo universal de reciclaje sólido', 'universal', 'símbolo de reciclaje'],
        },
    },
    {
        code: '⚜️',
        name: {
            en: 'fleur_de_lis',
            es: 'flor_de_lis',
        },
        keywords: {
            en: ['fleur-de-lis'],
            es: ['flor', 'lis', 'flor de lis'],
        },
    },
    {
        code: '🔱',
        name: {
            en: 'trident',
            es: 'tridente',
        },
        keywords: {
            en: ['anchor', 'emblem', 'ship', 'tool', 'trident'],
            es: ['ancla', 'emblema', 'tridente', 'emblema de tridente'],
        },
    },
    {
        code: '📛',
        name: {
            en: 'name_badge',
            es: 'chapa_identificativa',
        },
        keywords: {
            en: ['badge', 'name'],
            es: ['etiqueta', 'nombre', 'etiqueta identificativa'],
        },
    },
    {
        code: '🔰',
        name: {
            en: 'beginner',
            es: 'principiante',
        },
        keywords: {
            en: ['beginner', 'chevron', 'Japanese', 'leaf', 'Japanese symbol for beginner'],
            es: ['amarillo', 'japonés', 'principiante', 'verde', 'símbolo japonés para principiante'],
        },
    },
    {
        code: '⭕',
        name: {
            en: 'o',
            es: 'o',
        },
        keywords: {
            en: ['circle', 'large', 'o', 'red', 'hollow red circle'],
            es: ['aro', 'círculo', 'o', 'rojo', 'círculo rojo hueco'],
        },
    },
    {
        code: '✅',
        name: {
            en: 'white_check_mark',
            es: 'marca_de_verificación_blanca',
        },
        keywords: {
            en: ['✓', 'button', 'check', 'mark'],
            es: ['✓', 'botón', 'marca', 'selección', 'verificación', 'botón de marca de verificación'],
        },
    },
    {
        code: '☑️',
        name: {
            en: 'ballot_box_with_check',
            es: 'casilla_con_marca_de_verificación',
        },
        keywords: {
            en: ['✓', 'box', 'check', 'check box with check'],
            es: ['✓', 'casilla', 'marca', 'selección', 'verificación', 'casilla con marca de verificación'],
        },
    },
    {
        code: '✔️',
        name: {
            en: 'heavy_check_mark',
            es: 'marca_de_verificación_gruesa',
        },
        keywords: {
            en: ['✓', 'check', 'mark'],
            es: ['✓', 'marca', 'selección', 'verificación', 'marca de verificación'],
        },
    },
    {
        code: '❌',
        name: {
            en: 'x',
            es: 'x',
        },
        keywords: {
            en: ['×', 'cancel', 'cross', 'mark', 'multiplication', 'multiply', 'x'],
            es: ['cancelar', 'cruz', 'marca de tachado', 'tachar', '×', 'marca de cruz', 'x'],
        },
    },
    {
        code: '❎',
        name: {
            en: 'negative_squared_cross_mark',
            es: 'cruz_negativa_enmarcada',
        },
        keywords: {
            en: ['×', 'mark', 'square', 'x', 'cross mark button'],
            es: ['casilla', 'cruz', 'marca', '×  botón con marca de cruz', 'x'],
        },
    },
    {
        code: '➰',
        name: {
            en: 'curly_loop',
            es: 'lazada',
        },
        keywords: {
            en: ['curl', 'loop', 'curly loop'],
            es: ['giro', 'tirabuzón', 'bucle'],
        },
    },
    {
        code: '➿',
        name: {
            en: 'loop',
            es: 'lazo',
        },
        keywords: {
            en: ['curl', 'double', 'loop', 'double curly loop'],
            es: ['bucle', 'doble'],
        },
    },
    {
        code: '〽️',
        name: {
            en: 'part_alternation_mark',
            es: 'signo_de_inicio_de_canción',
        },
        keywords: {
            en: ['mark', 'part', 'part alternation mark'],
            es: ['alternancia', 'marca', 'marca de alternancia'],
        },
    },
    {
        code: '✳️',
        name: {
            en: 'eight_spoked_asterisk',
            es: 'asterisco_de_ocho_puntas',
        },
        keywords: {
            en: ['asterisk', '*', 'eight-spoked asterisk'],
            es: ['asterisco', '*', 'asterisco de ocho puntas'],
        },
    },
    {
        code: '✴️',
        name: {
            en: 'eight_pointed_black_star',
            es: 'estrella_negra_de_ocho_puntas',
        },
        keywords: {
            en: ['star', '*  eight-pointed star'],
            es: ['estrella', '*', 'estrella de ocho puntas'],
        },
    },
    {
        code: '❇️',
        name: {
            en: 'sparkle',
            es: 'destello',
        },
        keywords: {
            en: ['*  sparkle'],
            es: ['*  chispa'],
        },
    },
    {
        code: '©️',
        name: {
            en: 'copyright',
            es: 'derechos_de_autor',
        },
        keywords: {
            en: ['C', 'copyright'],
            es: ['c', 'símbolo', 'copyright'],
        },
    },
    {
        code: '®️',
        name: {
            en: 'registered',
            es: 'registrado',
        },
        keywords: {
            en: ['R', 'registered'],
            es: ['r', 'símbolo de marca registrada', 'marca registrada'],
        },
    },
    {
        code: '™️',
        name: {
            en: 'tm',
            es: 'tm',
        },
        keywords: {
            en: ['mark', 'TM', 'trademark', 'trade mark'],
            es: ['marca comercial', 'símbolo de marca comercial'],
        },
    },
    {
        code: '#️⃣',
        name: {
            en: 'hash',
            es: 'almohadilla',
        },
        keywords: {
            en: ['keycap'],
            es: ['Teclas'],
        },
    },
    {
        code: '*️⃣',
        name: {
            en: 'keycap_star',
            es: 'asterisco_enmarcado',
        },
        keywords: {
            en: ['keycap'],
            es: ['Teclas'],
        },
    },
    {
        code: '0️⃣',
        name: {
            en: 'zero',
            es: 'cero',
        },
        keywords: {
            en: ['keycap'],
            es: ['Teclas'],
        },
    },
    {
        code: '1️⃣',
        name: {
            en: 'one',
            es: 'uno',
        },
        keywords: {
            en: ['keycap'],
            es: ['Teclas'],
        },
    },
    {
        code: '2️⃣',
        name: {
            en: 'two',
            es: 'dos',
        },
        keywords: {
            en: ['keycap'],
            es: ['Teclas'],
        },
    },
    {
        code: '3️⃣',
        name: {
            en: 'three',
            es: 'tres',
        },
        keywords: {
            en: ['keycap'],
            es: ['Teclas'],
        },
    },
    {
        code: '4️⃣',
        name: {
            en: 'four',
            es: 'cuatro',
        },
        keywords: {
            en: ['keycap'],
            es: ['Teclas'],
        },
    },
    {
        code: '5️⃣',
        name: {
            en: 'five',
            es: 'cinco',
        },
        keywords: {
            en: ['keycap'],
            es: ['Teclas'],
        },
    },
    {
        code: '6️⃣',
        name: {
            en: 'six',
            es: 'seis',
        },
        keywords: {
            en: ['keycap'],
            es: ['Teclas'],
        },
    },
    {
        code: '7️⃣',
        name: {
            en: 'seven',
            es: 'siete',
        },
        keywords: {
            en: ['keycap'],
            es: ['Teclas'],
        },
    },
    {
        code: '8️⃣',
        name: {
            en: 'eight',
            es: 'ocho',
        },
        keywords: {
            en: ['keycap'],
            es: ['Teclas'],
        },
    },
    {
        code: '9️⃣',
        name: {
            en: 'nine',
            es: 'nueve',
        },
        keywords: {
            en: ['keycap'],
            es: ['Teclas'],
        },
    },
    {
        code: '🔟',
        name: {
            en: 'keycap_ten',
            es: 'diez_enmarcado',
        },
        keywords: {
            en: ['keycap'],
            es: ['Teclas'],
        },
    },
    {
        code: '🔠',
        name: {
            en: 'capital_abcd',
            es: 'abcd_en_mayúsculas',
        },
        keywords: {
            en: ['ABCD', 'input', 'latin', 'letters', 'uppercase'],
            es: ['abcd', 'letras', 'mayúsculas', 'letras latinas mayúsculas'],
        },
    },
    {
        code: '🔡',
        name: {
            en: 'abcd',
            es: 'abcd',
        },
        keywords: {
            en: ['abcd', 'input', 'latin', 'letters', 'lowercase'],
            es: ['abcd', 'letras', 'minúsculas', 'letras latinas minúsculas'],
        },
    },
    {
        code: '🔢',
        name: {
            en: '1234',
            es: '1234',
        },
        keywords: {
            en: ['1234', 'input', 'numbers'],
            es: ['1234', 'dígitos', 'números'],
        },
    },
    {
        code: '🔣',
        name: {
            en: 'symbols',
            es: 'símbolos',
        },
        keywords: {
            en: ['〒♪&%', 'input', 'input symbols'],
            es: ['〒♪&%', 'símbolos'],
        },
    },
    {
        code: '🔤',
        name: {
            en: 'abc',
            es: 'abc',
        },
        keywords: {
            en: ['abc', 'alphabet', 'input', 'latin', 'letters'],
            es: ['ABC', 'latino', 'alfabeto latino'],
        },
    },
    {
        code: '🅰️',
        name: {
            en: 'a',
            es: 'a',
        },
        keywords: {
            en: ['A', 'blood type', 'A button (blood type)'],
            es: ['A', 'grupo', 'sanguíneo', 'tipo A'],
        },
    },
    {
        code: '🆎',
        name: {
            en: 'ab',
            es: 'ab',
        },
        keywords: {
            en: ['AB', 'blood type', 'AB button (blood type)'],
            es: ['AB', 'grupo', 'sanguíneo', 'tipo AB'],
        },
    },
    {
        code: '🅱️',
        name: {
            en: 'b',
            es: 'b',
        },
        keywords: {
            en: ['B', 'blood type', 'B button (blood type)'],
            es: ['B', 'grupo', 'sanguíneo', 'tipo B'],
        },
    },
    {
        code: '🆑',
        name: {
            en: 'cl',
            es: 'cl',
        },
        keywords: {
            en: ['CL', 'CL button'],
            es: ['símbolo', 'borrar'],
        },
    },
    {
        code: '🆒',
        name: {
            en: 'cool',
            es: 'guay',
        },
        keywords: {
            en: ['COOL', 'COOL button'],
            es: ['botón', 'cool', 'mola', 'botón COOL'],
        },
    },
    {
        code: '🆓',
        name: {
            en: 'free',
            es: 'gratis',
        },
        keywords: {
            en: ['FREE', 'FREE button'],
            es: ['gratis', 'símbolo gratis', 'botón FREE'],
        },
    },
    {
        code: 'ℹ️',
        name: {
            en: 'information_source',
            es: 'fuente_de_información',
        },
        keywords: {
            en: ['i', 'information'],
            es: ['i', 'información'],
        },
    },
    {
        code: '🆔',
        name: {
            en: 'id',
            es: 'carné_de_identidad',
        },
        keywords: {
            en: ['ID', 'identity', 'ID button'],
            es: ['ID', 'identidad', 'símbolo identidad', 'símbolo de identificación'],
        },
    },
    {
        code: 'Ⓜ️',
        name: {
            en: 'm',
            es: 'm',
        },
        keywords: {
            en: ['circle', 'M', 'circled M'],
            es: ['círculo', 'm', 'm en círculo'],
        },
    },
    {
        code: '🆕',
        name: {
            en: 'new',
            es: 'nuevo',
        },
        keywords: {
            en: ['NEW', 'NEW button'],
            es: ['botón', 'NEW', 'nuevo'],
        },
    },
    {
        code: '🆖',
        name: {
            en: 'ng',
            es: 'nada_guay',
        },
        keywords: {
            en: ['NG', 'NG button'],
            es: ['botón', 'ng', 'nuevo', 'botón NG'],
        },
    },
    {
        code: '🅾️',
        name: {
            en: 'o2',
            es: 'o2',
        },
        keywords: {
            en: ['blood type', 'O', 'O button (blood type)'],
            es: ['grupo sanguíneo', 'o', 'grupo sanguíneo tipo O'],
        },
    },
    {
        code: '🆗',
        name: {
            en: 'ok',
            es: 'vale',
        },
        keywords: {
            en: ['OK', 'OK button'],
            es: ['botón', 'ok', 'botón OK'],
        },
    },
    {
        code: '🅿️',
        name: {
            en: 'parking',
            es: 'aparcamiento',
        },
        keywords: {
            en: ['P', 'parking', 'P button'],
            es: ['p', 'parking', 'aparcamiento'],
        },
    },
    {
        code: '🆘',
        name: {
            en: 'sos',
            es: 'llamada_de_socorro',
        },
        keywords: {
            en: ['help', 'SOS', 'SOS button'],
            es: ['ayuda', 'símbolo', 'socorro', 'sos', 'símbolo de socorro'],
        },
    },
    {
        code: '🆙',
        name: {
            en: 'up',
            es: 'arriba',
        },
        keywords: {
            en: ['mark', 'UP', 'UP!  UP! button'],
            es: ['arriba', 'información', 'novedad', 'símbolo', 'up', 'botón UP!'],
        },
    },
    {
        code: '🆚',
        name: {
            en: 'vs',
            es: 'vs',
        },
        keywords: {
            en: ['versus', 'VS', 'VS button'],
            es: ['contra', 'frente a', 'símbolo', 'versus', 'vs', 'botón VS'],
        },
    },
    {
        code: '🈁',
        name: {
            en: 'koko',
            es: 'koko',
        },
        keywords: {
            en: ['“here”', 'Japanese', 'katakana', 'ココ', 'Japanese “here” button'],
            es: ['“aquí”', 'japonés', 'katakana', 'ideograma japonés para "aquí"'],
        },
    },
    {
        code: '🈂️',
        name: {
            en: 'sa',
            es: 'sa',
        },
        keywords: {
            en: ['“service charge”', 'Japanese', 'katakana', 'サ', 'Japanese “service charge” button'],
            es: ['cortesía', 'japonés', 'katakana', 'ideograma japonés para "de cortesía"'],
        },
    },
    {
        code: '🈷️',
        name: {
            en: 'u6708',
            es: 'u6708',
        },
        keywords: {
            en: ['“monthly amount”', 'ideograph', 'Japanese', '月', 'Japanese “monthly amount” button'],
            es: ['“cantidad mensual”', 'ideograma', 'japonés', 'kanji', 'ideograma japonés para "cantidad mensual"'],
        },
    },
    {
        code: '🈶',
        name: {
            en: 'u6709',
            es: 'u6709',
        },
        keywords: {
            en: ['“not free of charge”', 'ideograph', 'Japanese', '有', 'Japanese “not free of charge” button'],
            es: ['“de pago”', 'ideograma', 'japonés', 'kanji', 'ideograma japonés para "de pago"'],
        },
    },
    {
        code: '🈯',
        name: {
            en: 'u6307',
            es: 'u6307',
        },
        keywords: {
            en: ['“reserved”', 'ideograph', 'Japanese', '指', 'Japanese “reserved” button'],
            es: ['ideograma', 'japonés', 'kanji', 'reservado', 'ideograma japonés para "reservado"'],
        },
    },
    {
        code: '🉐',
        name: {
            en: 'ideograph_advantage',
            es: 'símbolo_de_ganga',
        },
        keywords: {
            en: ['“bargain”', 'ideograph', 'Japanese', '得', 'Japanese “bargain” button'],
            es: ['ganga', 'ideograma', 'japonés', 'kanji', 'ideograma japonés para "ganga"'],
        },
    },
    {
        code: '🈹',
        name: {
            en: 'u5272',
            es: 'u5272',
        },
        keywords: {
            en: ['“discount”', 'ideograph', 'Japanese', '割', 'Japanese “discount” button'],
            es: ['descuento', 'ideograma', 'japonés', 'kanji', 'ideograma japonés para "descuento"'],
        },
    },
    {
        code: '🈚',
        name: {
            en: 'u7121',
            es: 'u7121',
        },
        keywords: {
            en: ['“free of charge”', 'ideograph', 'Japanese', '無', 'Japanese “free of charge” button'],
            es: ['gratis', 'ideograma', 'japonés', 'kanji', 'ideograma japonés para "gratis"'],
        },
    },
    {
        code: '🈲',
        name: {
            en: 'u7981',
            es: 'u7981',
        },
        keywords: {
            en: ['ideograph', 'Japanese', '禁', '“prohibited”', 'Japanese “prohibited” button'],
            es: ['ideograma', 'japonés', 'kanji', 'prohibido', 'ideograma japonés para "prohibido"'],
        },
    },
    {
        code: '🉑',
        name: {
            en: 'accept',
            es: 'aceptar',
        },
        keywords: {
            en: ['“acceptable”', 'ideograph', 'Japanese', '可', 'Japanese “acceptable” button'],
            es: ['aceptable', 'ideograma', 'japonés', 'kanji', 'ideograma japonés para "aceptable"'],
        },
    },
    {
        code: '🈸',
        name: {
            en: 'u7533',
            es: 'u7533',
        },
        keywords: {
            en: ['“application”', 'ideograph', 'Japanese', '申', 'Japanese “application” button'],
            es: ['aplicación', 'ideograma', 'japonés', 'kanji', 'ideograma japonés para "aplicación"'],
        },
    },
    {
        code: '🈴',
        name: {
            en: 'u5408',
            es: 'u5408',
        },
        keywords: {
            en: ['“passing grade”', 'ideograph', 'Japanese', '合', 'Japanese “passing grade” button'],
            es: ['aprobado', 'ideograma', 'japonés', 'kanji', 'ideograma japonés para "aprobado"'],
        },
    },
    {
        code: '🈳',
        name: {
            en: 'u7a7a',
            es: 'u7a7a',
        },
        keywords: {
            en: ['“vacancy”', 'ideograph', 'Japanese', '空', 'Japanese “vacancy” button'],
            es: ['ideograma', 'japonés', 'kanji', 'vacante', 'ideograma japonés para "vacante"'],
        },
    },
    {
        code: '㊗️',
        name: {
            en: 'congratulations',
            es: 'felicitaciones',
        },
        keywords: {
            en: ['“congratulations”', 'ideograph', 'Japanese', '祝', 'Japanese “congratulations” button'],
            es: ['enhorabuena', 'ideograma', 'japonés', 'kanji', 'ideograma japonés para "enhorabuena"'],
        },
    },
    {
        code: '㊙️',
        name: {
            en: 'secret',
            es: 'secreto',
        },
        keywords: {
            en: ['“secret”', 'ideograph', 'Japanese', '秘', 'Japanese “secret” button'],
            es: ['ideograma', 'japonés', 'kanji', 'secreto', 'ideograma japonés para "secreto"'],
        },
    },
    {
        code: '🈺',
        name: {
            en: 'u55b6',
            es: 'u55b6',
        },
        keywords: {
            en: ['“open for business”', 'ideograph', 'Japanese', '営', 'Japanese “open for business” button'],
            es: ['abierto', 'ideograma', 'japonés', 'kanji', 'ideograma japonés para "abierto"'],
        },
    },
    {
        code: '🈵',
        name: {
            en: 'u6e80',
            es: 'u6e80',
        },
        keywords: {
            en: ['“no vacancy”', 'ideograph', 'Japanese', '満', 'Japanese “no vacancy” button'],
            es: ['completo', 'ideograma', 'japonés', 'kanji', 'lleno', 'ideograma japonés para "completo"'],
        },
    },
    {
        code: '🔴',
        name: {
            en: 'red_circle',
            es: 'círculo_rojo',
        },
        keywords: {
            en: ['circle', 'geometric', 'red'],
            es: ['círculo', 'geometría', 'rojo'],
        },
    },
    {
        code: '🟠',
        name: {
            en: 'large_orange_circle',
            es: 'círculo_naranja_grande',
        },
        keywords: {
            en: ['circle', 'orange'],
            es: ['círculo', 'naranja'],
        },
    },
    {
        code: '🟡',
        name: {
            en: 'large_yellow_circle',
            es: 'círculo_amarillo_grande',
        },
        keywords: {
            en: ['circle', 'yellow'],
            es: ['amarillo', 'círculo'],
        },
    },
    {
        code: '🟢',
        name: {
            en: 'large_green_circle',
            es: 'círculo_verde_grande',
        },
        keywords: {
            en: ['circle', 'green'],
            es: ['círculo', 'verde'],
        },
    },
    {
        code: '🔵',
        name: {
            en: 'large_blue_circle',
            es: 'círculo_azul_grande',
        },
        keywords: {
            en: ['blue', 'circle', 'geometric'],
            es: ['azul', 'círculo', 'geometría'],
        },
    },
    {
        code: '🟣',
        name: {
            en: 'large_purple_circle',
            es: 'círculo_morado_grande',
        },
        keywords: {
            en: ['circle', 'purple'],
            es: ['círculo', 'lila', 'morado', 'púrpura'],
        },
    },
    {
        code: '🟤',
        name: {
            en: 'large_brown_circle',
            es: 'círculo_marrón_grande',
        },
        keywords: {
            en: ['brown', 'circle'],
            es: ['círculo', 'marrón'],
        },
    },
    {
        code: '⚫',
        name: {
            en: 'black_circle',
            es: 'círculo_negro',
        },
        keywords: {
            en: ['circle', 'geometric', 'black circle'],
            es: ['círculo', 'geometría', 'círculo negro'],
        },
    },
    {
        code: '⚪',
        name: {
            en: 'white_circle',
            es: 'círculo_blanco',
        },
        keywords: {
            en: ['circle', 'geometric', 'white circle'],
            es: ['círculo', 'geometría', 'círculo blanco'],
        },
    },
    {
        code: '🟥',
        name: {
            en: 'large_red_square',
            es: 'cuadrado_rojo_grande',
        },
        keywords: {
            en: ['red', 'square'],
            es: ['cuadrado', 'rojo'],
        },
    },
    {
        code: '🟧',
        name: {
            en: 'large_orange_square',
            es: 'cuadrado_naranja_grande',
        },
        keywords: {
            en: ['orange', 'square'],
            es: ['cuadrado', 'naranja'],
        },
    },
    {
        code: '🟨',
        name: {
            en: 'large_yellow_square',
            es: 'cuadrado_amarillo_grande',
        },
        keywords: {
            en: ['square', 'yellow'],
            es: ['amarillo', 'cuadrado'],
        },
    },
    {
        code: '🟩',
        name: {
            en: 'large_green_square',
            es: 'cuadrado_verde_grande',
        },
        keywords: {
            en: ['green', 'square'],
            es: ['cuadrado', 'verde'],
        },
    },
    {
        code: '🟦',
        name: {
            en: 'large_blue_square',
            es: 'cuadrado_azul_grande',
        },
        keywords: {
            en: ['blue', 'square'],
            es: ['azul', 'cuadrado'],
        },
    },
    {
        code: '🟪',
        name: {
            en: 'large_purple_square',
            es: 'cuadrado_morado_grande',
        },
        keywords: {
            en: ['purple', 'square'],
            es: ['cuadrado', 'lila', 'morado', 'púrpura'],
        },
    },
    {
        code: '🟫',
        name: {
            en: 'large_brown_square',
            es: 'cuadrado_marrón_grande',
        },
        keywords: {
            en: ['brown', 'square'],
            es: ['cuadrado', 'marrón'],
        },
    },
    {
        code: '⬛',
        name: {
            en: 'black_large_square',
            es: 'gran_cuadrado_negro',
        },
        keywords: {
            en: ['geometric', 'square', 'black large square'],
            es: ['cuadrado', 'geometría', 'negro', 'cuadrado negro grande'],
        },
    },
    {
        code: '⬜',
        name: {
            en: 'white_large_square',
            es: 'cuadrado_blanco_grande',
        },
        keywords: {
            en: ['geometric', 'square', 'white large square'],
            es: ['blanco', 'cuadrado', 'geometría', 'cuadrado blanco grande'],
        },
    },
    {
        code: '◼️',
        name: {
            en: 'black_medium_square',
            es: 'cuadrado_mediano_negro',
        },
        keywords: {
            en: ['geometric', 'square', 'black medium square'],
            es: ['cuadrado', 'geometría', 'negro', 'cuadrado negro mediano'],
        },
    },
    {
        code: '◻️',
        name: {
            en: 'white_medium_square',
            es: 'cuadrado_blanco_mediano',
        },
        keywords: {
            en: ['geometric', 'square', 'white medium square'],
            es: ['blanco', 'cuadrado', 'geometría', 'cuadrado blanco mediano'],
        },
    },
    {
        code: '◾',
        name: {
            en: 'black_medium_small_square',
            es: 'cuadrado_mediano_pequeño_negro',
        },
        keywords: {
            en: ['geometric', 'square', 'black medium-small square'],
            es: ['cuadrado', 'geometría', 'negro', 'cuadrado negro mediano-pequeño'],
        },
    },
    {
        code: '◽',
        name: {
            en: 'white_medium_small_square',
            es: 'cuadrado_blanco_mediano_pequeño',
        },
        keywords: {
            en: ['geometric', 'square', 'white medium-small square'],
            es: ['blanco', 'cuadrado', 'geometría', 'cuadrado blanco mediano-pequeño'],
        },
    },
    {
        code: '▪️',
        name: {
            en: 'black_small_square',
            es: 'cuadrado_pequeño_negro',
        },
        keywords: {
            en: ['geometric', 'square', 'black small square'],
            es: ['cuadrado', 'geometría', 'negro', 'cuadrado negro pequeño'],
        },
    },
    {
        code: '▫️',
        name: {
            en: 'white_small_square',
            es: 'cuadrado_blanco_pequeño',
        },
        keywords: {
            en: ['geometric', 'square', 'white small square'],
            es: ['blanco', 'cuadrado', 'geometría', 'cuadrado blanco pequeño'],
        },
    },
    {
        code: '🔶',
        name: {
            en: 'large_orange_diamond',
            es: 'diamante_naranja_grande',
        },
        keywords: {
            en: ['diamond', 'geometric', 'orange', 'large orange diamond'],
            es: ['geometría', 'naranja', 'rombo', 'rombo naranja grande'],
        },
    },
    {
        code: '🔷',
        name: {
            en: 'large_blue_diamond',
            es: 'diamante_azul_grande',
        },
        keywords: {
            en: ['blue', 'diamond', 'geometric', 'large blue diamond'],
            es: ['azul', 'geometría', 'rombo', 'rombo azul grande'],
        },
    },
    {
        code: '🔸',
        name: {
            en: 'small_orange_diamond',
            es: 'diamante_naranja_pequeño',
        },
        keywords: {
            en: ['diamond', 'geometric', 'orange', 'small orange diamond'],
            es: ['geometría', 'naranja', 'rombo', 'rombo naranja pequeño'],
        },
    },
    {
        code: '🔹',
        name: {
            en: 'small_blue_diamond',
            es: 'diamante_azul_pequeño',
        },
        keywords: {
            en: ['blue', 'diamond', 'geometric', 'small blue diamond'],
            es: ['azul', 'geometría', 'rombo', 'rombo azul pequeño'],
        },
    },
    {
        code: '🔺',
        name: {
            en: 'small_red_triangle',
            es: 'triángulo_rojo_pequeño',
        },
        keywords: {
            en: ['geometric', 'red', 'red triangle pointed up'],
            es: ['geometría', 'rojo', 'triángulo', 'triángulo hacia arriba rojo', 'triángulo rojo hacia arriba'],
        },
    },
    {
        code: '🔻',
        name: {
            en: 'small_red_triangle_down',
            es: 'triángulo_rojo_pequeño_hacia_abajo',
        },
        keywords: {
            en: ['down', 'geometric', 'red', 'red triangle pointed down'],
            es: ['geometría', 'rojo', 'triángulo', 'triángulo hacia abajo rojo', 'triángulo rojo hacia abajo'],
        },
    },
    {
        code: '💠',
        name: {
            en: 'diamond_shape_with_a_dot_inside',
            es: 'forma_de_diamante_con_un_punto_dentro',
        },
        keywords: {
            en: ['comic', 'diamond', 'geometric', 'inside', 'diamond with a dot'],
            es: ['flor', 'geometría', 'rombo', 'rombo con pétalo'],
        },
    },
    {
        code: '🔘',
        name: {
            en: 'radio_button',
            es: 'botón_de_radio',
        },
        keywords: {
            en: ['button', 'geometric', 'radio'],
            es: ['botón', 'opción', 'botón de opción'],
        },
    },
    {
        code: '🔳',
        name: {
            en: 'white_square_button',
            es: 'botón_cuadrado_blanco',
        },
        keywords: {
            en: ['button', 'geometric', 'outlined', 'square', 'white square button'],
            es: ['botón', 'cuadrado', 'botón cuadrado con borde blanco'],
        },
    },
    {
        code: '🔲',
        name: {
            en: 'black_square_button',
            es: 'botón_cuadrado_negro',
        },
        keywords: {
            en: ['button', 'geometric', 'square', 'black square button'],
            es: ['botón', 'cuadrado', 'botón cuadrado con borde negro'],
        },
    },
    {
        code: 'flags',
        icon: Flags,
        header: true,
    },
    {
        code: '🏁',
        name: {
            en: 'checkered_flag',
            es: 'bandera_de_cuadros',
        },
        keywords: {
            en: ['checkered', 'chequered', 'racing', 'chequered flag'],
            es: ['bandera', 'carreras', 'cuadros', 'deporte', 'motor', 'bandera de cuadros'],
        },
    },
    {
        code: '🚩',
        name: {
            en: 'triangular_flag_on_post',
            es: 'mastil_con_bandera_triangular',
        },
        keywords: {
            en: ['post', 'triangular flag'],
            es: ['bandera', 'bandera de localización triangular', 'bandera informativa de localización', 'localización', 'bandera triangular'],
        },
    },
    {
        code: '🎌',
        name: {
            en: 'crossed_flags',
            es: 'banderas_cruzadas',
        },
        keywords: {
            en: ['celebration', 'cross', 'crossed', 'Japanese', 'crossed flags'],
            es: ['banderas', 'celebración', 'japón', 'banderas cruzadas'],
        },
    },
    {
        code: '🏴',
        name: {
            en: 'waving_black_flag',
            es: 'ondeando_bandera_negra',
        },
        keywords: {
            en: ['waving', 'black flag'],
            es: ['bandera', 'negra', 'ondear'],
        },
    },
    {
        code: '🏳️',
        name: {
            en: 'waving_white_flag',
            es: 'ondeando_bandera_blanca',
        },
        keywords: {
            en: ['waving', 'white flag'],
            es: ['bandera', 'blanca', 'ondear'],
        },
    },
    {
        code: '🏳️‍🌈',
        name: {
            en: 'rainbow-flag',
            es: 'bandera-arcoíris',
        },
        keywords: {
            en: ['pride', 'rainbow', 'rainbow flag'],
            es: ['arcoíris', 'bandera', 'bandera del arcoíris'],
        },
    },
    {
        code: '🏳️‍⚧️',
        name: {
            en: 'transgender_flag',
            es: 'bandera_transgénero',
        },
        keywords: {
            en: ['flag', 'light blue', 'pink', 'transgender', 'white'],
            es: ['azul', 'bandera', 'blanco', 'LGTB', 'rosa', 'transgénero'],
        },
    },
    {
        code: '🏴‍☠️',
        name: {
            en: 'pirate_flag',
            es: 'bandera_pirata',
        },
        keywords: {
            en: ['Jolly Roger', 'pirate', 'plunder', 'treasure', 'pirate flag'],
            es: ['botín', 'Jolly Roger', 'pirata', 'tesoro', 'bandera pirata'],
        },
    },
    {
        code: '🇦🇨',
        name: {
            en: 'flag-ac',
            es: 'bandera-ac',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇦🇩',
        name: {
            en: 'flag-ad',
            es: 'bandera-ad',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇦🇪',
        name: {
            en: 'flag-ae',
            es: 'bandera-ae',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇦🇫',
        name: {
            en: 'flag-af',
            es: 'bandera-af',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇦🇬',
        name: {
            en: 'flag-ag',
            es: 'bandera-ag',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇦🇮',
        name: {
            en: 'flag-ai',
            es: 'bandera-ai',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇦🇱',
        name: {
            en: 'flag-al',
            es: 'bandera-al',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇦🇲',
        name: {
            en: 'flag-am',
            es: 'bandera-am',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇦🇴',
        name: {
            en: 'flag-ao',
            es: 'bandera-ao',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇦🇶',
        name: {
            en: 'flag-aq',
            es: 'bandera-aq',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇦🇷',
        name: {
            en: 'flag-ar',
            es: 'bandera-ar',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇦🇸',
        name: {
            en: 'flag-as',
            es: 'bandera-as',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇦🇹',
        name: {
            en: 'flag-at',
            es: 'bandera-at',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇦🇺',
        name: {
            en: 'flag-au',
            es: 'bandera-au',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇦🇼',
        name: {
            en: 'flag-aw',
            es: 'bandera-aw',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇦🇽',
        name: {
            en: 'flag-ax',
            es: 'bandera-ax',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇦🇿',
        name: {
            en: 'flag-az',
            es: 'bandera-az',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇧🇦',
        name: {
            en: 'flag-ba',
            es: 'bandera-ba',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇧🇧',
        name: {
            en: 'flag-bb',
            es: 'bandera-bb',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇧🇩',
        name: {
            en: 'flag-bd',
            es: 'bandera-bd',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇧🇪',
        name: {
            en: 'flag-be',
            es: 'bandera-be',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇧🇫',
        name: {
            en: 'flag-bf',
            es: 'bandera-bf',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇧🇬',
        name: {
            en: 'flag-bg',
            es: 'bandera-bg',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇧🇭',
        name: {
            en: 'flag-bh',
            es: 'bandera-bh',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇧🇮',
        name: {
            en: 'flag-bi',
            es: 'bandera-bi',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇧🇯',
        name: {
            en: 'flag-bj',
            es: 'bandera-bj',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇧🇱',
        name: {
            en: 'flag-bl',
            es: 'bandera-bl',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇧🇲',
        name: {
            en: 'flag-bm',
            es: 'bandera-bm',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇧🇳',
        name: {
            en: 'flag-bn',
            es: 'bandera-bn',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇧🇴',
        name: {
            en: 'flag-bo',
            es: 'bandera-bo',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇧🇶',
        name: {
            en: 'flag-bq',
            es: 'bandera-bq',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇧🇷',
        name: {
            en: 'flag-br',
            es: 'bandera-br',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇧🇸',
        name: {
            en: 'flag-bs',
            es: 'bandera-bs',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇧🇹',
        name: {
            en: 'flag-bt',
            es: 'bandera-bt',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇧🇻',
        name: {
            en: 'flag-bv',
            es: 'bandera-bv',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇧🇼',
        name: {
            en: 'flag-bw',
            es: 'bandera-bw',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇧🇾',
        name: {
            en: 'flag-by',
            es: 'bandera-by',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇧🇿',
        name: {
            en: 'flag-bz',
            es: 'bandera-bz',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇨🇦',
        name: {
            en: 'flag-ca',
            es: 'bandera-ca',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇨🇨',
        name: {
            en: 'flag-cc',
            es: 'bandera-cc',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇨🇩',
        name: {
            en: 'flag-cd',
            es: 'bandera-cd',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇨🇫',
        name: {
            en: 'flag-cf',
            es: 'bandera-cf',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇨🇬',
        name: {
            en: 'flag-cg',
            es: 'bandera-cg',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇨🇭',
        name: {
            en: 'flag-ch',
            es: 'bandera-ch',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇨🇮',
        name: {
            en: 'flag-ci',
            es: 'bandera-ci',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇨🇰',
        name: {
            en: 'flag-ck',
            es: 'bandera-ck',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇨🇱',
        name: {
            en: 'flag-cl',
            es: 'bandera-cl',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇨🇲',
        name: {
            en: 'flag-cm',
            es: 'bandera-cm',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇨🇳',
        name: {
            en: 'cn',
            es: 'cn',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇨🇴',
        name: {
            en: 'flag-co',
            es: 'bandera-co',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇨🇵',
        name: {
            en: 'flag-cp',
            es: 'bandera-cp',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇨🇷',
        name: {
            en: 'flag-cr',
            es: 'bandera-cr',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇨🇺',
        name: {
            en: 'flag-cu',
            es: 'bandera-cu',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇨🇻',
        name: {
            en: 'flag-cv',
            es: 'bandera-cv',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇨🇼',
        name: {
            en: 'flag-cw',
            es: 'bandera-cw',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇨🇽',
        name: {
            en: 'flag-cx',
            es: 'bandera-cx',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇨🇾',
        name: {
            en: 'flag-cy',
            es: 'bandera-cy',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇨🇿',
        name: {
            en: 'flag-cz',
            es: 'bandera-cz',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇩🇪',
        name: {
            en: 'de',
            es: 'de',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇩🇬',
        name: {
            en: 'flag-dg',
            es: 'bandera-dg',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇩🇯',
        name: {
            en: 'flag-dj',
            es: 'bandera-dj',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇩🇰',
        name: {
            en: 'flag-dk',
            es: 'bandera-dk',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇩🇲',
        name: {
            en: 'flag-dm',
            es: 'bandera-dm',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇩🇴',
        name: {
            en: 'flag-do',
            es: 'bandera-do',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇩🇿',
        name: {
            en: 'flag-dz',
            es: 'bandera-dz',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇪🇦',
        name: {
            en: 'flag-ea',
            es: 'bandera-ea',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇪🇨',
        name: {
            en: 'flag-ec',
            es: 'bandera-ec',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇪🇪',
        name: {
            en: 'flag-ee',
            es: 'bandera-ee',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇪🇬',
        name: {
            en: 'flag-eg',
            es: 'bandera-eg',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇪🇭',
        name: {
            en: 'flag-eh',
            es: 'bandera-eh',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇪🇷',
        name: {
            en: 'flag-er',
            es: 'bandera-er',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇪🇸',
        name: {
            en: 'es',
            es: 'es',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇪🇹',
        name: {
            en: 'flag-et',
            es: 'bandera-et',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇪🇺',
        name: {
            en: 'flag-eu',
            es: 'bandera-eu',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇫🇮',
        name: {
            en: 'flag-fi',
            es: 'bandera-fi',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇫🇯',
        name: {
            en: 'flag-fj',
            es: 'bandera-fj',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇫🇰',
        name: {
            en: 'flag-fk',
            es: 'bandera-fk',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇫🇲',
        name: {
            en: 'flag-fm',
            es: 'bandera-fm',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇫🇴',
        name: {
            en: 'flag-fo',
            es: 'bandera-fo',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇫🇷',
        name: {
            en: 'fr',
            es: 'fr',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇬🇦',
        name: {
            en: 'flag-ga',
            es: 'bandera-ga',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇬🇧',
        name: {
            en: 'gb',
            es: 'gb',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇬🇩',
        name: {
            en: 'flag-gd',
            es: 'bandera-gd',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇬🇪',
        name: {
            en: 'flag-ge',
            es: 'bandera-ge',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇬🇫',
        name: {
            en: 'flag-gf',
            es: 'bandera-gf',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇬🇬',
        name: {
            en: 'flag-gg',
            es: 'bandera-gg',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇬🇭',
        name: {
            en: 'flag-gh',
            es: 'bandera-gh',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇬🇮',
        name: {
            en: 'flag-gi',
            es: 'bandera-gi',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇬🇱',
        name: {
            en: 'flag-gl',
            es: 'bandera-gl',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇬🇲',
        name: {
            en: 'flag-gm',
            es: 'bandera-gm',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇬🇳',
        name: {
            en: 'flag-gn',
            es: 'bandera-gn',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇬🇵',
        name: {
            en: 'flag-gp',
            es: 'bandera-gp',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇬🇶',
        name: {
            en: 'flag-gq',
            es: 'bandera-gq',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇬🇷',
        name: {
            en: 'flag-gr',
            es: 'bandera-gr',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇬🇸',
        name: {
            en: 'flag-gs',
            es: 'bandera-gs',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇬🇹',
        name: {
            en: 'flag-gt',
            es: 'bandera-gt',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇬🇺',
        name: {
            en: 'flag-gu',
            es: 'bandera-gu',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇬🇼',
        name: {
            en: 'flag-gw',
            es: 'bandera-gw',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇬🇾',
        name: {
            en: 'flag-gy',
            es: 'bandera-gy',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇭🇰',
        name: {
            en: 'flag-hk',
            es: 'bandera-hk',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇭🇲',
        name: {
            en: 'flag-hm',
            es: 'bandera-hm',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇭🇳',
        name: {
            en: 'flag-hn',
            es: 'bandera-hn',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇭🇷',
        name: {
            en: 'flag-hr',
            es: 'bandera-hr',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇭🇹',
        name: {
            en: 'flag-ht',
            es: 'bandera-ht',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇭🇺',
        name: {
            en: 'flag-hu',
            es: 'bandera-hu',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇮🇨',
        name: {
            en: 'flag-ic',
            es: 'bandera-ic',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇮🇩',
        name: {
            en: 'flag-id',
            es: 'bandera-id',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇮🇪',
        name: {
            en: 'flag-ie',
            es: 'bandera-ie',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇮🇱',
        name: {
            en: 'flag-il',
            es: 'bandera-il',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇮🇲',
        name: {
            en: 'flag-im',
            es: 'bandera-im',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇮🇳',
        name: {
            en: 'flag-in',
            es: 'bandera-in',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇮🇴',
        name: {
            en: 'flag-io',
            es: 'bandera-io',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇮🇶',
        name: {
            en: 'flag-iq',
            es: 'bandera-iq',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇮🇷',
        name: {
            en: 'flag-ir',
            es: 'bandera-ir',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇮🇸',
        name: {
            en: 'flag-is',
            es: 'bandera-is',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇮🇹',
        name: {
            en: 'it',
            es: 'it',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇯🇪',
        name: {
            en: 'flag-je',
            es: 'bandera-je',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇯🇲',
        name: {
            en: 'flag-jm',
            es: 'bandera-jm',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇯🇴',
        name: {
            en: 'flag-jo',
            es: 'bandera-jo',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇯🇵',
        name: {
            en: 'jp',
            es: 'jp',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇰🇪',
        name: {
            en: 'flag-ke',
            es: 'bandera-ke',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇰🇬',
        name: {
            en: 'flag-kg',
            es: 'bandera-kg',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇰🇭',
        name: {
            en: 'flag-kh',
            es: 'bandera-kh',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇰🇮',
        name: {
            en: 'flag-ki',
            es: 'bandera-kl',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇰🇲',
        name: {
            en: 'flag-km',
            es: 'bandera-km',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇰🇳',
        name: {
            en: 'flag-kn',
            es: 'bandera-kn',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇰🇵',
        name: {
            en: 'flag-kp',
            es: 'bandera-kp',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇰🇷',
        name: {
            en: 'kr',
            es: 'kr',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇰🇼',
        name: {
            en: 'flag-kw',
            es: 'bandera-kw',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇰🇾',
        name: {
            en: 'flag-ky',
            es: 'bandera-ky',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇰🇿',
        name: {
            en: 'flag-kz',
            es: 'bandera-kz',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇱🇦',
        name: {
            en: 'flag-la',
            es: 'bandera-la',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇱🇧',
        name: {
            en: 'flag-lb',
            es: 'bandera-lb',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇱🇨',
        name: {
            en: 'flag-lc',
            es: 'bandera-lc',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇱🇮',
        name: {
            en: 'flag-li',
            es: 'bandera-li',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇱🇰',
        name: {
            en: 'flag-lk',
            es: 'bandera-lk',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇱🇷',
        name: {
            en: 'flag-lr',
            es: 'bandera-lr',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇱🇸',
        name: {
            en: 'flag-ls',
            es: 'bandera-ls',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇱🇹',
        name: {
            en: 'flag-lt',
            es: 'bandera-lt',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇱🇺',
        name: {
            en: 'flag-lu',
            es: 'bandera-lu',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇱🇻',
        name: {
            en: 'flag-lv',
            es: 'bandera-lv',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇱🇾',
        name: {
            en: 'flag-ly',
            es: 'bandera-ly',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇲🇦',
        name: {
            en: 'flag-ma',
            es: 'bandera-ma',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇲🇨',
        name: {
            en: 'flag-mc',
            es: 'bandera-mc',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇲🇩',
        name: {
            en: 'flag-md',
            es: 'bandera-md',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇲🇪',
        name: {
            en: 'flag-me',
            es: 'bandera-me',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇲🇫',
        name: {
            en: 'flag-mf',
            es: 'bandera-mf',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇲🇬',
        name: {
            en: 'flag-mg',
            es: 'bandera-mg',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇲🇭',
        name: {
            en: 'flag-mh',
            es: 'bandera-mh',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇲🇰',
        name: {
            en: 'flag-mk',
            es: 'bandera-mk',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇲🇱',
        name: {
            en: 'flag-ml',
            es: 'bandera-ml',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇲🇲',
        name: {
            en: 'flag-mm',
            es: 'bandera-mm',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇲🇳',
        name: {
            en: 'flag-mn',
            es: 'bandera-mn',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇲🇴',
        name: {
            en: 'flag-mo',
            es: 'bandera-mo',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇲🇵',
        name: {
            en: 'flag-mp',
            es: 'bandera-mp',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇲🇶',
        name: {
            en: 'flag-mq',
            es: 'bandera-mq',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇲🇷',
        name: {
            en: 'flag-mr',
            es: 'bandera-mr',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇲🇸',
        name: {
            en: 'flag-ms',
            es: 'bandera-ms',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇲🇹',
        name: {
            en: 'flag-mt',
            es: 'bandera-mt',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇲🇺',
        name: {
            en: 'flag-mu',
            es: 'bandera-mu',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇲🇻',
        name: {
            en: 'flag-mv',
            es: 'bandera-mv',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇲🇼',
        name: {
            en: 'flag-mw',
            es: 'bandera-mw',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇲🇽',
        name: {
            en: 'flag-mx',
            es: 'bandera-mx',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇲🇾',
        name: {
            en: 'flag-my',
            es: 'bandera-my',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇲🇿',
        name: {
            en: 'flag-mz',
            es: 'bandera-mz',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇳🇦',
        name: {
            en: 'flag-na',
            es: 'bandera-na',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇳🇨',
        name: {
            en: 'flag-nc',
            es: 'bandera-nc',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇳🇪',
        name: {
            en: 'flag-ne',
            es: 'bandera-ne',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇳🇫',
        name: {
            en: 'flag-nf',
            es: 'bandera-nf',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇳🇬',
        name: {
            en: 'flag-ng',
            es: 'bandera-ng',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇳🇮',
        name: {
            en: 'flag-ni',
            es: 'bandera-ni',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇳🇱',
        name: {
            en: 'flag-nl',
            es: 'bandera-nl',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇳🇴',
        name: {
            en: 'flag-no',
            es: 'bandera-no',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇳🇵',
        name: {
            en: 'flag-np',
            es: 'bandera-np',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇳🇷',
        name: {
            en: 'flag-nr',
            es: 'bandera-nr',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇳🇺',
        name: {
            en: 'flag-nu',
            es: 'bandera-nu',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇳🇿',
        name: {
            en: 'flag-nz',
            es: 'bandera-nz',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇴🇲',
        name: {
            en: 'flag-om',
            es: 'bandera-om',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇵🇦',
        name: {
            en: 'flag-pa',
            es: 'bandera-pa',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇵🇪',
        name: {
            en: 'flag-pe',
            es: 'bandera-pe',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇵🇫',
        name: {
            en: 'flag-pf',
            es: 'bandera-pf',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇵🇬',
        name: {
            en: 'flag-pg',
            es: 'bandera-pg',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇵🇭',
        name: {
            en: 'flag-ph',
            es: 'bandera-ph',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇵🇰',
        name: {
            en: 'flag-pk',
            es: 'bandera-pk',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇵🇱',
        name: {
            en: 'flag-pl',
            es: 'bandera-pl',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇵🇲',
        name: {
            en: 'flag-pm',
            es: 'bandera-pm',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇵🇳',
        name: {
            en: 'flag-pn',
            es: 'bandera-pn',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇵🇷',
        name: {
            en: 'flag-pr',
            es: 'bandera-pr',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇵🇸',
        name: {
            en: 'flag-ps',
            es: 'bandera-ps',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇵🇹',
        name: {
            en: 'flag-pt',
            es: 'bandera-pt',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇵🇼',
        name: {
            en: 'flag-pw',
            es: 'bandera-pw',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇵🇾',
        name: {
            en: 'flag-py',
            es: 'bandera-py',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇶🇦',
        name: {
            en: 'flag-qa',
            es: 'bandera-qa',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇷🇪',
        name: {
            en: 'flag-re',
            es: 'bandera-re',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇷🇴',
        name: {
            en: 'flag-ro',
            es: 'bandera-ro',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇷🇸',
        name: {
            en: 'flag-rs',
            es: 'bandera-rs',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇷🇺',
        name: {
            en: 'ru',
            es: 'ru',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇷🇼',
        name: {
            en: 'flag-rw',
            es: 'bandera-rw',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇸🇦',
        name: {
            en: 'flag-sa',
            es: 'bandera-sa',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇸🇧',
        name: {
            en: 'flag-sb',
            es: 'bandera-sb',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇸🇨',
        name: {
            en: 'flag-sc',
            es: 'bandera-sc',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇸🇩',
        name: {
            en: 'flag-sd',
            es: 'bandera-sd',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇸🇪',
        name: {
            en: 'flag-se',
            es: 'bandera-se',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇸🇬',
        name: {
            en: 'flag-sg',
            es: 'bandera-sg',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇸🇭',
        name: {
            en: 'flag-sh',
            es: 'bandera-sh',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇸🇮',
        name: {
            en: 'flag-si',
            es: 'bandera-si',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇸🇯',
        name: {
            en: 'flag-sj',
            es: 'bandera-sj',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇸🇰',
        name: {
            en: 'flag-sk',
            es: 'bandera-sk',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇸🇱',
        name: {
            en: 'flag-sl',
            es: 'bandera-sl',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇸🇲',
        name: {
            en: 'flag-sm',
            es: 'bandera-sm',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇸🇳',
        name: {
            en: 'flag-sn',
            es: 'bandera-sn',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇸🇴',
        name: {
            en: 'flag-so',
            es: 'bandera-so',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇸🇷',
        name: {
            en: 'flag-sr',
            es: 'bandera-sr',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇸🇸',
        name: {
            en: 'flag-ss',
            es: 'bandera-ss',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇸🇹',
        name: {
            en: 'flag-st',
            es: 'bandera-st',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇸🇻',
        name: {
            en: 'flag-sv',
            es: 'bandera-sv',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇸🇽',
        name: {
            en: 'flag-sx',
            es: 'bandera-sx',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇸🇾',
        name: {
            en: 'flag-sy',
            es: 'bandera-sy',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇸🇿',
        name: {
            en: 'flag-sz',
            es: 'bandera-sz',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇹🇦',
        name: {
            en: 'flag-ta',
            es: 'bandera-ta',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇹🇨',
        name: {
            en: 'flag-tc',
            es: 'bandera-tc',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇹🇩',
        name: {
            en: 'flag-td',
            es: 'bandera-td',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇹🇫',
        name: {
            en: 'flag-tf',
            es: 'bandera-tf',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇹🇬',
        name: {
            en: 'flag-tg',
            es: 'bandera-tg',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇹🇭',
        name: {
            en: 'flag-th',
            es: 'bandera-th',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇹🇯',
        name: {
            en: 'flag-tj',
            es: 'bandera-tj',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇹🇰',
        name: {
            en: 'flag-tk',
            es: 'bandera-tk',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇹🇱',
        name: {
            en: 'flag-tl',
            es: 'bandera-tl',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇹🇲',
        name: {
            en: 'flag-tm',
            es: 'bandera-tm',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇹🇳',
        name: {
            en: 'flag-tn',
            es: 'bandera-tn',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇹🇴',
        name: {
            en: 'flag-to',
            es: 'bandera-to',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇹🇷',
        name: {
            en: 'flag-tr',
            es: 'bandera-tr',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇹🇹',
        name: {
            en: 'flag-tt',
            es: 'bandera-tt',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇹🇻',
        name: {
            en: 'flag-tv',
            es: 'bandera-tv',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇹🇼',
        name: {
            en: 'flag-tw',
            es: 'bandera-tw',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇹🇿',
        name: {
            en: 'flag-tz',
            es: 'bandera-tz',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇺🇦',
        name: {
            en: 'flag-ua',
            es: 'bandera-ua',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇺🇬',
        name: {
            en: 'flag-ug',
            es: 'bandera-ug',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇺🇲',
        name: {
            en: 'flag-um',
            es: 'bandera-um',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇺🇳',
        name: {
            en: 'flag-un',
            es: 'bandera-onu',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇺🇸',
        name: {
            en: 'us',
            es: 'us',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇺🇾',
        name: {
            en: 'flag-uy',
            es: 'bandera-uy',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇺🇿',
        name: {
            en: 'flag-uz',
            es: 'bandera-uz',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇻🇦',
        name: {
            en: 'flag-va',
            es: 'bandera-va',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇻🇨',
        name: {
            en: 'flag-vc',
            es: 'bandera-vc',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇻🇪',
        name: {
            en: 'flag-ve',
            es: 'bandera-ve',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇻🇬',
        name: {
            en: 'flag-vg',
            es: 'bandera-vg',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇻🇮',
        name: {
            en: 'flag-vi',
            es: 'bandera-vi',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇻🇳',
        name: {
            en: 'flag-vn',
            es: 'bandera-vn',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇻🇺',
        name: {
            en: 'flag-vu',
            es: 'bandera-vu',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇼🇫',
        name: {
            en: 'flag-wf',
            es: 'bandera-wf',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇼🇸',
        name: {
            en: 'flag-ws',
            es: 'bandera-ws',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇽🇰',
        name: {
            en: 'flag-xk',
            es: 'bandera-xk',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇾🇪',
        name: {
            en: 'flag-ye',
            es: 'bandera-ye',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇾🇹',
        name: {
            en: 'flag-yt',
            es: 'bandera-yt',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇿🇦',
        name: {
            en: 'flag-za',
            es: 'bandera-za',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇿🇲',
        name: {
            en: 'flag-zm',
            es: 'bandera-zm',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🇿🇼',
        name: {
            en: 'flag-zw',
            es: 'bandera-zw',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
        name: {
            en: 'flag-england',
            es: 'bandera-inglaterra',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
        name: {
            en: 'flag-scotland',
            es: 'bandera-escocia',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
    {
        code: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
        name: {
            en: 'flag-wales',
            es: 'bandera-gales',
        },
        keywords: {
            en: ['flag'],
            es: ['Bandera'],
        },
    },
];

const localizedEmojiNames = _.reduce(
    emojis,
    (prev, cur) => {
        const newValue = prev;
        if (!cur.header) {
            newValue[cur.name.en] = cur.name;
        }
        return newValue;
    },
    {},
);

const categoryFrequentlyUsed = {
    header: true,
    code: 'frequentlyUsed',
    icon: FrequentlyUsed,
};

export {skinTones, localizedEmojiNames, categoryFrequentlyUsed};
export default emojis;
