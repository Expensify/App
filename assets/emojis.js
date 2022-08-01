import CONST from '../src/CONST';

/*
 * This list is generated from the code here https://github.com/amurani/unicode-emoji-list
 * Each code is then converted to hex by replacing the "U+" with "0x"
 * Each hex is then converted to a string using this function (each section is defined as "emojis" in this function)
 * for (var i=0; i<emojis.length; i++) {
 *  newCode = '';
 *  emojis[i].code.forEach(codePiece => {
 *      newCode += String.fromCodePoint(codePiece);
 *  });
 *  emojis[i].code=newCode;
 *  //console.log(newCode);
 *  if (emojis[i].types) {
 *      newTypesArray = [];
 *      emojis[i].types.forEach(type => {
 *          typeCode = '';
 *          type.forEach(code => {
 *               typeCode += String.fromCodePoint(code);
 *          });
 *          newTypesArray.push(typeCode);
 *      });
 *      //console.log(newTypesArray);
 *      emojis[i].types = newTypesArray
 *  }
 * }
 */

// BEFORE YOU EDIT THIS, PLEASE SEE WARNINGS IN EmojiPickerMenu.js
const skinTones = [{
    code: '🖐',
    skinTone: CONST.DEFAULT_SKIN_TONE,
}, {
    code: '🖐🏻',
    skinTone: 4,
}, {
    code: '🖐🏼',
    skinTone: 3,
}, {
    code: '🖐🏽',
    skinTone: 2,
}, {
    code: '🖐🏾',
    skinTone: 1,
}, {
    code: '🖐🏿',
    skinTone: 0,
}];

const emojis = [
    {
        code: 'smileysAndPeople',
        header: true,
    },
    {
        code: '😀',
        keywords: [
            'face',
            'grin',
        ],
        name: 'grinning',
    },
    {
        code: '😁',
        keywords: [
            'eye',
            'face',
            'grin',
            'smile',
        ],
        name: 'grin',
    },
    {
        code: '😂',
        keywords: [
            'face',
            'joy',
            'laugh',
            'tear',
        ],
        name: 'joy',
    },
    {
        code: '🤣',
        keywords: [
            'face',
            'floor',
            'laugh',
            'lol',
            'rofl',
            'rolling',
        ],
        name: 'rofl',
    },
    {
        code: '😃',
        keywords: [
            'face',
            'mouth',
            'open',
            'smile',
        ],
        name: 'smiley',
    },
    {
        code: '😄',
        keywords: [
            'eye',
            'face',
            'mouth',
            'open',
            'smile',
        ],
        name: 'smile',
    },
    {
        code: '😅',
        keywords: [
            'cold',
            'face',
            'open',
            'smile',
            'sweat',
        ],
        name: 'sweat_smile',
    },
    {
        code: '😆',
        keywords: [
            'face',
            'laugh',
            'mouth',
            'open',
            'satisfied',
            'smile',
        ],
        name: 'laughing',
    },
    {
        code: '😉',
        keywords: [
            'face',
            'wink',
        ],
        name: 'wink',
    },
    {
        code: '😊',
        keywords: [
            'blush',
            'eye',
            'face',
            'smile',
        ],
        name: 'blush',
    },
    {
        code: '😋',
        keywords: [
            'delicious',
            'face',
            'savouring',
            'smile',
            'um',
            'yum',
        ],
        name: 'yum',
    },
    {
        code: '😎',
        keywords: [
            'bright',
            'cool',
            'eye',
            'eyewear',
            'face',
            'glasses',
            'smile',
            'sun',
            'sunglasses',
            'weather',
        ],
        name: 'sunglasses',
    },
    {
        code: '😍',
        keywords: [
            'eye',
            'face',
            'heart',
            'love',
            'smile',
        ],
        name: 'heart_eyes',
    },
    {
        code: '😘',
        keywords: [
            'face',
            'heart',
            'kiss',
        ],
        name: 'kissing_heart',
    },
    {
        code: '😗',
        keywords: [
            'face',
            'kiss',
        ],
        name: 'kissing',
    },
    {
        code: '😙',
        keywords: [
            'eye',
            'face',
            'kiss',
            'smile',
        ],
        name: 'kissing_smiling_eyes',
    },
    {
        code: '😚',
        keywords: [
            'closed',
            'eye',
            'face',
            'kiss',
        ],
        name: 'kissing_closed_eyes',
    },
    {
        code: '🙂',
        keywords: [
            'face',
            'smile',
        ],
        name: 'slightly_smiling_face',
    },
    {
        code: '🤗',
        keywords: [
            'face',
            'hug',
            'hugging',
        ],
        name: 'hugs',
    },
    {
        code: '🤔',
        keywords: [
            'face',
            'thinking',
        ],
        name: 'thinking',
    },
    {
        code: '😐',
        keywords: [
            'deadpan',
            'face',
            'neutral',
        ],
        name: 'neutral_face',
    },
    {
        code: '😑',
        keywords: [
            'expressionless',
            'face',
            'inexpressive',
            'unexpressive',
        ],
        name: 'expressionless',
    },
    {
        code: '😶',
        keywords: [
            'face',
            'mouth',
            'quiet',
            'silent',
        ],
        name: 'no_mouth',
    },
    {
        code: '🙄',
        keywords: [
            'eyes',
            'face',
            'rolling',
        ],
        name: 'roll_eyes',
    },
    {
        code: '😏',
        keywords: [
            'face',
            'smirk',
        ],
        name: 'smirk',
    },
    {
        code: '😣',
        keywords: [
            'face',
            'persevere',
        ],
        name: 'persevere',
    },
    {
        code: '😥',
        keywords: [
            'disappointed',
            'face',
            'relieved',
            'whew',
        ],
        name: 'disappointed_relieved',
    },
    {
        code: '😮',
        keywords: [
            'face',
            'mouth',
            'open',
            'sympathy',
        ],
        name: 'open_mouth',
    },
    {
        code: '🤐',
        keywords: [
            'face',
            'mouth',
            'zipper',
        ],
        name: 'zipper_mouth_face',
    },
    {
        code: '😯',
        keywords: [
            'face',
            'hushed',
            'stunned',
            'surprised',
        ],
        name: 'hushed',
    },
    {
        code: '😪',
        keywords: [
            'face',
            'sleep',
        ],
        name: 'sleepy',
    },
    {
        code: '😫',
        keywords: [
            'face',
            'tired',
        ],
        name: 'tired_face',
    },
    {
        code: '😴',
        keywords: [
            'face',
            'sleep',
            'zzz',
        ],
        name: 'sleeping',
    },
    {
        code: '😌',
        keywords: [
            'face',
            'relieved',
        ],
        name: 'relieved',
    },
    {
        code: '🤓',
        keywords: [
            'face',
            'geek',
            'nerd',
        ],
        name: 'nerd_face',
    },
    {
        code: '😛',
        keywords: [
            'face',
            'tongue',
        ],
        name: 'stuck_out_tongue',
    },
    {
        code: '😜',
        keywords: [
            'eye',
            'face',
            'joke',
            'tongue',
            'wink',
        ],
        name: 'stuck_out_tongue_winking_eye',
    },
    {
        code: '😝',
        keywords: [
            'eye',
            'face',
            'horrible',
            'taste',
            'tongue',
        ],
        name: 'stuck_out_tongue_closed_eyes',
    },
    {
        code: '🤤',
        keywords: [
            'drooling',
            'face',
        ],
        name: 'drooling_face',
    },
    {
        code: '😒',
        keywords: [
            'face',
            'unamused',
            'unhappy',
        ],
        name: 'unamused',
    },
    {
        code: '😓',
        keywords: [
            'cold',
            'face',
            'sweat',
        ],
        name: 'sweat',
    },
    {
        code: '😔',
        keywords: [
            'dejected',
            'face',
            'pensive',
        ],
        name: 'pensive',
    },
    {
        code: '😕',
        keywords: [
            'confused',
            'face',
        ],
        name: 'confused',
    },
    {
        code: '🙃',
        keywords: [
            'face',
            'upside-down',
        ],
        name: 'upside_down_face',
    },
    {
        code: '🤑',
        keywords: [
            'face',
            'money',
            'mouth',
        ],
        name: 'money_mouth_face',
    },
    {
        code: '😲',
        keywords: [
            'astonished',
            'face',
            'shocked',
            'totally',
        ],
        name: 'astonished',
    },
    {
        code: '🙁',
        keywords: [
            'face',
            'frown',
        ],
        name: 'slightly_frowning_face',
    },
    {
        code: '😖',
        keywords: [
            'confounded',
            'face',
        ],
        name: 'confounded',
    },
    {
        code: '😞',
        keywords: [
            'disappointed',
            'face',
        ],
        name: 'disappointed',
    },
    {
        code: '😟',
        keywords: [
            'face',
            'worried',
        ],
        name: 'worried',
    },
    {
        code: '😤',
        keywords: [
            'face',
            'triumph',
            'won',
        ],
        name: 'triumph',
    },
    {
        code: '😢',
        keywords: [
            'cry',
            'face',
            'sad',
            'tear',
        ],
        name: 'cry',
    },
    {
        code: '😭',
        keywords: [
            'cry',
            'face',
            'sad',
            'sob',
            'tear',
        ],
        name: 'sob',
    },
    {
        code: '😦',
        keywords: [
            'face',
            'frown',
            'mouth',
            'open',
        ],
        name: 'frowning',
    },
    {
        code: '😧',
        keywords: [
            'anguished',
            'face',
        ],
        name: 'anguished',
    },
    {
        code: '😨',
        keywords: [
            'face',
            'fear',
            'fearful',
            'scared',
        ],
        name: 'fearful',
    },
    {
        code: '😩',
        keywords: [
            'face',
            'tired',
            'weary',
        ],
        name: 'weary',
    },
    {
        code: '😬',
        keywords: [
            'face',
            'grimace',
        ],
        name: 'grimacing',
    },
    {
        code: '😰',
        keywords: [
            'blue',
            'cold',
            'face',
            'mouth',
            'open',
            'rushed',
            'sweat',
        ],
        name: 'cold_sweat',
    },
    {
        code: '😱',
        keywords: [
            'face',
            'fear',
            'fearful',
            'munch',
            'scared',
            'scream',
        ],
        name: 'scream',
    },
    {
        code: '😳',
        keywords: [
            'dazed',
            'face',
            'flushed',
        ],
        name: 'flushed',
    },
    {
        code: '😵',
        keywords: [
            'dizzy',
            'face',
        ],
        name: 'dizzy_face',
    },
    {
        code: '😡',
        keywords: [
            'angry',
            'face',
            'mad',
            'pouting',
            'rage',
            'red',
        ],
        name: 'rage',
    },
    {
        code: '😠',
        keywords: [
            'angry',
            'face',
            'mad',
        ],
        name: 'angry',
    },
    {
        code: '😇',
        keywords: [
            'angel',
            'face',
            'fairy tale',
            'fantasy',
            'halo',
            'innocent',
            'smile',
        ],
        name: 'innocent',
    },
    {
        code: '🤠',
        keywords: [
            'cowboy',
            'cowgirl',
            'face',
            'hat',
        ],
        name: 'cowboy_hat_face',
    },
    {
        code: '🤡',
        keywords: [
            'clown',
            'face',
        ],
        name: 'clown_face',
    },
    {
        code: '🤥',
        keywords: [
            'face',
            'lie',
            'pinocchio',
        ],
        name: 'lying_face',
    },
    {
        code: '😷',
        keywords: [
            'cold',
            'doctor',
            'face',
            'mask',
            'medicine',
            'sick',
        ],
        name: 'mask',
    },
    {
        code: '🤒',
        keywords: [
            'face',
            'ill',
            'sick',
            'thermometer',
        ],
        name: 'face_with_thermometer',
    },
    {
        code: '🤕',
        keywords: [
            'bandage',
            'face',
            'hurt',
            'injury',
        ],
        name: 'face_with_head_bandage',
    },
    {
        code: '🤢',
        keywords: [
            'face',
            'nauseated',
            'vomit',
        ],
        name: 'nauseated_face',
    },
    {
        code: '🤧',
        keywords: [
            'face',
            'gesundheit',
            'sneeze',
        ],
        name: 'sneezing_face',
    },
    {
        code: '😈',
        keywords: [
            'face',
            'fairy tale',
            'fantasy',
            'horns',
            'smile',
        ],
        name: 'smiling_imp',
    },
    {
        code: '👿',
        keywords: [
            'demon',
            'devil',
            'face',
            'fairy tale',
            'fantasy',
            'imp',
        ],
        name: 'imp',
    },
    {
        code: '👹',
        keywords: [
            'creature',
            'face',
            'fairy tale',
            'fantasy',
            'japanese',
            'monster',
            'ogre',
        ],
        name: 'japanese_ogre',
    },
    {
        code: '👺',
        keywords: [
            'creature',
            'face',
            'fairy tale',
            'fantasy',
            'goblin',
            'japanese',
            'monster',
        ],
        name: 'japanese_goblin',
    },
    {
        code: '💀',
        keywords: [
            'body',
            'death',
            'face',
            'fairy tale',
            'monster',
            'skull',
        ],
        name: 'skull',
    },
    {
        code: '☠️',
        keywords: [
            'body',
            'crossbones',
            'death',
            'face',
            'monster',
            'skull',
        ],
        name: 'skull_and_crossbones',
    },
    {
        code: '👻',
        keywords: [
            'creature',
            'face',
            'fairy tale',
            'fantasy',
            'ghost',
            'monster',
        ],
        name: 'ghost',
    },
    {
        code: '👽',
        keywords: [
            'alien',
            'creature',
            'extraterrestrial',
            'face',
            'fairy tale',
            'fantasy',
            'monster',
            'space',
            'ufo',
        ],
        name: 'alien',
    },
    {
        code: '👾',
        keywords: [
            'alien',
            'creature',
            'extraterrestrial',
            'face',
            'fairy tale',
            'fantasy',
            'monster',
            'space',
            'ufo',
        ],
        name: 'space_invader',
    },
    {
        code: '🤖',
        keywords: [
            'face',
            'monster',
            'robot',
        ],
        name: 'robot',
    },
    {
        code: '💩',
        keywords: [
            'comic',
            'dung',
            'face',
            'monster',
            'poo',
            'poop',
        ],
        name: 'hankey',
    },
    {
        code: '😺',
        keywords: [
            'cat',
            'face',
            'mouth',
            'open',
            'smile',
        ],
        name: 'smiley_cat',
    },
    {
        code: '😸',
        keywords: [
            'cat',
            'eye',
            'face',
            'grin',
            'smile',
        ],
        name: 'smile_cat',
    },
    {
        code: '😹',
        keywords: [
            'cat',
            'face',
            'joy',
            'tear',
        ],
        name: 'joy_cat',
    },
    {
        code: '😻',
        keywords: [
            'cat',
            'eye',
            'face',
            'heart',
            'love',
            'smile',
        ],
        name: 'heart_eyes_cat',
    },
    {
        code: '😼',
        keywords: [
            'cat',
            'face',
            'ironic',
            'smile',
            'wry',
        ],
        name: 'smirk_cat',
    },
    {
        code: '😽',
        keywords: [
            'cat',
            'eye',
            'face',
            'kiss',
        ],
        name: 'kissing_cat',
    },
    {
        code: '🙀',
        keywords: [
            'cat',
            'face',
            'oh',
            'surprised',
            'weary',
        ],
        name: 'scream_cat',
    },
    {
        code: '😿',
        keywords: [
            'cat',
            'cry',
            'face',
            'sad',
            'tear',
        ],
        name: 'crying_cat_face',
    },
    {
        code: '😾',
        keywords: [
            'cat',
            'face',
            'pouting',
        ],
        name: 'pouting_cat',
    },
    {
        code: '🙈',
        keywords: [
            'evil',
            'face',
            'forbidden',
            'gesture',
            'monkey',
            'no',
            'not',
            'prohibited',
            'see',
        ],
        name: 'see_no_evil',
    },
    {
        code: '🙉',
        keywords: [
            'evil',
            'face',
            'forbidden',
            'gesture',
            'hear',
            'monkey',
            'no',
            'not',
            'prohibited',
        ],
        name: 'hear_no_evil',
    },
    {
        code: '🙊',
        keywords: [
            'evil',
            'face',
            'forbidden',
            'gesture',
            'monkey',
            'no',
            'not',
            'prohibited',
            'speak',
        ],
        name: 'speak_no_evil',
    },
    {
        code: '👦',
        keywords: [
            'boy',
        ],
        types: [
            '👦🏿',
            '👦🏾',
            '👦🏽',
            '👦🏼',
            '👦🏻',
        ],
        name: 'boy',
    },
    {
        code: '👧',
        keywords: [
            'girl',
            'maiden',
            'virgin',
            'virgo',
            'zodiac',
        ],
        types: [
            '👧🏿',
            '👧🏾',
            '👧🏽',
            '👧🏼',
            '👧🏻',
        ],
        name: 'girl',
    },
    {
        code: '👨',
        keywords: [
            'man',
        ],
        types: [
            '👨🏿',
            '👨🏾',
            '👨🏽',
            '👨🏼',
            '👨🏻',
        ],
        name: 'man',
    },
    {
        code: '👩',
        keywords: [
            'woman',
        ],
        types: [
            '👩🏿',
            '👩🏾',
            '👩🏽',
            '👩🏼',
            '👩🏻',
        ],
        name: 'woman',
    },
    {
        code: '👴',
        keywords: [
            'man',
            'old',
        ],
        types: [
            '👴🏿',
            '👴🏾',
            '👴🏽',
            '👴🏼',
            '👴🏻',
        ],
        name: 'older_man',
    },
    {
        code: '👵',
        keywords: [
            'old',
            'woman',
        ],
        types: [
            '👵🏿',
            '👵🏾',
            '👵🏽',
            '👵🏼',
            '👵🏻',
        ],
        name: 'older_woman',
    },
    {
        code: '👶',
        keywords: [
            'baby',
        ],
        types: [
            '👶🏿',
            '👶🏾',
            '👶🏽',
            '👶🏼',
            '👶🏻',
        ],
        name: 'baby',
    },
    {
        code: '👼',
        keywords: [
            'angel',
            'baby',
            'face',
            'fairy tale',
            'fantasy',
        ],
        types: [
            '👼🏿',
            '👼🏾',
            '👼🏽',
            '👼🏼',
            '👼🏻',
        ],
        name: 'angel',
    },
    {
        code: '👱',
        keywords: [
            'blond',
        ],
        types: [
            '👱🏿',
            '👱🏾',
            '👱🏽',
            '👱🏼',
            '👱🏻',
        ],
        name: 'blond_haired_person',
    },
    {
        code: '👮',
        keywords: [
            'cop',
            'officer',
            'police',
        ],
        types: [
            '👮🏿',
            '👮🏾',
            '👮🏽',
            '👮🏼',
            '👮🏻',
        ],
        name: 'police_officer',
    },
    {
        code: '👲',
        keywords: [
            'gua pi mao',
            'hat',
            'man',
        ],
        types: [
            '👲🏿',
            '👲🏾',
            '👲🏽',
            '👲🏼',
            '👲🏻',
        ],
        name: 'man_with_gua_pi_mao',
    },
    {
        code: '👳',
        keywords: [
            'man',
            'turban',
        ],
        types: [
            '👳🏿',
            '👳🏾',
            '👳🏽',
            '👳🏼',
            '👳🏻',
        ],
        name: 'person_with_turban',
    },
    {
        code: '👷',
        keywords: [
            'construction',
            'hat',
            'worker',
        ],
        types: [
            '👷🏿',
            '👷🏾',
            '👷🏽',
            '👷🏼',
            '👷🏻',
        ],
        name: 'construction_worker',
    },
    {
        code: '👸',
        keywords: [
            'fairy tale',
            'fantasy',
            'princess',
        ],
        types: [
            '👸🏿',
            '👸🏾',
            '👸🏽',
            '👸🏼',
            '👸🏻',
        ],
        name: 'princess',
    },
    {
        code: '🤴',
        keywords: [
            'prince',
        ],
        types: [
            '🤴🏿',
            '🤴🏾',
            '🤴🏽',
            '🤴🏼',
            '🤴🏻',
        ],
        name: 'prince',
    },
    {
        code: '💂',
        keywords: [
            'guard',
            'guardsman',
        ],
        types: [
            '💂🏿',
            '💂🏾',
            '💂🏽',
            '💂🏼',
            '💂🏻',
        ],
        name: 'guard',
    },
    {
        code: '🕵',
        keywords: [
            'detective',
            'sleuth',
            'spy',
        ],
        types: [
            '🕵🏿',
            '🕵🏾',
            '🕵🏽',
            '🕵🏼',
            '🕵🏻',
        ],
        name: 'detective',
    },
    {
        code: '🎅',
        keywords: [
            'activity',
            'celebration',
            'christmas',
            'fairy tale',
            'fantasy',
            'father',
            'santa',
        ],
        types: [
            '🎅🏿',
            '🎅🏾',
            '🎅🏽',
            '🎅🏼',
            '🎅🏻',
        ],
        name: 'santa',
    },
    {
        code: '🤶',
        keywords: [
            'christmas',
            'mother',
            'mrs. claus',
        ],
        types: [
            '🤶🏿',
            '🤶🏾',
            '🤶🏽',
            '🤶🏼',
            '🤶🏻',
        ],
        name: 'mrs_claus',
    },
    {
        code: '👰',
        keywords: [
            'bride',
            'veil',
            'wedding',
        ],
        types: [
            '👰🏿',
            '👰🏾',
            '👰🏽',
            '👰🏼',
            '👰🏻',
        ],
        name: 'person_with_veil',
    },
    {
        code: '🤵',
        keywords: [
            'groom',
            'man',
            'tuxedo',
        ],
        types: [
            '🤵🏿',
            '🤵🏾',
            '🤵🏽',
            '🤵🏼',
            '🤵🏻',
        ],
        name: 'person_in_tuxedo',
    },
    {
        code: '💆',
        keywords: [
            'massage',
            'salon',
        ],
        types: [
            '💆🏿',
            '💆🏾',
            '💆🏽',
            '💆🏼',
            '💆🏻',
        ],
        name: 'massage',
    },
    {
        code: '💇',
        keywords: [
            'barber',
            'beauty',
            'haircut',
            'parlor',
        ],
        types: [
            '💇🏿',
            '💇🏾',
            '💇🏽',
            '💇🏼',
            '💇🏻',
        ],
        name: 'haircut',
    },
    {
        code: '🙍',
        keywords: [
            'frown',
            'gesture',
        ],
        types: [
            '🙍🏿',
            '🙍🏾',
            '🙍🏽',
            '🙍🏼',
            '🙍🏻',
        ],
        name: 'frowning_person',
    },
    {
        code: '🙎',
        keywords: [
            'gesture',
            'pouting',
        ],
        types: [
            '🙎🏿',
            '🙎🏾',
            '🙎🏽',
            '🙎🏼',
            '🙎🏻',
        ],
        name: 'pouting_face',
    },
    {
        code: '🙅',
        keywords: [
            'forbidden',
            'gesture',
            'hand',
            'no',
            'not',
            'prohibited',
        ],
        types: [
            '🙅🏿',
            '🙅🏾',
            '🙅🏽',
            '🙅🏼',
            '🙅🏻',
        ],
        name: 'no_good',
    },
    {
        code: '🙆',
        keywords: [
            'gesture',
            'hand',
            'ok',
        ],
        types: [
            '🙆🏿',
            '🙆🏾',
            '🙆🏽',
            '🙆🏼',
            '🙆🏻',
        ],
        name: 'ok_person',
    },
    {
        code: '💁',
        keywords: [
            'hand',
            'help',
            'information',
            'sassy',
        ],
        types: [
            '💁🏿',
            '💁🏾',
            '💁🏽',
            '💁🏼',
            '💁🏻',
        ],
        name: 'tipping_hand_person',
    },
    {
        code: '🤷',
        keywords: [
            'doubt',
            'ignorance',
            'indifference',
            'shrug',
        ],
        types: [
            '🤷🏿',
            '🤷🏾',
            '🤷🏽',
            '🤷🏼',
            '🤷🏻',
        ],
        name: 'shrug',
    },
    {
        code: '🙋',
        keywords: [
            'gesture',
            'hand',
            'happy',
            'raised',
        ],
        types: [
            '🙋🏿',
            '🙋🏾',
            '🙋🏽',
            '🙋🏼',
            '🙋🏻',
        ],
        name: 'raising_hand',
    },
    {
        code: '🤦',
        keywords: [
            'disbelief',
            'exasperation',
            'face',
            'palm',
        ],
        types: [
            '🤦🏿',
            '🤦🏾',
            '🤦🏽',
            '🤦🏼',
            '🤦🏻',
        ],
        name: 'facepalm',
    },
    {
        code: '🙇',
        keywords: [
            'apology',
            'bow',
            'gesture',
            'sorry',
        ],
        types: [
            '🙇🏿',
            '🙇🏾',
            '🙇🏽',
            '🙇🏼',
            '🙇🏻',
        ],
        name: 'bow',
    },
    {
        code: '🚶',
        keywords: [
            'hike',
            'pedestrian',
            'walk',
            'walking',
        ],
        types: [
            '🚶🏿',
            '🚶🏾',
            '🚶🏽',
            '🚶🏼',
            '🚶🏻',
        ],
        name: 'walking',
    },
    {
        code: '🏃',
        keywords: [
            'marathon',
            'runner',
            'running',
        ],
        types: [
            '🏃🏿',
            '🏃🏾',
            '🏃🏽',
            '🏃🏼',
            '🏃🏻',
        ],
        name: 'runner',
    },
    {
        code: '💃',
        keywords: [
            'dancer',
        ],
        types: [
            '💃🏿',
            '💃🏾',
            '💃🏽',
            '💃🏼',
            '💃🏻',
        ],
        name: 'woman_dancing',
    },
    {
        code: '🕺',
        keywords: [
            'dance',
            'man',
        ],
        types: [
            '🕺🏿',
            '🕺🏾',
            '🕺🏽',
            '🕺🏼',
            '🕺🏻',
        ],
        name: 'man_dancing',
    },
    {
        code: '🤰',
        keywords: [
            'pregnant',
            'woman',
        ],
        types: [
            '🤰🏿',
            '🤰🏾',
            '🤰🏽',
            '🤰🏼',
            '🤰🏻',
        ],
        name: 'pregnant_woman',
    },
    {
        code: '👯',
        keywords: [
            'bunny',
            'dancer',
            'ear',
            'girl',
            'woman',
        ],
        name: 'dancers',
    },
    {
        code: '🕴',
        keywords: [
            'business',
            'man',
            'suit',
        ],
        name: 'business_suit_levitating',
    },
    {
        code: '🗣',
        keywords: [
            'face',
            'head',
            'silhouette',
            'speak',
            'speaking',
        ],
        name: 'speaking_head',
    },
    {
        code: '👤',
        keywords: [
            'bust',
            'silhouette',
        ],
        name: 'bust_in_silhouette',
    },
    {
        code: '👥',
        keywords: [
            'bust',
            'silhouette',
        ],
        name: 'busts_in_silhouette',
    },
    {
        code: '👫',
        keywords: [
            'couple',
            'hand',
            'hold',
            'man',
            'woman',
        ],
        name: 'couple',
    },
    {
        code: '👬',
        keywords: [
            'couple',
            'gemini',
            'hand',
            'hold',
            'man',
            'twins',
            'zodiac',
        ],
        name: 'two_men_holding_hands',
    },
    {
        code: '👭',
        keywords: [
            'couple',
            'hand',
            'hold',
            'woman',
        ],
        name: 'two_women_holding_hands',
    },
    {
        code: '💏',
        keywords: [
            'couple',
            'kiss',
            'romance',
        ],
        name: 'couplekiss',
    },
    {
        code: '💑',
        keywords: [
            'couple',
            'heart',
            'love',
            'romance',
        ],
        name: 'couple_with_heart',
    },
    {
        code: '👪',
        keywords: [
            'child',
            'family',
            'father',
            'mother',
        ],
        name: 'family',
    },
    {
        code: '👨‍👩‍👦',
        keywords: [
            'boy',
            'family',
            'man',
            'woman',
        ],
        name: 'family_man_woman_boy',
    },
    {
        code: '👨‍👩‍👧',
        keywords: [
            'family',
            'girl',
            'man',
            'woman',
        ],
        name: 'family_man_woman_girl',
    },
    {
        code: '👨‍👩‍👧‍👦',
        keywords: [
            'boy',
            'family',
            'girl',
            'man',
            'woman',
        ],
        name: 'family_man_woman_girl_boy',
    },
    {
        code: '👨‍👩‍👦‍👦',
        keywords: [
            'boy',
            'family',
            'man',
            'woman',
        ],
        name: 'family_man_woman_boy_boy',
    },
    {
        code: '👨‍👩‍👧‍👧',
        keywords: [
            'family',
            'girl',
            'man',
            'woman',
        ],
        name: 'family_man_woman_girl_girl',
    },
    {
        code: '👨‍👨‍👦',
        keywords: [
            'boy',
            'family',
            'man',
        ],
        name: 'family_man_man_boy',
    },
    {
        code: '👨‍👨‍👧',
        keywords: [
            'family',
            'girl',
            'man',
        ],
        name: 'family_man_man_girl',
    },
    {
        code: '👨‍👨‍👧‍👦',
        keywords: [
            'boy',
            'family',
            'girl',
            'man',
        ],
        name: 'family_man_man_girl_boy',
    },
    {
        code: '👨‍👨‍👦‍👦',
        keywords: [
            'boy',
            'family',
            'man',
        ],
        name: 'family_man_man_boy_boy',
    },
    {
        code: '👨‍👨‍👧‍👧',
        keywords: [
            'family',
            'girl',
            'man',
        ],
        name: 'family_man_man_girl_girl',
    },
    {
        code: '👩‍👩‍👦',
        keywords: [
            'boy',
            'family',
            'woman',
        ],
        name: 'family_woman_woman_boy',
    },
    {
        code: '👩‍👩‍👧',
        keywords: [
            'family',
            'girl',
            'woman',
        ],
        name: 'family_woman_woman_girl',
    },
    {
        code: '👩‍👩‍👧‍👦',
        keywords: [
            'boy',
            'family',
            'girl',
            'woman',
        ],
        name: 'family_woman_woman_girl_boy',
    },
    {
        code: '👩‍👩‍👦‍👦',
        keywords: [
            'boy',
            'family',
            'woman',
        ],
        name: 'family_woman_woman_boy_boy',
    },
    {
        code: '👩‍👩‍👧‍👧',
        keywords: [
            'family',
            'girl',
            'woman',
        ],
        name: 'family_woman_woman_girl_girl',
    },
    {
        code: '💪',
        keywords: [
            'biceps',
            'body',
            'comic',
            'flex',
            'muscle',
        ],
        types: [
            '💪🏿',
            '💪🏾',
            '💪🏽',
            '💪🏼',
            '💪🏻',
        ],
        name: 'muscle',
    },
    {
        code: '🤳',
        keywords: [
            'camera',
            'phone',
            'selfie',
        ],
        types: [
            '🤳🏿',
            '🤳🏾',
            '🤳🏽',
            '🤳🏼',
            '🤳🏻',
        ],
        name: 'selfie',
    },
    {
        code: '👈',
        keywords: [
            'backhand',
            'body',
            'finger',
            'hand',
            'index',
            'point',
        ],
        types: [
            '👈🏿',
            '👈🏾',
            '👈🏽',
            '👈🏼',
            '👈🏻',
        ],
        name: 'point_left',
    },
    {
        code: '👉',
        keywords: [
            'backhand',
            'body',
            'finger',
            'hand',
            'index',
            'point',
        ],
        types: [
            '👉🏿',
            '👉🏾',
            '👉🏽',
            '👉🏼',
            '👉🏻',
        ],
        name: 'point_right',
    },
    {
        code: '☝',
        keywords: [
            'body',
            'finger',
            'hand',
            'index',
            'point',
            'up',
        ],
        types: [
            '☝🏿',
            '☝🏾',
            '☝🏽',
            '☝🏼',
            '☝🏻',
        ],
        name: 'point_up',
    },
    {
        code: '👆',
        keywords: [
            'backhand',
            'body',
            'finger',
            'hand',
            'index',
            'point',
            'up',
        ],
        types: [
            '👆🏿',
            '👆🏾',
            '👆🏽',
            '👆🏼',
            '👆🏻',
        ],
        name: 'point_up_2',
    },
    {
        code: '🖕',
        keywords: [
            'body',
            'finger',
            'hand',
            'middle finger',
        ],
        types: [
            '🖕🏿',
            '🖕🏾',
            '🖕🏽',
            '🖕🏼',
            '🖕🏻',
        ],
        name: 'middle_finger',
    },
    {
        code: '👇',
        keywords: [
            'backhand',
            'body',
            'down',
            'finger',
            'hand',
            'index',
            'point',
        ],
        types: [
            '👇🏿',
            '👇🏾',
            '👇🏽',
            '👇🏼',
            '👇🏻',
        ],
        name: 'point_down',
    },
    {
        code: '✌',
        keywords: [
            'body',
            'hand',
            'v',
            'victory',
        ],
        types: [
            '✌🏿',
            '✌🏾',
            '✌🏽',
            '✌🏼',
            '✌🏻',
        ],
        name: 'v',
    },
    {
        code: '🤞',
        keywords: [
            'cross',
            'finger',
            'hand',
            'luck',
        ],
        types: [
            '🤞🏿',
            '🤞🏾',
            '🤞🏽',
            '🤞🏼',
            '🤞🏻',
        ],
        name: 'crossed_fingers',
    },
    {
        code: '🖖',
        keywords: [
            'body',
            'finger',
            'hand',
            'spock',
            'vulcan',
        ],
        types: [
            '🖖🏿',
            '🖖🏾',
            '🖖🏽',
            '🖖🏼',
            '🖖🏻',
        ],
        name: 'vulcan_salute',
    },
    {
        code: '🤘',
        keywords: [
            'body',
            'finger',
            'hand',
            'horns',
            'rock-on',
        ],
        types: [
            '🤘🏿',
            '🤘🏾',
            '🤘🏽',
            '🤘🏼',
            '🤘🏻',
        ],
        name: 'metal',
    },
    {
        code: '🤙',
        keywords: [
            'call',
            'hand',
        ],
        types: [
            '🤙🏿',
            '🤙🏾',
            '🤙🏽',
            '🤙🏼',
            '🤙🏻',
        ],
        name: 'call_me_hand',
    },
    {
        code: '🖐',
        keywords: [
            'body',
            'finger',
            'hand',
            'splayed',
        ],
        types: [
            '🖐🏿',
            '🖐🏾',
            '🖐🏽',
            '🖐🏼',
            '🖐🏻',
        ],
        name: 'raised_hand_with_fingers_splayed',
    },
    {
        code: '✋',
        keywords: [
            'body',
            'hand',
        ],
        types: [
            '✋🏿',
            '✋🏾',
            '✋🏽',
            '✋🏼',
            '✋🏻',
        ],
        name: 'hand',
    },
    {
        code: '👌',
        keywords: [
            'body',
            'hand',
            'ok',
        ],
        types: [
            '👌🏿',
            '👌🏾',
            '👌🏽',
            '👌🏼',
            '👌🏻',
        ],
        name: 'ok_hand',
    },
    {
        code: '👍',
        keywords: [
            '+1',
            'body',
            'hand',
            'thumb',
            'thumbs up',
            'up',
        ],
        types: [
            '👍🏿',
            '👍🏾',
            '👍🏽',
            '👍🏼',
            '👍🏻',
        ],
        name: '+1',
    },
    {
        code: '👎',
        keywords: [
            '-1',
            'body',
            'down',
            'hand',
            'thumb',
            'thumbs down',
        ],
        types: [
            '👎🏿',
            '👎🏾',
            '👎🏽',
            '👎🏼',
            '👎🏻',
        ],
        name: '-1',
    },
    {
        code: '✊',
        keywords: [
            'body',
            'clenched',
            'fist',
            'hand',
            'punch',
        ],
        types: [
            '✊🏿',
            '✊🏾',
            '✊🏽',
            '✊🏼',
            '✊🏻',
        ],
        name: 'fist_raised',
    },
    {
        code: '👊',
        keywords: [
            'body',
            'clenched',
            'fist',
            'hand',
            'punch',
        ],
        types: [
            '👊🏿',
            '👊🏾',
            '👊🏽',
            '👊🏼',
            '👊🏻',
        ],
        name: 'fist_oncoming',
    },
    {
        code: '🤛',
        keywords: [
            'fist',
            'leftwards',
        ],
        types: [
            '🤛🏿',
            '🤛🏾',
            '🤛🏽',
            '🤛🏼',
            '🤛🏻',
        ],
        name: 'fist_left',
    },
    {
        code: '🤜',
        keywords: [
            'fist',
            'rightwards',
        ],
        types: [
            '🤜🏿',
            '🤜🏾',
            '🤜🏽',
            '🤜🏼',
            '🤜🏻',
        ],
        name: 'fist_right',
    },
    {
        code: '🤚',
        keywords: [
            'backhand',
            'raised',
        ],
        types: [
            '🤚🏿',
            '🤚🏾',
            '🤚🏽',
            '🤚🏼',
            '🤚🏻',
        ],
        name: 'raised_back_of_hand',
    },
    {
        code: '👋',
        keywords: [
            'body',
            'hand',
            'wave',
            'waving',
        ],
        types: [
            '👋🏿',
            '👋🏾',
            '👋🏽',
            '👋🏼',
            '👋🏻',
        ],
        name: 'wave',
    },
    {
        code: '👏',
        keywords: [
            'body',
            'clap',
            'hand',
        ],
        types: [
            '👏🏿',
            '👏🏾',
            '👏🏽',
            '👏🏼',
            '👏🏻',
        ],
        name: 'clap',
    },
    {
        code: '✍',
        keywords: [
            'body',
            'hand',
            'write',
        ],
        types: [
            '✍🏿',
            '✍🏾',
            '✍🏽',
            '✍🏼',
            '✍🏻',
        ],
        name: 'writing_hand',
    },
    {
        code: '👐',
        keywords: [
            'body',
            'hand',
            'open',
        ],
        types: [
            '👐🏿',
            '👐🏾',
            '👐🏽',
            '👐🏼',
            '👐🏻',
        ],
        name: 'open_hands',
    },
    {
        code: '🙌',
        keywords: [
            'body',
            'celebration',
            'gesture',
            'hand',
            'hooray',
            'raised',
        ],
        types: [
            '🙌🏿',
            '🙌🏾',
            '🙌🏽',
            '🙌🏼',
            '🙌🏻',
        ],
        name: 'raised_hands',
    },
    {
        code: '🙏',
        keywords: [
            'ask',
            'body',
            'bow',
            'folded',
            'gesture',
            'hand',
            'please',
            'pray',
            'thanks',
        ],
        types: [
            '🙏🏿',
            '🙏🏾',
            '🙏🏽',
            '🙏🏼',
            '🙏🏻',
        ],
        name: 'pray',
    },
    {
        code: '🤝',
        keywords: [
            'agreement',
            'hand',
            'handshake',
            'meeting',
            'shake',
        ],
        types: [
            '🤝🏿',
            '🤝🏾',
            '🤝🏽',
            '🤝🏼',
            '🤝🏻',
        ],
        name: 'handshake',
    },
    {
        code: '💅',
        keywords: [
            'body',
            'care',
            'cosmetics',
            'manicure',
            'nail',
            'polish',
        ],
        types: [
            '💅🏿',
            '💅🏾',
            '💅🏽',
            '💅🏼',
            '💅🏻',
        ],
        name: 'nail_care',
    },
    {
        code: '👂',
        keywords: [
            'body',
            'ear',
        ],
        types: [
            '👂🏿',
            '👂🏾',
            '👂🏽',
            '👂🏼',
            '👂🏻',
        ],
        name: 'ear',
    },
    {
        code: '👃',
        keywords: [
            'body',
            'nose',
        ],
        types: [
            '👃🏿',
            '👃🏾',
            '👃🏽',
            '👃🏼',
            '👃🏻',
        ],
        name: 'nose',
    },
    {
        code: '👣',
        keywords: [
            'body',
            'clothing',
            'footprint',
            'print',
        ],
        name: 'footprints',
    },
    {
        code: '👀',
        keywords: [
            'body',
            'eye',
            'face',
        ],
        name: 'eyes',
    },
    {
        code: '👁',
        keywords: [
            'body',
            'eye',
        ],
        name: 'eye',
    },
    {
        code: '👁‍🗨',
        keywords: [
            'bubble',
            'eye',
            'speech',
            'witness',
        ],
        name: 'eye_speech_bubble',
    },
    {
        code: '👅',
        keywords: [
            'body',
            'tongue',
        ],
        name: 'tongue',
    },
    {
        code: '👄',
        keywords: [
            'body',
            'lips',
            'mouth',
        ],
        name: 'lips',
    },
    {
        code: '💋',
        keywords: [
            'heart',
            'kiss',
            'lips',
            'mark',
            'romance',
        ],
        name: 'kiss',
    },
    {
        code: '💘',
        keywords: [
            'arrow',
            'cupid',
            'heart',
            'romance',
        ],
        name: 'cupid',
    },
    {
        code: '❤️',
        keywords: [
            'heart',
        ],
        name: 'heart',
    },
    {
        code: '💓',
        keywords: [
            'beating',
            'heart',
            'heartbeat',
            'pulsating',
        ],
        name: 'heartbeat',
    },
    {
        code: '💔',
        keywords: [
            'break',
            'broken',
            'heart',
        ],
        name: 'broken_heart',
    },
    {
        code: '💕',
        keywords: [
            'heart',
            'love',
        ],
        name: 'two_hearts',
    },
    {
        code: '💖',
        keywords: [
            'excited',
            'heart',
            'sparkle',
        ],
        name: 'sparkling_heart',
    },
    {
        code: '💗',
        keywords: [
            'excited',
            'growing',
            'heart',
            'heartpulse',
            'nervous',
        ],
        name: 'heartpulse',
    },
    {
        code: '💙',
        keywords: [
            'blue',
            'heart',
        ],
        name: 'blue_heart',
    },
    {
        code: '💚',
        keywords: [
            'green',
            'heart',
        ],
        name: 'green_heart',
    },
    {
        code: '💛',
        keywords: [
            'heart',
            'yellow',
        ],
        name: 'yellow_heart',
    },
    {
        code: '💜',
        keywords: [
            'heart',
            'purple',
        ],
        name: 'purple_heart',
    },
    {
        code: '🖤',
        keywords: [
            'black',
            'evil',
            'heart',
            'wicked',
        ],
        name: 'black_heart',
    },
    {
        code: '💝',
        keywords: [
            'heart',
            'ribbon',
            'valentine',
        ],
        name: 'gift_heart',
    },
    {
        code: '💞',
        keywords: [
            'heart',
            'revolving',
        ],
        name: 'revolving_hearts',
    },
    {
        code: '💟',
        keywords: [
            'heart',
        ],
        name: 'heart_decoration',
    },
    {
        code: '❣️',
        keywords: [
            'exclamation',
            'heart',
            'mark',
            'punctuation',
        ],
        name: 'heavy_heart_exclamation',
    },
    {
        code: '💌',
        keywords: [
            'heart',
            'letter',
            'love',
            'mail',
            'romance',
        ],
        name: 'love_letter',
    },
    {
        code: '💤',
        keywords: [
            'comic',
            'sleep',
            'zzz',
        ],
        name: 'zzz',
    },
    {
        code: '💢',
        keywords: [
            'angry',
            'comic',
            'mad',
        ],
        name: 'anger',
    },
    {
        code: '💣',
        keywords: [
            'bomb',
            'comic',
        ],
        name: 'bomb',
    },
    {
        code: '💥',
        keywords: [
            'boom',
            'collision',
            'comic',
        ],
        name: 'boom',
    },
    {
        code: '💦',
        keywords: [
            'comic',
            'splashing',
            'sweat',
        ],
        name: 'sweat_drops',
    },
    {
        code: '💨',
        keywords: [
            'comic',
            'dash',
            'running',
        ],
        name: 'dash',
    },
    {
        code: '💫',
        keywords: [
            'comic',
            'dizzy',
            'star',
        ],
        name: 'dizzy',
    },
    {
        code: '💬',
        keywords: [
            'balloon',
            'bubble',
            'comic',
            'dialog',
            'speech',
        ],
        name: 'speech_balloon',
    },
    {
        code: '🗨',
        keywords: [
            'dialog',
            'speech',
        ],
        name: 'left_speech_bubble',
    },
    {
        code: '🗯',
        keywords: [
            'angry',
            'balloon',
            'bubble',
            'mad',
        ],
        name: 'right_anger_bubble',
    },
    {
        code: '💭',
        keywords: [
            'balloon',
            'bubble',
            'comic',
            'thought',
        ],
        name: 'thought_balloon',
    },
    {
        code: '🕳',
        keywords: [
            'hole',
        ],
        name: 'hole',
    },
    {
        code: '👓',
        keywords: [
            'clothing',
            'eye',
            'eyeglasses',
            'eyewear',
            'glasses',
        ],
        name: 'eyeglasses',
    },
    {
        code: '🕶',
        keywords: [
            'dark',
            'eye',
            'eyewear',
            'glasses',
            'sunglasses',
        ],
        name: 'dark_sunglasses',
    },
    {
        code: '👔',
        keywords: [
            'clothing',
            'necktie',
        ],
        name: 'necktie',
    },
    {
        code: '👕',
        keywords: [
            'clothing',
            'shirt',
            'tshirt',
        ],
        name: 'shirt',
    },
    {
        code: '👖',
        keywords: [
            'clothing',
            'jeans',
            'pants',
            'trousers',
        ],
        name: 'jeans',
    },
    {
        code: '👗',
        keywords: [
            'clothing',
            'dress',
        ],
        name: 'dress',
    },
    {
        code: '👘',
        keywords: [
            'clothing',
            'kimono',
        ],
        name: 'kimono',
    },
    {
        code: '👙',
        keywords: [
            'bikini',
            'clothing',
            'swim',
        ],
        name: 'bikini',
    },
    {
        code: '👚',
        keywords: [
            'clothing',
            'woman',
        ],
        name: 'womans_clothes',
    },
    {
        code: '👛',
        keywords: [
            'clothing',
            'coin',
            'purse',
        ],
        name: 'purse',
    },
    {
        code: '👜',
        keywords: [
            'bag',
            'clothing',
            'handbag',
        ],
        name: 'handbag',
    },
    {
        code: '👝',
        keywords: [
            'bag',
            'clothing',
            'pouch',
        ],
        name: 'pouch',
    },
    {
        code: '🛍',
        keywords: [
            'bag',
            'hotel',
            'shopping',
        ],
        name: 'shopping',
    },
    {
        code: '🎒',
        keywords: [
            'activity',
            'bag',
            'satchel',
            'school',
        ],
        name: 'school_satchel',
    },
    {
        code: '👞',
        keywords: [
            'clothing',
            'man',
            'shoe',
        ],
        name: 'mans_shoe',
    },
    {
        code: '👟',
        keywords: [
            'athletic',
            'clothing',
            'shoe',
            'sneaker',
        ],
        name: 'athletic_shoe',
    },
    {
        code: '👠',
        keywords: [
            'clothing',
            'heel',
            'shoe',
            'woman',
        ],
        name: 'high_heel',
    },
    {
        code: '👡',
        keywords: [
            'clothing',
            'sandal',
            'shoe',
            'woman',
        ],
        name: 'sandal',
    },
    {
        code: '👢',
        keywords: [
            'boot',
            'clothing',
            'shoe',
            'woman',
        ],
        name: 'boot',
    },
    {
        code: '👑',
        keywords: [
            'clothing',
            'crown',
            'king',
            'queen',
        ],
        name: 'crown',
    },
    {
        code: '👒',
        keywords: [
            'clothing',
            'hat',
            'woman',
        ],
        name: 'womans_hat',
    },
    {
        code: '🎩',
        keywords: [
            'activity',
            'clothing',
            'entertainment',
            'hat',
            'top',
            'tophat',
        ],
        name: 'tophat',
    },
    {
        code: '🎓',
        keywords: [
            'activity',
            'cap',
            'celebration',
            'clothing',
            'graduation',
            'hat',
        ],
        name: 'mortar_board',
    },
    {
        code: '⛑',
        keywords: [
            'aid',
            'cross',
            'face',
            'hat',
            'helmet',
        ],
        name: 'rescue_worker_helmet',
    },
    {
        code: '📿',
        keywords: [
            'beads',
            'clothing',
            'necklace',
            'prayer',
            'religion',
        ],
        name: 'prayer_beads',
    },
    {
        code: '💄',
        keywords: [
            'cosmetics',
            'lipstick',
            'makeup',
        ],
        name: 'lipstick',
    },
    {
        code: '💍',
        keywords: [
            'diamond',
            'ring',
            'romance',
        ],
        name: 'ring',
    },
    {
        code: '💎',
        keywords: [
            'diamond',
            'gem',
            'jewel',
            'romance',
        ],
        name: 'gem',
    },
    {
        code: 'animalsAndNature',
        header: true,
    },
    {
        code: '🐵',
        keywords: [
            'face',
            'monkey',
        ],
        name: 'monkey_face',
    },
    {
        code: '🐒',
        keywords: [
            'monkey',
        ],
        name: 'monkey',
    },
    {
        code: '🦍',
        keywords: [
            'gorilla',
        ],
        name: 'gorilla',
    },
    {
        code: '🐶',
        keywords: [
            'dog',
            'face',
            'pet',
        ],
        name: 'dog',
    },
    {
        code: '🐕',
        keywords: [
            'dog',
            'pet',
        ],
        name: 'dog2',
    },
    {
        code: '🐩',
        keywords: [
            'dog',
            'poodle',
        ],
        name: 'poodle',
    },
    {
        code: '🐺',
        keywords: [
            'face',
            'wolf',
        ],
        name: 'wolf',
    },
    {
        code: '🦊',
        keywords: [
            'face',
            'fox',
        ],
        name: 'fox_face',
    },
    {
        code: '🐱',
        keywords: [
            'cat',
            'face',
            'pet',
        ],
        name: 'cat',
    },
    {
        code: '🐈',
        keywords: [
            'cat',
            'pet',
        ],
        name: 'cat2',
    },
    {
        code: '🦁',
        keywords: [
            'face',
            'leo',
            'lion',
            'zodiac',
        ],
        name: 'lion',
    },
    {
        code: '🐯',
        keywords: [
            'face',
            'tiger',
        ],
        name: 'tiger',
    },
    {
        code: '🐅',
        keywords: [
            'tiger',
        ],
        name: 'tiger2',
    },
    {
        code: '🐆',
        keywords: [
            'leopard',
        ],
        name: 'leopard',
    },
    {
        code: '🐴',
        keywords: [
            'face',
            'horse',
        ],
        name: 'horse',
    },
    {
        code: '🐎',
        keywords: [
            'horse',
            'racehorse',
            'racing',
        ],
        name: 'racehorse',
    },
    {
        code: '🦌',
        keywords: [
            'deer',
        ],
        name: 'deer',
    },
    {
        code: '🦄',
        keywords: [
            'face',
            'unicorn',
        ],
        name: 'unicorn',
    },
    {
        code: '🐮',
        keywords: [
            'cow',
            'face',
        ],
        name: 'cow',
    },
    {
        code: '🐂',
        keywords: [
            'bull',
            'ox',
            'taurus',
            'zodiac',
        ],
        name: 'ox',
    },
    {
        code: '🐃',
        keywords: [
            'buffalo',
            'water',
        ],
        name: 'water_buffalo',
    },
    {
        code: '🐄',
        keywords: [
            'cow',
        ],
        name: 'cow2',
    },
    {
        code: '🐷',
        keywords: [
            'face',
            'pig',
        ],
        name: 'pig',
    },
    {
        code: '🐖',
        keywords: [
            'pig',
            'sow',
        ],
        name: 'pig2',
    },
    {
        code: '🐗',
        keywords: [
            'boar',
            'pig',
        ],
        name: 'boar',
    },
    {
        code: '🐽',
        keywords: [
            'face',
            'nose',
            'pig',
        ],
        name: 'pig_nose',
    },
    {
        code: '🐏',
        keywords: [
            'aries',
            'ram',
            'sheep',
            'zodiac',
        ],
        name: 'ram',
    },
    {
        code: '🐑',
        keywords: [
            'ewe',
            'sheep',
        ],
        name: 'sheep',
    },
    {
        code: '🐐',
        keywords: [
            'capricorn',
            'goat',
            'zodiac',
        ],
        name: 'goat',
    },
    {
        code: '🐪',
        keywords: [
            'camel',
            'dromedary',
            'hump',
        ],
        name: 'dromedary_camel',
    },
    {
        code: '🐫',
        keywords: [
            'bactrian',
            'camel',
            'hump',
        ],
        name: 'camel',
    },
    {
        code: '🐘',
        keywords: [
            'elephant',
        ],
        name: 'elephant',
    },
    {
        code: '🦏',
        keywords: [
            'rhinoceros',
        ],
        name: 'rhinoceros',
    },
    {
        code: '🐭',
        keywords: [
            'face',
            'mouse',
        ],
        name: 'mouse',
    },
    {
        code: '🐁',
        keywords: [
            'mouse',
        ],
        name: 'mouse2',
    },
    {
        code: '🐀',
        keywords: [
            'rat',
        ],
        name: 'rat',
    },
    {
        code: '🐹',
        keywords: [
            'face',
            'hamster',
            'pet',
        ],
        name: 'hamster',
    },
    {
        code: '🐰',
        keywords: [
            'bunny',
            'face',
            'pet',
            'rabbit',
        ],
        name: 'rabbit',
    },
    {
        code: '🐇',
        keywords: [
            'bunny',
            'pet',
            'rabbit',
        ],
        name: 'rabbit2',
    },
    {
        code: '🐿',
        keywords: [
            'chipmunk',
        ],
        name: 'chipmunk',
    },
    {
        code: '🦇',
        keywords: [
            'bat',
            'vampire',
        ],
        name: 'bat',
    },
    {
        code: '🐻',
        keywords: [
            'bear',
            'face',
        ],
        name: 'bear',
    },
    {
        code: '🐨',
        keywords: [
            'bear',
            'koala',
        ],
        name: 'koala',
    },
    {
        code: '🐼',
        keywords: [
            'face',
            'panda',
        ],
        name: 'panda_face',
    },
    {
        code: '🐾',
        keywords: [
            'feet',
            'paw',
            'print',
        ],
        name: 'feet',
    },
    {
        code: '🦃',
        keywords: [
            'turkey',
        ],
        name: 'turkey',
    },
    {
        code: '🐔',
        keywords: [
            'chicken',
        ],
        name: 'chicken',
    },
    {
        code: '🐓',
        keywords: [
            'rooster',
        ],
        name: 'rooster',
    },
    {
        code: '🐣',
        keywords: [
            'baby',
            'chick',
            'hatching',
        ],
        name: 'hatching_chick',
    },
    {
        code: '🐤',
        keywords: [
            'baby',
            'chick',
        ],
        name: 'baby_chick',
    },
    {
        code: '🐥',
        keywords: [
            'baby',
            'chick',
        ],
        name: 'hatched_chick',
    },
    {
        code: '🐦',
        keywords: [
            'bird',
        ],
        name: 'bird',
    },
    {
        code: '🐧',
        keywords: [
            'penguin',
        ],
        name: 'penguin',
    },
    {
        code: '🕊',
        keywords: [
            'bird',
            'dove',
            'fly',
            'peace',
        ],
        name: 'dove',
    },
    {
        code: '🦅',
        keywords: [
            'bird',
            'eagle',
        ],
        name: 'eagle',
    },
    {
        code: '🦆',
        keywords: [
            'bird',
            'duck',
        ],
        name: 'duck',
    },
    {
        code: '🦉',
        keywords: [
            'bird',
            'owl',
            'wise',
        ],
        name: 'owl',
    },
    {
        code: '🐸',
        keywords: [
            'face',
            'frog',
        ],
        name: 'frog',
    },
    {
        code: '🐊',
        keywords: [
            'crocodile',
        ],
        name: 'crocodile',
    },
    {
        code: '🐢',
        keywords: [
            'turtle',
        ],
        name: 'turtle',
    },
    {
        code: '🦎',
        keywords: [
            'lizard',
            'reptile',
        ],
        name: 'lizard',
    },
    {
        code: '🐍',
        keywords: [
            'bearer',
            'ophiuchus',
            'serpent',
            'snake',
            'zodiac',
        ],
        name: 'snake',
    },
    {
        code: '🐲',
        keywords: [
            'dragon',
            'face',
            'fairy tale',
        ],
        name: 'dragon_face',
    },
    {
        code: '🐉',
        keywords: [
            'dragon',
            'fairy tale',
        ],
        name: 'dragon',
    },
    {
        code: '🐳',
        keywords: [
            'face',
            'spouting',
            'whale',
        ],
        name: 'whale',
    },
    {
        code: '🐋',
        keywords: [
            'whale',
        ],
        name: 'whale2',
    },
    {
        code: '🐬',
        keywords: [
            'dolphin',
            'flipper',
        ],
        name: 'dolphin',
    },
    {
        code: '🐟',
        keywords: [
            'fish',
            'pisces',
            'zodiac',
        ],
        name: 'fish',
    },
    {
        code: '🐠',
        keywords: [
            'fish',
            'tropical',
        ],
        name: 'tropical_fish',
    },
    {
        code: '🐡',
        keywords: [
            'blowfish',
            'fish',
        ],
        name: 'blowfish',
    },
    {
        code: '🦈',
        keywords: [
            'fish',
            'shark',
        ],
        name: 'shark',
    },
    {
        code: '🐙',
        keywords: [
            'octopus',
        ],
        name: 'octopus',
    },
    {
        code: '🐚',
        keywords: [
            'shell',
            'spiral',
        ],
        name: 'shell',
    },
    {
        code: '🦀',
        keywords: [
            'cancer',
            'crab',
            'zodiac',
        ],
        name: 'crab',
    },
    {
        code: '🦐',
        keywords: [
            'shellfish',
            'shrimp',
            'small',
        ],
        name: 'shrimp',
    },
    {
        code: '🦑',
        keywords: [
            'molusc',
            'squid',
        ],
        name: 'squid',
    },
    {
        code: '🦋',
        keywords: [
            'butterfly',
            'insect',
            'pretty',
        ],
        name: 'butterfly',
    },
    {
        code: '🐌',
        keywords: [
            'snail',
        ],
        name: 'snail',
    },
    {
        code: '🐛',
        keywords: [
            'bug',
            'insect',
        ],
        name: 'bug',
    },
    {
        code: '🐜',
        keywords: [
            'ant',
            'insect',
        ],
        name: 'ant',
    },
    {
        code: '🐝',
        keywords: [
            'bee',
            'honeybee',
            'insect',
        ],
        name: 'bee',
    },
    {
        code: '🐞',
        keywords: [
            'beetle',
            'insect',
            'lady beetle',
            'ladybird',
            'ladybug',
        ],
        name: 'lady_beetle',
    },
    {
        code: '🕷',
        keywords: [
            'insect',
            'spider',
        ],
        name: 'spider',
    },
    {
        code: '🕸',
        keywords: [
            'spider',
            'web',
        ],
        name: 'spider_web',
    },
    {
        code: '🦂',
        keywords: [
            'scorpio',
            'scorpion',
            'scorpius',
            'zodiac',
        ],
        name: 'scorpion',
    },
    {
        code: '💐',
        keywords: [
            'bouquet',
            'flower',
            'plant',
            'romance',
        ],
        name: 'bouquet',
    },
    {
        code: '🌸',
        keywords: [
            'blossom',
            'cherry',
            'flower',
            'plant',
        ],
        name: 'cherry_blossom',
    },
    {
        code: '💮',
        keywords: [
            'flower',
        ],
        name: 'white_flower',
    },
    {
        code: '🏵',
        keywords: [
            'plant',
            'rosette',
        ],
        name: 'rosette',
    },
    {
        code: '🌹',
        keywords: [
            'flower',
            'plant',
            'rose',
        ],
        name: 'rose',
    },
    {
        code: '🥀',
        keywords: [
            'flower',
            'wilted',
        ],
        name: 'wilted_flower',
    },
    {
        code: '🌺',
        keywords: [
            'flower',
            'hibiscus',
            'plant',
        ],
        name: 'hibiscus',
    },
    {
        code: '🌻',
        keywords: [
            'flower',
            'plant',
            'sun',
            'sunflower',
        ],
        name: 'sunflower',
    },
    {
        code: '🌼',
        keywords: [
            'blossom',
            'flower',
            'plant',
        ],
        name: 'blossom',
    },
    {
        code: '🌷',
        keywords: [
            'flower',
            'plant',
            'tulip',
        ],
        name: 'tulip',
    },
    {
        code: '🌱',
        keywords: [
            'plant',
            'seedling',
            'young',
        ],
        name: 'seedling',
    },
    {
        code: '🌲',
        keywords: [
            'evergreen',
            'plant',
            'tree',
        ],
        name: 'evergreen_tree',
    },
    {
        code: '🌳',
        keywords: [
            'deciduous',
            'plant',
            'shedding',
            'tree',
        ],
        name: 'deciduous_tree',
    },
    {
        code: '🌴',
        keywords: [
            'palm',
            'plant',
            'tree',
        ],
        name: 'palm_tree',
    },
    {
        code: '🌵',
        keywords: [
            'cactus',
            'plant',
        ],
        name: 'cactus',
    },
    {
        code: '🌾',
        keywords: [
            'ear',
            'plant',
            'rice',
        ],
        name: 'ear_of_rice',
    },
    {
        code: '🌿',
        keywords: [
            'herb',
            'leaf',
            'plant',
        ],
        name: 'herb',
    },
    {
        code: '☘️',
        keywords: [
            'plant',
            'shamrock',
        ],
        name: 'shamrock',
    },
    {
        code: '🍀',
        keywords: [
            '4',
            'clover',
            'four',
            'leaf',
            'plant',
        ],
        name: 'four_leaf_clover',
    },
    {
        code: '🍁',
        keywords: [
            'falling',
            'leaf',
            'maple',
            'plant',
        ],
        name: 'maple_leaf',
    },
    {
        code: '🍂',
        keywords: [
            'falling',
            'leaf',
            'plant',
        ],
        name: 'fallen_leaf',
    },
    {
        code: '🍃',
        keywords: [
            'blow',
            'flutter',
            'leaf',
            'plant',
            'wind',
        ],
        name: 'leaves',
    },
    {
        code: 'foodAndDrinks',
        header: true,
    },
    {
        code: '🍇',
        keywords: [
            'fruit',
            'grape',
            'plant',
        ],
        name: 'grapes',
    },
    {
        code: '🍈',
        keywords: [
            'fruit',
            'melon',
            'plant',
        ],
        name: 'melon',
    },
    {
        code: '🍉',
        keywords: [
            'fruit',
            'plant',
            'watermelon',
        ],
        name: 'watermelon',
    },
    {
        code: '🍊',
        keywords: [
            'fruit',
            'orange',
            'plant',
            'tangerine',
        ],
        name: 'tangerine',
    },
    {
        code: '🍋',
        keywords: [
            'citrus',
            'fruit',
            'lemon',
            'plant',
        ],
        name: 'lemon',
    },
    {
        code: '🍌',
        keywords: [
            'banana',
            'fruit',
            'plant',
        ],
        name: 'banana',
    },
    {
        code: '🍍',
        keywords: [
            'fruit',
            'pineapple',
            'plant',
        ],
        name: 'pineapple',
    },
    {
        code: '🍎',
        keywords: [
            'apple',
            'fruit',
            'plant',
            'red',
        ],
        name: 'apple',
    },
    {
        code: '🍏',
        keywords: [
            'apple',
            'fruit',
            'green',
            'plant',
        ],
        name: 'green_apple',
    },
    {
        code: '🍐',
        keywords: [
            'fruit',
            'pear',
            'plant',
        ],
        name: 'pear',
    },
    {
        code: '🍑',
        keywords: [
            'fruit',
            'peach',
            'plant',
        ],
        name: 'peach',
    },
    {
        code: '🍒',
        keywords: [
            'cherry',
            'fruit',
            'plant',
        ],
        name: 'cherries',
    },
    {
        code: '🍓',
        keywords: [
            'berry',
            'fruit',
            'plant',
            'strawberry',
        ],
        name: 'strawberry',
    },
    {
        code: '🍅',
        keywords: [
            'plant',
            'tomato',
            'vegetable',
        ],
        name: 'tomato',
    },
    {
        code: '🥝',
        keywords: [
            'fruit',
            'kiwi',
        ],
        name: 'kiwi_fruit',
    },
    {
        code: '🥑',
        keywords: [
            'avocado',
            'fruit',
        ],
        name: 'avocado',
    },
    {
        code: '🍆',
        keywords: [
            'aubergine',
            'eggplant',
            'plant',
            'vegetable',
        ],
        name: 'eggplant',
    },
    {
        code: '🥔',
        keywords: [
            'potato',
            'vegetable',
        ],
        name: 'potato',
    },
    {
        code: '🥕',
        keywords: [
            'carrot',
            'vegetable',
        ],
        name: 'carrot',
    },
    {
        code: '🌽',
        keywords: [
            'corn',
            'ear',
            'maize',
            'maze',
            'plant',
        ],
        name: 'corn',
    },
    {
        code: '🌶',
        keywords: [
            'hot',
            'pepper',
            'plant',
        ],
        name: 'hot_pepper',
    },
    {
        code: '🥒',
        keywords: [
            'cucumber',
            'pickle',
            'vegetable',
        ],
        name: 'cucumber',
    },
    {
        code: '🍄',
        keywords: [
            'mushroom',
            'plant',
        ],
        name: 'mushroom',
    },
    {
        code: '🥜',
        keywords: [
            'nut',
            'peanut',
            'vegetable',
        ],
        name: 'peanuts',
    },
    {
        code: '🌰',
        keywords: [
            'chestnut',
            'plant',
        ],
        name: 'chestnut',
    },
    {
        code: '🍞',
        keywords: [
            'bread',
            'loaf',
        ],
        name: 'bread',
    },
    {
        code: '🥐',
        keywords: [
            'bread',
            'crescent roll',
            'croissant',
            'french',
        ],
        name: 'croissant',
    },
    {
        code: '🥖',
        keywords: [
            'baguette',
            'bread',
            'french',
        ],
        name: 'baguette_bread',
    },
    {
        code: '🥞',
        keywords: [
            'crêpe',
            'hotcake',
            'pancake',
        ],
        name: 'pancakes',
    },
    {
        code: '🧀',
        keywords: [
            'cheese',
        ],
        name: 'cheese',
    },
    {
        code: '🍖',
        keywords: [
            'bone',
            'meat',
        ],
        name: 'meat_on_bone',
    },
    {
        code: '🍗',
        keywords: [
            'bone',
            'chicken',
            'leg',
            'poultry',
        ],
        name: 'poultry_leg',
    },
    {
        code: '🥓',
        keywords: [
            'bacon',
            'meat',
        ],
        name: 'bacon',
    },
    {
        code: '🍔',
        keywords: [
            'burger',
            'hamburger',
        ],
        name: 'hamburger',
    },
    {
        code: '🍟',
        keywords: [
            'french',
            'fries',
        ],
        name: 'fries',
    },
    {
        code: '🍕',
        keywords: [
            'cheese',
            'pizza',
            'slice',
        ],
        name: 'pizza',
    },
    {
        code: '🌭',
        keywords: [
            'frankfurter',
            'hot dog',
            'hotdog',
            'sausage',
        ],
        name: 'hotdog',
    },
    {
        code: '🌮',
        keywords: [
            'mexican',
            'taco',
        ],
        name: 'taco',
    },
    {
        code: '🌯',
        keywords: [
            'burrito',
            'mexican',
        ],
        name: 'burrito',
    },
    {
        code: '🥙',
        keywords: [
            'falafel',
            'flatbread',
            'gyro',
            'kebab',
            'stuffed',
        ],
        name: 'stuffed_flatbread',
    },
    {
        code: '🥚',
        keywords: [
            'egg',
        ],
        name: 'egg',
    },
    {
        code: '🍳',
        keywords: [
            'cooking',
            'egg',
            'frying',
            'pan',
        ],
        name: 'fried_egg',
    },
    {
        code: '🥘',
        keywords: [
            'casserole',
            'paella',
            'pan',
            'shallow',
        ],
        name: 'shallow_pan_of_food',
    },
    {
        code: '🍲',
        keywords: [
            'pot',
            'stew',
        ],
        name: 'stew',
    },
    {
        code: '🥗',
        keywords: [
            'green',
            'salad',
        ],
        name: 'green_salad',
    },
    {
        code: '🍿',
        keywords: [
            'popcorn',
        ],
        name: 'popcorn',
    },
    {
        code: '🍱',
        keywords: [
            'bento',
            'box',
        ],
        name: 'bento',
    },
    {
        code: '🍘',
        keywords: [
            'cracker',
            'rice',
        ],
        name: 'rice_cracker',
    },
    {
        code: '🍙',
        keywords: [
            'ball',
            'japanese',
            'rice',
        ],
        name: 'rice_ball',
    },
    {
        code: '🍚',
        keywords: [
            'cooked',
            'rice',
        ],
        name: 'rice',
    },
    {
        code: '🍛',
        keywords: [
            'curry',
            'rice',
        ],
        name: 'curry',
    },
    {
        code: '🍜',
        keywords: [
            'bowl',
            'noodle',
            'ramen',
            'steaming',
        ],
        name: 'ramen',
    },
    {
        code: '🍝',
        keywords: [
            'pasta',
            'spaghetti',
        ],
        name: 'spaghetti',
    },
    {
        code: '🍠',
        keywords: [
            'potato',
            'roasted',
            'sweet',
        ],
        name: 'sweet_potato',
    },
    {
        code: '🍢',
        keywords: [
            'kebab',
            'oden',
            'seafood',
            'skewer',
            'stick',
        ],
        name: 'oden',
    },
    {
        code: '🍣',
        keywords: [
            'sushi',
        ],
        name: 'sushi',
    },
    {
        code: '🍤',
        keywords: [
            'fried',
            'prawn',
            'shrimp',
            'tempura',
        ],
        name: 'fried_shrimp',
    },
    {
        code: '🍥',
        keywords: [
            'cake',
            'fish',
            'pastry',
            'swirl',
        ],
        name: 'fish_cake',
    },
    {
        code: '🍡',
        keywords: [
            'dango',
            'dessert',
            'japanese',
            'skewer',
            'stick',
            'sweet',
        ],
        name: 'dango',
    },
    {
        code: '🍦',
        keywords: [
            'cream',
            'dessert',
            'ice',
            'icecream',
            'soft',
            'sweet',
        ],
        name: 'icecream',
    },
    {
        code: '🍧',
        keywords: [
            'dessert',
            'ice',
            'shaved',
            'sweet',
        ],
        name: 'shaved_ice',
    },
    {
        code: '🍨',
        keywords: [
            'cream',
            'dessert',
            'ice',
            'sweet',
        ],
        name: 'ice_cream',
    },
    {
        code: '🍩',
        keywords: [
            'dessert',
            'donut',
            'doughnut',
            'sweet',
        ],
        name: 'doughnut',
    },
    {
        code: '🍪',
        keywords: [
            'cookie',
            'dessert',
            'sweet',
        ],
        name: 'cookie',
    },
    {
        code: '🎂',
        keywords: [
            'birthday',
            'cake',
            'celebration',
            'dessert',
            'pastry',
            'sweet',
        ],
        name: 'birthday',
    },
    {
        code: '🍰',
        keywords: [
            'cake',
            'dessert',
            'pastry',
            'shortcake',
            'slice',
            'sweet',
        ],
        name: 'cake',
    },
    {
        code: '🍫',
        keywords: [
            'bar',
            'chocolate',
            'dessert',
            'sweet',
        ],
        name: 'chocolate_bar',
    },
    {
        code: '🍬',
        keywords: [
            'candy',
            'dessert',
            'sweet',
        ],
        name: 'candy',
    },
    {
        code: '🍭',
        keywords: [
            'candy',
            'dessert',
            'lollipop',
            'sweet',
        ],
        name: 'lollipop',
    },
    {
        code: '🍮',
        keywords: [
            'custard',
            'dessert',
            'pudding',
            'sweet',
        ],
        name: 'custard',
    },
    {
        code: '🍯',
        keywords: [
            'honey',
            'honeypot',
            'pot',
            'sweet',
        ],
        name: 'honey_pot',
    },
    {
        code: '🍼',
        keywords: [
            'baby',
            'bottle',
            'drink',
            'milk',
        ],
        name: 'baby_bottle',
    },
    {
        code: '🥛',
        keywords: [
            'drink',
            'glass',
            'milk',
        ],
        name: 'milk_glass',
    },
    {
        code: '☕',
        keywords: [
            'beverage',
            'coffee',
            'drink',
            'hot',
            'steaming',
            'tea',
        ],
        name: 'coffee',
    },
    {
        code: '🍵',
        keywords: [
            'beverage',
            'cup',
            'drink',
            'tea',
            'teacup',
        ],
        name: 'tea',
    },
    {
        code: '🍶',
        keywords: [
            'bar',
            'beverage',
            'bottle',
            'cup',
            'drink',
            'sake',
        ],
        name: 'sake',
    },
    {
        code: '🍾',
        keywords: [
            'bar',
            'bottle',
            'cork',
            'drink',
            'popping',
        ],
        name: 'champagne',
    },
    {
        code: '🍷',
        keywords: [
            'bar',
            'beverage',
            'drink',
            'glass',
            'wine',
        ],
        name: 'wine_glass',
    },
    {
        code: '🍸',
        keywords: [
            'bar',
            'cocktail',
            'drink',
            'glass',
        ],
        name: 'cocktail',
    },
    {
        code: '🍹',
        keywords: [
            'bar',
            'drink',
            'tropical',
        ],
        name: 'tropical_drink',
    },
    {
        code: '🍺',
        keywords: [
            'bar',
            'beer',
            'drink',
            'mug',
        ],
        name: 'beer',
    },
    {
        code: '🍻',
        keywords: [
            'bar',
            'beer',
            'clink',
            'drink',
            'mug',
        ],
        name: 'beers',
    },
    {
        code: '🥂',
        keywords: [
            'celebrate',
            'clink',
            'drink',
            'glass',
        ],
        name: 'clinking_glasses',
    },
    {
        code: '🥃',
        keywords: [
            'glass',
            'liquor',
            'shot',
            'tumbler',
            'whisky',
        ],
        name: 'tumbler_glass',
    },
    {
        code: '🍽',
        keywords: [
            'cooking',
            'fork',
            'knife',
            'plate',
        ],
        name: 'plate_with_cutlery',
    },
    {
        code: '🍴',
        keywords: [
            'cooking',
            'fork',
            'knife',
        ],
        name: 'fork_and_knife',
    },
    {
        code: '🥄',
        keywords: [
            'spoon',
            'tableware',
        ],
        name: 'spoon',
    },
    {
        code: '🔪',
        keywords: [
            'cooking',
            'hocho',
            'knife',
            'tool',
            'weapon',
        ],
        name: 'hocho',
    },
    {
        code: '🏺',
        keywords: [
            'amphora',
            'aquarius',
            'cooking',
            'drink',
            'jug',
            'tool',
            'weapon',
            'zodiac',
        ],
        name: 'amphora',
    },
    {
        code: 'travelAndPlaces',
        header: true,
    },
    {
        code: '🌍',
        keywords: [
            'africa',
            'earth',
            'europe',
            'globe',
            'world',
        ],
        name: 'earth_africa',
    },
    {
        code: '🌎',
        keywords: [
            'americas',
            'earth',
            'globe',
            'world',
        ],
        name: 'earth_americas',
    },
    {
        code: '🌏',
        keywords: [
            'asia',
            'australia',
            'earth',
            'globe',
            'world',
        ],
        name: 'earth_asia',
    },
    {
        code: '🌐',
        keywords: [
            'earth',
            'globe',
            'meridians',
            'world',
        ],
        name: 'globe_with_meridians',
    },
    {
        code: '🗺',
        keywords: [
            'map',
            'world',
        ],
        name: 'world_map',
    },
    {
        code: '🗾',
        keywords: [
            'japan',
            'map',
        ],
        name: 'japan',
    },
    {
        code: '🏔',
        keywords: [
            'cold',
            'mountain',
            'snow',
        ],
        name: 'mountain_snow',
    },
    {
        code: '⛰',
        keywords: [
            'mountain',
        ],
        name: 'mountain',
    },
    {
        code: '🌋',
        keywords: [
            'eruption',
            'mountain',
            'volcano',
            'weather',
        ],
        name: 'volcano',
    },
    {
        code: '🗻',
        keywords: [
            'fuji',
            'mountain',
        ],
        name: 'mount_fuji',
    },
    {
        code: '🏕',
        keywords: [
            'camping',
        ],
        name: 'camping',
    },
    {
        code: '🏖',
        keywords: [
            'beach',
            'umbrella',
        ],
        name: 'beach_umbrella',
    },
    {
        code: '🏜',
        keywords: [
            'desert',
        ],
        name: 'desert',
    },
    {
        code: '🏝',
        keywords: [
            'desert',
            'island',
        ],
        name: 'desert_island',
    },
    {
        code: '🏞',
        keywords: [
            'national park',
            'park',
        ],
        name: 'national_park',
    },
    {
        code: '🏟',
        keywords: [
            'stadium',
        ],
        name: 'stadium',
    },
    {
        code: '🏛',
        keywords: [
            'building',
            'classical',
        ],
        name: 'classical_building',
    },
    {
        code: '🏗',
        keywords: [
            'building',
            'construction',
        ],
        name: 'building_construction',
    },
    {
        code: '🏘',
        keywords: [
            'building',
            'house',
        ],
        name: 'houses',
    },
    {
        code: '🏙',
        keywords: [
            'building',
            'city',
        ],
        name: 'cityscape',
    },
    {
        code: '🏚',
        keywords: [
            'building',
            'derelict',
            'house',
        ],
        name: 'derelict_house',
    },
    {
        code: '🏠',
        keywords: [
            'building',
            'home',
            'house',
        ],
        name: 'house',
    },
    {
        code: '🏡',
        keywords: [
            'building',
            'garden',
            'home',
            'house',
        ],
        name: 'house_with_garden',
    },
    {
        code: '🏢',
        keywords: [
            'building',
        ],
        name: 'office',
    },
    {
        code: '🏣',
        keywords: [
            'building',
            'japanese',
            'post',
        ],
        name: 'post_office',
    },
    {
        code: '🏤',
        keywords: [
            'building',
            'european',
            'post',
        ],
        name: 'european_post_office',
    },
    {
        code: '🏥',
        keywords: [
            'building',
            'doctor',
            'hospital',
            'medicine',
        ],
        name: 'hospital',
    },
    {
        code: '🏦',
        keywords: [
            'bank',
            'building',
        ],
        name: 'bank',
    },
    {
        code: '🏨',
        keywords: [
            'building',
            'hotel',
        ],
        name: 'hotel',
    },
    {
        code: '🏩',
        keywords: [
            'building',
            'hotel',
            'love',
        ],
        name: 'love_hotel',
    },
    {
        code: '🏪',
        keywords: [
            'building',
            'convenience',
            'store',
        ],
        name: 'convenience_store',
    },
    {
        code: '🏫',
        keywords: [
            'building',
            'school',
        ],
        name: 'school',
    },
    {
        code: '🏬',
        keywords: [
            'building',
            'department',
            'store',
        ],
        name: 'department_store',
    },
    {
        code: '🏭',
        keywords: [
            'building',
            'factory',
        ],
        name: 'factory',
    },
    {
        code: '🏯',
        keywords: [
            'building',
            'castle',
            'japanese',
        ],
        name: 'japanese_castle',
    },
    {
        code: '🏰',
        keywords: [
            'building',
            'castle',
            'european',
        ],
        name: 'european_castle',
    },
    {
        code: '💒',
        keywords: [
            'activity',
            'chapel',
            'romance',
            'wedding',
        ],
        name: 'wedding',
    },
    {
        code: '🗼',
        keywords: [
            'tokyo',
            'tower',
        ],
        name: 'tokyo_tower',
    },
    {
        code: '🗽',
        keywords: [
            'liberty',
            'statue',
        ],
        name: 'statue_of_liberty',
    },
    {
        code: '⛪',
        keywords: [
            'building',
            'christian',
            'church',
            'cross',
            'religion',
        ],
        name: 'church',
    },
    {
        code: '🕌',
        keywords: [
            'islam',
            'mosque',
            'muslim',
            'religion',
        ],
        name: 'mosque',
    },
    {
        code: '🕍',
        keywords: [
            'jew',
            'jewish',
            'religion',
            'synagogue',
            'temple',
        ],
        name: 'synagogue',
    },
    {
        code: '⛩',
        keywords: [
            'religion',
            'shinto',
            'shrine',
        ],
        name: 'shinto_shrine',
    },
    {
        code: '🕋',
        keywords: [
            'islam',
            'kaaba',
            'muslim',
            'religion',
        ],
        name: 'kaaba',
    },
    {
        code: '⛲',
        keywords: [
            'fountain',
        ],
        name: 'fountain',
    },
    {
        code: '⛺',
        keywords: [
            'camping',
            'tent',
        ],
        name: 'tent',
    },
    {
        code: '🌁',
        keywords: [
            'fog',
            'weather',
        ],
        name: 'foggy',
    },
    {
        code: '🌃',
        keywords: [
            'night',
            'star',
            'weather',
        ],
        name: 'night_with_stars',
    },
    {
        code: '🌄',
        keywords: [
            'morning',
            'mountain',
            'sun',
            'sunrise',
            'weather',
        ],
        name: 'sunrise_over_mountains',
    },
    {
        code: '🌅',
        keywords: [
            'morning',
            'sun',
            'sunrise',
            'weather',
        ],
        name: 'sunrise',
    },
    {
        code: '🌆',
        keywords: [
            'building',
            'city',
            'dusk',
            'evening',
            'landscape',
            'sun',
            'sunset',
            'weather',
        ],
        name: 'city_sunset',
    },
    {
        code: '🌇',
        keywords: [
            'building',
            'dusk',
            'sun',
            'sunset',
            'weather',
        ],
        name: 'city_sunrise',
    },
    {
        code: '🌉',
        keywords: [
            'bridge',
            'night',
            'weather',
        ],
        name: 'bridge_at_night',
    },
    {
        code: '♨️',
        keywords: [
            'hot',
            'hotsprings',
            'springs',
            'steaming',
        ],
        name: 'hotsprings',
    },
    {
        code: '🌌',
        keywords: [
            'milky way',
            'space',
            'weather',
        ],
        name: 'milky_way',
    },
    {
        code: '🎠',
        keywords: [
            'activity',
            'carousel',
            'entertainment',
            'horse',
        ],
        name: 'carousel_horse',
    },
    {
        code: '🎡',
        keywords: [
            'activity',
            'amusement park',
            'entertainment',
            'ferris',
            'wheel',
        ],
        name: 'ferris_wheel',
    },
    {
        code: '🎢',
        keywords: [
            'activity',
            'amusement park',
            'coaster',
            'entertainment',
            'roller',
        ],
        name: 'roller_coaster',
    },
    {
        code: '💈',
        keywords: [
            'barber',
            'haircut',
            'pole',
        ],
        name: 'barber',
    },
    {
        code: '🎪',
        keywords: [
            'activity',
            'circus',
            'entertainment',
            'tent',
        ],
        name: 'circus_tent',
    },
    {
        code: '🎭',
        keywords: [
            'activity',
            'art',
            'entertainment',
            'mask',
            'performing',
            'theater',
            'theatre',
        ],
        name: 'performing_arts',
    },
    {
        code: '🖼',
        keywords: [
            'art',
            'frame',
            'museum',
            'painting',
            'picture',
        ],
        name: 'framed_picture',
    },
    {
        code: '🎨',
        keywords: [
            'activity',
            'art',
            'entertainment',
            'museum',
            'painting',
            'palette',
        ],
        name: 'art',
    },
    {
        code: '🎰',
        keywords: [
            'activity',
            'game',
            'slot',
        ],
        name: 'slot_machine',
    },
    {
        code: '🚂',
        keywords: [
            'engine',
            'locomotive',
            'railway',
            'steam',
            'train',
            'vehicle',
        ],
        name: 'steam_locomotive',
    },
    {
        code: '🚃',
        keywords: [
            'car',
            'electric',
            'railway',
            'train',
            'tram',
            'trolleybus',
            'vehicle',
        ],
        name: 'railway_car',
    },
    {
        code: '🚄',
        keywords: [
            'railway',
            'shinkansen',
            'speed',
            'train',
            'vehicle',
        ],
        name: 'bullettrain_side',
    },
    {
        code: '🚅',
        keywords: [
            'bullet',
            'railway',
            'shinkansen',
            'speed',
            'train',
            'vehicle',
        ],
        name: 'bullettrain_front',
    },
    {
        code: '🚆',
        keywords: [
            'railway',
            'train',
            'vehicle',
        ],
        name: 'train2',
    },
    {
        code: '🚇',
        keywords: [
            'metro',
            'subway',
            'vehicle',
        ],
        name: 'metro',
    },
    {
        code: '🚈',
        keywords: [
            'railway',
            'vehicle',
        ],
        name: 'light_rail',
    },
    {
        code: '🚉',
        keywords: [
            'railway',
            'station',
            'train',
            'vehicle',
        ],
        name: 'station',
    },
    {
        code: '🚊',
        keywords: [
            'tram',
            'trolleybus',
            'vehicle',
        ],
        name: 'tram',
    },
    {
        code: '🚝',
        keywords: [
            'monorail',
            'vehicle',
        ],
        name: 'monorail',
    },
    {
        code: '🚞',
        keywords: [
            'car',
            'mountain',
            'railway',
            'vehicle',
        ],
        name: 'mountain_railway',
    },
    {
        code: '🚋',
        keywords: [
            'car',
            'tram',
            'trolleybus',
            'vehicle',
        ],
        name: 'train',
    },
    {
        code: '🚌',
        keywords: [
            'bus',
            'vehicle',
        ],
        name: 'bus',
    },
    {
        code: '🚍',
        keywords: [
            'bus',
            'oncoming',
            'vehicle',
        ],
        name: 'oncoming_bus',
    },
    {
        code: '🚎',
        keywords: [
            'bus',
            'tram',
            'trolley',
            'trolleybus',
            'vehicle',
        ],
        name: 'trolleybus',
    },
    {
        code: '🚏',
        keywords: [
            'bus',
            'busstop',
            'stop',
        ],
        name: 'busstop',
    },
    {
        code: '🚐',
        keywords: [
            'bus',
            'minibus',
            'vehicle',
        ],
        name: 'minibus',
    },
    {
        code: '🚑',
        keywords: [
            'ambulance',
            'vehicle',
        ],
        name: 'ambulance',
    },
    {
        code: '🚒',
        keywords: [
            'engine',
            'fire',
            'truck',
            'vehicle',
        ],
        name: 'fire_engine',
    },
    {
        code: '🚓',
        keywords: [
            'car',
            'patrol',
            'police',
            'vehicle',
        ],
        name: 'police_car',
    },
    {
        code: '🚔',
        keywords: [
            'car',
            'oncoming',
            'police',
            'vehicle',
        ],
        name: 'oncoming_police_car',
    },
    {
        code: '🚕',
        keywords: [
            'taxi',
            'vehicle',
        ],
        name: 'taxi',
    },
    {
        code: '🚖',
        keywords: [
            'oncoming',
            'taxi',
            'vehicle',
        ],
        name: 'oncoming_taxi',
    },
    {
        code: '🚗',
        keywords: [
            'automobile',
            'car',
            'vehicle',
        ],
        name: 'car',
    },
    {
        code: '🚘',
        keywords: [
            'automobile',
            'car',
            'oncoming',
            'vehicle',
        ],
        name: 'oncoming_automobile',
    },
    {
        code: '🚙',
        keywords: [
            'recreational',
            'rv',
            'vehicle',
        ],
        name: 'blue_car',
    },
    {
        code: '🚚',
        keywords: [
            'delivery',
            'truck',
            'vehicle',
        ],
        name: 'truck',
    },
    {
        code: '🚛',
        keywords: [
            'lorry',
            'semi',
            'truck',
            'vehicle',
        ],
        name: 'articulated_lorry',
    },
    {
        code: '🚜',
        keywords: [
            'tractor',
            'vehicle',
        ],
        name: 'tractor',
    },
    {
        code: '🚲',
        keywords: [
            'bicycle',
            'bike',
            'vehicle',
        ],
        name: 'bike',
    },
    {
        code: '⛽',
        keywords: [
            'fuel',
            'fuelpump',
            'gas',
            'pump',
            'station',
        ],
        name: 'fuelpump',
    },
    {
        code: '🛣',
        keywords: [
            'highway',
            'motorway',
            'road',
        ],
        name: 'motorway',
    },
    {
        code: '🛤',
        keywords: [
            'railway',
            'train',
        ],
        name: 'railway_track',
    },
    {
        code: '🚨',
        keywords: [
            'beacon',
            'car',
            'light',
            'police',
            'revolving',
            'vehicle',
        ],
        name: 'rotating_light',
    },
    {
        code: '🚥',
        keywords: [
            'light',
            'signal',
            'traffic',
        ],
        name: 'traffic_light',
    },
    {
        code: '🚦',
        keywords: [
            'light',
            'signal',
            'traffic',
        ],
        name: 'vertical_traffic_light',
    },
    {
        code: '🚧',
        keywords: [
            'barrier',
            'construction',
        ],
        name: 'construction',
    },
    {
        code: '🛑',
        keywords: [
            'octagonal',
            'stop',
        ],
        name: 'stop_sign',
    },
    {
        code: '🛴',
        keywords: [
            'kick',
            'scooter',
        ],
        name: 'kick_scooter',
    },
    {
        code: '🛵',
        keywords: [
            'motor',
            'scooter',
        ],
        name: 'motor_scooter',
    },
    {
        code: '⚓',
        keywords: [
            'anchor',
            'ship',
            'tool',
        ],
        name: 'anchor',
    },
    {
        code: '⛵',
        keywords: [
            'boat',
            'resort',
            'sailboat',
            'sea',
            'vehicle',
            'yacht',
        ],
        name: 'boat',
    },
    {
        code: '🚣',
        keywords: [
            'boat',
            'rowboat',
            'vehicle',
        ],
        types: [
            '🚣🏿',
            '🚣🏾',
            '🚣🏽',
            '🚣🏼',
            '🚣🏻',
        ],
        name: 'rowboat',
    },
    {
        code: '🛶',
        keywords: [
            'boat',
            'canoe',
        ],
        name: 'canoe',
    },
    {
        code: '🚤',
        keywords: [
            'boat',
            'speedboat',
            'vehicle',
        ],
        name: 'speedboat',
    },
    {
        code: '🛳',
        keywords: [
            'passenger',
            'ship',
            'vehicle',
        ],
        name: 'passenger_ship',
    },
    {
        code: '⛴',
        keywords: [
            'boat',
            'ferry',
        ],
        name: 'ferry',
    },
    {
        code: '🛥',
        keywords: [
            'boat',
            'motorboat',
            'vehicle',
        ],
        name: 'motor_boat',
    },
    {
        code: '🚢',
        keywords: [
            'ship',
            'vehicle',
        ],
        name: 'ship',
    },
    {
        code: '✈️',
        keywords: [
            'airplane',
            'vehicle',
        ],
        name: 'airplane',
    },
    {
        code: '🛩',
        keywords: [
            'airplane',
            'vehicle',
        ],
        name: 'small_airplane',
    },
    {
        code: '🛫',
        keywords: [
            'airplane',
            'check-in',
            'departure',
            'departures',
            'vehicle',
        ],
        name: 'flight_departure',
    },
    {
        code: '🛬',
        keywords: [
            'airplane',
            'arrivals',
            'arriving',
            'landing',
            'vehicle',
        ],
        name: 'flight_arrival',
    },
    {
        code: '💺',
        keywords: [
            'chair',
            'seat',
        ],
        name: 'seat',
    },
    {
        code: '🚁',
        keywords: [
            'helicopter',
            'vehicle',
        ],
        name: 'helicopter',
    },
    {
        code: '🚟',
        keywords: [
            'railway',
            'suspension',
            'vehicle',
        ],
        name: 'suspension_railway',
    },
    {
        code: '🚠',
        keywords: [
            'cable',
            'gondola',
            'mountain',
            'vehicle',
        ],
        name: 'mountain_cableway',
    },
    {
        code: '🚡',
        keywords: [
            'aerial',
            'cable',
            'car',
            'gondola',
            'ropeway',
            'tramway',
            'vehicle',
        ],
        name: 'aerial_tramway',
    },
    {
        code: '🚀',
        keywords: [
            'rocket',
            'space',
            'vehicle',
        ],
        name: 'rocket',
    },
    {
        code: '🛰',
        keywords: [
            'satellite',
            'space',
            'vehicle',
        ],
        name: 'artificial_satellite',
    },
    {
        code: '🛎',
        keywords: [
            'bell',
            'bellhop',
            'hotel',
        ],
        name: 'bellhop_bell',
    },
    {
        code: '🚪',
        keywords: [
            'door',
        ],
        name: 'door',
    },
    {
        code: '🛌',
        keywords: [
            'hotel',
            'sleep',
        ],
        name: 'sleeping_bed',
    },
    {
        code: '🛏',
        keywords: [
            'bed',
            'hotel',
            'sleep',
        ],
        name: 'bed',
    },
    {
        code: '🛋',
        keywords: [
            'couch',
            'hotel',
            'lamp',
        ],
        name: 'couch_and_lamp',
    },
    {
        code: '🚽',
        keywords: [
            'toilet',
        ],
        name: 'toilet',
    },
    {
        code: '🚿',
        keywords: [
            'shower',
            'water',
        ],
        name: 'shower',
    },
    {
        code: '🛀',
        keywords: [
            'bath',
            'bathtub',
        ],
        types: [
            '🛀🏿',
            '🛀🏾',
            '🛀🏽',
            '🛀🏼',
            '🛀🏻',
        ],
        name: 'bath',
    },
    {
        code: '🛁',
        keywords: [
            'bath',
            'bathtub',
        ],
        name: 'bathtub',
    },
    {
        code: '⌛',
        keywords: [
            'hourglass',
            'sand',
            'timer',
        ],
        name: 'hourglass',
    },
    {
        code: '⏳',
        keywords: [
            'hourglass',
            'sand',
            'timer',
        ],
        name: 'hourglass_flowing_sand',
    },
    {
        code: '⌚',
        keywords: [
            'clock',
            'watch',
        ],
        name: 'watch',
    },
    {
        code: '⏰',
        keywords: [
            'alarm',
            'clock',
        ],
        name: 'alarm_clock',
    },
    {
        code: '⏱',
        keywords: [
            'clock',
            'stopwatch',
        ],
        name: 'stopwatch',
    },
    {
        code: '⏲',
        keywords: [
            'clock',
            'timer',
        ],
        name: 'timer_clock',
    },
    {
        code: '🕰',
        keywords: [
            'clock',
        ],
        name: 'mantelpiece_clock',
    },
    {
        code: '🕛',
        keywords: [
            '00',
            '12',
            '12:00',
            'clock',
            'o’clock',
            'twelve',
        ],
        name: 'clock12',
    },
    {
        code: '🕧',
        keywords: [
            '12',
            '12:30',
            '30',
            'clock',
            'thirty',
            'twelve',
        ],
        name: 'clock1230',
    },
    {
        code: '🕐',
        keywords: [
            '00',
            '1',
            '1:00',
            'clock',
            'o’clock',
            'one',
        ],
        name: 'clock1',
    },
    {
        code: '🕜',
        keywords: [
            '1',
            '1:30',
            '30',
            'clock',
            'one',
            'thirty',
        ],
        name: 'clock130',
    },
    {
        code: '🕑',
        keywords: [
            '00',
            '2',
            '2:00',
            'clock',
            'o’clock',
            'two',
        ],
        name: 'clock2',
    },
    {
        code: '🕝',
        keywords: [
            '2',
            '2:30',
            '30',
            'clock',
            'thirty',
            'two',
        ],
        name: 'clock230',
    },
    {
        code: '🕒',
        keywords: [
            '00',
            '3',
            '3:00',
            'clock',
            'o’clock',
            'three',
        ],
        name: 'clock3',
    },
    {
        code: '🕞',
        keywords: [
            '3',
            '3:30',
            '30',
            'clock',
            'thirty',
            'three',
        ],
        name: 'clock330',
    },
    {
        code: '🕓',
        keywords: [
            '00',
            '4',
            '4:00',
            'clock',
            'four',
            'o’clock',
        ],
        name: 'clock4',
    },
    {
        code: '🕟',
        keywords: [
            '30',
            '4',
            '4:30',
            'clock',
            'four',
            'thirty',
        ],
        name: 'clock430',
    },
    {
        code: '🕔',
        keywords: [
            '00',
            '5',
            '5:00',
            'clock',
            'five',
            'o’clock',
        ],
        name: 'clock5',
    },
    {
        code: '🕠',
        keywords: [
            '30',
            '5',
            '5:30',
            'clock',
            'five',
            'thirty',
        ],
        name: 'clock530',
    },
    {
        code: '🕕',
        keywords: [
            '00',
            '6',
            '6:00',
            'clock',
            'o’clock',
            'six',
        ],
        name: 'clock6',
    },
    {
        code: '🕡',
        keywords: [
            '30',
            '6',
            '6:30',
            'clock',
            'six',
            'thirty',
        ],
        name: 'clock630',
    },
    {
        code: '🕖',
        keywords: [
            '00',
            '7',
            '7:00',
            'clock',
            'o’clock',
            'seven',
        ],
        name: 'clock7',
    },
    {
        code: '🕢',
        keywords: [
            '30',
            '7',
            '7:30',
            'clock',
            'seven',
            'thirty',
        ],
        name: 'clock730',
    },
    {
        code: '🕗',
        keywords: [
            '00',
            '8',
            '8:00',
            'clock',
            'eight',
            'o’clock',
        ],
        name: 'clock8',
    },
    {
        code: '🕣',
        keywords: [
            '30',
            '8',
            '8:30',
            'clock',
            'eight',
            'thirty',
        ],
        name: 'clock830',
    },
    {
        code: '🕘',
        keywords: [
            '00',
            '9',
            '9:00',
            'clock',
            'nine',
            'o’clock',
        ],
        name: 'clock9',
    },
    {
        code: '🕤',
        keywords: [
            '30',
            '9',
            '9:30',
            'clock',
            'nine',
            'thirty',
        ],
        name: 'clock930',
    },
    {
        code: '🕙',
        keywords: [
            '00',
            '10',
            '10:00',
            'clock',
            'o’clock',
            'ten',
        ],
        name: 'clock10',
    },
    {
        code: '🕥',
        keywords: [
            '10',
            '10:30',
            '30',
            'clock',
            'ten',
            'thirty',
        ],
        name: 'clock1030',
    },
    {
        code: '🕚',
        keywords: [
            '00',
            '11',
            '11:00',
            'clock',
            'eleven',
            'o’clock',
        ],
        name: 'clock11',
    },
    {
        code: '🕦',
        keywords: [
            '11',
            '11:30',
            '30',
            'clock',
            'eleven',
            'thirty',
        ],
        name: 'clock1130',
    },
    {
        code: '🌑',
        keywords: [
            'dark',
            'moon',
            'space',
            'weather',
        ],
        name: 'new_moon',
    },
    {
        code: '🌒',
        keywords: [
            'crescent',
            'moon',
            'space',
            'waxing',
            'weather',
        ],
        name: 'waxing_crescent_moon',
    },
    {
        code: '🌓',
        keywords: [
            'moon',
            'quarter',
            'space',
            'weather',
        ],
        name: 'first_quarter_moon',
    },
    {
        code: '🌔',
        keywords: [
            'gibbous',
            'moon',
            'space',
            'waxing',
            'weather',
        ],
        name: 'moon',
    },
    {
        code: '🌕',
        keywords: [
            'full',
            'moon',
            'space',
            'weather',
        ],
        name: 'full_moon',
    },
    {
        code: '🌖',
        keywords: [
            'gibbous',
            'moon',
            'space',
            'waning',
            'weather',
        ],
        name: 'waning_gibbous_moon',
    },
    {
        code: '🌗',
        keywords: [
            'moon',
            'quarter',
            'space',
            'weather',
        ],
        name: 'last_quarter_moon',
    },
    {
        code: '🌘',
        keywords: [
            'crescent',
            'moon',
            'space',
            'waning',
            'weather',
        ],
        name: 'waning_crescent_moon',
    },
    {
        code: '🌙',
        keywords: [
            'crescent',
            'moon',
            'space',
            'weather',
        ],
        name: 'crescent_moon',
    },
    {
        code: '🌚',
        keywords: [
            'face',
            'moon',
            'space',
            'weather',
        ],
        name: 'new_moon_with_face',
    },
    {
        code: '🌛',
        keywords: [
            'face',
            'moon',
            'quarter',
            'space',
            'weather',
        ],
        name: 'first_quarter_moon_with_face',
    },
    {
        code: '🌜',
        keywords: [
            'face',
            'moon',
            'quarter',
            'space',
            'weather',
        ],
        name: 'last_quarter_moon_with_face',
    },
    {
        code: '🌡',
        keywords: [
            'thermometer',
            'weather',
        ],
        name: 'thermometer',
    },
    {
        code: '☀️',
        keywords: [
            'bright',
            'rays',
            'space',
            'sun',
            'sunny',
            'weather',
        ],
        name: 'sunny',
    },
    {
        code: '🌝',
        keywords: [
            'bright',
            'face',
            'full',
            'moon',
            'space',
            'weather',
        ],
        name: 'full_moon_with_face',
    },
    {
        code: '🌞',
        keywords: [
            'bright',
            'face',
            'space',
            'sun',
            'weather',
        ],
        name: 'sun_with_face',
    },
    {
        code: '⭐',
        keywords: [
            'star',
        ],
        name: 'star',
    },
    {
        code: '🌟',
        keywords: [
            'glittery',
            'glow',
            'shining',
            'sparkle',
            'star',
        ],
        name: 'star2',
    },
    {
        code: '🌠',
        keywords: [
            'activity',
            'falling',
            'shooting',
            'space',
            'star',
        ],
        name: 'stars',
    },
    {
        code: '☁️',
        keywords: [
            'cloud',
            'weather',
        ],
        name: 'cloud',
    },
    {
        code: '⛅',
        keywords: [
            'cloud',
            'sun',
            'weather',
        ],
        name: 'partly_sunny',
    },
    {
        code: '⛈',
        keywords: [
            'cloud',
            'rain',
            'thunder',
            'weather',
        ],
        name: 'cloud_with_lightning_and_rain',
    },
    {
        code: '🌤',
        keywords: [
            'cloud',
            'sun',
            'weather',
        ],
        name: 'sun_behind_small_cloud',
    },
    {
        code: '🌥',
        keywords: [
            'cloud',
            'sun',
            'weather',
        ],
        name: 'sun_behind_large_cloud',
    },
    {
        code: '🌦',
        keywords: [
            'cloud',
            'rain',
            'sun',
            'weather',
        ],
        name: 'sun_behind_rain_cloud',
    },
    {
        code: '🌧',
        keywords: [
            'cloud',
            'rain',
            'weather',
        ],
        name: 'cloud_with_rain',
    },
    {
        code: '🌨',
        keywords: [
            'cloud',
            'cold',
            'snow',
            'weather',
        ],
        name: 'cloud_with_snow',
    },
    {
        code: '🌩',
        keywords: [
            'cloud',
            'lightning',
            'weather',
        ],
        name: 'cloud_with_lightning',
    },
    {
        code: '🌪',
        keywords: [
            'cloud',
            'tornado',
            'weather',
            'whirlwind',
        ],
        name: 'tornado',
    },
    {
        code: '🌫',
        keywords: [
            'cloud',
            'fog',
            'weather',
        ],
        name: 'fog',
    },
    {
        code: '🌬',
        keywords: [
            'blow',
            'cloud',
            'face',
            'weather',
            'wind',
        ],
        name: 'wind_face',
    },
    {
        code: '🌀',
        keywords: [
            'cyclone',
            'dizzy',
            'twister',
            'typhoon',
            'weather',
        ],
        name: 'cyclone',
    },
    {
        code: '🌈',
        keywords: [
            'rain',
            'rainbow',
            'weather',
        ],
        name: 'rainbow',
    },
    {
        code: '🌂',
        keywords: [
            'clothing',
            'rain',
            'umbrella',
            'weather',
        ],
        name: 'closed_umbrella',
    },
    {
        code: '☂️',
        keywords: [
            'clothing',
            'rain',
            'umbrella',
            'weather',
        ],
        name: 'open_umbrella',
    },
    {
        code: '☔',
        keywords: [
            'clothing',
            'drop',
            'rain',
            'umbrella',
            'weather',
        ],
        name: 'umbrella',
    },
    {
        code: '⛱',
        keywords: [
            'rain',
            'sun',
            'umbrella',
            'weather',
        ],
        name: 'parasol_on_ground',
    },
    {
        code: '⚡',
        keywords: [
            'danger',
            'electric',
            'electricity',
            'lightning',
            'voltage',
            'zap',
        ],
        name: 'zap',
    },
    {
        code: '❄️',
        keywords: [
            'cold',
            'snow',
            'snowflake',
            'weather',
        ],
        name: 'snowflake',
    },
    {
        code: '☃️',
        keywords: [
            'cold',
            'snow',
            'snowman',
            'weather',
        ],
        name: 'snowman_with_snow',
    },
    {
        code: '⛄',
        keywords: [
            'cold',
            'snow',
            'snowman',
            'weather',
        ],
        name: 'snowman',
    },
    {
        code: '☄️',
        keywords: [
            'comet',
            'space',
        ],
        name: 'comet',
    },
    {
        code: '🔥',
        keywords: [
            'fire',
            'flame',
            'tool',
        ],
        name: 'fire',
    },
    {
        code: '💧',
        keywords: [
            'cold',
            'comic',
            'drop',
            'sweat',
            'weather',
        ],
        name: 'droplet',
    },
    {
        code: '🌊',
        keywords: [
            'ocean',
            'water',
            'wave',
            'weather',
        ],
        name: 'ocean',
    },
    {
        code: 'activities',
        header: true,
    },
    {
        code: '🎃',
        keywords: [
            'activity',
            'celebration',
            'entertainment',
            'halloween',
            'jack',
            'lantern',
        ],
        name: 'jack_o_lantern',
    },
    {
        code: '🎄',
        keywords: [
            'activity',
            'celebration',
            'christmas',
            'entertainment',
            'tree',
        ],
        name: 'christmas_tree',
    },
    {
        code: '🎆',
        keywords: [
            'activity',
            'celebration',
            'entertainment',
            'fireworks',
        ],
        name: 'fireworks',
    },
    {
        code: '🎇',
        keywords: [
            'activity',
            'celebration',
            'entertainment',
            'fireworks',
            'sparkle',
        ],
        name: 'sparkler',
    },
    {
        code: '✨',
        keywords: [
            'entertainment',
            'sparkle',
            'star',
        ],
        name: 'sparkles',
    },
    {
        code: '🎈',
        keywords: [
            'activity',
            'balloon',
            'celebration',
            'entertainment',
        ],
        name: 'balloon',
    },
    {
        code: '🎉',
        keywords: [
            'activity',
            'celebration',
            'entertainment',
            'party',
            'popper',
            'tada',
        ],
        name: 'tada',
    },
    {
        code: '🎊',
        keywords: [
            'activity',
            'ball',
            'celebration',
            'confetti',
            'entertainment',
        ],
        name: 'confetti_ball',
    },
    {
        code: '🎋',
        keywords: [
            'activity',
            'banner',
            'celebration',
            'entertainment',
            'japanese',
            'tree',
        ],
        name: 'tanabata_tree',
    },
    {
        code: '🎍',
        keywords: [
            'activity',
            'bamboo',
            'celebration',
            'japanese',
            'pine',
            'plant',
        ],
        name: 'bamboo',
    },
    {
        code: '🎎',
        keywords: [
            'activity',
            'celebration',
            'doll',
            'entertainment',
            'festival',
            'japanese',
        ],
        name: 'dolls',
    },
    {
        code: '🎏',
        keywords: [
            'activity',
            'carp',
            'celebration',
            'entertainment',
            'flag',
            'streamer',
        ],
        name: 'flags',
    },
    {
        code: '🎐',
        keywords: [
            'activity',
            'bell',
            'celebration',
            'chime',
            'entertainment',
            'wind',
        ],
        name: 'wind_chime',
    },
    {
        code: '🎑',
        keywords: [
            'activity',
            'celebration',
            'ceremony',
            'entertainment',
            'moon',
        ],
        name: 'rice_scene',
    },
    {
        code: '🎀',
        keywords: [
            'celebration',
            'ribbon',
        ],
        name: 'ribbon',
    },
    {
        code: '🎁',
        keywords: [
            'box',
            'celebration',
            'entertainment',
            'gift',
            'present',
            'wrapped',
        ],
        name: 'gift',
    },
    {
        code: '🎗',
        keywords: [
            'celebration',
            'reminder',
            'ribbon',
        ],
        name: 'reminder_ribbon',
    },
    {
        code: '🎟',
        keywords: [
            'admission',
            'entertainment',
            'ticket',
        ],
        name: 'tickets',
    },
    {
        code: '🎫',
        keywords: [
            'activity',
            'admission',
            'entertainment',
            'ticket',
        ],
        name: 'ticket',
    },
    {
        code: '🎖',
        keywords: [
            'celebration',
            'medal',
            'military',
        ],
        name: 'medal_military',
    },
    {
        code: '🏆',
        keywords: [
            'prize',
            'trophy',
        ],
        name: 'trophy',
    },
    {
        code: '🏅',
        keywords: [
            'medal',
        ],
        name: 'medal_sports',
    },
    {
        code: '🥇',
        keywords: [
            'first',
            'gold',
            'medal',
        ],
        name: '1st_place_medal',
    },
    {
        code: '🥈',
        keywords: [
            'medal',
            'second',
            'silver',
        ],
        name: '2nd_place_medal',
    },
    {
        code: '🥉',
        keywords: [
            'bronze',
            'medal',
            'third',
        ],
        name: '3rd_place_medal',
    },
    {
        code: '⚽',
        keywords: [
            'ball',
            'soccer',
        ],
        name: 'soccer',
    },
    {
        code: '⚾',
        keywords: [
            'ball',
            'baseball',
        ],
        name: 'baseball',
    },
    {
        code: '🏀',
        keywords: [
            'ball',
            'basketball',
            'hoop',
        ],
        name: 'basketball',
    },
    {
        code: '🏐',
        keywords: [
            'ball',
            'game',
            'volleyball',
        ],
        name: 'volleyball',
    },
    {
        code: '🏈',
        keywords: [
            'american',
            'ball',
            'football',
        ],
        name: 'football',
    },
    {
        code: '🏉',
        keywords: [
            'ball',
            'football',
            'rugby',
        ],
        name: 'rugby_football',
    },
    {
        code: '🎾',
        keywords: [
            'ball',
            'racquet',
            'tennis',
        ],
        name: 'tennis',
    },
    {
        code: '🎱',
        keywords: [
            '8',
            '8 ball',
            'ball',
            'billiard',
            'eight',
            'game',
        ],
        name: '8ball',
    },
    {
        code: '🎳',
        keywords: [
            'ball',
            'bowling',
            'game',
        ],
        name: 'bowling',
    },
    {
        code: '🏏',
        keywords: [
            'ball',
            'bat',
            'cricket',
            'game',
        ],
        name: 'cricket_game',
    },
    {
        code: '🏑',
        keywords: [
            'ball',
            'field',
            'game',
            'hockey',
            'stick',
        ],
        name: 'field_hockey',
    },
    {
        code: '🏒',
        keywords: [
            'game',
            'hockey',
            'ice',
            'puck',
            'stick',
        ],
        name: 'ice_hockey',
    },
    {
        code: '🏓',
        keywords: [
            'ball',
            'bat',
            'game',
            'paddle',
            'table tennis',
        ],
        name: 'ping_pong',
    },
    {
        code: '🏸',
        keywords: [
            'badminton',
            'birdie',
            'game',
            'racquet',
            'shuttlecock',
        ],
        name: 'badminton',
    },
    {
        code: '🥊',
        keywords: [
            'boxing',
            'glove',
        ],
        name: 'boxing_glove',
    },
    {
        code: '🥋',
        keywords: [
            'judo',
            'karate',
            'martial arts',
            'taekwondo',
            'uniform',
        ],
        name: 'martial_arts_uniform',
    },
    {
        code: '⛳',
        keywords: [
            'flag',
            'golf',
            'hole',
        ],
        name: 'golf',
    },
    {
        code: '🏌',
        keywords: [
            'ball',
            'golf',
        ],
        name: 'golfing',
    },
    {
        code: '⛸',
        keywords: [
            'ice',
            'skate',
        ],
        name: 'ice_skate',
    },
    {
        code: '🎣',
        keywords: [
            'entertainment',
            'fish',
            'pole',
        ],
        name: 'fishing_pole_and_fish',
    },
    {
        code: '🎽',
        keywords: [
            'running',
            'sash',
            'shirt',
        ],
        name: 'running_shirt_with_sash',
    },
    {
        code: '🎿',
        keywords: [
            'ski',
            'snow',
        ],
        name: 'ski',
    },
    {
        code: '⛷',
        keywords: [
            'ski',
            'snow',
        ],
        name: 'skier',
    },
    {
        code: '🏂',
        keywords: [
            'ski',
            'snow',
            'snowboard',
        ],
        name: 'snowboarder',
    },
    {
        code: '🏄',
        keywords: [
            'surfer',
            'surfing',
        ],
        types: [
            '🏄🏿',
            '🏄🏾',
            '🏄🏽',
            '🏄🏼',
            '🏄🏻',
        ],
        name: 'surfer',
    },
    {
        code: '🏇',
        keywords: [
            'horse',
            'jockey',
            'racehorse',
            'racing',
        ],
        name: 'horse_racing',
    },
    {
        code: '🏊',
        keywords: [
            'swim',
            'swimmer',
        ],
        types: [
            '🏊🏿',
            '🏊🏾',
            '🏊🏽',
            '🏊🏼',
            '🏊🏻',
        ],
        name: 'swimmer',
    },
    {
        code: '⛹',
        keywords: [
            'ball',
        ],
        types: [
            '⛹🏿',
            '⛹🏾',
            '⛹🏽',
            '⛹🏼',
            '⛹🏻',
        ],
        name: 'bouncing_ball_person',
    },
    {
        code: '🏋',
        keywords: [
            'lifter',
            'weight',
        ],
        types: [
            '🏋🏿',
            '🏋🏾',
            '🏋🏽',
            '🏋🏼',
            '🏋🏻',
        ],
        name: 'weight_lifting',
    },
    {
        code: '🚴',
        keywords: [
            'bicycle',
            'bicyclist',
            'bike',
            'cyclist',
        ],
        types: [
            '🚴🏿',
            '🚴🏾',
            '🚴🏽',
            '🚴🏼',
            '🚴🏻',
        ],
        name: 'bicyclist',
    },
    {
        code: '🚵',
        keywords: [
            'bicycle',
            'bicyclist',
            'bike',
            'cyclist',
            'mountain',
        ],
        types: [
            '🚵🏿',
            '🚵🏾',
            '🚵🏽',
            '🚵🏼',
            '🚵🏻',
        ],
        name: 'mountain_bicyclist',
    },
    {
        code: '🏎',
        keywords: [
            'car',
            'racing',
        ],
        name: 'racing_car',
    },
    {
        code: '🏍',
        keywords: [
            'motorcycle',
            'racing',
        ],
        name: 'motorcycle',
    },
    {
        code: '🤸',
        keywords: [
            'cartwheel',
            'gymnastics',
        ],
        types: [
            '🤸🏿',
            '🤸🏾',
            '🤸🏽',
            '🤸🏼',
            '🤸🏻',
        ],
        name: 'cartwheeling',
    },
    {
        code: '🤼',
        keywords: [
            'wrestle',
            'wrestler',
        ],
        types: [
            '🤼🏿',
            '🤼🏾',
            '🤼🏽',
            '🤼🏼',
            '🤼🏻',
        ],
        name: 'wrestling',
    },
    {
        code: '🤽',
        keywords: [
            'polo',
            'water',
        ],
        types: [
            '🤽🏿',
            '🤽🏾',
            '🤽🏽',
            '🤽🏼',
            '🤽🏻',
        ],
        name: 'water_polo',
    },
    {
        code: '🤾',
        keywords: [
            'ball',
            'handball',
        ],
        types: [
            '🤾🏿',
            '🤾🏾',
            '🤾🏽',
            '🤾🏼',
            '🤾🏻',
        ],
        name: 'handball_person',
    },
    {
        code: '🤺',
        keywords: [
            'fencer',
            'fencing',
            'sword',
        ],
        name: 'person_fencing',
    },
    {
        code: '🥅',
        keywords: [
            'goal',
            'net',
        ],
        name: 'goal_net',
    },
    {
        code: '🤹',
        keywords: [
            'balance',
            'juggle',
            'multitask',
            'skill',
        ],
        types: [
            '🤹🏿',
            '🤹🏾',
            '🤹🏽',
            '🤹🏼',
            '🤹🏻',
        ],
        name: 'juggling_person',
    },
    {
        code: '🎯',
        keywords: [
            'activity',
            'bull',
            'bullseye',
            'dart',
            'entertainment',
            'eye',
            'game',
            'hit',
            'target',
        ],
        name: 'dart',
    },
    {
        code: '🎮',
        keywords: [
            'controller',
            'entertainment',
            'game',
            'video game',
        ],
        name: 'video_game',
    },
    {
        code: '🕹',
        keywords: [
            'entertainment',
            'game',
            'joystick',
            'video game',
        ],
        name: 'joystick',
    },
    {
        code: '🎲',
        keywords: [
            'dice',
            'die',
            'entertainment',
            'game',
        ],
        name: 'game_die',
    },
    {
        code: '♠️',
        keywords: [
            'card',
            'game',
            'spade',
            'suit',
        ],
        name: 'spades',
    },
    {
        code: '♥️',
        keywords: [
            'card',
            'game',
            'heart',
            'hearts',
            'suit',
        ],
        name: 'hearts',
    },
    {
        code: '♦️',
        keywords: [
            'card',
            'diamond',
            'diamonds',
            'game',
            'suit',
        ],
        name: 'diamonds',
    },
    {
        code: '♣️',
        keywords: [
            'card',
            'club',
            'clubs',
            'game',
            'suit',
        ],
        name: 'clubs',
    },
    {
        code: '🃏',
        keywords: [
            'card',
            'entertainment',
            'game',
            'joker',
            'playing',
        ],
        name: 'black_joker',
    },
    {
        code: '🀄',
        keywords: [
            'game',
            'mahjong',
            'red',
        ],
        name: 'mahjong',
    },
    {
        code: '🎴',
        keywords: [
            'activity',
            'card',
            'entertainment',
            'flower',
            'game',
            'japanese',
            'playing',
        ],
        name: 'flower_playing_cards',
    },
    {
        code: 'objects',
        header: true,
    },
    {
        code: '🔇',
        keywords: [
            'mute',
            'quiet',
            'silent',
            'speaker',
            'volume',
        ],
        name: 'mute',
    },
    {
        code: '🔈',
        keywords: [
            'speaker',
            'volume',
        ],
        name: 'speaker',
    },
    {
        code: '🔉',
        keywords: [
            'low',
            'speaker',
            'volume',
            'wave',
        ],
        name: 'sound',
    },
    {
        code: '🔊',
        keywords: [
            '3',
            'entertainment',
            'high',
            'loud',
            'speaker',
            'three',
            'volume',
        ],
        name: 'loud_sound',
    },
    {
        code: '📢',
        keywords: [
            'communication',
            'loud',
            'loudspeaker',
            'public address',
        ],
        name: 'loudspeaker',
    },
    {
        code: '📣',
        keywords: [
            'cheering',
            'communication',
            'megaphone',
        ],
        name: 'mega',
    },
    {
        code: '📯',
        keywords: [
            'communication',
            'entertainment',
            'horn',
            'post',
            'postal',
        ],
        name: 'postal_horn',
    },
    {
        code: '🔔',
        keywords: [
            'bell',
        ],
        name: 'bell',
    },
    {
        code: '🔕',
        keywords: [
            'bell',
            'forbidden',
            'mute',
            'no',
            'not',
            'prohibited',
            'quiet',
            'silent',
        ],
        name: 'no_bell',
    },
    {
        code: '🎼',
        keywords: [
            'activity',
            'entertainment',
            'music',
            'score',
        ],
        name: 'musical_score',
    },
    {
        code: '🎵',
        keywords: [
            'activity',
            'entertainment',
            'music',
            'note',
        ],
        name: 'musical_note',
    },
    {
        code: '🎶',
        keywords: [
            'activity',
            'entertainment',
            'music',
            'note',
            'notes',
        ],
        name: 'notes',
    },
    {
        code: '🎙',
        keywords: [
            'mic',
            'microphone',
            'music',
            'studio',
        ],
        name: 'studio_microphone',
    },
    {
        code: '🎚',
        keywords: [
            'level',
            'music',
            'slider',
        ],
        name: 'level_slider',
    },
    {
        code: '🎛',
        keywords: [
            'control',
            'knobs',
            'music',
        ],
        name: 'control_knobs',
    },
    {
        code: '🎤',
        keywords: [
            'activity',
            'entertainment',
            'karaoke',
            'mic',
            'microphone',
        ],
        name: 'microphone',
    },
    {
        code: '🎧',
        keywords: [
            'activity',
            'earbud',
            'entertainment',
            'headphone',
        ],
        name: 'headphones',
    },
    {
        code: '📻',
        keywords: [
            'entertainment',
            'radio',
            'video',
        ],
        name: 'radio',
    },
    {
        code: '🎷',
        keywords: [
            'activity',
            'entertainment',
            'instrument',
            'music',
            'sax',
            'saxophone',
        ],
        name: 'saxophone',
    },
    {
        code: '🎸',
        keywords: [
            'activity',
            'entertainment',
            'guitar',
            'instrument',
            'music',
        ],
        name: 'guitar',
    },
    {
        code: '🎹',
        keywords: [
            'activity',
            'entertainment',
            'instrument',
            'keyboard',
            'music',
            'piano',
        ],
        name: 'musical_keyboard',
    },
    {
        code: '🎺',
        keywords: [
            'activity',
            'entertainment',
            'instrument',
            'music',
            'trumpet',
        ],
        name: 'trumpet',
    },
    {
        code: '🎻',
        keywords: [
            'activity',
            'entertainment',
            'instrument',
            'music',
            'violin',
        ],
        name: 'violin',
    },
    {
        code: '🥁',
        keywords: [
            'drum',
            'drumsticks',
            'music',
        ],
        name: 'drum',
    },
    {
        code: '📱',
        keywords: [
            'cell',
            'communication',
            'mobile',
            'phone',
            'telephone',
        ],
        name: 'iphone',
    },
    {
        code: '📲',
        keywords: [
            'arrow',
            'call',
            'cell',
            'communication',
            'mobile',
            'phone',
            'receive',
            'telephone',
        ],
        name: 'calling',
    },
    {
        code: '☎',
        keywords: [
            'phone',
            'telephone',
        ],
        name: 'phone',
    },
    {
        code: '📞',
        keywords: [
            'communication',
            'phone',
            'receiver',
            'telephone',
        ],
        name: 'telephone_receiver',
    },
    {
        code: '📟',
        keywords: [
            'communication',
            'pager',
        ],
        name: 'pager',
    },
    {
        code: '📠',
        keywords: [
            'communication',
            'fax',
        ],
        name: 'fax',
    },
    {
        code: '🔋',
        keywords: [
            'battery',
        ],
        name: 'battery',
    },
    {
        code: '🔌',
        keywords: [
            'electric',
            'electricity',
            'plug',
        ],
        name: 'electric_plug',
    },
    {
        code: '💻',
        keywords: [
            'computer',
            'pc',
            'personal',
        ],
        name: 'computer',
    },
    {
        code: '🖥',
        keywords: [
            'computer',
            'desktop',
        ],
        name: 'desktop_computer',
    },
    {
        code: '🖨',
        keywords: [
            'computer',
            'printer',
        ],
        name: 'printer',
    },
    {
        code: '⌨️',
        keywords: [
            'computer',
            'keyboard',
        ],
        name: 'keyboard',
    },
    {
        code: '🖱',
        keywords: [
            '3',
            'button',
            'computer',
            'mouse',
            'three',
        ],
        name: 'computer_mouse',
    },
    {
        code: '🖲',
        keywords: [
            'computer',
            'trackball',
        ],
        name: 'trackball',
    },
    {
        code: '💽',
        keywords: [
            'computer',
            'disk',
            'entertainment',
            'minidisk',
            'optical',
        ],
        name: 'minidisc',
    },
    {
        code: '💾',
        keywords: [
            'computer',
            'disk',
            'floppy',
        ],
        name: 'floppy_disk',
    },
    {
        code: '💿',
        keywords: [
            'blu-ray',
            'cd',
            'computer',
            'disk',
            'dvd',
            'optical',
        ],
        name: 'cd',
    },
    {
        code: '📀',
        keywords: [
            'blu-ray',
            'cd',
            'computer',
            'disk',
            'dvd',
            'entertainment',
            'optical',
        ],
        name: 'dvd',
    },
    {
        code: '🎥',
        keywords: [
            'activity',
            'camera',
            'cinema',
            'entertainment',
            'movie',
        ],
        name: 'movie_camera',
    },
    {
        code: '🎞',
        keywords: [
            'cinema',
            'entertainment',
            'film',
            'frames',
            'movie',
        ],
        name: 'film_strip',
    },
    {
        code: '📽',
        keywords: [
            'cinema',
            'entertainment',
            'film',
            'movie',
            'projector',
            'video',
        ],
        name: 'film_projector',
    },
    {
        code: '🎬',
        keywords: [
            'activity',
            'clapper',
            'entertainment',
            'movie',
        ],
        name: 'clapper',
    },
    {
        code: '📺',
        keywords: [
            'entertainment',
            'television',
            'tv',
            'video',
        ],
        name: 'tv',
    },
    {
        code: '📷',
        keywords: [
            'camera',
            'entertainment',
            'video',
        ],
        name: 'camera',
    },
    {
        code: '📸',
        keywords: [
            'camera',
            'flash',
            'video',
        ],
        name: 'camera_flash',
    },
    {
        code: '📹',
        keywords: [
            'camera',
            'entertainment',
            'video',
        ],
        name: 'video_camera',
    },
    {
        code: '📼',
        keywords: [
            'entertainment',
            'tape',
            'vhs',
            'video',
            'videocassette',
        ],
        name: 'vhs',
    },
    {
        code: '🔍',
        keywords: [
            'glass',
            'magnifying',
            'search',
            'tool',
        ],
        name: 'mag',
    },
    {
        code: '🔎',
        keywords: [
            'glass',
            'magnifying',
            'search',
            'tool',
        ],
        name: 'mag_right',
    },
    {
        code: '🔬',
        keywords: [
            'microscope',
            'tool',
        ],
        name: 'microscope',
    },
    {
        code: '🔭',
        keywords: [
            'telescope',
            'tool',
        ],
        name: 'telescope',
    },
    {
        code: '📡',
        keywords: [
            'antenna',
            'communication',
            'dish',
            'satellite',
        ],
        name: 'satellite',
    },
    {
        code: '🕯',
        keywords: [
            'candle',
            'light',
        ],
        name: 'candle',
    },
    {
        code: '💡',
        keywords: [
            'bulb',
            'comic',
            'electric',
            'idea',
            'light',
        ],
        name: 'bulb',
    },
    {
        code: '🔦',
        keywords: [
            'electric',
            'flashlight',
            'light',
            'tool',
            'torch',
        ],
        name: 'flashlight',
    },
    {
        code: '🏮',
        keywords: [
            'bar',
            'japanese',
            'lantern',
            'light',
            'red',
        ],
        name: 'izakaya_lantern',
    },
    {
        code: '📔',
        keywords: [
            'book',
            'cover',
            'decorated',
            'notebook',
        ],
        name: 'notebook_with_decorative_cover',
    },
    {
        code: '📕',
        keywords: [
            'book',
            'closed',
        ],
        name: 'closed_book',
    },
    {
        code: '📖',
        keywords: [
            'book',
            'open',
        ],
        name: 'book',
    },
    {
        code: '📗',
        keywords: [
            'book',
            'green',
        ],
        name: 'green_book',
    },
    {
        code: '📘',
        keywords: [
            'blue',
            'book',
        ],
        name: 'blue_book',
    },
    {
        code: '📙',
        keywords: [
            'book',
            'orange',
        ],
        name: 'orange_book',
    },
    {
        code: '📚',
        keywords: [
            'book',
            'books',
        ],
        name: 'books',
    },
    {
        code: '📓',
        keywords: [
            'notebook',
        ],
        name: 'notebook',
    },
    {
        code: '📒',
        keywords: [
            'ledger',
            'notebook',
        ],
        name: 'ledger',
    },
    {
        code: '📃',
        keywords: [
            'curl',
            'document',
            'page',
        ],
        name: 'page_with_curl',
    },
    {
        code: '📜',
        keywords: [
            'paper',
            'scroll',
        ],
        name: 'scroll',
    },
    {
        code: '📄',
        keywords: [
            'document',
            'page',
        ],
        name: 'page_facing_up',
    },
    {
        code: '📰',
        keywords: [
            'communication',
            'news',
            'newspaper',
            'paper',
        ],
        name: 'newspaper',
    },
    {
        code: '🗞',
        keywords: [
            'news',
            'newspaper',
            'paper',
            'rolled',
        ],
        name: 'newspaper_roll',
    },
    {
        code: '📑',
        keywords: [
            'bookmark',
            'mark',
            'marker',
            'tabs',
        ],
        name: 'bookmark_tabs',
    },
    {
        code: '🔖',
        keywords: [
            'bookmark',
            'mark',
        ],
        name: 'bookmark',
    },
    {
        code: '🏷',
        keywords: [
            'label',
        ],
        name: 'label',
    },
    {
        code: '💰',
        keywords: [
            'bag',
            'dollar',
            'money',
            'moneybag',
        ],
        name: 'moneybag',
    },
    {
        code: '💴',
        keywords: [
            'bank',
            'banknote',
            'bill',
            'currency',
            'money',
            'note',
            'yen',
        ],
        name: 'yen',
    },
    {
        code: '💵',
        keywords: [
            'bank',
            'banknote',
            'bill',
            'currency',
            'dollar',
            'money',
            'note',
        ],
        name: 'dollar',
    },
    {
        code: '💶',
        keywords: [
            'bank',
            'banknote',
            'bill',
            'currency',
            'euro',
            'money',
            'note',
        ],
        name: 'euro',
    },
    {
        code: '💷',
        keywords: [
            'bank',
            'banknote',
            'bill',
            'currency',
            'money',
            'note',
            'pound',
        ],
        name: 'pound',
    },
    {
        code: '💸',
        keywords: [
            'bank',
            'banknote',
            'bill',
            'dollar',
            'fly',
            'money',
            'note',
            'wings',
        ],
        name: 'money_with_wings',
    },
    {
        code: '💳',
        keywords: [
            'bank',
            'card',
            'credit',
            'money',
        ],
        name: 'credit_card',
    },
    {
        code: '💹',
        keywords: [
            'bank',
            'chart',
            'currency',
            'graph',
            'growth',
            'market',
            'money',
            'rise',
            'trend',
            'upward',
            'yen',
        ],
        name: 'chart',
    },
    {
        code: '💱',
        keywords: [
            'bank',
            'currency',
            'exchange',
            'money',
        ],
        name: 'currency_exchange',
    },
    {
        code: '💲',
        keywords: [
            'currency',
            'dollar',
            'money',
        ],
        name: 'heavy_dollar_sign',
    },
    {
        code: '✉️',
        keywords: [
            'e-mail',
            'email',
            'envelope',
        ],
        name: 'envelope',
    },
    {
        code: '📧',
        keywords: [
            'communication',
            'e-mail',
            'email',
            'letter',
            'mail',
        ],
        name: 'email',
    },
    {
        code: '📨',
        keywords: [
            'communication',
            'e-mail',
            'email',
            'envelope',
            'incoming',
            'letter',
            'mail',
            'receive',
        ],
        name: 'incoming_envelope',
    },
    {
        code: '📩',
        keywords: [
            'arrow',
            'communication',
            'down',
            'e-mail',
            'email',
            'envelope',
            'letter',
            'mail',
            'outgoing',
            'sent',
        ],
        name: 'envelope_with_arrow',
    },
    {
        code: '📤',
        keywords: [
            'box',
            'communication',
            'letter',
            'mail',
            'outbox',
            'sent',
            'tray',
        ],
        name: 'outbox_tray',
    },
    {
        code: '📥',
        keywords: [
            'box',
            'communication',
            'inbox',
            'letter',
            'mail',
            'receive',
            'tray',
        ],
        name: 'inbox_tray',
    },
    {
        code: '📦',
        keywords: [
            'box',
            'communication',
            'package',
            'parcel',
        ],
        name: 'package',
    },
    {
        code: '📫',
        keywords: [
            'closed',
            'communication',
            'flag',
            'mail',
            'mailbox',
            'postbox',
        ],
        name: 'mailbox',
    },
    {
        code: '📪',
        keywords: [
            'closed',
            'communication',
            'flag',
            'lowered',
            'mail',
            'mailbox',
            'postbox',
        ],
        name: 'mailbox_closed',
    },
    {
        code: '📬',
        keywords: [
            'communication',
            'flag',
            'mail',
            'mailbox',
            'open',
            'postbox',
        ],
        name: 'mailbox_with_mail',
    },
    {
        code: '📭',
        keywords: [
            'communication',
            'flag',
            'lowered',
            'mail',
            'mailbox',
            'open',
            'postbox',
        ],
        name: 'mailbox_with_no_mail',
    },
    {
        code: '📮',
        keywords: [
            'communication',
            'mail',
            'mailbox',
            'postbox',
        ],
        name: 'postbox',
    },
    {
        code: '🗳',
        keywords: [
            'ballot',
            'box',
        ],
        name: 'ballot_box',
    },
    {
        code: '✏',
        keywords: [
            'pencil',
        ],
        name: 'pencil2',
    },
    {
        code: '✒️',
        keywords: [
            'nib',
            'pen',
        ],
        name: 'black_nib',
    },
    {
        code: '🖋',
        keywords: [
            'communication',
            'fountain',
            'pen',
        ],
        name: 'fountain_pen',
    },
    {
        code: '🖊',
        keywords: [
            'ballpoint',
            'communication',
            'pen',
        ],
        name: 'pen',
    },
    {
        code: '🖌',
        keywords: [
            'communication',
            'paintbrush',
            'painting',
        ],
        name: 'paintbrush',
    },
    {
        code: '🖍',
        keywords: [
            'communication',
            'crayon',
        ],
        name: 'crayon',
    },
    {
        code: '📝',
        keywords: [
            'communication',
            'memo',
            'pencil',
        ],
        name: 'memo',
    },
    {
        code: '💼',
        keywords: [
            'briefcase',
        ],
        name: 'briefcase',
    },
    {
        code: '📁',
        keywords: [
            'file',
            'folder',
        ],
        name: 'file_folder',
    },
    {
        code: '📂',
        keywords: [
            'file',
            'folder',
            'open',
        ],
        name: 'open_file_folder',
    },
    {
        code: '🗂',
        keywords: [
            'card',
            'dividers',
            'index',
        ],
        name: 'card_index_dividers',
    },
    {
        code: '📅',
        keywords: [
            'calendar',
            'date',
        ],
        name: 'date',
    },
    {
        code: '📆',
        keywords: [
            'calendar',
        ],
        name: 'calendar',
    },
    {
        code: '🗒',
        keywords: [
            'note',
            'pad',
            'spiral',
        ],
        name: 'spiral_notepad',
    },
    {
        code: '🗓',
        keywords: [
            'calendar',
            'pad',
            'spiral',
        ],
        name: 'spiral_calendar',
    },
    {
        code: '📇',
        keywords: [
            'card',
            'index',
            'rolodex',
        ],
        name: 'card_index',
    },
    {
        code: '📈',
        keywords: [
            'chart',
            'graph',
            'growth',
            'trend',
            'upward',
        ],
        name: 'chart_with_upwards_trend',
    },
    {
        code: '📉',
        keywords: [
            'chart',
            'down',
            'graph',
            'trend',
        ],
        name: 'chart_with_downwards_trend',
    },
    {
        code: '📊',
        keywords: [
            'bar',
            'chart',
            'graph',
        ],
        name: 'bar_chart',
    },
    {
        code: '📋',
        keywords: [
            'clipboard',
        ],
        name: 'clipboard',
    },
    {
        code: '📌',
        keywords: [
            'pin',
            'pushpin',
        ],
        name: 'pushpin',
    },
    {
        code: '📍',
        keywords: [
            'pin',
            'pushpin',
        ],
        name: 'round_pushpin',
    },
    {
        code: '📎',
        keywords: [
            'paperclip',
        ],
        name: 'paperclip',
    },
    {
        code: '🖇',
        keywords: [
            'communication',
            'link',
            'paperclip',
        ],
        name: 'paperclips',
    },
    {
        code: '📏',
        keywords: [
            'ruler',
            'straight edge',
        ],
        name: 'straight_ruler',
    },
    {
        code: '📐',
        keywords: [
            'ruler',
            'set',
            'triangle',
        ],
        name: 'triangular_ruler',
    },
    {
        code: '✂️',
        keywords: [
            'scissors',
            'tool',
        ],
        name: 'scissors',
    },
    {
        code: '🗃',
        keywords: [
            'box',
            'card',
            'file',
        ],
        name: 'card_file_box',
    },
    {
        code: '🗄',
        keywords: [
            'cabinet',
            'file',
        ],
        name: 'file_cabinet',
    },
    {
        code: '🗑',
        keywords: [
            'wastebasket',
        ],
        name: 'wastebasket',
    },
    {
        code: '🔒',
        keywords: [
            'closed',
            'lock',
        ],
        name: 'lock',
    },
    {
        code: '🔓',
        keywords: [
            'lock',
            'open',
            'unlock',
        ],
        name: 'unlock',
    },
    {
        code: '🔏',
        keywords: [
            'ink',
            'lock',
            'nib',
            'pen',
            'privacy',
        ],
        name: 'lock_with_ink_pen',
    },
    {
        code: '🔐',
        keywords: [
            'closed',
            'key',
            'lock',
            'secure',
        ],
        name: 'closed_lock_with_key',
    },
    {
        code: '🔑',
        keywords: [
            'key',
            'lock',
            'password',
        ],
        name: 'key',
    },
    {
        code: '🗝',
        keywords: [
            'clue',
            'key',
            'lock',
            'old',
        ],
        name: 'old_key',
    },
    {
        code: '🔨',
        keywords: [
            'hammer',
            'tool',
        ],
        name: 'hammer',
    },
    {
        code: '⛏',
        keywords: [
            'mining',
            'pick',
            'tool',
        ],
        name: 'pick',
    },
    {
        code: '⚒️',
        keywords: [
            'hammer',
            'pick',
            'tool',
        ],
        name: 'hammer_and_pick',
    },
    {
        code: '🛠',
        keywords: [
            'hammer',
            'tool',
            'wrench',
        ],
        name: 'hammer_and_wrench',
    },
    {
        code: '🗡',
        keywords: [
            'dagger',
            'knife',
            'weapon',
        ],
        name: 'dagger',
    },
    {
        code: '⚔️',
        keywords: [
            'crossed',
            'swords',
            'weapon',
        ],
        name: 'crossed_swords',
    },
    {
        code: '🔫',
        keywords: [
            'gun',
            'handgun',
            'pistol',
            'revolver',
            'tool',
            'weapon',
        ],
        name: 'gun',
    },
    {
        code: '🏹',
        keywords: [
            'archer',
            'arrow',
            'bow',
            'sagittarius',
            'tool',
            'weapon',
            'zodiac',
        ],
        name: 'bow_and_arrow',
    },
    {
        code: '🛡',
        keywords: [
            'shield',
            'weapon',
        ],
        name: 'shield',
    },
    {
        code: '🔧',
        keywords: [
            'tool',
            'wrench',
        ],
        name: 'wrench',
    },
    {
        code: '🔩',
        keywords: [
            'bolt',
            'nut',
            'tool',
        ],
        name: 'nut_and_bolt',
    },
    {
        code: '⚙️',
        keywords: [
            'gear',
            'tool',
        ],
        name: 'gear',
    },
    {
        code: '🗜',
        keywords: [
            'compression',
            'tool',
            'vice',
        ],
        name: 'clamp',
    },
    {
        code: '⚗️',
        keywords: [
            'alembic',
            'chemistry',
            'tool',
        ],
        name: 'alembic',
    },
    {
        code: '⚖️',
        keywords: [
            'balance',
            'justice',
            'libra',
            'scales',
            'tool',
            'weight',
            'zodiac',
        ],
        name: 'balance_scale',
    },
    {
        code: '🔗',
        keywords: [
            'link',
        ],
        name: 'link',
    },
    {
        code: '⛓',
        keywords: [
            'chain',
        ],
        name: 'chains',
    },
    {
        code: '💉',
        keywords: [
            'doctor',
            'medicine',
            'needle',
            'shot',
            'sick',
            'syringe',
            'tool',
        ],
        name: 'syringe',
    },
    {
        code: '💊',
        keywords: [
            'doctor',
            'medicine',
            'pill',
            'sick',
        ],
        name: 'pill',
    },
    {
        code: '🚬',
        keywords: [
            'activity',
            'smoking',
        ],
        name: 'smoking',
    },
    {
        code: '⚰',
        keywords: [
            'coffin',
            'death',
        ],
        name: 'coffin',
    },
    {
        code: '⚱',
        keywords: [
            'death',
            'funeral',
            'urn',
        ],
        name: 'funeral_urn',
    },
    {
        code: '🗿',
        keywords: [
            'face',
            'moyai',
            'statue',
        ],
        name: 'moyai',
    },
    {
        code: '🛢',
        keywords: [
            'drum',
            'oil',
        ],
        name: 'oil_drum',
    },
    {
        code: '🔮',
        keywords: [
            'ball',
            'crystal',
            'fairy tale',
            'fantasy',
            'fortune',
            'tool',
        ],
        name: 'crystal_ball',
    },
    {
        code: '🛒',
        keywords: [
            'cart',
            'shopping',
            'trolley',
        ],
        name: 'shopping_cart',
    },
    {
        code: 'symbols',
        header: true,
    },
    {
        code: '🏧',
        keywords: [
            'atm',
            'automated',
            'bank',
            'teller',
        ],
        name: 'atm',
    },
    {
        code: '🚮',
        keywords: [
            'litter',
            'litterbox',
        ],
        name: 'put_litter_in_its_place',
    },
    {
        code: '🚰',
        keywords: [
            'drink',
            'potable',
            'water',
        ],
        name: 'potable_water',
    },
    {
        code: '♿',
        keywords: [
            'access',
            'wheelchair',
        ],
        name: 'wheelchair',
    },
    {
        code: '🚹',
        keywords: [
            'lavatory',
            'man',
            'restroom',
            'wc',
        ],
        name: 'mens',
    },
    {
        code: '🚺',
        keywords: [
            'lavatory',
            'restroom',
            'wc',
            'woman',
        ],
        name: 'womens',
    },
    {
        code: '🚻',
        keywords: [
            'lavatory',
            'restroom',
            'wc',
        ],
        name: 'restroom',
    },
    {
        code: '🚼',
        keywords: [
            'baby',
            'changing',
        ],
        name: 'baby_symbol',
    },
    {
        code: '🚾',
        keywords: [
            'closet',
            'lavatory',
            'restroom',
            'water',
            'wc',
        ],
        name: 'wc',
    },
    {
        code: '🛂',
        keywords: [
            'control',
            'passport',
        ],
        name: 'passport_control',
    },
    {
        code: '🛃',
        keywords: [
            'customs',
        ],
        name: 'customs',
    },
    {
        code: '🛄',
        keywords: [
            'baggage',
            'claim',
        ],
        name: 'baggage_claim',
    },
    {
        code: '🛅',
        keywords: [
            'baggage',
            'left luggage',
            'locker',
            'luggage',
        ],
        name: 'left_luggage',
    },
    {
        code: '⚠',
        keywords: [
            'warning',
        ],
        name: 'warning',
    },
    {
        code: '🚸',
        keywords: [
            'child',
            'crossing',
            'pedestrian',
            'traffic',
        ],
        name: 'children_crossing',
    },
    {
        code: '⛔',
        keywords: [
            'entry',
            'forbidden',
            'no',
            'not',
            'prohibited',
            'traffic',
        ],
        name: 'no_entry',
    },
    {
        code: '🚫',
        keywords: [
            'entry',
            'forbidden',
            'no',
            'not',
            'prohibited',
        ],
        name: 'no_entry_sign',
    },
    {
        code: '🚳',
        keywords: [
            'bicycle',
            'bike',
            'forbidden',
            'no',
            'not',
            'prohibited',
            'vehicle',
        ],
        name: 'no_bicycles',
    },
    {
        code: '🚭',
        keywords: [
            'forbidden',
            'no',
            'not',
            'prohibited',
            'smoking',
        ],
        name: 'no_smoking',
    },
    {
        code: '🚯',
        keywords: [
            'forbidden',
            'litter',
            'no',
            'not',
            'prohibited',
        ],
        name: 'do_not_litter',
    },
    {
        code: '🚱',
        keywords: [
            'drink',
            'forbidden',
            'no',
            'not',
            'potable',
            'prohibited',
            'water',
        ],
        name: 'non',
    },
    {
        code: '🚷',
        keywords: [
            'forbidden',
            'no',
            'not',
            'pedestrian',
            'prohibited',
        ],
        name: 'no_pedestrians',
    },
    {
        code: '📵',
        keywords: [
            'cell',
            'communication',
            'forbidden',
            'mobile',
            'no',
            'not',
            'phone',
            'prohibited',
            'telephone',
        ],
        name: 'no_mobile_phones',
    },
    {
        code: '🔞',
        keywords: [
            '18',
            'age restriction',
            'eighteen',
            'forbidden',
            'no',
            'not',
            'prohibited',
            'underage',
        ],
        name: 'underage',
    },
    {
        code: '☢️',
        keywords: [
            'radioactive',
        ],
        name: 'radioactive',
    },
    {
        code: '☣️',
        keywords: [
            'biohazard',
        ],
        name: 'biohazard',
    },
    {
        code: '⬆',
        keywords: [
            'arrow',
            'cardinal',
            'direction',
            'north',
        ],
        name: 'arrow_up',
    },
    {
        code: '↗️',
        keywords: [
            'arrow',
            'direction',
            'intercardinal',
            'northeast',
        ],
        name: 'arrow_upper_right',
    },
    {
        code: '➡',
        keywords: [
            'arrow',
            'cardinal',
            'direction',
            'east',
        ],
        name: 'arrow_right',
    },
    {
        code: '↘️',
        keywords: [
            'arrow',
            'direction',
            'intercardinal',
            'southeast',
        ],
        name: 'arrow_lower_right',
    },
    {
        code: '⬇',
        keywords: [
            'arrow',
            'cardinal',
            'direction',
            'down',
            'south',
        ],
        name: 'arrow_down',
    },
    {
        code: '↙️',
        keywords: [
            'arrow',
            'direction',
            'intercardinal',
            'southwest',
        ],
        name: 'arrow_lower_left',
    },
    {
        code: '⬅',
        keywords: [
            'arrow',
            'cardinal',
            'direction',
            'west',
        ],
        name: 'arrow_left',
    },
    {
        code: '↖️',
        keywords: [
            'arrow',
            'direction',
            'intercardinal',
            'northwest',
        ],
        name: 'arrow_upper_left',
    },
    {
        code: '↕️',
        keywords: [
            'arrow',
        ],
        name: 'arrow_up_down',
    },
    {
        code: '↔️',
        keywords: [
            'arrow',
        ],
        name: 'left_right_arrow',
    },
    {
        code: '↩',
        keywords: [
            'arrow',
        ],
        name: 'leftwards_arrow_with_hook',
    },
    {
        code: '↪',
        keywords: [
            'arrow',
        ],
        name: 'arrow_right_hook',
    },
    {
        code: '⤴️',
        keywords: [
            'arrow',
            'up',
        ],
        name: 'arrow_heading_up',
    },
    {
        code: '⤵️',
        keywords: [
            'arrow',
            'down',
        ],
        name: 'arrow_heading_down',
    },
    {
        code: '🔃',
        keywords: [
            'arrow',
            'clockwise',
            'reload',
        ],
        name: 'arrows_clockwise',
    },
    {
        code: '🔄',
        keywords: [
            'anticlockwise',
            'arrow',
            'counterclockwise',
            'withershins',
        ],
        name: 'arrows_counterclockwise',
    },
    {
        code: '🔙',
        keywords: [
            'arrow',
            'back',
        ],
        name: 'back',
    },
    {
        code: '🔚',
        keywords: [
            'arrow',
            'end',
        ],
        name: 'end',
    },
    {
        code: '🔛',
        keywords: [
            'arrow',
            'mark',
            'on',
        ],
        name: 'on',
    },
    {
        code: '🔜',
        keywords: [
            'arrow',
            'soon',
        ],
        name: 'soon',
    },
    {
        code: '🔝',
        keywords: [
            'arrow',
            'top',
            'up',
        ],
        name: 'top',
    },
    {
        code: '🛐',
        keywords: [
            'religion',
            'worship',
        ],
        name: 'place_of_worship',
    },
    {
        code: '⚛',
        keywords: [
            'atheist',
            'atom',
        ],
        name: 'atom_symbol',
    },
    {
        code: '🕉',
        keywords: [
            'hindu',
            'om',
            'religion',
        ],
        name: 'om',
    },
    {
        code: '✡️',
        keywords: [
            'david',
            'jew',
            'jewish',
            'religion',
            'star',
        ],
        name: 'star_of_david',
    },
    {
        code: '☸️',
        keywords: [
            'buddhist',
            'dharma',
            'religion',
            'wheel',
        ],
        name: 'wheel_of_dharma',
    },
    {
        code: '☯',
        keywords: [
            'religion',
            'tao',
            'taoist',
            'yang',
            'yin',
        ],
        name: 'yin_yang',
    },
    {
        code: '☦️',
        keywords: [
            'christian',
            'cross',
            'religion',
        ],
        name: 'orthodox_cross',
    },
    {
        code: '☦',
        keywords: [
            'christian',
            'cross',
            'religion',
        ],
        name: 'latin_cross',
    },
    {
        code: '☪',
        keywords: [
            'islam',
            'muslim',
            'religion',
        ],
        name: 'star_and_crescent',
    },
    {
        code: '☮',
        keywords: [
            'peace',
        ],
        name: 'peace_symbol',
    },
    {
        code: '🕎',
        keywords: [
            'candelabrum',
            'candlestick',
            'menorah',
            'religion',
        ],
        name: 'menorah',
    },
    {
        code: '🔯',
        keywords: [
            'fortune',
            'star',
        ],
        name: 'six_pointed_star',
    },
    {
        code: '♻',
        keywords: [
            'recycle',
        ],
        name: 'recycle',
    },
    {
        code: '📛',
        keywords: [
            'badge',
            'name',
        ],
        name: 'name_badge',
    },
    {
        code: '⚜',
        keywords: [
            'fleur-de-lis',
        ],
        name: 'fleur_de_lis',
    },
    {
        code: '🔰',
        keywords: [
            'beginner',
            'chevron',
            'green',
            'japanese',
            'leaf',
            'tool',
            'yellow',
        ],
        name: 'beginner',
    },
    {
        code: '🔱',
        keywords: [
            'anchor',
            'emblem',
            'ship',
            'tool',
            'trident',
        ],
        name: 'trident',
    },
    {
        code: '⭕',
        keywords: [
            'circle',
            'o',
        ],
        name: 'o',
    },
    {
        code: '✅',
        keywords: [
            'check',
            'mark',
        ],
        name: 'white_check_mark',
    },
    {
        code: '☑️',
        keywords: [
            'ballot',
            'box',
            'check',
        ],
        name: 'ballot_box_with_check',
    },
    {
        code: '✔️',
        keywords: [
            'check',
            'mark',
        ],
        name: 'heavy_check_mark',
    },
    {
        code: '✖️',
        keywords: [
            'cancel',
            'multiplication',
            'multiply',
            'x',
        ],
        name: 'heavy_multiplication_x',
    },
    {
        code: '❌',
        keywords: [
            'cancel',
            'mark',
            'multiplication',
            'multiply',
            'x',
        ],
        name: 'x',
    },
    {
        code: '❎',
        keywords: [
            'mark',
            'square',
        ],
        name: 'negative_squared_cross_mark',
    },
    {
        code: '➕',
        keywords: [
            'math',
            'plus',
        ],
        name: 'heavy_plus_sign',
    },
    {
        code: '➖',
        keywords: [
            'math',
            'minus',
        ],
        name: 'heavy_minus_sign',
    },
    {
        code: '➗',
        keywords: [
            'division',
            'math',
        ],
        name: 'heavy_division_sign',
    },
    {
        code: '➰',
        keywords: [
            'curl',
            'loop',
        ],
        name: 'curly_loop',
    },
    {
        code: '➿',
        keywords: [
            'curl',
            'double',
            'loop',
        ],
        name: 'loop',
    },
    {
        code: '〽',
        keywords: [
            'mark',
            'part',
        ],
        name: 'part_alternation_mark',
    },
    {
        code: '✳️',
        keywords: [
            'asterisk',
        ],
        name: 'eight_spoked_asterisk',
    },
    {
        code: '✴️',
        keywords: [
            'star',
        ],
        name: 'eight_pointed_black_star',
    },
    {
        code: '❇️',
        keywords: [
            'sparkle',
        ],
        name: 'sparkle',
    },
    {
        code: '‼',
        keywords: [
            'bangbang',
            'exclamation',
            'mark',
            'punctuation',
        ],
        name: 'bangbang',
    },
    {
        code: '⁉️',
        keywords: [
            'exclamation',
            'interrobang',
            'mark',
            'punctuation',
            'question',
        ],
        name: 'interrobang',
    },
    {
        code: '❓',
        keywords: [
            'mark',
            'punctuation',
            'question',
        ],
        name: 'question',
    },
    {
        code: '❔',
        keywords: [
            'mark',
            'outlined',
            'punctuation',
            'question',
        ],
        name: 'grey_question',
    },
    {
        code: '❕',
        keywords: [
            'exclamation',
            'mark',
            'outlined',
            'punctuation',
        ],
        name: 'grey_exclamation',
    },
    {
        code: '❗',
        keywords: [
            'exclamation',
            'mark',
            'punctuation',
        ],
        name: 'exclamation',
    },
    {
        code: '〰️',
        keywords: [
            'dash',
            'punctuation',
            'wavy',
        ],
        name: 'wavy_dash',
    },
    {
        code: '©',
        keywords: [
            'copyright',
        ],
        name: 'copyright',
    },
    {
        code: '®',
        keywords: [
            'registered',
        ],
        name: 'registered',
    },
    {
        code: '™️',
        keywords: [
            'mark',
            'tm',
            'trademark',
        ],
        name: 'tm',
    },
    {
        code: '♈',
        keywords: [
            'aries',
            'ram',
            'zodiac',
        ],
        name: 'aries',
    },
    {
        code: '♉',
        keywords: [
            'bull',
            'ox',
            'taurus',
            'zodiac',
        ],
        name: 'taurus',
    },
    {
        code: '♊',
        keywords: [
            'gemini',
            'twins',
            'zodiac',
        ],
        name: 'gemini',
    },
    {
        code: '♋',
        keywords: [
            'cancer',
            'crab',
            'zodiac',
        ],
        name: 'cancer',
    },
    {
        code: '♌',
        keywords: [
            'leo',
            'lion',
            'zodiac',
        ],
        name: 'leo',
    },
    {
        code: '♍',
        keywords: [
            'maiden',
            'virgin',
            'virgo',
            'zodiac',
        ],
        name: 'virgo',
    },
    {
        code: '♎',
        keywords: [
            'balance',
            'justice',
            'libra',
            'scales',
            'zodiac',
        ],
        name: 'libra',
    },
    {
        code: '♏',
        keywords: [
            'scorpio',
            'scorpion',
            'scorpius',
            'zodiac',
        ],
        name: 'scorpius',
    },
    {
        code: '♐',
        keywords: [
            'archer',
            'sagittarius',
            'zodiac',
        ],
        name: 'sagittarius',
    },
    {
        code: '♑',
        keywords: [
            'capricorn',
            'goat',
            'zodiac',
        ],
        name: 'capricorn',
    },
    {
        code: '♒',
        keywords: [
            'aquarius',
            'bearer',
            'water',
            'zodiac',
        ],
        name: 'aquarius',
    },
    {
        code: '♓',
        keywords: [
            'fish',
            'pisces',
            'zodiac',
        ],
        name: 'pisces',
    },
    {
        code: '⛎',
        keywords: [
            'bearer',
            'ophiuchus',
            'serpent',
            'snake',
            'zodiac',
        ],
        name: 'ophiuchus',
    },
    {
        code: '🔀',
        keywords: [
            'arrow',
            'crossed',
        ],
        name: 'twisted_rightwards_arrows',
    },
    {
        code: '🔁',
        keywords: [
            'arrow',
            'clockwise',
            'repeat',
        ],
        name: 'repeat',
    },
    {
        code: '🔂',
        keywords: [
            'arrow',
            'clockwise',
            'once',
        ],
        name: 'repeat_one',
    },
    {
        code: '▶',
        keywords: [
            'arrow',
            'play',
            'right',
            'triangle',
        ],
        name: 'arrow_forward',
    },
    {
        code: '⏩',
        keywords: [
            'arrow',
            'double',
            'fast',
            'forward',
        ],
        name: 'fast_forward',
    },
    {
        code: '⏭',
        keywords: [
            'arrow',
            'next scene',
            'next track',
            'triangle',
        ],
        name: 'next_track_button',
    },
    {
        code: '⏯',
        keywords: [
            'arrow',
            'pause',
            'play',
            'right',
            'triangle',
        ],
        name: 'play_or_pause_button',
    },
    {
        code: '◀',
        keywords: [
            'arrow',
            'left',
            'reverse',
            'triangle',
        ],
        name: 'arrow_backward',
    },
    {
        code: '⏪',
        keywords: [
            'arrow',
            'double',
            'rewind',
        ],
        name: 'rewind',
    },
    {
        code: '⏮',
        keywords: [
            'arrow',
            'previous scene',
            'previous track',
            'triangle',
        ],
        name: 'previous_track_button',
    },
    {
        code: '🔼',
        keywords: [
            'arrow',
            'button',
            'red',
        ],
        name: 'arrow_up_small',
    },
    {
        code: '⏫',
        keywords: [
            'arrow',
            'double',
        ],
        name: 'arrow_double_up',
    },
    {
        code: '🔽',
        keywords: [
            'arrow',
            'button',
            'down',
            'red',
        ],
        name: 'arrow_down_small',
    },
    {
        code: '⏬',
        keywords: [
            'arrow',
            'double',
            'down',
        ],
        name: 'arrow_double_down',
    },
    {
        code: '⏸',
        keywords: [
            'bar',
            'double',
            'pause',
            'vertical',
        ],
        name: 'pause_button',
    },
    {
        code: '⏹',
        keywords: [
            'square',
            'stop',
        ],
        name: 'stop_button',
    },
    {
        code: '⏺',
        keywords: [
            'circle',
            'record',
        ],
        name: 'record_button',
    },
    {
        code: '⏏',
        keywords: [
            'eject',
        ],
        name: 'eject_button',
    },
    {
        code: '🎦',
        keywords: [
            'activity',
            'camera',
            'cinema',
            'entertainment',
            'film',
            'movie',
        ],
        name: 'cinema',
    },
    {
        code: '🔅',
        keywords: [
            'brightness',
            'dim',
            'low',
        ],
        name: 'low_brightness',
    },
    {
        code: '🔆',
        keywords: [
            'bright',
            'brightness',
        ],
        name: 'high_brightness',
    },
    {
        code: '📶',
        keywords: [
            'antenna',
            'bar',
            'cell',
            'communication',
            'mobile',
            'phone',
            'signal',
            'telephone',
        ],
        name: 'signal_strength',
    },
    {
        code: '📳',
        keywords: [
            'cell',
            'communication',
            'mobile',
            'mode',
            'phone',
            'telephone',
            'vibration',
        ],
        name: 'vibration_mode',
    },
    {
        code: '📴',
        keywords: [
            'cell',
            'communication',
            'mobile',
            'off',
            'phone',
            'telephone',
        ],
        name: 'mobile_phone_off',
    },
    {
        code: '#️⃣',
        keywords: [
            'hash',
            'keycap',
            'pound',
        ],
        name: 'hash',
    },
    {
        code: '*️⃣',
        keywords: [
            'asterisk',
            'keycap',
            'star',
        ],
        name: 'asterisk',
    },
    {
        code: '0️⃣',
        keywords: [
            '0',
            'keycap',
            'zero',
        ],
        name: 'zero',
    },
    {
        code: '1️⃣',
        keywords: [
            '1',
            'keycap',
            'one',
        ],
        name: 'one',
    },
    {
        code: '2️⃣',
        keywords: [
            '2',
            'keycap',
            'two',
        ],
        name: 'two',
    },
    {
        code: '3️⃣',
        keywords: [
            '3',
            'keycap',
            'three',
        ],
        name: 'three',
    },
    {
        code: '4️⃣',
        keywords: [
            '4',
            'four',
            'keycap',
        ],
        name: 'four',
    },
    {
        code: '5️⃣',
        keywords: [
            '5',
            'five',
            'keycap',
        ],
        name: 'five',
    },
    {
        code: '6️⃣',
        keywords: [
            '6',
            'keycap',
            'six',
        ],
        name: 'six',
    },
    {
        code: '7️⃣',
        keywords: [
            '7',
            'keycap',
            'seven',
        ],
        name: 'seven',
    },
    {
        code: '8️⃣',
        keywords: [
            '8',
            'eight',
            'keycap',
        ],
        name: 'eight',
    },
    {
        code: '9️⃣',
        keywords: [
            '9',
            'keycap',
            'nine',
        ],
        name: 'nine',
    },
    {
        code: '🔟',
        keywords: [
            '10',
            'keycap',
            'ten',
        ],
        name: 'keycap_ten',
    },
    {
        code: '💯',
        keywords: [
            '100',
            'full',
            'hundred',
            'score',
        ],
        name: '100',
    },
    {
        code: '🔠',
        keywords: [
            'input',
            'latin',
            'letters',
            'uppercase',
        ],
        name: 'capital_abcd',
    },
    {
        code: '🔡',
        keywords: [
            'abcd',
            'input',
            'latin',
            'letters',
            'lowercase',
        ],
        name: 'abcd',
    },
    {
        code: '🔢',
        keywords: [
            '1234',
            'input',
            'numbers',
        ],
        name: '1234',
    },
    {
        code: '🔣',
        keywords: [
            'input',
        ],
        name: 'symbols',
    },
    {
        code: '🔤',
        keywords: [
            'abc',
            'alphabet',
            'input',
            'latin',
            'letters',
        ],
        name: 'abc',
    },
    {
        code: '🅰',
        keywords: [
            'a',
            'blood',
        ],
        name: 'a',
    },
    {
        code: '🆎',
        keywords: [
            'ab',
            'blood',
        ],
        name: 'ab',
    },
    {
        code: '🅱',
        keywords: [
            'b',
            'blood',
        ],
        name: 'b',
    },
    {
        code: '🆑',
        keywords: [
            'cl',
        ],
        name: 'cl',
    },
    {
        code: '🆒',
        keywords: [
            'cool',
        ],
        name: 'cool',
    },
    {
        code: '🆓',
        keywords: [
            'free',
        ],
        name: 'free',
    },
    {
        code: 'ℹ️',
        keywords: [
            'i',
            'information',
        ],
        name: 'information_source',
    },
    {
        code: '🆔',
        keywords: [
            'id',
            'identity',
        ],
        name: 'id',
    },
    {
        code: 'Ⓜ',
        keywords: [
            'circle',
            'm',
        ],
        name: 'm',
    },
    {
        code: '🆕',
        keywords: [
            'new',
        ],
        name: 'new',
    },
    {
        code: '🆖',
        keywords: [
            'ng',
        ],
        name: 'ng',
    },
    {
        code: '🅾',
        keywords: [
            'blood',
            'o',
        ],
        name: 'o2',
    },
    {
        code: '🆗',
        keywords: [
            'ok',
        ],
        name: 'ok',
    },
    {
        code: '🅿',
        keywords: [
            'parking',
        ],
        name: 'parking',
    },
    {
        code: '🆘',
        keywords: [
            'help',
            'sos',
        ],
        name: 'sos',
    },
    {
        code: '🆙',
        keywords: [
            'mark',
            'up',
        ],
        name: 'up',
    },
    {
        code: '🆚',
        keywords: [
            'versus',
            'vs',
        ],
        name: 'vs',
    },
    {
        code: '🈁',
        keywords: [
            'japanese',
        ],
        name: 'koko',
    },
    {
        code: '🈂',
        keywords: [
            'japanese',
        ],
        name: 'sa',
    },
    {
        code: '🈷',
        keywords: [
            'japanese',
        ],
        name: 'u6708',
    },
    {
        code: '🈶',
        keywords: [
            'japanese',
        ],
        name: 'u6709',
    },
    {
        code: '🈯',
        keywords: [
            'japanese',
        ],
        name: 'u6307',
    },
    {
        code: '🉐',
        keywords: [
            'japanese',
        ],
        name: 'ideograph_advantage',
    },
    {
        code: '🈹',
        keywords: [
            'japanese',
        ],
        name: 'u5272',
    },
    {
        code: '🈚',
        keywords: [
            'japanese',
        ],
        name: 'u7121',
    },
    {
        code: '🈲',
        keywords: [
            'japanese',
        ],
        name: 'u7981',
    },
    {
        code: '🉑',
        keywords: [
            'chinese',
        ],
        name: 'accept',
    },
    {
        code: '🈸',
        keywords: [
            'chinese',
        ],
        name: 'u7533',
    },
    {
        code: '🈴',
        keywords: [
            'chinese',
        ],
        name: 'u5408',
    },
    {
        code: '🈳',
        keywords: [
            'chinese',
        ],
        name: 'u7a7a',
    },
    {
        code: '㊗️',
        keywords: [
            'chinese',
            'congratulation',
            'congratulations',
            'ideograph',
        ],
        name: 'congratulations',
    },
    {
        code: '㊙️',
        keywords: [
            'chinese',
            'ideograph',
            'secret',
        ],
        name: 'secret',
    },
    {
        code: '🈺',
        keywords: [
            'chinese',
        ],
        name: 'u55b6',
    },
    {
        code: '🈵',
        keywords: [
            'chinese',
        ],
        name: 'u6e80',
    },
    {
        code: '▪',
        keywords: [
            'geometric',
            'square',
        ],
        name: 'black_small_square',
    },
    {
        code: '▫',
        keywords: [
            'geometric',
            'square',
        ],
        name: 'white_small_square',
    },
    {
        code: '◻',
        keywords: [
            'geometric',
            'square',
        ],
        name: 'white_medium_square',
    },
    {
        code: '◼',
        keywords: [
            'geometric',
            'square',
        ],
        name: 'black_medium_square',
    },
    {
        code: '◽',
        keywords: [
            'geometric',
            'square',
        ],
        name: 'white_medium_small_square',
    },
    {
        code: '◾',
        keywords: [
            'geometric',
            'square',
        ],
        name: 'black_medium_small_square',
    },
    {
        code: '⬛',
        keywords: [
            'geometric',
            'square',
        ],
        name: 'black_large_square',
    },
    {
        code: '⬜',
        keywords: [
            'geometric',
            'square',
        ],
        name: 'white_large_square',
    },
    {
        code: '🔶',
        keywords: [
            'diamond',
            'geometric',
            'orange',
        ],
        name: 'large_orange_diamond',
    },
    {
        code: '🔷',
        keywords: [
            'blue',
            'diamond',
            'geometric',
        ],
        name: 'large_blue_diamond',
    },
    {
        code: '🔸',
        keywords: [
            'diamond',
            'geometric',
            'orange',
        ],
        name: 'small_orange_diamond',
    },
    {
        code: '🔹',
        keywords: [
            'blue',
            'diamond',
            'geometric',
        ],
        name: 'small_blue_diamond',
    },
    {
        code: '🔺',
        keywords: [
            'geometric',
            'red',
        ],
        name: 'small_red_triangle',
    },
    {
        code: '🔻',
        keywords: [
            'down',
            'geometric',
            'red',
        ],
        name: 'small_red_triangle_down',
    },
    {
        code: '💠',
        keywords: [
            'comic',
            'diamond',
            'geometric',
            'inside',
        ],
        name: 'diamond_shape_with_a_dot_inside',
    },
    {
        code: '🔘',
        keywords: [
            'button',
            'geometric',
            'radio',
        ],
        name: 'radio_button',
    },
    {
        code: '🔲',
        keywords: [
            'button',
            'geometric',
            'square',
        ],
        name: 'black_square_button',
    },
    {
        code: '🔳',
        keywords: [
            'button',
            'geometric',
            'outlined',
            'square',
        ],
        name: 'white_square_button',
    },
    {
        code: '⚪',
        keywords: [
            'circle',
            'geometric',
        ],
        name: 'white_circle',
    },
    {
        code: '⚫',
        keywords: [
            'circle',
            'geometric',
        ],
        name: 'black_circle',
    },
    {
        code: '🔴',
        keywords: [
            'circle',
            'geometric',
            'red',
        ],
        name: 'red_circle',
    },
    {
        code: '🔵',
        keywords: [
            'blue',
            'circle',
            'geometric',
        ],
        name: 'large_blue_circle',
    },
    {
        code: 'flags',
        header: true,
    },
    {
        code: '🏁',
        keywords: [
            'checkered',
            'chequered',
            'flag',
            'racing',
        ],
        name: 'checkered_flag',
    },
    {
        code: '🚩',
        keywords: [
            'flag',
            'post',
        ],
        name: 'triangular_flag_on_post',
    },
    {
        code: '🎌',
        keywords: [
            'activity',
            'celebration',
            'cross',
            'crossed',
            'flag',
            'japanese',
        ],
        name: 'crossed_flags',
    },
    {
        code: '🏴',
        keywords: [
            'flag',
            'waving',
        ],
        name: 'black_flag',
    },
    {
        code: '🏳',
        keywords: [
            'flag',
            'waving',
        ],
        name: 'white_flag',
    },
    {
        code: '🇦🇨',
        keywords: [
            'ascension',
            'flag',
            'island',
        ],
        name: 'ascension_island',
    },
    {
        code: '🇦🇩',
        keywords: [
            'andorra',
            'flag',
        ],
        name: 'andorra',
    },
    {
        code: '🇦🇪',
        keywords: [
            'emirates',
            'flag',
            'uae',
            'united',
        ],
        name: 'united_arab_emirates',
    },
    {
        code: '🇦🇫',
        keywords: [
            'afghanistan',
            'flag',
        ],
        name: 'afghanistan',
    },
    {
        code: '🇦🇬',
        keywords: [
            'antigua',
            'barbuda',
            'flag',
        ],
        name: 'antigua_barbuda',
    },
    {
        code: '🇦🇮',
        keywords: [
            'anguilla',
            'flag',
        ],
        name: 'anguilla',
    },
    {
        code: '🇦🇱',
        keywords: [
            'albania',
            'flag',
        ],
        name: 'albania',
    },
    {
        code: '🇦🇲',
        keywords: [
            'armenia',
            'flag',
        ],
        name: 'armenia',
    },
    {
        code: '🇦🇴',
        keywords: [
            'angola',
            'flag',
        ],
        name: 'angola',
    },
    {
        code: '🇦🇶',
        keywords: [
            'antarctica',
            'flag',
        ],
        name: 'antarctica',
    },
    {
        code: '🇦🇷',
        keywords: [
            'argentina',
            'flag',
        ],
        name: 'argentina',
    },
    {
        code: '🇦🇸',
        keywords: [
            'american',
            'flag',
            'samoa',
        ],
        name: 'american_samoa',
    },
    {
        code: '🇦🇹',
        keywords: [
            'austria',
            'flag',
        ],
        name: 'austria',
    },
    {
        code: '🇦🇺',
        keywords: [
            'australia',
            'flag',
        ],
        name: 'australia',
    },
    {
        code: '🇦🇼',
        keywords: [
            'aruba',
            'flag',
        ],
        name: 'aruba',
    },
    {
        code: '🇦🇽',
        keywords: [
            'åland',
            'flag',
        ],
        name: 'aland_islands',
    },
    {
        code: '🇦🇿',
        keywords: [
            'azerbaijan',
            'flag',
        ],
        name: 'azerbaijan',
    },
    {
        code: '🇧🇦',
        keywords: [
            'bosnia',
            'flag',
            'herzegovina',
        ],
        name: 'bosnia_herzegovina',
    },
    {
        code: '🇧🇧',
        keywords: [
            'barbados',
            'flag',
        ],
        name: 'barbados',
    },
    {
        code: '🇧🇩',
        keywords: [
            'bangladesh',
            'flag',
        ],
        name: 'bangladesh',
    },
    {
        code: '🇧🇪',
        keywords: [
            'belgium',
            'flag',
        ],
        name: 'belgium',
    },
    {
        code: '🇧🇫',
        keywords: [
            'burkina faso',
            'flag',
        ],
        name: 'burkina_faso',
    },
    {
        code: '🇧🇬',
        keywords: [
            'bulgaria',
            'flag',
        ],
        name: 'bulgaria',
    },
    {
        code: '🇧🇭',
        keywords: [
            'bahrain',
            'flag',
        ],
        name: 'bahrain',
    },
    {
        code: '🇧🇮',
        keywords: [
            'burundi',
            'flag',
        ],
        name: 'burundi',
    },
    {
        code: '🇧🇯',
        keywords: [
            'benin',
            'flag',
        ],
        name: 'benin',
    },
    {
        code: '🇧🇱',
        keywords: [
            'barthelemy',
            'barthélemy',
            'flag',
            'saint',
        ],
        name: 'st_barthelemy',
    },
    {
        code: '🇧🇲',
        keywords: [
            'bermuda',
            'flag',
        ],
        name: 'bermuda',
    },
    {
        code: '🇧🇳',
        keywords: [
            'brunei',
            'darussalam',
            'flag',
        ],
        name: 'brunei',
    },
    {
        code: '🇧🇴',
        keywords: [
            'bolivia',
            'flag',
        ],
        name: 'bolivia',
    },
    {
        code: '🇧🇶',
        keywords: [
            'bonaire',
            'caribbean',
            'eustatius',
            'flag',
            'netherlands',
            'saba',
            'sint',
        ],
        name: 'caribbean_netherlands',
    },
    {
        code: '🇧🇷',
        keywords: [
            'brazil',
            'flag',
        ],
        name: 'brazil',
    },
    {
        code: '🇧🇸',
        keywords: [
            'bahamas',
            'flag',
        ],
        name: 'bahamas',
    },
    {
        code: '🇧🇹',
        keywords: [
            'bhutan',
            'flag',
        ],
        name: 'bhutan',
    },
    {
        code: '🇧🇻',
        keywords: [
            'bouvet',
            'flag',
            'island',
        ],
        name: 'bouvet_island',
    },
    {
        code: '🇧🇼',
        keywords: [
            'botswana',
            'flag',
        ],
        name: 'botswana',
    },
    {
        code: '🇧🇾',
        keywords: [
            'belarus',
            'flag',
        ],
        name: 'belarus',
    },
    {
        code: '🇧🇿',
        keywords: [
            'belize',
            'flag',
        ],
        name: 'belize',
    },
    {
        code: '🇨🇦',
        keywords: [
            'canada',
            'flag',
        ],
        name: 'canada',
    },
    {
        code: '🇨🇨',
        keywords: [
            'cocos',
            'flag',
            'island',
            'keeling',
        ],
        name: 'cocos_islands',
    },
    {
        code: '🇨🇩',
        keywords: [
            'congo',
            'congo-kinshasa',
            'democratic republic of congo',
            'drc',
            'flag',
            'kinshasa',
            'republic',
        ],
        name: 'congo_kinshasa',
    },
    {
        code: '🇨🇫',
        keywords: [
            'central african republic',
            'flag',
            'republic',
        ],
        name: 'central_african_republic',
    },
    {
        code: '🇨🇬',
        keywords: [
            'brazzaville',
            'congo',
            'congo republic',
            'congo-brazzaville',
            'flag',
            'republic',
            'republic of the congo',
        ],
        name: 'congo_brazzaville',
    },
    {
        code: '🇨🇭',
        keywords: [
            'flag',
            'switzerland',
        ],
        name: 'switzerland',
    },
    {
        code: '🇨🇮',
        keywords: [
            'cote ivoire',
            'côte ivoire',
            'flag',
            'ivory coast',
        ],
        name: 'cote_divoire',
    },
    {
        code: '🇨🇰',
        keywords: [
            'cook',
            'flag',
            'island',
        ],
        name: 'cook_islands',
    },
    {
        code: '🇨🇱',
        keywords: [
            'chile',
            'flag',
        ],
        name: 'chile',
    },
    {
        code: '🇨🇲',
        keywords: [
            'cameroon',
            'flag',
        ],
        name: 'cameroon',
    },
    {
        code: '🇨🇳',
        keywords: [
            'china',
            'flag',
        ],
        name: 'cn',
    },
    {
        code: '🇨🇴',
        keywords: [
            'colombia',
            'flag',
        ],
        name: 'colombia',
    },
    {
        code: '🇨🇵',
        keywords: [
            'clipperton',
            'flag',
            'island',
        ],
        name: 'clipperton_island',
    },
    {
        code: '🇨🇷',
        keywords: [
            'costa rica',
            'flag',
        ],
        name: 'costa_rica',
    },
    {
        code: '🇨🇺',
        keywords: [
            'cuba',
            'flag',
        ],
        name: 'cuba',
    },
    {
        code: '🇨🇻',
        keywords: [
            'cabo',
            'cape',
            'flag',
            'verde',
        ],
        name: 'cape_verde',
    },
    {
        code: '🇨🇼',
        keywords: [
            'antilles',
            'curacao',
            'curaçao',
            'flag',
        ],
        name: 'curacao',
    },
    {
        code: '🇨🇽',
        keywords: [
            'christmas',
            'flag',
            'island',
        ],
        name: 'christmas_island',
    },
    {
        code: '🇨🇾',
        keywords: [
            'cyprus',
            'flag',
        ],
        name: 'cyprus',
    },
    {
        code: '🇨🇿',
        keywords: [
            'czech republic',
            'flag',
        ],
        name: 'czech_republic',
    },
    {
        code: '🇩🇪',
        keywords: [
            'flag',
            'germany',
        ],
        name: 'de',
    },
    {
        code: '🇩🇬',
        keywords: [
            'diego garcia',
            'flag',
        ],
        name: 'diego_garcia',
    },
    {
        code: '🇩🇯',
        keywords: [
            'djibouti',
            'flag',
        ],
        name: 'djibouti',
    },
    {
        code: '🇩🇰',
        keywords: [
            'denmark',
            'flag',
        ],
        name: 'denmark',
    },
    {
        code: '🇩🇲',
        keywords: [
            'dominica',
            'flag',
        ],
        name: 'dominica',
    },
    {
        code: '🇩🇴',
        keywords: [
            'dominican republic',
            'flag',
        ],
        name: 'dominican_republic',
    },
    {
        code: '🇩🇿',
        keywords: [
            'algeria',
            'flag',
        ],
        name: 'algeria',
    },
    {
        code: '🇪🇦',
        keywords: [
            'ceuta',
            'flag',
            'melilla',
        ],
        name: 'ceuta_melilla',
    },
    {
        code: '🇪🇨',
        keywords: [
            'ecuador',
            'flag',
        ],
        name: 'ecuador',
    },
    {
        code: '🇪🇪',
        keywords: [
            'estonia',
            'flag',
        ],
        name: 'estonia',
    },
    {
        code: '🇪🇬',
        keywords: [
            'egypt',
            'flag',
        ],
        name: 'egypt',
    },
    {
        code: '🇪🇭',
        keywords: [
            'flag',
            'sahara',
            'west',
            'western sahara',
        ],
        name: 'western_sahara',
    },
    {
        code: '🇪🇷',
        keywords: [
            'eritrea',
            'flag',
        ],
        name: 'eritrea',
    },
    {
        code: '🇪🇸',
        keywords: [
            'flag',
            'spain',
        ],
        name: 'es',
    },
    {
        code: '🇪🇹',
        keywords: [
            'ethiopia',
            'flag',
        ],
        name: 'ethiopia',
    },
    {
        code: '🇪🇺',
        keywords: [
            'european union',
            'flag',
        ],
        name: 'eu',
    },
    {
        code: '🇫🇮',
        keywords: [
            'finland',
            'flag',
        ],
        name: 'finland',
    },
    {
        code: '🇫🇯',
        keywords: [
            'fiji',
            'flag',
        ],
        name: 'fiji',
    },
    {
        code: '🇫🇰',
        keywords: [
            'falkland',
            'falklands',
            'flag',
            'island',
            'islas',
            'malvinas',
        ],
        name: 'falkland_islands',
    },
    {
        code: '🇫🇲',
        keywords: [
            'flag',
            'micronesia',
        ],
        name: 'micronesia',
    },
    {
        code: '🇫🇴',
        keywords: [
            'faroe',
            'flag',
            'island',
        ],
        name: 'faroe_islands',
    },
    {
        code: '🇫🇷',
        keywords: [
            'flag',
            'france',
        ],
        name: 'fr',
    },
    {
        code: '🇬🇦',
        keywords: [
            'flag',
            'gabon',
        ],
        name: 'gabon',
    },
    {
        code: '🇬🇧',
        keywords: [
            'britain',
            'british',
            'cornwall',
            'england',
            'flag',
            'great britain',
            'ireland',
            'northern ireland',
            'scotland',
            'uk',
            'union jack',
            'united',
            'united kingdom',
            'wales',
        ],
        name: 'gb',
    },
    {
        code: '🇬🇩',
        keywords: [
            'flag',
            'grenada',
        ],
        name: 'grenada',
    },
    {
        code: '🇬🇪',
        keywords: [
            'flag',
            'georgia',
        ],
        name: 'georgia',
    },
    {
        code: '🇬🇫',
        keywords: [
            'flag',
            'french',
            'guiana',
        ],
        name: 'french_guiana',
    },
    {
        code: '🇬🇬',
        keywords: [
            'flag',
            'guernsey',
        ],
        name: 'guernsey',
    },
    {
        code: '🇬🇭',
        keywords: [
            'flag',
            'ghana',
        ],
        name: 'ghana',
    },
    {
        code: '🇬🇮',
        keywords: [
            'flag',
            'gibraltar',
        ],
        name: 'gibraltar',
    },
    {
        code: '🇬🇱',
        keywords: [
            'flag',
            'greenland',
        ],
        name: 'greenland',
    },
    {
        code: '🇬🇲',
        keywords: [
            'flag',
            'gambia',
        ],
        name: 'gambia',
    },
    {
        code: '🇬🇳',
        keywords: [
            'flag',
            'guinea',
        ],
        name: 'guinea',
    },
    {
        code: '🇬🇵',
        keywords: [
            'flag',
            'guadeloupe',
        ],
        name: 'guadeloupe',
    },
    {
        code: '🇬🇶',
        keywords: [
            'equatorial guinea',
            'flag',
            'guinea',
        ],
        name: 'equatorial_guinea',
    },
    {
        code: '🇬🇷',
        keywords: [
            'flag',
            'greece',
        ],
        name: 'greece',
    },
    {
        code: '🇬🇸',
        keywords: [
            'flag',
            'georgia',
            'island',
            'south',
            'south georgia',
            'south sandwich',
        ],
        name: 'south_georgia_south_sandwich_islands',
    },
    {
        code: '🇬🇹',
        keywords: [
            'flag',
            'guatemala',
        ],
        name: 'guatemala',
    },
    {
        code: '🇬🇺',
        keywords: [
            'flag',
            'guam',
        ],
        name: 'guam',
    },
    {
        code: '🇬🇼',
        keywords: [
            'bissau',
            'flag',
            'guinea',
        ],
        name: 'guinea_bissau',
    },
    {
        code: '🇬🇾',
        keywords: [
            'flag',
            'guyana',
        ],
        name: 'guyana',
    },
    {
        code: '🇭🇰',
        keywords: [
            'china',
            'flag',
            'hong kong',
        ],
        name: 'hong_kong',
    },
    {
        code: '🇭🇲',
        keywords: [
            'flag',
            'heard',
            'island',
            'mcdonald',
        ],
        name: 'heard_mcdonald_islands',
    },
    {
        code: '🇭🇳',
        keywords: [
            'flag',
            'honduras',
        ],
        name: 'honduras',
    },
    {
        code: '🇭🇷',
        keywords: [
            'croatia',
            'flag',
        ],
        name: 'croatia',
    },
    {
        code: '🇭🇹',
        keywords: [
            'flag',
            'haiti',
        ],
        name: 'haiti',
    },
    {
        code: '🇭🇺',
        keywords: [
            'flag',
            'hungary',
        ],
        name: 'hungary',
    },
    {
        code: '🇮🇨',
        keywords: [
            'canary',
            'flag',
            'island',
        ],
        name: 'canary_islands',
    },
    {
        code: '🇮🇩',
        keywords: [
            'flag',
            'indonesia',
        ],
        name: 'indonesia',
    },
    {
        code: '🇮🇪',
        keywords: [
            'flag',
            'ireland',
        ],
        name: 'ireland',
    },
    {
        code: '🇮🇱',
        keywords: [
            'flag',
            'israel',
        ],
        name: 'israel',
    },
    {
        code: '🇮🇲',
        keywords: [
            'flag',
            'isle of man',
        ],
        name: 'isle_of_man',
    },
    {
        code: '🇮🇳',
        keywords: [
            'flag',
            'india',
        ],
        name: 'india',
    },
    {
        code: '🇮🇴',
        keywords: [
            'british',
            'chagos',
            'flag',
            'indian ocean',
            'island',
        ],
        name: 'british_indian_ocean_territory',
    },
    {
        code: '🇮🇶',
        keywords: [
            'flag',
            'iraq',
        ],
        name: 'iraq',
    },
    {
        code: '🇮🇷',
        keywords: [
            'flag',
            'iran',
        ],
        name: 'iran',
    },
    {
        code: '🇮🇸',
        keywords: [
            'flag',
            'iceland',
        ],
        name: 'iceland',
    },
    {
        code: '🇮🇹',
        keywords: [
            'flag',
            'italy',
        ],
        name: 'it',
    },
    {
        code: '🇯🇪',
        keywords: [
            'flag',
            'jersey',
        ],
        name: 'jersey',
    },
    {
        code: '🇯🇲',
        keywords: [
            'flag',
            'jamaica',
        ],
        name: 'jamaica',
    },
    {
        code: '🇯🇴',
        keywords: [
            'flag',
            'jordan',
        ],
        name: 'jordan',
    },
    {
        code: '🇯🇵',
        keywords: [
            'flag',
            'japan',
        ],
        name: 'jp',
    },
    {
        code: '🇰🇪',
        keywords: [
            'flag',
            'kenya',
        ],
        name: 'kenya',
    },
    {
        code: '🇰🇬',
        keywords: [
            'flag',
            'kyrgyzstan',
        ],
        name: 'kyrgyzstan',
    },
    {
        code: '🇰🇭',
        keywords: [
            'cambodia',
            'flag',
        ],
        name: 'cambodia',
    },
    {
        code: '🇰🇮',
        keywords: [
            'flag',
            'kiribati',
        ],
        name: 'kiribati',
    },
    {
        code: '🇰🇲',
        keywords: [
            'comoros',
            'flag',
        ],
        name: 'comoros',
    },
    {
        code: '🇰🇳',
        keywords: [
            'flag',
            'kitts',
            'nevis',
            'saint',
        ],
        name: 'st_kitts_nevis',
    },
    {
        code: '🇰🇵',
        keywords: [
            'flag',
            'korea',
            'north',
            'north korea',
        ],
        name: 'north_korea',
    },
    {
        code: '🇰🇷',
        keywords: [
            'flag',
            'korea',
            'south',
            'south korea',
        ],
        name: 'kr',
    },
    {
        code: '🇰🇼',
        keywords: [
            'flag',
            'kuwait',
        ],
        name: 'kuwait',
    },
    {
        code: '🇰🇾',
        keywords: [
            'cayman',
            'flag',
            'island',
        ],
        name: 'cayman_islands',
    },
    {
        code: '🇰🇿',
        keywords: [
            'flag',
            'kazakhstan',
        ],
        name: 'kazakhstan',
    },
    {
        code: '🇱🇦',
        keywords: [
            'flag',
            'laos',
        ],
        name: 'laos',
    },
    {
        code: '🇱🇧',
        keywords: [
            'flag',
            'lebanon',
        ],
        name: 'lebanon',
    },
    {
        code: '🇱🇨',
        keywords: [
            'flag',
            'lucia',
            'saint',
        ],
        name: 'st_lucia',
    },
    {
        code: '🇱🇮',
        keywords: [
            'flag',
            'liechtenstein',
        ],
        name: 'liechtenstein',
    },
    {
        code: '🇱🇰',
        keywords: [
            'flag',
            'sri lanka',
        ],
        name: 'sri_lanka',
    },
    {
        code: '🇱🇷',
        keywords: [
            'flag',
            'liberia',
        ],
        name: 'liberia',
    },
    {
        code: '🇱🇸',
        keywords: [
            'flag',
            'lesotho',
        ],
        name: 'lesotho',
    },
    {
        code: '🇱🇹',
        keywords: [
            'flag',
            'lithuania',
        ],
        name: 'lithuania',
    },
    {
        code: '🇱🇺',
        keywords: [
            'flag',
            'luxembourg',
        ],
        name: 'luxembourg',
    },
    {
        code: '🇱🇻',
        keywords: [
            'flag',
            'latvia',
        ],
        name: 'latvia',
    },
    {
        code: '🇱🇾',
        keywords: [
            'flag',
            'libya',
        ],
        name: 'libya',
    },
    {
        code: '🇲🇦',
        keywords: [
            'flag',
            'morocco',
        ],
        name: 'morocco',
    },
    {
        code: '🇲🇨',
        keywords: [
            'flag',
            'monaco',
        ],
        name: 'monaco',
    },
    {
        code: '🇲🇩',
        keywords: [
            'flag',
            'moldova',
        ],
        name: 'moldova',
    },
    {
        code: '🇲🇪',
        keywords: [
            'flag',
            'montenegro',
        ],
        name: 'montenegro',
    },
    {
        code: '🇲🇫',
        keywords: [
            'flag',
            'french',
            'martin',
            'saint',
        ],
        name: 'st_martin',
    },
    {
        code: '🇲🇬',
        keywords: [
            'flag',
            'madagascar',
        ],
        name: 'madagascar',
    },
    {
        code: '🇲🇭',
        keywords: [
            'flag',
            'island',
            'marshall',
        ],
        name: 'marshall_islands',
    },
    {
        code: '🇲🇰',
        keywords: [
            'flag',
            'macedonia',
        ],
        name: 'macedonia',
    },
    {
        code: '🇲🇱',
        keywords: [
            'flag',
            'mali',
        ],
        name: 'mali',
    },
    {
        code: '🇲🇲',
        keywords: [
            'burma',
            'flag',
            'myanmar',
        ],
        name: 'myanmar',
    },
    {
        code: '🇲🇳',
        keywords: [
            'flag',
            'mongolia',
        ],
        name: 'mongolia',
    },
    {
        code: '🇲🇴',
        keywords: [
            'china',
            'flag',
            'macao',
            'macau',
        ],
        name: 'macau',
    },
    {
        code: '🇲🇵',
        keywords: [
            'flag',
            'island',
            'mariana',
            'north',
            'northern mariana',
        ],
        name: 'northern_mariana_islands',
    },
    {
        code: '🇲🇶',
        keywords: [
            'flag',
            'martinique',
        ],
        name: 'martinique',
    },
    {
        code: '🇲🇷',
        keywords: [
            'flag',
            'mauritania',
        ],
        name: 'mauritania',
    },
    {
        code: '🇲🇸',
        keywords: [
            'flag',
            'montserrat',
        ],
        name: 'montserrat',
    },
    {
        code: '🇲🇹',
        keywords: [
            'flag',
            'malta',
        ],
        name: 'malta',
    },
    {
        code: '🇲🇺',
        keywords: [
            'flag',
            'mauritius',
        ],
        name: 'mauritius',
    },
    {
        code: '🇲🇻',
        keywords: [
            'flag',
            'maldives',
        ],
        name: 'maldives',
    },
    {
        code: '🇲🇼',
        keywords: [
            'flag',
            'malawi',
        ],
        name: 'malawi',
    },
    {
        code: '🇲🇽',
        keywords: [
            'flag',
            'mexico',
        ],
        name: 'mexico',
    },
    {
        code: '🇲🇾',
        keywords: [
            'flag',
            'malaysia',
        ],
        name: 'malaysia',
    },
    {
        code: '🇲🇿',
        keywords: [
            'flag',
            'mozambique',
        ],
        name: 'mozambique',
    },
    {
        code: '🇳🇦',
        keywords: [
            'flag',
            'namibia',
        ],
        name: 'namibia',
    },
    {
        code: '🇳🇨',
        keywords: [
            'flag',
            'new',
            'new caledonia',
        ],
        name: 'new_caledonia',
    },
    {
        code: '🇳🇪',
        keywords: [
            'flag',
            'niger',
        ],
        name: 'niger',
    },
    {
        code: '🇳🇫',
        keywords: [
            'flag',
            'island',
            'norfolk',
        ],
        name: 'norfolk_island',
    },
    {
        code: '🇳🇬',
        keywords: [
            'flag',
            'nigeria',
        ],
        name: 'nigeria',
    },
    {
        code: '🇳🇮',
        keywords: [
            'flag',
            'nicaragua',
        ],
        name: 'nicaragua',
    },
    {
        code: '🇳🇱',
        keywords: [
            'flag',
            'netherlands',
        ],
        name: 'netherlands',
    },
    {
        code: '🇳🇴',
        keywords: [
            'flag',
            'norway',
        ],
        name: 'norway',
    },
    {
        code: '🇳🇵',
        keywords: [
            'flag',
            'nepal',
        ],
        name: 'nepal',
    },
    {
        code: '🇳🇷',
        keywords: [
            'flag',
            'nauru',
        ],
        name: 'nauru',
    },
    {
        code: '🇳🇺',
        keywords: [
            'flag',
            'niue',
        ],
        name: 'niue',
    },
    {
        code: '🇳🇿',
        keywords: [
            'flag',
            'new',
            'new zealand',
        ],
        name: 'new_zealand',
    },
    {
        code: '🇴🇲',
        keywords: [
            'flag',
            'oman',
        ],
        name: 'oman',
    },
    {
        code: '🇵🇦',
        keywords: [
            'flag',
            'panama',
        ],
        name: 'panama',
    },
    {
        code: '🇵🇪',
        keywords: [
            'flag',
            'peru',
        ],
        name: 'peru',
    },
    {
        code: '🇵🇫',
        keywords: [
            'flag',
            'french',
            'polynesia',
        ],
        name: 'french_polynesia',
    },
    {
        code: '🇵🇬',
        keywords: [
            'flag',
            'guinea',
            'new',
            'papua new guinea',
        ],
        name: 'papua_new_guinea',
    },
    {
        code: '🇵🇭',
        keywords: [
            'flag',
            'philippines',
        ],
        name: 'philippines',
    },
    {
        code: '🇵🇰',
        keywords: [
            'flag',
            'pakistan',
        ],
        name: 'pakistan',
    },
    {
        code: '🇵🇱',
        keywords: [
            'flag',
            'poland',
        ],
        name: 'poland',
    },
    {
        code: '🇵🇲',
        keywords: [
            'flag',
            'miquelon',
            'pierre',
            'saint',
        ],
        name: 'st_pierre_miquelon',
    },
    {
        code: '🇵🇳',
        keywords: [
            'flag',
            'island',
            'pitcairn',
        ],
        name: 'pitcairn_islands',
    },
    {
        code: '🇵🇷',
        keywords: [
            'flag',
            'puerto rico',
        ],
        name: 'puerto_rico',
    },
    {
        code: '🇵🇸',
        keywords: [
            'flag',
            'palestine',
        ],
        name: 'palestinian_territories',
    },
    {
        code: '🇵🇹',
        keywords: [
            'flag',
            'portugal',
        ],
        name: 'portugal',
    },
    {
        code: '🇵🇼',
        keywords: [
            'flag',
            'palau',
        ],
        name: 'palau',
    },
    {
        code: '🇵🇾',
        keywords: [
            'flag',
            'paraguay',
        ],
        name: 'paraguay',
    },
    {
        code: '🇶🇦',
        keywords: [
            'flag',
            'qatar',
        ],
        name: 'qatar',
    },
    {
        code: '🇷🇪',
        keywords: [
            'flag',
            'reunion',
            'réunion',
        ],
        name: 'reunion',
    },
    {
        code: '🇷🇴',
        keywords: [
            'flag',
            'romania',
        ],
        name: 'romania',
    },
    {
        code: '🇷🇸',
        keywords: [
            'flag',
            'serbia',
        ],
        name: 'serbia',
    },
    {
        code: '🇷🇺',
        keywords: [
            'flag',
            'russia',
        ],
        name: 'ru',
    },
    {
        code: '🇷🇼',
        keywords: [
            'flag',
            'rwanda',
        ],
        name: 'rwanda',
    },
    {
        code: '🇸🇦',
        keywords: [
            'flag',
            'saudi arabia',
        ],
        name: 'saudi_arabia',
    },
    {
        code: '🇸🇧',
        keywords: [
            'flag',
            'island',
            'solomon',
        ],
        name: 'solomon_islands',
    },
    {
        code: '🇸🇨',
        keywords: [
            'flag',
            'seychelles',
        ],
        name: 'seychelles',
    },
    {
        code: '🇸🇩',
        keywords: [
            'flag',
            'sudan',
        ],
        name: 'sudan',
    },
    {
        code: '🇸🇪',
        keywords: [
            'flag',
            'sweden',
        ],
        name: 'sweden',
    },
    {
        code: '🇸🇬',
        keywords: [
            'flag',
            'singapore',
        ],
        name: 'singapore',
    },
    {
        code: '🇸🇭',
        keywords: [
            'flag',
            'helena',
            'saint',
        ],
        name: 'st_helena',
    },
    {
        code: '🇸🇮',
        keywords: [
            'flag',
            'slovenia',
        ],
        name: 'slovenia',
    },
    {
        code: '🇸🇯',
        keywords: [
            'flag',
            'jan mayen',
            'svalbard',
        ],
        name: 'svalbard_jan_mayen',
    },
    {
        code: '🇸🇰',
        keywords: [
            'flag',
            'slovakia',
        ],
        name: 'slovakia',
    },
    {
        code: '🇸🇱',
        keywords: [
            'flag',
            'sierra leone',
        ],
        name: 'sierra_leone',
    },
    {
        code: '🇸🇲',
        keywords: [
            'flag',
            'san marino',
        ],
        name: 'san_marino',
    },
    {
        code: '🇸🇳',
        keywords: [
            'flag',
            'senegal',
        ],
        name: 'senegal',
    },
    {
        code: '🇸🇴',
        keywords: [
            'flag',
            'somalia',
        ],
        name: 'somalia',
    },
    {
        code: '🇸🇷',
        keywords: [
            'flag',
            'suriname',
        ],
        name: 'suriname',
    },
    {
        code: '🇸🇸',
        keywords: [
            'flag',
            'south',
            'south sudan',
            'sudan',
        ],
        name: 'south_sudan',
    },
    {
        code: '🇸🇹',
        keywords: [
            'flag',
            'principe',
            'príncipe',
            'sao tome',
            'são tomé',
        ],
        name: 'sao_tome_principe',
    },
    {
        code: '🇸🇻',
        keywords: [
            'el salvador',
            'flag',
        ],
        name: 'el_salvador',
    },
    {
        code: '🇸🇽',
        keywords: [
            'flag',
            'maarten',
            'sint',
        ],
        name: 'sint_maarten',
    },
    {
        code: '🇸🇾',
        keywords: [
            'flag',
            'syria',
        ],
        name: 'syria',
    },
    {
        code: '🇸🇿',
        keywords: [
            'flag',
            'swaziland',
        ],
        name: 'swaziland',
    },
    {
        code: '🇹🇦',
        keywords: [
            'flag',
            'tristan da cunha',
        ],
        name: 'tristan_da_cunha',
    },
    {
        code: '🇹🇨',
        keywords: [
            'caicos',
            'flag',
            'island',
            'turks',
        ],
        name: 'turks_caicos_islands',
    },
    {
        code: '🇹🇩',
        keywords: [
            'chad',
            'flag',
        ],
        name: 'chad',
    },
    {
        code: '🇹🇫',
        keywords: [
            'antarctic',
            'flag',
            'french',
        ],
        name: 'french_southern_territories',
    },
    {
        code: '🇹🇬',
        keywords: [
            'flag',
            'togo',
        ],
        name: 'togo',
    },
    {
        code: '🇹🇭',
        keywords: [
            'flag',
            'thailand',
        ],
        name: 'thailand',
    },
    {
        code: '🇹🇯',
        keywords: [
            'flag',
            'tajikistan',
        ],
        name: 'tajikistan',
    },
    {
        code: '🇹🇰',
        keywords: [
            'flag',
            'tokelau',
        ],
        name: 'tokelau',
    },
    {
        code: '🇹🇱',
        keywords: [
            'east',
            'east timor',
            'flag',
            'timor-leste',
        ],
        name: 'timor_leste',
    },
    {
        code: '🇹🇲',
        keywords: [
            'flag',
            'turkmenistan',
        ],
        name: 'turkmenistan',
    },
    {
        code: '🇹🇳',
        keywords: [
            'flag',
            'tunisia',
        ],
        name: 'tunisia',
    },
    {
        code: '🇹🇴',
        keywords: [
            'flag',
            'tonga',
        ],
        name: 'tonga',
    },
    {
        code: '🇹🇷',
        keywords: [
            'flag',
            'turkey',
        ],
        name: 'tr',
    },
    {
        code: '🇹🇹',
        keywords: [
            'flag',
            'tobago',
            'trinidad',
        ],
        name: 'trinidad_tobago',
    },
    {
        code: '🇹🇻',
        keywords: [
            'flag',
            'tuvalu',
        ],
        name: 'tuvalu',
    },
    {
        code: '🇹🇼',
        keywords: [
            'china',
            'flag',
            'taiwan',
        ],
        name: 'taiwan',
    },
    {
        code: '🇹🇿',
        keywords: [
            'flag',
            'tanzania',
        ],
        name: 'tanzania',
    },
    {
        code: '🇺🇦',
        keywords: [
            'flag',
            'ukraine',
        ],
        name: 'ukraine',
    },
    {
        code: '🇺🇬',
        keywords: [
            'flag',
            'uganda',
        ],
        name: 'uganda',
    },
    {
        code: '🇺🇲',
        keywords: [
            'america',
            'flag',
            'island',
            'minor outlying',
            'united',
            'united states',
            'us',
            'usa',
        ],
        name: 'us_outlying_islands',
    },
    {
        code: '🇺🇸',
        keywords: [
            'america',
            'flag',
            'stars and stripes',
            'united',
            'united states',
        ],
        name: 'us',
    },
    {
        code: '🇺🇾',
        keywords: [
            'flag',
            'uruguay',
        ],
        name: 'uruguay',
    },
    {
        code: '🇺🇿',
        keywords: [
            'flag',
            'uzbekistan',
        ],
        name: 'uzbekistan',
    },
    {
        code: '🇻🇦',
        keywords: [
            'flag',
            'vatican',
        ],
        name: 'vatican_city',
    },
    {
        code: '🇻🇨',
        keywords: [
            'flag',
            'grenadines',
            'saint',
            'vincent',
        ],
        name: 'st_vincent_grenadines',
    },
    {
        code: '🇻🇪',
        keywords: [
            'flag',
            'venezuela',
        ],
        name: 'venezuela',
    },
    {
        code: '🇻🇬',
        keywords: [
            'british',
            'flag',
            'island',
            'virgin',
        ],
        name: 'british_virgin_islands',
    },
    {
        code: '🇻🇮',
        keywords: [
            'america',
            'american',
            'flag',
            'island',
            'united',
            'united states',
            'us',
            'usa',
            'virgin',
        ],
        name: 'us_virgin_islands',
    },
    {
        code: '🇻🇳',
        keywords: [
            'flag',
            'viet nam',
            'vietnam',
        ],
        name: 'vietnam',
    },
    {
        code: '🇻🇺',
        keywords: [
            'flag',
            'vanuatu',
        ],
        name: 'vanuatu',
    },
    {
        code: '🇼🇫',
        keywords: [
            'flag',
            'futuna',
            'wallis',
        ],
        name: 'wallis_futuna',
    },
    {
        code: '🇼🇸',
        keywords: [
            'flag',
            'samoa',
        ],
        name: 'samoa',
    },
    {
        code: '🇽🇰',
        keywords: [
            'flag',
            'kosovo',
        ],
        name: 'kosovo',
    },
    {
        code: '🇾🇪',
        keywords: [
            'flag',
            'yemen',
        ],
        name: 'yemen',
    },
    {
        code: '🇾🇹',
        keywords: [
            'flag',
            'mayotte',
        ],
        name: 'mayotte',
    },
    {
        code: '🇿🇦',
        keywords: [
            'flag',
            'south',
            'south africa',
        ],
        name: 'south_africa',
    },
    {
        code: '🇿🇲',
        keywords: [
            'flag',
            'zambia',
        ],
        name: 'zambia',
    },
    {
        code: '🇿🇼',
        keywords: [
            'flag',
            'zimbabwe',
        ],
        name: 'zimbabwe',
    },
];

export {skinTones};
export default emojis;
